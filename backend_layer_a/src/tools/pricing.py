import json
import os

DATA_DIR = os.path.join(os.path.dirname(__file__), "../../data")

def get_pricing_db():
    path = os.path.join(DATA_DIR, "pricing_db.json")
    with open(path, 'r') as f:
        return json.load(f)

def get_price_for_sku(sku_id: str):
    db = get_pricing_db()
    price = db["prices"].get(sku_id)
    if price is None:
        return {"price": db["avg_unit_price"], "is_estimate": True}
    return {"price": price, "is_estimate": False}

def get_test_cost(test_id_or_name: str):
    db = get_pricing_db()
    # fuzzy match test key
    for tid, details in db["tests"].items():
        if tid.lower() in test_id_or_name.lower() or test_id_or_name.lower() in tid.lower():
            return details
    return {"cost": 0, "billing": "unknown"}
