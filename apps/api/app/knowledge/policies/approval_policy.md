# Approval Policy

## Cost thresholds
- estimated_cost < 1000 -> site_supervisor
- 1000 <= estimated_cost < 5000 -> project_manager
- estimated_cost >= 5000 -> director

## Safety escalation
- Any request with safety_flag=true must be escalated to safety_officer.
- Any high-risk safety issue requires human approval.

## Missing information
- If material fields are missing, route to needs_review or needs_info before approval.
