from typing import Any
from sqlalchemy.orm import Session

from app.models.project import Project
from app.models.user import User


def to_ai_request_payload(request_obj: Any, db: Session) -> dict:
    project_name = None
    requester_name = None

    # direct attrs if they exist
    project_name = getattr(request_obj, "project_name", None)
    requester_name = getattr(request_obj, "requester_name", None)

    # relationship fallback if relationships exist later
    project_rel = getattr(request_obj, "project", None)
    if not project_name and project_rel is not None:
        project_name = getattr(project_rel, "name", None) or getattr(project_rel, "title", None)

    requester_rel = getattr(request_obj, "requester", None)
    if not requester_name and requester_rel is not None:
        requester_name = (
            getattr(requester_rel, "full_name", None)
            or getattr(requester_rel, "name", None)
            or getattr(requester_rel, "email", None)
        )

    # DB lookup fallback using foreign keys
    if not project_name and getattr(request_obj, "project_id", None):
        project = db.get(Project, request_obj.project_id)
        if project is not None:
            project_name = getattr(project, "name", None) or getattr(project, "title", None)

    if not requester_name and getattr(request_obj, "requester_id", None):
        user = db.get(User, request_obj.requester_id)
        if user is not None:
            requester_name = (
                getattr(user, "full_name", None)
                or getattr(user, "name", None)
                or getattr(user, "email", None)
            )

    return {
        "request_id": request_obj.id,
        "project_name": project_name,
        "requester_name": requester_name,
        "request_type": getattr(request_obj, "request_type", None),
        "category": getattr(request_obj, "category", None),
        "priority": getattr(request_obj, "priority", None),
        "estimated_cost": float(getattr(request_obj, "estimated_cost", 0) or 0),
        "safety_flag": bool(getattr(request_obj, "safety_flag", False)),
        "description": getattr(request_obj, "description", None) or "",
        "metadata_json": getattr(request_obj, "metadata", None) or {},
    }