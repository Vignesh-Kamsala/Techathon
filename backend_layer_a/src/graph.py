from langgraph.graph import StateGraph, END
from src.state import AgentState
from src.agents.sales import sales_agent
from src.agents.main_agent import main_agent_start, main_agent_end
from src.agents.technical import technical_agent
from src.agents.pricing import pricing_agent

def create_graph():
    workflow = StateGraph(AgentState)
    
    # Add Nodes
    workflow.add_node("sales_agent", sales_agent)
    workflow.add_node("main_agent_start", main_agent_start)
    workflow.add_node("technical_agent", technical_agent)
    workflow.add_node("pricing_agent", pricing_agent)
    workflow.add_node("main_agent_end", main_agent_end)
    
    # Add Edges
    workflow.set_entry_point("sales_agent")
    
    workflow.add_edge("sales_agent", "main_agent_start")
    workflow.add_edge("main_agent_start", "technical_agent")
    workflow.add_edge("technical_agent", "pricing_agent")
    workflow.add_edge("pricing_agent", "main_agent_end")
    workflow.add_edge("main_agent_end", END)
    
    return workflow.compile()

app_graph = create_graph()
