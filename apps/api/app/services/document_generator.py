from __future__ import annotations

from io import BytesIO
import re
from typing import Any

from reportlab.lib import colors
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


def _safe_text(value: Any, fallback: str = "-") -> str:
    if value is None:
        return fallback
    text = str(value).strip()
    return text if text else fallback


def _resolve_project_name(request_obj: Any) -> str:
    direct_name = _get(request_obj, "project_name")
    if direct_name:
        return _safe_text(direct_name)

    project = getattr(request_obj, "project", None)
    if project is not None:
        project_name = getattr(project, "name", None)
        if project_name:
            return _safe_text(project_name)

    return f"Project #{_get(request_obj, 'project_id', '-')}"


def _resolve_requester_name(request_obj: Any) -> str:
    direct_name = _get(request_obj, "requester_name")
    if direct_name:
        return _safe_text(direct_name)

    requester = getattr(request_obj, "requester", None)
    if requester is not None:
        requester_name = (
            getattr(requester, "full_name", None)
            or getattr(requester, "name", None)
            or getattr(requester, "display_name", None)
        )
        if requester_name:
            return _safe_text(requester_name)

    return f"Requester #{_get(request_obj, 'requester_id', '-')}"


def _format_route(route_value: Any) -> str:
    text = _safe_text(route_value or "-")
    text = text.replace("→", ">").replace("->", ">")
    text = re.sub(r"\s*>\s*", " > ", text)
    return text.strip()


def build_document_payload(request_obj: Any) -> dict[str, str]:
    request_id = _get(request_obj, "id", "-")
    status = _get(request_obj, "status", "")

    if status not in {"approved", "document_generated", "notified", "closed"}:
        raise DocumentGenerationError(
            f"Document generation is not allowed for status '{status}'."
        )

    project_name = _resolve_project_name(request_obj)
    requester_name = _resolve_requester_name(request_obj)
    request_type = _safe_text(_get(request_obj, "request_type", "-"))
    category = _safe_text(_get(request_obj, "category", "-"))
    title = _safe_text(_get(request_obj, "title", "-"))
    description = _safe_text(_get(request_obj, "description", "-"))
    priority = _safe_text(_get(request_obj, "priority", "-"))
    estimated_cost = _get(request_obj, "estimated_cost", "-")
    safety_flag = _get(request_obj, "safety_flag", False)
    ai_summary = _safe_text(_get(request_obj, "ai_summary", "-"))
    ai_risk_level = _safe_text(_get(request_obj, "ai_risk_level", "-"))
    final_route = _format_route(_get(request_obj, "final_route", "-"))

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
    if not text:
        return [""]

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


def _draw_wrapped_text(
    pdf: canvas.Canvas,
    text: str,
    x: float,
    y: float,
    max_width: float,
    font_name: str,
    font_size: int,
    leading: float,
    color: colors.Color = colors.black,
) -> float:
    pdf.setFont(font_name, font_size)
    pdf.setFillColor(color)

    for paragraph in text.splitlines():
        paragraph = paragraph.strip()
        wrapped = _wrap_line(paragraph, font_name, font_size, max_width) if paragraph else [""]
        for line in wrapped:
            pdf.drawString(x, y, line)
            y -= leading
        if paragraph:
            y -= 1.5 * mm

    return y


def _draw_label_value(
    pdf: canvas.Canvas,
    label: str,
    value: str,
    x: float,
    y: float,
    width: float,
) -> None:
    pdf.setFillColor(colors.HexColor("#64748b"))
    pdf.setFont("Helvetica-Bold", 8)
    pdf.drawString(x, y, label.upper())

    pdf.setFillColor(colors.HexColor("#0f172a"))
    pdf.setFont("Helvetica", 10)

    wrapped = _wrap_line(value, "Helvetica", 10, width)
    current_y = y - 5 * mm
    for line in wrapped[:2]:
        pdf.drawString(x, current_y, line)
        current_y -= 4.5 * mm


