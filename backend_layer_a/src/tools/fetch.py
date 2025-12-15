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
