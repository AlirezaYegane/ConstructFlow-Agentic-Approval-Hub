from fastapi import FastAPI
from app.db.session import Base, engine
from app import models  # noqa: F401
from app.api.routes.health import router as health_router
from app.api.routes.requests import router as requests_router
from app.api.routes.dashboard import router as dashboard_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="ConstructFlow API", version="0.1.0")

app.include_router(health_router, prefix="/api")
app.include_router(requests_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
