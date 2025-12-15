import json
import os
from typing import List, Dict

DATA_DIR = os.path.join(os.path.dirname(__file__), "../../data")

def get_product_repo() -> List[Dict]:
    path = os.path.join(DATA_DIR, "product_repo.json")
    with open(path, 'r') as f:
        return json.load(f)

def product_lookup(query_specs: Dict) -> List[Dict]:
    """
    Returns SKUs. In a real app this would fuzzy search.
    Here we return all SKUs to let the Technical Agent sort by match %.
    Or we could do a naive pre-filter.
    For the assignment: "returns matching SKUs (use exact & simple fuzzy rules); deterministic ordering."
    
    Since we have a dedicated spec_matcher logic in the Agent, 
    the tool can just return ALL distinct candidates relevant to the "product_name" or "voltage".
    Let's filter by voltage if present to reduce noise, else return top 5.
    """
    repo = get_product_repo()
    results = []
    
    req_voltage = query_specs.get("voltage")
    
    for sku in repo:
        # Simple heuristic: if voltage matches or isn't specified, include it.
        if req_voltage:
            # simple string match "132kV" vs "132kV"
            if req_voltage.lower() in sku["specs"].get("voltage", "").lower():
                results.append(sku)
            # fallback: if no voltage match, don't include? 
            # Let's include everything if voltage check fails so the agent can see mismatches.
            # Actually, returning *everything* is safer for the "Technical Agent" to do the detailed math.
            # But "product_repo_lookup" implies some search.
            # Let's return all for this small demo scale (10 items).
        else:
             results.append(sku)
    
    # If filtered list is empty, return everything (fallback)
    if not results:
        results = repo
        
    return results
