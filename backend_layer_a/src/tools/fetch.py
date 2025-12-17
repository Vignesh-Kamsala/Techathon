import json
import os
from datetime import datetime, timedelta

DATA_DIR = os.path.join(os.path.dirname(__file__), "../../data")

def fetch_local_rfps(demo_mode: bool = True):
    """
    Reads local JSON files for demo purposes.
    """
    rfps = []
    files = ["ideal_match_rfp.json", "partial_match_rfp.json"]
    for f in files:
        path = os.path.join(DATA_DIR, f)
        if os.path.exists(path):
            with open(path, "r") as json_file:
                rfps.extend(json.load(json_file))
    return rfps

def filter_rfps(rfps: list):
    """
    Filter RFPs with validation: date within 90 days.
    """
    # For demo persistence, we might mock "today" or use real date.
    # Requirement: "Filter only RFPs with deadlines within 90 days from runtime date."
    # But demo data has 2026 dates. I will assume "runtime" could be in 2025/2026 or just allow them.
    # To be safe for the demo, I'll set 'today' relative to the demo dates or just accept them if close enough.
    # Actually, let's just use real today, and ensure mock data is future enough. Mock data is 2026, real date is Dec 2025.
    # 2026-03-15 is ~3 months away. 2026-02-20 is ~2.5 months. So they should pass if we check < 90 days?
    # Wait, Dec 2025 to Feb 2026 is ~60-70 days. It should pass.
    
    valid_rfps = []
    today = datetime.now()
    cutoff = today + timedelta(days=90)
    
    for rfp in rfps:
        try:
            deadline = datetime.fromisoformat(rfp["submission_deadline"].replace("Z", ""))
            if today <= deadline <= cutoff:
                valid_rfps.append(rfp)
        except ValueError:
            pass # Invalid date format
            
    return valid_rfps

def scan_urls(urls: list[str]) -> list[dict]:
    """
    Simulates scanning a list of URLs.
    Generates mock RFP objects with deadlines.
    Some will be within 90 days, some outside.
    """
    scanned_rfps = []
    today = datetime.now()
    
    import random
    
    for i, url in enumerate(urls):
        # Generate a random deadline relative to today
        # Chance to be valid (10-80 days) or invalid (100-200 days)
        is_valid_date = random.choice([True, True, False]) # 66% chance valid
        
        days_offset = random.randint(10, 85) if is_valid_date else random.randint(95, 200)
        deadline = today + timedelta(days=days_offset)
        
        # Create a mock RFP
        rfp = {
            "id": f"scan_{i}_{int(today.timestamp())}",
            "title": f"RFP Detected from {url[:30]}...",
            "issuer": "Online Source",
            "submission_deadline": deadline.isoformat(),
            "scope_excerpt": f"This is an RFP extracted from {url}. It requires high voltage cabling and switchgear...",
            "estimated_value": random.randint(50000, 500000),
            "source_url": url,
            "status": "detected"
        }
        scanned_rfps.append(rfp)
        
    return scanned_rfps
