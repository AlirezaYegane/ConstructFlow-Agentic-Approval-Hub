# ConstructFlow Agentic Approval Hub

ConstructFlow Agentic Approval Hub is a governed workflow system for construction approval operations. It is designed to help teams intake requests, support human decision-making with AI, retrieve relevant policy context, generate controlled documents, and maintain a complete audit trail from submission to final output.

This project was built as an MVP to demonstrate how agentic AI can be used in a practical, structured, and accountable way inside construction and project approval workflows.

---

## Why this project exists

Construction teams often deal with variations, defects, safety issues, and internal approvals across fragmented tools and informal communication channels. That creates real operational problems:

- inconsistent triage and routing
- unclear decision ownership
- weak document control
- limited audit visibility
- duplicated manual work
- delays between review, approval, and communication

ConstructFlow addresses that by bringing the workflow into one governed system.

Instead of using AI as a decorative chatbot layer, this project uses AI in a controlled and reviewable process:
- analyze incoming requests
- ground decisions in policy context
- preserve human approval gates
- generate controlled outputs
- keep a clear event history

---

## Core capabilities

- Structured request intake
- AI-assisted request analysis
- Policy-aware context retrieval
- Governed routing support
- Human-in-the-loop approval workflow
- Controlled document preview generation
- PDF document export
- AI-assisted document validation
- AI-generated notification draft
- Full audit trail and event history
- Dashboard and reporting views

---

## Product workflow

A typical request flows through the following stages:

1. A request is submitted
2. AI analyzes the request and summarizes the issue
3. Relevant policy context is retrieved
4. The system supports the routing decision
5. A human reviewer approves or rejects the request
6. A controlled document is generated
7. The document can be previewed or exported as PDF
8. AI can validate the draft output
9. AI can generate a notification draft
10. Every transition is recorded in the audit trail

This creates a workflow that feels operationally governed rather than loosely automated.

---

## Tech stack

### Frontend
- Next.js
- TypeScript
- Tailwind CSS

### Backend
- FastAPI
- SQLAlchemy
- Pydantic

### Data and retrieval
- PostgreSQL
- Chroma vector store

### AI services
- Gemini model for analysis, drafting, and validation
- Google embedding model for retrieval

### Document generation
- ReportLab

---

## Repository structure

```text
constructflow-agentic-approval-hub/
├── apps/
│   ├── api/
│   │   ├── app/
│   │   ├── requirements.txt
│   │   └── .env.example
│   └── web/
├── docs/
├── scripts/
└── README.md
```

---

## Key features in the MVP

### 1. AI-assisted intake analysis
The system can analyze an incoming request and produce:
- a short summary
- issue category
- risk level
- missing fields
- suggested approver role
- brief reasoning

### 2. Policy-grounded support
The system retrieves relevant policy material from a local corpus using embeddings and vector search, so AI responses are grounded in the project’s reference documents.

### 3. Human approval gate
AI supports the workflow, but a person still reviews and approves the request before final output is generated.

### 4. Controlled document generation
Once approved, the system can generate a governed output document and render it as both:
- structured preview content
- downloadable PDF

### 5. Audit trail
Every important transition is recorded, making the workflow traceable and reviewable.

### 6. Notification drafting
The system can generate a structured notification draft once the document is ready.

---

## Prerequisites

Before running the project locally, make sure you have:

- Python 3.11 recommended
- Node.js 18+ recommended
- npm
- PostgreSQL running locally
- A valid Google / Gemini API key

---

## Local configuration

The backend reads settings from:

```text
apps/api/.env
```

Create that file by copying the example:

```powershell
Copy-Item apps/api/.env.example apps/api/.env
```

Then update the values with your own configuration.

### Example `.env`

```env
DATABASE_URL=postgresql+psycopg://constructflow:constructflow@localhost:5433/constructflow
GOOGLE_API_KEY=YOUR_GEMINI_API_KEY
GEMINI_MODEL=gemini-2.5-flash
GOOGLE_EMBEDDING_MODEL=models/text-embedding-004
CHROMA_PERSIST_DIR=./storage/chroma
POLICY_DOCS_DIR=./app/knowledge/policies

AUTH_PROVIDER=demo
STORAGE_PROVIDER=local
NOTIFICATION_PROVIDER=local
GOOGLE_INTEGRATIONS_ENABLED=false
RBAC_ENABLED=false
```

### Configuration notes

- `DATABASE_URL` points to the local PostgreSQL instance
- `GOOGLE_API_KEY` is required for AI-assisted paths
- `GEMINI_MODEL` controls the model used for analysis and drafting
- `GOOGLE_EMBEDDING_MODEL` is used for policy retrieval
- `CHROMA_PERSIST_DIR` stores the vector database locally
- `POLICY_DOCS_DIR` points to the local policy document folder

---

## Quick start

## 1) Clone the repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd constructflow-agentic-hub
```

---

## 2) Backend setup

Move into the backend app:

```bash
cd apps/api
```

Create and activate your Python environment.

### Conda example

```powershell
conda create -n constructflow python=3.11 -y
conda activate constructflow
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### venv example

