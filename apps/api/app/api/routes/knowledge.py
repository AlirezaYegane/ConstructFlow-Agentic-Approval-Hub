from fastapi import APIRouter, Query, HTTPException

from app.services.knowledge_service import build_policy_index, retrieve_policy_chunks

router = APIRouter(prefix="/api/knowledge", tags=["knowledge"])

@router.post("/index")
def index_policies():
    try:
        return build_policy_index()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {e}")

@router.get("/retrieve")
def retrieve_policies(query: str = Query(...), k: int = Query(4, ge=1, le=10)):
    try:
        return {
            "query": query,
            "results": retrieve_policy_chunks(query=query, k=k),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"{type(e).__name__}: {e}")
