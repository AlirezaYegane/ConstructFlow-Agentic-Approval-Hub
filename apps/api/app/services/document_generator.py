from __future__ import annotations

from io import BytesIO
import re
from typing import Any

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas


class DocumentGenerationError(ValueError):
    pass


def _get(obj: Any, key: str, default: Any = None) -> Any:
    if isinstance(obj, dict):
        return obj.get(key, default)
    return getattr(obj, key, default)


def _slugify(value: str) -> str:
    value = re.sub(r"[^a-zA-Z0-9]+", "-", value).strip("-").lower()
    return value or "generated-document"


def build_document_payload(request_obj: Any) -> dict[str, str]:
    request_id = _get(request_obj, "id", "-")
    status = _get(request_obj, "status", "")

    if status not in {"approved", "document_generated", "notified", "closed"}:
        raise DocumentGenerationError(
            f"Document generation is not allowed for status '{status}'."
        )

    project_name = _get(request_obj, "project_name", "-")
    requester_name = _get(request_obj, "requester_name", "-")
    request_type = _get(request_obj, "request_type", "-")
    category = _get(request_obj, "category", "-")
    title = _get(request_obj, "title", "-")
    description = _get(request_obj, "description", "-")
    priority = _get(request_obj, "priority", "-")
    estimated_cost = _get(request_obj, "estimated_cost", "-")
    safety_flag = _get(request_obj, "safety_flag", False)
    ai_summary = _get(request_obj, "ai_summary", "-")
    ai_risk_level = _get(request_obj, "ai_risk_level", "-")
    final_route = _get(request_obj, "final_route", "-")

    doc_title = f"Variation Approval Document - Request {request_id}"

    content = f"""#{doc_title}

Project: {project_name}
Request ID: {request_id}
Requester: {requester_name}
Type: {request_type}
Category: {category}
Priority: {priority}
Estimated Cost: ${estimated_cost}
Safety Flag: {safety_flag}

Title:
{title}

Description:
{description}

AI Assessment:
{ai_summary}

AI Risk Level:
{ai_risk_level}

Final Route:
{final_route}

Approval Outcome:
This request has completed the approval gate and is ready for document-controlled downstream processing.
"""

    filename = _slugify(f"request-{request_id}-approval-document") + ".pdf"

    return {
        "title": doc_title,
        "filename": filename,
        "content": content,
    }


def _wrap_line(text: str, font_name: str, font_size: int, max_width: float) -> list[str]:
    words = text.split()
    if not words:
        return [""]

    lines: list[str] = []
    current = words[0]

    for word in words[1:]:
        trial = current + " " + word
        if stringWidth(trial, font_name, font_size) <= max_width:
            current = trial
        else:
            lines.append(current)
            current = word

    lines.append(current)
    return lines


def build_document_pdf(request_obj: Any) -> bytes:
    payload = build_document_payload(request_obj)

    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    margin_x = 18 * mm
    margin_y = 18 * mm
    usable_width = width - (2 * margin_x)

    y = height - margin_y

    title_font = "Helvetica-Bold"
    body_font = "Helvetica"
    title_size = 16
    body_size = 10
    line_gap = 5 * mm

    pdf.setTitle(payload["title"])

    pdf.setFont(title_font, title_size)
    pdf.drawString(margin_x, y, payload["title"])
    y -= 10 * mm

    for paragraph in payload["content"].splitlines():
        font_name = body_font
        font_size = body_size
        line = paragraph.strip()

        if line.startswith("#"):
            continue

        if not line:
            y -= 4 * mm
            if y <= margin_y:
                pdf.showPage()
                y = height - margin_y
            continue

        wrapped = _wrap_line(line, font_name, font_size, usable_width)

        for wrapped_line in wrapped:
            if y <= margin_y:
                pdf.showPage()
                y = height - margin_y

            pdf.setFont(font_name, font_size)
            pdf.drawString(margin_x, y, wrapped_line)
            y -= line_gap

    pdf.save()
    buffer.seek(0)
    return buffer.read()
