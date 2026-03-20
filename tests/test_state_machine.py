from app.services.state_machine import can_transition, ensure_transition, InvalidTransitionError


def test_submitted_can_be_approved():
    result = ensure_transition("submitted", "approved")
    assert result.to_status == "approved"


def test_under_review_can_be_rejected():
    result = ensure_transition("under_review", "rejected")
    assert result.to_status == "rejected"


def test_approved_cannot_be_approved_again():
    try:
        ensure_transition("approved", "approved")
        assert False, "Expected InvalidTransitionError"
    except InvalidTransitionError:
        assert True


def test_rejected_cannot_transition_to_approved():
    assert can_transition("rejected", "approved") is False
