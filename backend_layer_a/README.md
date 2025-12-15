# Layer A: RFP Automation Backend (LangGraph)

This is the backend for the RFP Automation prototype, implementing a deterministic Multi-Agent System.

## Architecture: Main Agent + Workers

The system follows a strict Hub-and-Spoke / Orchestrator pattern managed by LangGraph:

1.  **Sales Agent**: 
    - Scans configured sources.
    - Selects the RFP with the earliest deadline (within 90 days).
    - Outputs structured selection justification.
2.  **Main Agent (Main Orchestrator)**:
    - **Start**: Receives the selected RFP, parses the "Scope of Supply", and generates role-specific summaries (Technical Summary vs Pricing Summary).
    - **End**: Consolidates the outputs from Technical and Pricing agents into the final logic.
3.  **Technical Agent**:
    - Receives Technical Summary.
    - Performs deterministic SKU matching against `product_repo.json` (±10% numeric tolerance, synonyms).
    - Outputs a "Comparison Table" with Match %.
    - Flags items as `MADE_TO_ORDER_REQUIRED` if match < 40%.
4.  **Pricing Agent**:
    - Receives Pricing Summary (Tests) and Technical Recommendations.
    - Calculates Unit Prices and Test Costs from `pricing_db.json`.
    - Returns a Consolidated Price Table.

## Integration (Layer B)

**Layer B (Frontend)** is expected to integrate via `fastai` (or standard HTTP client) consuming the following interface:

- **API Endpoints**:
    - `POST /api/v1/scan`: Trigger scan.
    - `POST /api/v1/trigger`: Start pipeline (returns `pipeline_id`).
    - `GET /api/v1/pipeline/{id}/final`: Get the final consolidated JSON.
- **Events**:
    - WebSocket `/ws` emits `AGENT_OUTPUT` events.
    - Layer B should visualize these events to show the "Thinking" process of the agents.

## Setup & Run

1.  **Install**:
    ```bash
    pip install -r requirements.txt
    ```
    *(Note: dependencies include fastapi, uvicorn, langgraph, langchain, pydantic)*

2.  **Run Server**:
    ```bash
    uvicorn src.main:app --reload
    ```

3.  **Run Demo**:
    ```bash
    python client_demo.py
    ```

## Demo Scenarios

The `data/` folder contains two scenarios. The **Sales Agent** will automatically pick **RFP 002** (Chemical Plant) because it expires in Feb 2026 (vs Mar 2026 for RFP 001).

**Expected Outcome for RFP 002**:
- **Line Item 1**: Standard Match.
- **Line Item 2**: `MADE_TO_ORDER_REQUIRED` (Custom Submarine Cable).
- **Line Item 3**: Standard Match.

To force RFP 001, you would typically modify the mock deadlines.
