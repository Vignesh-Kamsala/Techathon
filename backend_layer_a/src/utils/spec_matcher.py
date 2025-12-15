from typing import Any, Dict, List, Optional
import re

SYNONYMS = {
    "xlpe": ["cross-linked polyethylene", "xlpe"],
    "pvc": ["polyvinyl chloride", "pvc"],
    "lszh": ["low smoke zero halogen", "lszh"],
    "cu": ["copper", "cu"],
    "al": ["aluminum", "aluminium", "al"]
}

def canonicalize(value: Any) -> str:
    if isinstance(value, str):
        val = value.lower().strip()
        # Check synonyms
        for key, synonyms in SYNONYMS.items():
            if val in synonyms:
                return key
        return val
    return str(value)

def check_numeric_match(req_val: float, sku_val: float, tolerance: float = 0.1) -> bool:
    """Check if sku_val is within tolerance of req_val."""
    try:
        req = float(req_val)
        sku = float(sku_val)
        return abs(sku - req) <= (req * tolerance)
    except (ValueError, TypeError):
        return False

def calculate_spec_match(required_specs: Dict[str, Any], sku_specs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Deterministically calculate match percentage.
    Returns details including match %, params matched vs total, and reasons.
    """
    matched_count = 0
    total_params = 0
    mismatch_reasons = []

    for key, req_val in required_specs.items():
        total_params += 1
        sku_val = sku_specs.get(key)
        
        # Missing param logic
        if sku_val is None:
            mismatch_reasons.append(f"Missing {key}")
            continue

        # Canonicalize
        canon_req = canonicalize(req_val)
        canon_sku = canonicalize(sku_val)

        is_match = False
        
        # Numeric check
        # HEURISTIC: if it looks like a number, try numeric match
        if isinstance(req_val, (int, float)) or (isinstance(req_val, str) and req_val.replace('.','',1).isdigit()):
             if check_numeric_match(req_val, sku_val):
                 is_match = True
        
        # Categorical/Exact check (fallback or string)
        if not is_match:
             if canon_req == canon_sku:
                 is_match = True
        
        if is_match:
            matched_count += 1
        else:
            mismatch_reasons.append(f"Mismatch {key}: Req '{req_val}' vs SKU '{sku_val}'")

    match_percent = (matched_count / total_params * 100) if total_params > 0 else 0.0
    
    return {
        "match_percent": round(match_percent, 2),
        "matched_params": matched_count,
        "total_params": total_params,
        "mismatch_reasons": mismatch_reasons
    }
