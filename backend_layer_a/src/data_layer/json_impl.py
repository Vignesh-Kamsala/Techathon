import json
import os
from typing import List, Dict, Any, Optional
from src.data_layer.protocols import ProductRepository, PricingRepository

# Configure path relative to this file, or we could pass it in. 
# For this refactor we maintain the logic that was in src/tools/...
# which assumed ../../data
DATA_DIR = os.path.join(os.path.dirname(__file__), "../../data")

class JsonProductRepository(ProductRepository):
    def __init__(self, data_dir: str = DATA_DIR):
        self.data_dir = data_dir
        self._cache = None

    def _load(self) -> List[Dict]:
        if self._cache is not None:
            return self._cache
            
        path = os.path.join(self.data_dir, "product_repo.json")
        try:
            with open(path, 'r') as f:
                self._cache = json.load(f)
        except FileNotFoundError:
            self._cache = []
        return self._cache

    def get_all(self) -> List[Dict]:
        return self._load()

    def find_by_specs(self, specs: Dict) -> List[Dict]:
        repo = self._load()
        results = []
        req_voltage = specs.get("voltage")
        
        for sku in repo:
            if req_voltage:
                # Logic ported from src/tools/product.py
                if req_voltage.lower() in sku["specs"].get("voltage", "").lower():
                    results.append(sku)
            else:
                results.append(sku)
        
        # Fallback if empty (as per original logic)
        if not results:
            return repo
            
        return results

class JsonPricingRepository(PricingRepository):
    def __init__(self, data_dir: str = DATA_DIR):
        self.data_dir = data_dir
        self._cache = None
        
    def _load(self) -> Dict:
        if self._cache is not None:
            return self._cache
            
        path = os.path.join(self.data_dir, "pricing_db.json")
        try:
            with open(path, 'r') as f:
                self._cache = json.load(f)
        except FileNotFoundError:
            self._cache = {"tests": {}, "prices": {}, "avg_unit_price": 0.0}
        return self._cache

    def get_price_for_sku(self, sku_id: str) -> Dict[str, Any]:
        db = self._load()
        price = db.get("prices", {}).get(sku_id)
        if price is None:
            return {"price": db.get("avg_unit_price", 0.0), "is_estimate": True}
        return {"price": price, "is_estimate": False}

    def get_test_cost(self, test_name: str) -> Dict[str, Any]:
        db = self._load()
        tests = db.get("tests", {})
        
        # Logic ported from src/tools/pricing.py: fuzzy match
        for tid, details in tests.items():
            if tid.lower() in test_name.lower() or test_name.lower() in tid.lower():
                return details
                
        return {"cost": 0, "billing": "unknown"}
