from typing import Literal


FinalRoute = Literal[
    "site_supervisor",
    "project_manager",
    "director",
    "safety_officer",
    "needs_review",
]


def decide_final_route(
    *,
    estimated_cost: float | None,
    safety_flag: bool,
    risk_level: str,
    missing_fields: list[str],
) -> FinalRoute:
    if safety_flag:
        return "safety_officer"

    if risk_level == "high" and missing_fields:
        return "needs_review"

    cost = estimated_cost or 0.0

    if cost < 1000:
        return "site_supervisor"
    if cost < 5000:
        return "project_manager"
    return "director"