from sqlalchemy import String, Text, Boolean, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.db.session import Base

class Request(Base):
    __tablename__ = "requests"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"))
    requester_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    request_type: Mapped[str] = mapped_column(String(50))
    category: Mapped[str] = mapped_column(String(50))
    title: Mapped[str] = mapped_column(String(160))
    description: Mapped[str] = mapped_column(Text)
    estimated_cost: Mapped[float] = mapped_column(Float, default=0)
    priority: Mapped[str] = mapped_column(String(20))
    safety_flag: Mapped[bool] = mapped_column(Boolean, default=False)
    status: Mapped[str] = mapped_column(String(30), default="submitted")
    ai_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    ai_risk_level: Mapped[str | None] = mapped_column(String(20), nullable=True)
    ai_suggested_route: Mapped[str | None] = mapped_column(String(50), nullable=True)
    final_route: Mapped[str | None] = mapped_column(String(50), nullable=True)
