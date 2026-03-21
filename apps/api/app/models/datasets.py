from __future__ import annotations

from datetime import datetime
from sqlalchemy import Boolean, DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class ExternalIncident(Base):
    __tablename__ = "external_incidents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    source_dataset: Mapped[str] = mapped_column(String(100), index=True)
    source_record_id: Mapped[str] = mapped_column(String(100), unique=True, index=True)

    event_date: Mapped[str | None] = mapped_column(String(50), nullable=True)
    employer: Mapped[str | None] = mapped_column(String(255), nullable=True)
    city: Mapped[str | None] = mapped_column(String(120), nullable=True)
    state: Mapped[str | None] = mapped_column(String(120), nullable=True)
    zip: Mapped[str | None] = mapped_column(String(20), nullable=True)

    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)

    primary_naics: Mapped[str | None] = mapped_column(String(20), nullable=True)

    hospitalized: Mapped[bool] = mapped_column(Boolean, default=False)
    amputation: Mapped[bool] = mapped_column(Boolean, default=False)
    loss_of_eye: Mapped[bool] = mapped_column(Boolean, default=False)

    inspection: Mapped[str | None] = mapped_column(String(50), nullable=True)

    nature_code: Mapped[str | None] = mapped_column(String(20), nullable=True)
    nature_title: Mapped[str | None] = mapped_column(String(255), nullable=True)

    part_of_body_code: Mapped[str | None] = mapped_column(String(20), nullable=True)
    part_of_body_title: Mapped[str | None] = mapped_column(String(255), nullable=True)

    event_code: Mapped[str | None] = mapped_column(String(20), nullable=True)
    event_title: Mapped[str | None] = mapped_column(String(255), nullable=True)

    source_code: Mapped[str | None] = mapped_column(String(20), nullable=True)
    source_title: Mapped[str | None] = mapped_column(String(255), nullable=True)

    secondary_source_code: Mapped[str | None] = mapped_column(String(20), nullable=True)
    secondary_source_title: Mapped[str | None] = mapped_column(String(255), nullable=True)

    federal_state: Mapped[str | None] = mapped_column(String(20), nullable=True)
    final_narrative: Mapped[str | None] = mapped_column(Text, nullable=True)

    risk_label: Mapped[str | None] = mapped_column(String(50), index=True, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class DocumentCorpus(Base):
    __tablename__ = "document_corpus"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    source_dataset: Mapped[str] = mapped_column(String(100), index=True)
    source_record_id: Mapped[str] = mapped_column(String(100), unique=True, index=True)

    split: Mapped[str | None] = mapped_column(String(20), nullable=True)
    doc_type: Mapped[str | None] = mapped_column(String(50), nullable=True)

    image_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    annotation_path: Mapped[str | None] = mapped_column(String(500), nullable=True)

    form_items: Mapped[int | None] = mapped_column(Integer, nullable=True)
    words_count: Mapped[int | None] = mapped_column(Integer, nullable=True)

    question_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    answer_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    header_count: Mapped[int | None] = mapped_column(Integer, nullable=True)
    other_count: Mapped[int | None] = mapped_column(Integer, nullable=True)

    text_preview: Mapped[str | None] = mapped_column(Text, nullable=True)
    full_text: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class TrainingCase(Base):
    __tablename__ = "training_cases"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    case_id: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    task_type: Mapped[str] = mapped_column(String(50), index=True)
    source_dataset: Mapped[str] = mapped_column(String(100), index=True)
    source_record_id: Mapped[str | None] = mapped_column(String(100), nullable=True)

    input_text: Mapped[str] = mapped_column(Text)
    expected_risk: Mapped[str | None] = mapped_column(String(50), nullable=True)
    expected_route: Mapped[str | None] = mapped_column(String(255), nullable=True)
    expected_document_type: Mapped[str | None] = mapped_column(String(100), nullable=True)

    metadata_json: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)