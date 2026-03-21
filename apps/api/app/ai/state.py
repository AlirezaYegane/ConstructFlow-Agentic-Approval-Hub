from typing import Any, TypedDict


class WorkflowState(TypedDict, total=False):
    request_id: int
    request_data: dict[str, Any]
    attachments_summary: list[dict[str, Any]]
    intake_analysis: dict[str, Any]
    final_route: str
    human_decision_required: bool
    status: str