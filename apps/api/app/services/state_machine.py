from dataclasses import dataclass

TERMINAL_STATES = {"approved", "rejected", "closed"}

ALLOWED_TRANSITIONS: dict[str, set[str]] = {
    "draft": {"submitted"},
    "submitted": {"under_review", "approved", "rejected", "needs_info"},
    "under_review": {"approved", "rejected", "needs_info"},
    "needs_info": {"submitted", "under_review"},
    "approved": {"document_generated"},
    "rejected": {"closed"},
    "document_generated": {"notified"},
    "notified": {"closed"},
    "closed": set(),
}


class InvalidTransitionError(ValueError):
    pass


@dataclass(frozen=True)
class TransitionResult:
    from_status: str
    to_status: str
    changed: bool


def can_transition(from_status: str, to_status: str) -> bool:
    allowed = ALLOWED_TRANSITIONS.get(from_status, set())
    return to_status in allowed


def ensure_transition(from_status: str, to_status: str) -> TransitionResult:
    if from_status == to_status:
        raise InvalidTransitionError(
            f"Request is already in status '{from_status}'."
        )

    if not can_transition(from_status, to_status):
        raise InvalidTransitionError(
            f"Invalid status transition: '{from_status}' -> '{to_status}'."
        )

    return TransitionResult(
        from_status=from_status,
        to_status=to_status,
        changed=True,
    )
