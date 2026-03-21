from langchain_core.messages import HumanMessage, SystemMessage
from .llm import get_chat_model
from .prompt_loader import load_prompt
from .schemas import IntakeAnalysis


def run_intake_analysis(request_payload: dict) -> IntakeAnalysis:
    system_text = load_prompt("global_system.txt")
    user_template = load_prompt("intake_analysis.txt")

    prompt = user_template.format(
        request_id=request_payload["request_id"],
        project_name=request_payload.get("project_name"),
        requester_name=request_payload.get("requester_name"),
        request_type=request_payload.get("request_type"),
        category=request_payload.get("category"),
        priority=request_payload.get("priority"),
        estimated_cost=request_payload.get("estimated_cost"),
        safety_flag=request_payload.get("safety_flag"),
        description=request_payload.get("description"),
        metadata_json=request_payload.get("metadata_json"),
    )

    model = get_chat_model().with_structured_output(IntakeAnalysis)
    return model.invoke(
        [
            SystemMessage(content=system_text),
            HumanMessage(content=prompt),
        ]
    )