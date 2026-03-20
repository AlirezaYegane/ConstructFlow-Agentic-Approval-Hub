from pydantic import BaseModel, Field

class RequestCreate(BaseModel):
    project_id: int
    requester_id: int
    request_type: str = Field(min_length=2, max_length=50)
    category: str = Field(min_length=2, max_length=50)
    title: str = Field(min_length=3, max_length=160)
    description: str = Field(min_length=10)
    estimated_cost: float = Field(ge=0)
    priority: str = Field(min_length=2, max_length=20)
    safety_flag: bool = False