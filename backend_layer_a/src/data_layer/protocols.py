from typing import Protocol, List, Dict, Optional, Any

class ProductRepository(Protocol):
    def find_by_specs(self, specs: Dict) -> List[Dict]:
        """
        Find candidates matching specific technical specifications.
        """
        ...
        
    def get_all(self) -> List[Dict]:
        """
        Return all products (for fallback).
        """
        ...

class PricingRepository(Protocol):
    def get_price_for_sku(self, sku_id: str) -> Dict[str, Any]:
        """
        Get base price details for a SKU.
        Returns dict with keys: 'price' (float), 'is_estimate' (bool)
        """
        ...
        
    def get_test_cost(self, test_name: str) -> Dict[str, Any]:
        """
        Get cost details for a specific test/service.
        Returns dict with keys: 'cost' (float), 'billing' (str)
        """
        ...
