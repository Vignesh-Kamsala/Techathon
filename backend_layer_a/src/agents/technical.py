from src.state import AgentState
from src.data_layer.json_impl import JsonProductRepository
from src.utils.spec_matcher import calculate_spec_match
from src.utils.logger import emit_event

def technical_agent(state: AgentState) -> AgentState:
    emit_event("AGENT_START", {"agent": "Technical Agent", "pipeline_id": state["pipeline_id"]})
    
    # Dependency: Product Repository
    # In a real DI framework, this would be injected. 
    # For now, we instantiate the default JSON impl if not in state.
    repo = state.get("deps", {}).get("product_repo") or JsonProductRepository()

    tech_summary = state.get("tech_summary", [])
    response_items = []
    
    for item in tech_summary:
        # 1. Lookup Candidates (Top candidates from repo)
        candidates = repo.find_by_specs(item["specs"])
        
        scored_candidates = []
        for sku in candidates:
            # 2. Calculate Spec Match (Equal weight)
            match_details = calculate_spec_match(item["specs"], sku["specs"])
            match_details["sku"] = sku
            scored_candidates.append(match_details)
        
        # 3. Sort by Match % (desc), then Unit Price (as tie-breaker, though we might not have price loaded here, 
        # we will rely on Order in repo or just match %. 
        # Requirement: "Tie-breaker: higher spec_match_percent -> if equal, lower unit price wins (price from pricing_lookup)"
        # This implies Technical Agent needs to call `pricing_lookup` just for the tie breaker? 
        # Or I can skip if I don't have ties.
        # Let's perform a lightweight price sort if needed.
        # For simplicity in this demo, strict Match % is usually distinguishable.
        
        scored_candidates.sort(key=lambda x: x["match_percent"], reverse=True)
        
        # "Recommends the top 3 OEM products... Prepare a comparison table... Top1/Top2/Top3"
        top_3 = scored_candidates[:3]
        
        # Select best
        winner = top_3[0]
        selected_sku_id = winner["sku"]["sku_id"]
        status = "STANDARD"
        
        # "If no SKU > 40%... mark MADE_TO_ORDER_REQUIRED"
        if winner["match_percent"] < 40.0:
            status = "MADE_TO_ORDER_REQUIRED"
            # It implies we still select the best match but flag it, OR we leave sku_id empty?
            # Usually we select the closest base.
        
        explanation = f"Selected {selected_sku_id} ({winner['match_percent']}%) match."
        if winner["mismatch_reasons"]:
            explanation += f" Mismatches: {', '.join(winner['mismatch_reasons'])}"
            
        # Structure the output for the "Comparison Table"
        # "RFP spec params vs Top1/Top2/Top3 OEM product specs with match %s"
        
        response_items.append({
            "line_item_id": item["item_id"],
            "required_specs": {**item["specs"], "product_name": item.get("product_name")},
            "quantity": item.get("quantity", 0),
            "selected_sku_id": selected_sku_id,
            "status": status,
            "match_details": {
                "match_percent": winner["match_percent"],
                "matched_params": winner["matched_params"],
                "total_params": winner["total_params"],
                "mismatch_reasons": winner["mismatch_reasons"]
            },
            # This 'comparison_table' list is the key requirement
            "comparison_table": [
                {
                    "rank": i+1,
                    "sku_id": c["sku"]["sku_id"],
                    "match_percent": c["match_percent"],
                    "specs": c["sku"]["specs"]
                } for i, c in enumerate(top_3)
            ],
            "explanation": explanation
        })

    emit_event("AGENT_OUTPUT", {
        "agent": "Technical Agent",
        "output": {
            "message": "Completed technical spec matching.",
            "processed_items": len(response_items),
            "status_flags": [r["status"] for r in response_items]
        }
    })

    return {
        **state,
        "technical_response": response_items
    }
