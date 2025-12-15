from typing import TypedDict, List, Dict, Any, Optional

class AgentState(TypedDict):
    # Pipeline metadata
    pipeline_id: str
    
    # Inputs
    demo_mode: bool
    rfp_url: Optional[str]
    
    # Sales Agent Outputs
    available_rfps: List[Dict]
    selected_rfp_id: Optional[str]
    selected_rfp: Optional[Dict]
    selection_reason: Optional[str]
    
    # Main Agent (Start) Outputs
    tech_summary: List[Dict] # List of line items with specs
    pricing_summary: List[Dict] # List of items with test reqs
    
    # Technical Agent Outputs
    technical_response: List[Dict] # "The final table" with recommendations
    
    # Pricing Agent Outputs
    pricing_response: List[Dict] # Consolidated price table
    
    # Main Agent (End) Outputs
    final_response: Optional[Dict] # The big JSON
    
    # Errors
    error: Optional[str]
