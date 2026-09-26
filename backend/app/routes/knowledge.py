from fastapi import APIRouter
from pydantic import BaseModel

from app.database.mongodb import get_database
from app.services.rag_service import search_knowledge_base

router = APIRouter(
    prefix="/api/knowledge",
    tags=["Knowledge Base"]
)


@router.get("")
def get_knowledge_articles():
    try:
        db = get_database()
        collection = db["knowledge_articles"]

        articles = list(
            collection.find(
                {},
                {"_id": 0}
            )
        )

        return {
            "success": True,
            "articles": articles
        }

    except Exception as e:
        return {
            "success": False,
            "articles": [],
            "error": str(e)
        }

class KnowledgeSearchRequest(BaseModel):
 query: str


@router.post("/search")
def search_knowledge(request: KnowledgeSearchRequest):
    results = search_knowledge_base(request.query)

    return {
        "success": True,
        "query": request.query,
        "results": results[:3]
    }