```powershell
python -m venv .venv
.venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

---

## 3) Create the local environment file

From `apps/api`:

```powershell
Copy-Item .env.example .env
```

Then open `.env` and replace:

```env
GOOGLE_API_KEY=YOUR_GEMINI_API_KEY
```

with your actual API key.

---

## 4) Make sure PostgreSQL is running

The expected local connection is:

```text
postgresql+psycopg://constructflow:constructflow@localhost:5433/constructflow
```

If you already have a Docker-based PostgreSQL setup for the project, start that before continuing.

---

## 5) Create database tables

From `apps/api`:

```powershell
python -c "import app.models; from app.db.session import Base, engine; Base.metadata.create_all(bind=engine); print('create_all done')"
```

---

## 6) Run the backend

From `apps/api`:

```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8001
```

The API should now be available at:

```text
http://127.0.0.1:8001
```

---

## 7) Index the policy corpus

In a new terminal, run:

```powershell
Invoke-RestMethod -Method Post http://127.0.0.1:8001/api/knowledge/index | ConvertTo-Json -Depth 20
```

This step loads the local policy documents into the retrieval system.

---

## 8) Frontend setup

Open another terminal and move into the frontend app:

```bash
cd apps/web
```

Install dependencies:

```powershell
npm install
```

Run the frontend:

```powershell
npm run dev
```

The UI should now be available at:

```text
http://localhost:3000
```

---

## Recommended smoke test

Once both backend and frontend are running, you can quickly verify the project with the following backend checks.

### Health check

```powershell
Invoke-RestMethod http://127.0.0.1:8001/api/health | ConvertTo-Json -Depth 10
```

### Fetch a request

```powershell
Invoke-RestMethod http://127.0.0.1:8001/api/requests/3 | ConvertTo-Json -Depth 20
```

### Fetch request events

```powershell
Invoke-RestMethod http://127.0.0.1:8001/api/requests/3/events | ConvertTo-Json -Depth 20
```

### Fetch document preview

```powershell
Invoke-RestMethod http://127.0.0.1:8001/api/requests/3/document-preview | ConvertTo-Json -Depth 20
```

### Generate notification draft

```powershell
$notificationBody = @{
  notification_type = "document_ready"
  recipient_role    = "project_manager"
  validation_status = "pass"
} | ConvertTo-Json -Depth 20

Invoke-RestMethod `
  -Method Post `
  -Uri http://127.0.0.1:8001/api/requests/3/ai/notification-draft `
  -ContentType "application/json" `
  -Body $notificationBody | ConvertTo-Json -Depth 20
```

---

## Suggested demo flow

If you want to show the product quickly to someone else, this is a clean demo path:

1. Open the dashboard
2. Open a request detail page
3. Show the AI analysis step
4. Show the policy-grounded support
5. Approve the request
6. Generate the controlled document
7. Open the preview
8. Open the PDF
9. Show the audit trail
10. Generate the notification draft

This gives a complete story from intake to governed output.

---

## Main user-facing pages

Typical pages in the frontend include:

- Dashboard
- Requests list
- Request detail
- Document preview / PDF access
- Event history / audit timeline
- Executive reports or reporting views
- System flow / governed workflow explanation

---

## API overview

The backend exposes endpoints for the core operational flow, including:

- health and system status
- request list and request detail
- request events
- AI analysis
- policy retrieval / context support
- document preview
- document PDF generation
- AI document validation
- AI notification draft
- dashboard summaries and charts

This makes the backend suitable both for direct UI consumption and for local demo scripting.

---

## What makes this different from a generic AI demo

This project is intentionally built around controlled workflow behavior rather than open-ended chatbot interaction.

The emphasis is on:
- governance
- traceability
- human review
- retrieval-grounded support
- operational usefulness

That means the system is designed to be:
- explainable
- demonstrable
- extensible
- easier to trust in enterprise-style workflows

---

## Limitations

This repository is an MVP and should be understood in that context.

Current limitations include:

- authentication is simplified for demo use
- role-based access control is not production-complete
- external integrations are intentionally lightweight
- retrieval quality depends on the local policy corpus
- Gemini API access is required for AI-assisted features
- backend and frontend are expected to run locally together
- deployment hardening is outside the current MVP scope

---

## Future improvements

Possible next steps for this project include:

- stronger authentication and RBAC
- richer workflow configuration
- production-grade deployment packaging
- better policy management UI
- approval analytics and SLA reporting
- integration with email, storage, and enterprise systems
- improved validation and compliance checks
- multi-project and multi-tenant support

---

## Handoff notes

For the fastest local handoff experience:

1. Clone the repository
2. Copy `.env.example` to `.env`
3. Add your Gemini API key
4. Start PostgreSQL
5. Run the backend on port `8001`
6. Index the policy corpus
7. Run the frontend on port `3000`

That gives you a working local setup for the full governed workflow demo.

---

## Screenshots

You can add screenshots here before final delivery:

- Dashboard
- Request detail
- AI analysis
- Policy context panel
- Document preview
- PDF output
- Audit trail
- Executive reports
- System flow page

---

## Final note

ConstructFlow Agentic Approval Hub was built to demonstrate a practical approach to agentic AI in real operational workflows. The goal is not just automation, but accountable automation — where AI helps teams move faster while preserving reviewability, control, and trust.

If you are reviewing this repository, the best way to understand it is to run the local demo flow end to end.