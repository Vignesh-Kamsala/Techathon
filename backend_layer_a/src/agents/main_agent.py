import re
from src.state import AgentState
from src.utils.logger import emit_event
from src.tools.ingest import llm_parse_rfp

def parse_line_items(scope_text: str):
    """
    Deterministic regex parser for the specific demo formats.
    """
    items = []
    # Split by "Line Item" or "Item"
    lines = scope_text.split('\n')
    current_item = {}
    
    for line in lines:
        line = line.strip()
        if not line: continue
        
        # Detect new item
        match = re.search(r"(?:Line )?Item (\d+):", line)
        if match:
            # Save previous if exists
            if current_item:
                items.append(current_item)
            current_item = {"item_id": match.group(1), "raw_text": line, "specs": {}}
        
        if current_item:
            # Simple keyword extraction
            lower_line = line.lower()
            
            # Specs
            if "voltage" not in current_item["specs"]:
                v_match = re.search(r"(\d+(\.\d+)?kV)", line, re.IGNORECASE)
                if v_match: current_item["specs"]["voltage"] = v_match.group(1)
            
            if "conductor_size_mm2" not in current_item["specs"]:
                c_match = re.search(r"(\d+)mm2", line, re.IGNORECASE)
                if c_match: current_item["specs"]["conductor_size_mm2"] = int(c_match.group(1))

            if "cond_mat" not in current_item["specs"]:
                if "copper" in lower_line: current_item["specs"]["conductor_material"] = "Copper"
                if "aluminum" in lower_line: current_item["specs"]["conductor_material"] = "Aluminum"
            
            if "insulation" not in current_item["specs"] or current_item["specs"]["insulation"] == "XLPE":
                 if "xlpe" in lower_line: current_item["specs"]["insulation"] = "XLPE"
                 if "pvc" in lower_line: current_item["specs"]["insulation"] = "PVC"
                 if "mica" in lower_line: current_item["specs"]["insulation"] = "Mica Tape + XLPE" # Specific override
            
            # Cores
            if "cores" not in current_item["specs"]:
                # Try to find NxPattern e.g. 3x300
                core_match = re.search(r"(\d+)x\d+mm2", line, re.IGNORECASE)
                if core_match: current_item["specs"]["cores"] = int(core_match.group(1))
            
            # Quantity
            q_match = re.search(r"Quantity:\s*(\d+)", line, re.IGNORECASE)
            if q_match:
                current_item["quantity"] = int(q_match.group(1))

            # Tests
            tc_match = re.search(r"Tests required: (.*)", line, re.IGNORECASE)
            if tc_match:
                current_item["tests_required"] = [t.strip() for t in tc_match.group(1).split(',')]

            # Product Name guess
            if "product_name" not in current_item:
                 # Remove "Item X:" and "Quantity..."
                 clean = re.sub(r"(?:Line )?Item \d+:", "", line)
                 clean = re.sub(r"Quantity.*", "", clean)
                 current_item["product_name"] = clean.strip().strip(".,")

    if current_item:
        items.append(current_item)
        
    return items

def main_agent_start(state: AgentState) -> AgentState:
    emit_event("AGENT_START", {"agent": "Main Agent (Start)", "pipeline_id": state["pipeline_id"]})
    
    rfp = state["selected_rfp"]
    
    tech_items = []
    
    # Logic: If Source URL exists, simulate LLM Extraction. Else use basic regex on 'scope_excerpt'
    if rfp.get("source_url"):
        emit_event("AGENT_OUTPUT", {"agent": "Main Agent", "message": "Using LLM-based Ingestion for Complex RFP..."})
        # Simulate fetch & parse
        parsed_data = llm_parse_rfp("dummy_raw_content", rfp["source_url"])
        tech_items = parsed_data.get("scope_items", [])
    else:
        # Regex (Legacy/Simple)
        scope_text = rfp.get("scope_excerpt", "")
        tech_items = parse_line_items(scope_text)
    
    # Parse Pricing Summary (Tests)
    pricing_items = []
    for item in tech_items:
        p_item = {
            "item_id": item["item_id"],
            "tests": item.get("tests_required", [])
        }
        pricing_items.append(p_item)
    
    emit_event("AGENT_OUTPUT", {
        "agent": "Main Agent",
        "stage": "Start",
        "output": {
            "message": "Parsed RFP and created role-specific summaries.",
            "items_parsed": len(tech_items)
        }
    })
    
    return {
        **state,
        "tech_summary": tech_items,
        "pricing_summary": pricing_items
    }

def main_agent_end(state: AgentState) -> AgentState:
    emit_event("AGENT_START", {"agent": "Main Agent (End)", "pipeline_id": state["pipeline_id"]})
    
    # Consolidate Everything
    tech_response = state.get("technical_response", [])
    pricing_data = state.get("pricing_response", {})
    
    final_package = {
        "rfp_id": state["selected_rfp"]["id"],
        "status": "COMPLETED",
        "grand_total": pricing_data.get("grand_total", 0),
        "consolidated_response": pricing_data.get("consolidated_table", []),
        "technical_summary": state.get("tech_summary", []),
        "pricing_summary": state.get("pricing_summary", [])
    }

    emit_event("FINAL_RESPONSE_READY", {"pipeline_id": state["pipeline_id"], "grand_total": final_package["grand_total"]})
    
    return {
        **state,
        "final_response": final_package
    }