def build_document_pdf(request_obj: Any) -> bytes:
    payload = build_document_payload(request_obj)

    request_id = _get(request_obj, "id", "-")
    project_name = _resolve_project_name(request_obj)
    requester_name = _resolve_requester_name(request_obj)
    request_type = _safe_text(_get(request_obj, "request_type", "-"))
    category = _safe_text(_get(request_obj, "category", "-"))
    title = _safe_text(_get(request_obj, "title", "-"))
    description = _safe_text(_get(request_obj, "description", "-"))
    priority = _safe_text(_get(request_obj, "priority", "-"))
    estimated_cost = _get(request_obj, "estimated_cost", "-")
    ai_summary = _safe_text(_get(request_obj, "ai_summary", "-"))
    ai_risk_level = _safe_text(_get(request_obj, "ai_risk_level", "-"))
    final_route = _format_route(_get(request_obj, "final_route", "-"))

    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4

    margin_x = 16 * mm
    usable_width = width - (2 * margin_x)

    navy = colors.HexColor("#0f172a")
    violet = colors.HexColor("#7c3aed")
    green = colors.HexColor("#10b981")
    light_bg = colors.HexColor("#f8fafc")
    border = colors.HexColor("#cbd5e1")
    text_main = colors.HexColor("#0f172a")
    text_muted = colors.HexColor("#475569")

    pdf.setTitle(payload["title"])

    pdf.setFillColor(navy)
    pdf.roundRect(margin_x, height - 42 * mm, usable_width, 26 * mm, 4 * mm, fill=1, stroke=0)

    pdf.setFillColor(colors.white)
    pdf.setFont("Helvetica-Bold", 18)
    pdf.drawString(margin_x + 8 * mm, height - 28 * mm, "ConstructFlow Approval Record")

    pdf.setFont("Helvetica", 10)
    pdf.drawString(
        margin_x + 8 * mm,
        height - 34 * mm,
        f"Controlled document for request {request_id}",
    )

    badge_w = 38 * mm
    badge_h = 10 * mm
    badge_x = margin_x + usable_width - badge_w - 8 * mm
    badge_y = height - 33 * mm
    pdf.setFillColor(green)
    pdf.roundRect(badge_x, badge_y, badge_w, badge_h, 4 * mm, fill=1, stroke=0)
    pdf.setFillColor(colors.white)
    pdf.setFont("Helvetica-Bold", 9)
    pdf.drawCentredString(badge_x + badge_w / 2, badge_y + 3.2 * mm, "DOCUMENT READY")

    y = height - 52 * mm

    pdf.setFillColor(text_main)
    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawString(margin_x, y, payload["title"])
    y -= 9 * mm

    box_h = 38 * mm
    pdf.setFillColor(light_bg)
    pdf.setStrokeColor(border)
    pdf.roundRect(margin_x, y - box_h, usable_width, box_h, 4 * mm, fill=1, stroke=1)

    left_x = margin_x + 6 * mm
    right_x = margin_x + usable_width / 2 + 2 * mm
    row1_y = y - 7 * mm
    row2_y = y - 17 * mm

    _draw_label_value(pdf, "Project", project_name, left_x, row1_y, 70 * mm)
    _draw_label_value(pdf, "Requester", requester_name, right_x, row1_y, 60 * mm)
    _draw_label_value(pdf, "Type / Category", f"{request_type} / {category}", left_x, row2_y, 70 * mm)
    _draw_label_value(pdf, "Priority / Risk", f"{priority} / {ai_risk_level}", right_x, row2_y, 60 * mm)
    _draw_label_value(pdf, "Estimated Cost", f"${estimated_cost}", left_x, row2_y - 10 * mm, 70 * mm)
    _draw_label_value(pdf, "Final Route", final_route, right_x, row2_y - 10 * mm, 60 * mm)

    y -= box_h + 8 * mm

    def draw_section(heading: str, body: str, current_y: float) -> float:
        pdf.setFillColor(violet)
        pdf.roundRect(margin_x, current_y - 6 * mm, usable_width, 8 * mm, 2 * mm, fill=1, stroke=0)
        pdf.setFillColor(colors.white)
        pdf.setFont("Helvetica-Bold", 10)
        pdf.drawString(margin_x + 4 * mm, current_y - 3.2 * mm, heading)

        current_y -= 12 * mm
        current_y = _draw_wrapped_text(
            pdf,
            body,
            margin_x,
            current_y,
            usable_width,
            "Helvetica",
            11,
            5.2 * mm,
            text_main,
        )
        return current_y - 3 * mm

    y = draw_section("Request Title", title, y)
    y = draw_section("Description", description, y)
    y = draw_section("AI Assessment", ai_summary, y)
    y = draw_section(
        "Approval Outcome",
        "This request has completed the approval gate and is ready for document-controlled downstream processing.",
        y,
    )

    pdf.setFillColor(text_muted)
    pdf.setFont("Helvetica", 8)
    pdf.drawRightString(width - margin_x, 10 * mm, "Generated by ConstructFlow AI")

    pdf.save()
    buffer.seek(0)
    return buffer.read()