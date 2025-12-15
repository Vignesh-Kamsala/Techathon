import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load params
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    print("Error: GEMINI_API_KEY not found in .env")
    exit(1)

print(f"Using API Key: {api_key[:5]}...{api_key[-3:]}")

try:
    genai.configure(api_key=api_key)
    
    print("\nListing available models...")
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"- {m.name}")
            
    print("\n(If your model isn't here, your API Key might process a different region or project restriction)")

except Exception as e:
    print(f"\nAPI Error: {e}")
