from src.state import AgentState
# from src.tools.pricing import get_price_for_sku, get_test_cost # OLD
from src.data_layer.json_impl import JsonPricingRepository
from src.utils.logger import emit_event

def pricing_agent(state: AgentState) -> AgentState:
    emit_event("AGENT_START", {"agent": "Pricing Agent", "pipeline_id": state["pipeline_id"]})
    
    # Dependency: Pricing Repository
    repo = state.get("deps", {}).get("pricing_repo") or JsonPricingRepository()

    tech_items = state.get("technical_response", [])
    pricing_reqs = {p["item_id"]: p.get("tests", []) for p in state.get("pricing_summary", [])}
    
    consolidated_table = []
    
    for item in tech_items:
        sku_id = item["selected_sku_id"]
        qty = item["quantity"]
        item_id = item["line_item_id"]
        
        # 1. Base Price (Dummy pricing table rule)
        price_info = repo.get_price_for_sku(sku_id)
        unit_price = price_info["price"]
        is_estimate = price_info["is_estimate"] # Fallback flag
        
        # 2. Material Total
        material_total = unit_price * qty
        
        # 3. Tests (Dummy services price table rule)
        tests_applied = []
        tests_cost_total = 0.0
        req_tests = pricing_reqs.get(item_id, [])
        
        for t_name in req_tests:
            t_info = repo.get_test_cost(t_name)
            cost = t_info["cost"]
            billing = t_info.get("billing", "per_unit")
            
            charge = cost
            if billing == "per_unit":
                charge = cost * qty
            
            tests_cost_total += charge
            tests_applied.append({
                "test_name": t_name,
                "cost": cost,
                "billing": billing,
                "total_charge": charge
            })
            
        line_total = material_total + tests_cost_total
        
        # "Consolidates total material price and services (test) price for every product"
        consolidated_table.append({
            "line_item_id": item_id,
            "product_description": item["required_specs"].get("product_name"),
            "selected_sku": sku_id,
            "quantity": qty,
            "unit_price": unit_price,
            "price_estimate": is_estimate,
            "material_total": material_total,
            "tests_total": tests_cost_total,
            "line_total": line_total,
            "status": item["status"],
            "explanation": item["explanation"],
            # Preserve Technical details for UI
            "comparison_table": item.get("comparison_table", []),
            "match_details": item.get("match_details", {})
        })

    emit_event("AGENT_OUTPUT", {
        "agent": "Pricing Agent",
        "output": {
            "message": "Calculated prices for all items.",
            "total_line_items": len(consolidated_table)
        }
    })
    
    return {
        **state,
        "pricing_response": consolidated_table
    }
