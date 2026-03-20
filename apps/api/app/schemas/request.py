from pydantic import BaseModel, ConfigDict

class RequestOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: int
    project_name: str | None = None
    requester_id: int
    requester_name: str | None = None
    request_type: str
    category: str
    title: str
    description: str
    estimated_cost: float
    priority: str
    safety_flag: bool
    status: str
    ai_summary: str | None = None
    ai_risk_level: str | None = None
    ai_suggested_route: str | None = None
    final_route: str | None = None
