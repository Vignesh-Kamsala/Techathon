"""
Ingestion Tool: Real implementation for fetching and extracting text from RFPs.
"""
import uuid
import re
import requests
import io
import logging
import os
from datetime import datetime, timedelta

# Try importing pypdf, handle if not installed (though we added it to requirements)
try:
    from pypdf import PdfReader
except ImportError:
    PdfReader = None

logger = logging.getLogger(__name__)

def fetch_rfp_content(url: str) -> str:
    """
    Fetches content from a URL.
    - If it's a PDF, extracts text using pypdf.
    - If it's text/html, returns text.
    - Handles basic headers to mimic a browser.
    """
    if not url:
        return ""
    
    print(f"[Ingest] Fetching: {url}")
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        content_type = response.headers.get('Content-Type', '').lower()
        
        # Check if PDF
        if 'pdf' in content_type or url.lower().endswith('.pdf'):
            if PdfReader:
                print("[Ingest] Detected PDF. Extracting text...")
                try:
                    pdf_file = io.BytesIO(response.content)
                    reader = PdfReader(pdf_file)
                    text = ""
                    for page in reader.pages:
                        text += page.extract_text() + "\n"
                    return text
                except Exception as e:
                    return f"Error reading PDF: {str(e)}"
            else:
                return "Error: pypdf library not installed. Cannot parse PDF."
        
        # Assume text/html
        return response.text
        
    except Exception as e:
        return f"Error fetching URL: {str(e)}"

