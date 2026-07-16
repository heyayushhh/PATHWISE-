from langgraph.graph import StateGraph, END

from app.graph.state import CareerState
from app.graph.nodes import (
    build_prompt_node,
    gemini_node,
    parser_node,
)

workflow = StateGraph(CareerState)

workflow.add_node("build_prompt", build_prompt_node)
workflow.add_node("call_gemini", gemini_node)
workflow.add_node("parse_response", parser_node)

workflow.set_entry_point("build_prompt")

workflow.add_edge("build_prompt", "call_gemini")
workflow.add_edge("call_gemini", "parse_response")
workflow.add_edge("parse_response", END)

career_graph = workflow.compile()