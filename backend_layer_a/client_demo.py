import sys
import os
import json
import time
from fastapi.testclient import TestClient

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), "src"))

from src.main import app

client = TestClient(app)

def run_pipeline(scenario_name, rfp_id=None, rfp_url=None):
    print(f"\n\n================================================")
    print(f"RUNNING SCENARIO: {scenario_name}")
    print(f"================================================")
    
    # 1. Scan (Skip scan for URL mode, or just show it works)
    if not rfp_url:
        print("[Step 1] Scanning for RFPs...")
        response = client.post("/api/v1/scan", json={"demo": True})
        print(f"Status: {response.status_code}")
        scan_data = response.json()
        print("Detected RFPs:", json.dumps(scan_data, indent=2))
    
    # 2. Trigger Pipeline
    print(f"\n[Step 2] Triggering Pipeline...")
    payload = {}
    if rfp_id: payload["rfp_id"] = rfp_id
    if rfp_url: payload["rfp_url"] = rfp_url
    
    response = client.post("/api/v1/trigger", json=payload)
    pipeline_data = response.json()
    pipeline_id = pipeline_data["pipeline_id"]
    print(f"Pipeline ID: {pipeline_id}")
    
    # 3. Poll for Completion
    print("\n[Step 3] Waiting for Agents...")
    max_retries = 10
    final_result = None
    
    for _ in range(max_retries):
        time.sleep(1) 
        status_resp = client.get(f"/api/v1/pipeline/{pipeline_id}/final")
        res = status_resp.json()
        if "error" not in res:
            final_result = res
            print("Pipeline Completed!")
            break
        else:
            print("Status: Working...")
    
    if not final_result:
        print("Timeout waiting for pipeline.")
        return

    # 4. Display Results
    print("\n=== FINAL CONSOLIDATED RESPONSE ===")
    
    # Validation
    rfp_id_out = final_result.get("rfp_id")
    grand_total = final_result.get("grand_total")
    items = final_result.get("consolidated_response", [])
    
    print(f"Processed RFP ID: {rfp_id_out}")
    print(f"Grand Total: ${grand_total}")
    print(f"Items Processed: {len(items)}")
    
    for item in items:
        print(f"- Item: {item.get('product_description', 'N/A')}")
        print(f"  SKU: {item['selected_sku']}")
        print(f"  Price Estimate: {item.get('price_estimate')}")
        print(f"  Status: {item.get('status')}")

def run_demo():
    # # Scenario A: Auto (should pick rfp_002)
    # run_pipeline("AUTO-SELECT (Default: Earliest Deadline)", rfp_id="auto")
    
    # # Scenario B: Manual (force rfp_001)
    # run_pipeline("MANUAL-SELECT (Ideal Match: rfp_001)", rfp_id="rfp_001")
    
    # Scenario C: URL (Huge RFP)
    run_pipeline("URL-INGESTION (Complex PDF Simulator)", rfp_url="https://share.google/AT8LkDrHQdAEUJRSg")

if __name__ == "__main__":
    run_demo()