def llm_parse_rfp(raw_content: str, url: str = "") -> dict:
    """
    Parses the raw text into structured JSON.
    
    NOTE: In a production environment, this function would call an LLM API 
    (e.g., OpenAI, Gemini) with the raw_content.
    
    Since we are running locally without an API Key, we use a 
    Heuristic / Regex-based 'Parser' that tries to find patterns 
    common in the User's samples (Line Item X, Specification tables).
    """
    
    print(f"[Ingest] Parsing content ({len(raw_content)} chars)...")

    # 1. Fetch content if "dummy_raw_content" was passed (integration shim)
    if raw_content == "dummy_raw_content" and url:
        raw_content = fetch_rfp_content(url)

    # 2. Check for Gemini API Key
    api_key = os.environ.get("GEMINI_API_KEY") 
    # Also check if passed in arguments (though standard is env var)
    
    if api_key:
        print("[Ingest] Gemini API Key detected. Using LLM for extraction...")
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            from langchain_core.prompts import PromptTemplate
            from langchain_core.output_parsers import JsonOutputParser
            
            # Setup Model (Flash for speed/cost)
            llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", google_api_key=api_key, temperature=0)
            
            # Define Prompt
            prompt_template = """
            You are an expert RFP Analyst. Extract the "Scope of Supply" or "Bill of Materials" from the following text into a structured JSON format.
            
            The JSON structure must be:
            {{
                "id": "extracted_rfp_id",
                "title": "Title of the RFP (inferred)",
                "issuer": "Issuer Name (inferred)",
                "submission_deadline": "YYYY-MM-DDTHH:MM:SSZ",
                "scope_items": [
                    {{
                        "item_id": "1",
                        "raw_text": "Original text line",
                        "product_name": "Short descriptive name",
                        "quantity": 1000,
                        "specs": {{
                            "voltage": "e.g. 11kV",
                            "conductor_size_mm2": 123,
                            "cores": 3,
                            "insulation": "XLPE",
                            "conductor_material": "Copper/Aluminum"
                        }},
                        "tests_required": ["Test 1", "Test 2"]
                    }}
                ]
            }}
            
            If specific specs are missing, omit them from the "specs" dictionary.
            If the text contains no clear items, return an empty "scope_items" list.
            
            RFP TEXT CONTENT:
            {text}
            """
            
            prompt = PromptTemplate(template=prompt_template, input_variables=["text"])
            chain = prompt | llm | JsonOutputParser()
            
            # Run Chain
            # Truncate content if too huge (Flash has 1M context but let's be safe/fast - 30k chars is usually plenty for tables)
            truncated_content = raw_content[:100000] 
            result = chain.invoke({"text": truncated_content})
            
            print("[Ingest] LLM Parsing successful.")
            return result
            
        except Exception as e:
            print(f"[Ingest] LLM Parsing failed: {e}. Falling back to Heuristic.")
    
    # 3. Fallback Heuristic Extraction Logic
    print("[Ingest] Using Heuristic Regex Parser (No API Key or LLM Error)...")
    
    items = []
    
    # Normalizing Text
    lines = raw_content.split('\n')
    
    current_item = {}
    
    # Aggressive Regex for "Item X" or "Line Item X" or just "1. Description"
    item_pattern = re.compile(r"(?:Item|Line Item|No\.)\s*(\d+)[:.]", re.IGNORECASE)
    
    for line in lines:
        line = line.strip()
        if not line: continue
        
        match = item_pattern.search(line)
        if match:
            # Save previous
            if current_item:
                items.append(current_item)
            
            # Start New
            item_id = match.group(1)
            desc_guess = line[match.end():].strip()
            current_item = {
                "item_id": item_id,
                "raw_text": line,
                "product_description": desc_guess, # Temporary holding
                "specs": {},
                "tests_required": []
            }
        
        if current_item:
            current_item["raw_text"] += " " + line
            lower = line.lower()
            
            # Extract Specs (Heuristic)
            # Voltage
            v_match = re.search(r"(\d+(\.\d+)?kV)", line, re.IGNORECASE)
            if v_match and "voltage" not in current_item["specs"]:
                current_item["specs"]["voltage"] = v_match.group(1)
            
            # Conductor Size
            bs_match = re.search(r"(\d+)\s*(?:mm2|sqmm)", line, re.IGNORECASE)
            if bs_match and "conductor_size_mm2" not in current_item["specs"]:
                current_item["specs"]["conductor_size_mm2"] = int(bs_match.group(1))
            
            # Cores
            c_match = re.search(r"(\d+)\s*[xX]\s*\d+", line)
            if c_match and "cores" not in current_item["specs"]:
                current_item["specs"]["cores"] = int(c_match.group(1))
            
            # Material
            if "copper" in lower or " cu " in lower: current_item["specs"]["conductor_material"] = "Copper"
            if "aluminum" in lower or " al " in lower or "acsr" in lower: current_item["specs"]["conductor_material"] = "Aluminum"
            
            # Insulation
            if "xlpe" in lower: current_item["specs"]["insulation"] = "XLPE"
            if "pvc" in lower: current_item["specs"]["insulation"] = "PVC"
            
            # Quantity
            q_match = re.search(r"(?:Qty|Quantity)[\s:]*(\d+)", line, re.IGNORECASE)
            if q_match:
                current_item["quantity"] = int(q_match.group(1))
            
            # Product Name Refinement
            # If we captured a description earlier, try to improve it
            if len(current_item.get("product_description", "")) < 10 and len(line) > 10 and len(line) < 100:
                 if "cable" in lower or "conductor" in lower:
                     current_item["product_description"] = line

    if current_item:
        items.append(current_item)

    # Post-process items to match "scope_items" schema expected by agents
    clean_items = []
    for i in items:
        p_name = i.get("product_description", "Unknown Item")
        if len(p_name) < 3: p_name = i["raw_text"][:50]
        
        clean_items.append({
            "item_id": i["item_id"],
            "raw_text": i["raw_text"],
            "product_name": p_name,
            "quantity": i.get("quantity", 1000), 
            "specs": i["specs"],
            "tests_required": ["Standard Test"] 
        })

    if not clean_items:
        print("[Ingest] Warning: No structured items found in text. Falling back to default list.")
        return {
            "id": "rfp_extracted_fallback",
            "title": "RFP (Extraction Fallback)",
            "scope_items": [
                 {
                    "item_id": "1",
                    "product_name": "Extracted Content (Parse Failed)",
                    "quantity": 1,
                    "specs": {},
                    "tests_required": []
                }
            ]
        }

    return {
        "id": f"rfp_from_{uuid.uuid4().hex[:6]}",
        "title": f"RFP Extracted from {url}",
        "issuer": "Extracted",
        "submission_deadline": (datetime.now() + timedelta(days=30)).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "scope_items": clean_items
    }
