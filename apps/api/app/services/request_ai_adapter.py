from typing import Any


def to_ai_request_payload(request_obj: Any) -> dict:
    return {
        "request_id": request_obj.id,
        "project_name": getattr(request_obj, "project_name", None) or getattr(request_obj, "project", None).name if getattr(request_obj, "project", None) else None,
        "requester_name": getattr(request_obj, "requester_name", None),
        "request_type": getattr(request_obj, "request_type", None),
        "category": getattr(request_obj, "category", None),
        "priority": getattr(request_obj, "priority", None),
        "estimated_cost": float(getattr(request_obj, "estimated_cost", 0) or 0),
        "safety_flag": bool(getattr(request_obj, "safety_flag", False)),
        "description": getattr(request_obj, "description", None) or "",
        "metadata_json": getattr(request_obj, "metadata", None) or {},
    }