from datetime import datetime

from pydantic import BaseModel, ConfigDict

class RequestEventOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    request_id: int
    actor_name: str
    action: str
    from_status: str | None = None
    to_status: str | None = None
    note: str | None = None
    created_at: datetime