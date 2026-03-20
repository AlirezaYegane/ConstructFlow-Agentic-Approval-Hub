def evaluate_request(
    *,
    request_type: str,
    category: str,
    title: str,
    description: str,
    estimated_cost: float,
    priority: str,
    safety_flag: bool,
) -> dict:
    normalized_type = request_type.strip().lower()
    normalized_priority = priority.strip().lower()

    if safety_flag:
        risk = "high"
        route_steps = ["site_supervisor", "project_manager", "director"]
        reason = "Safety-related item requires immediate escalation."
    elif estimated_cost >= 5000 or normalized_priority == "high":
        risk = "high" if estimated_cost >= 10000 else "medium"
        route_steps = ["project_manager", "director"]
        reason = "Cost and/or priority requires management approval."
    elif normalized_type == "variation":
        risk = "medium" if estimated_cost >= 1500 else "low"
        route_steps = ["contracts_admin", "project_manager"]
        reason = "Commercial variation should be reviewed by contracts and project management."
    else:
        risk = "low"
        route_steps = ["site_supervisor", "project_manager"]
        reason = "Standard operational workflow."

    route_label = " > ".join(route_steps)
    summary = (
        f"{title}: {reason} "
        f"Category={category}; estimated_cost=${estimated_cost:.0f}; "
        f"priority={priority}; safety_flag={str(safety_flag).lower()}."
    )

    return {
        "risk": risk,
        "route_steps": route_steps,
        "route_label": route_label,
        "summary": summary,
    }
