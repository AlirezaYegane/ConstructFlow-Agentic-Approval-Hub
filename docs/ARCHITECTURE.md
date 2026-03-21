# Architecture

## Goal
A governed workflow system for construction approvals with auditability and controlled AI assistance.

## Principles
- AI supports analysis and drafting
- approvals remain human-supervised
- routing remains deterministic
- major transitions are auditable

## Components
- Frontend: dashboard, request list, request detail, workflow page
- Backend: requests API, approval actions, document generation, dashboard APIs
- Storage: SQLite
- Output: document preview + PDF

## State flow
submitted -> approved/rejected -> document_generated -> notified -> closed
