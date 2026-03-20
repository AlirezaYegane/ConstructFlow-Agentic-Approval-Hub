from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column
from app.db.session import Base

class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120))
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    address: Mapped[str] = mapped_column(String(255))
    client_name: Mapped[str] = mapped_column(String(120))
