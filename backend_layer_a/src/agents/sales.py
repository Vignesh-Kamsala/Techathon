from src.state import AgentState
from src.tools.fetch import fetch_local_rfps, filter_rfps
from src.utils.logger import emit_event

def sales_agent(state: AgentState) -> AgentState:
    emit_event("AGENT_START", {"agent": "Sales Agent", "pipeline_id": state["pipeline_id"]})
    
    # 1. Check for URL Mode
    rfp_url = state.get("rfp_url")
    if rfp_url:
        emit_event("AGENT_OUTPUT", {"agent": "Sales Agent", "stage": "Scan", "message": f"Scanning provided URL: {rfp_url}..."})
        
        # In a real app, we might do a lightweight metadata fetch here.
        # For this demo, we assume if a URL is provided, it's a valid RFP found by the user.
        # We construct a "Selected Object" wrapper for it.
        
        selected = {
            "id": "url_based_rfp",
            "title": "RFP from URL",
            "submission_deadline": "2026-02-28T00:00:00Z", # Mock acceptance
            "source_url": rfp_url,
            "reason_for_selection": f"User explicitly provided URL: {rfp_url}"
        }
        
        emit_event("AGENT_OUTPUT", {
            "agent": "Sales Agent",
            "output": {
                "selected_rfp": selected
            }
        })
        
        return {
            **state,
            "selected_rfp": selected,
            "selected_rfp_id": "url_based_rfp",
            "selection_reason": selected["reason_for_selection"]
        }

    # 2. Normal Scan / Fetch
    raw_rfps = fetch_local_rfps(state.get("demo_mode", True))
    
    # 3. Filter (Within 3 months / 90 days)
    valid_rfps = filter_rfps(raw_rfps)
    
    # Emit "detected_rfps" info
    emit_event("AGENT_OUTPUT", {
        "agent": "Sales Agent",
        "stage": "Scan",
        "detected_count": len(valid_rfps)
    })
    
    if not valid_rfps:
        emit_event("ERROR", {"message": "No valid RFPs found due within 90 days."})
        return {**state, "error": "NO_RFP_FOUND"}
    
    # 3. Select
    selected = None
    reason = ""
    
    # Check for Manual Selection Override
    manual_id = state.get("selected_rfp_id")
    if manual_id:
        # Find the requested RFP
        for rfp in valid_rfps:
            if rfp["id"] == manual_id:
                selected = rfp
                reason = f"Selected '{selected['title']}' because it was manually requested via API (ID: {manual_id})."
                break
        
        if not selected:
             # Fallback if ID not found? Or Error? Let's log warning and fallback to auto.
             emit_event("AGENT_OUTPUT", {"agent": "Sales Agent", "warning": f"Requested ID {manual_id} not found in valid set. Falling back to auto."})
    
    # Default / Auto Selection (Earliest Deadline)
    if not selected:
        valid_rfps.sort(key=lambda x: x["submission_deadline"])
        selected = valid_rfps[0]
        reason = f"Selected '{selected['title']}' because it has the earliest submission deadline ({selected['submission_deadline']})."
    
    # Output format: {id, title, issuer, submission_deadline, scope_excerpt, link, estimated_value, reason_for_selection}
    # My mock data has most keys. I'll ensure `reason_for_selection` is added.
    selected["reason_for_selection"] = reason
    
    emit_event("AGENT_OUTPUT", {
        "agent": "Sales Agent",
        "output": {
            "selected_rfp": {
                "id": selected["id"],
                "title": selected["title"],
                "submission_deadline": selected["submission_deadline"],
                "reason_for_selection": reason
            }
        }
    })
    
    return {
        **state,
        "available_rfps": valid_rfps,
        "selected_rfp_id": selected["id"],
        "selected_rfp": selected,
        "selection_reason": reason
    }
