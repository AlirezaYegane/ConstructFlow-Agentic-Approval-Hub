from fastapi import FastAPI
from app.db.session import Base, engine
from app import models  # noqa: F401
from app.api.routes.health import router as health_router
from app.api.routes.requests import router as requests_router
from app.api.routes.document_ai import router as document_ai_router
from app.api.routes.knowledge import router as knowledge_router
from app.api.routes.dashboard import router as dashboard_router
from app.api.routes.ai_workflow import router as ai_workflow_router


Base.metadata.create_all(bind=engine)

app = FastAPI(title="ConstructFlow API", version="0.1.0")

app.include_router(health_router, prefix="/api")
app.include_router(requests_router, prefix="/api")
app.include_router(knowledge_router)
app.include_router(dashboard_router, prefix="/api")
app.include_router(ai_workflow_router)
app.include_router(document_ai_router)
