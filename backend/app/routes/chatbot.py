from fastapi import APIRouter
from pydantic import BaseModel

from app.services.ai_service import analyze_ticket
from app.services.rag_service import search_knowledge_base


router = APIRouter(
    prefix="/api/chat",
    tags=["AI Chatbot"]
)


class ChatRequest(BaseModel):
    message: str


@router.post("")
def chat(request: ChatRequest):

    # 1. Analyze the IT issue
    analysis = analyze_ticket(request.message)

    # 2. Search the AI Knowledge Base using RAG
    knowledge_results = search_knowledge_base(request.message)

    # 3. Select the most relevant article
    knowledge_base = None

    if knowledge_results:
        knowledge_base = knowledge_results[0]

    # 4. Return AI analysis + RAG result
    return {
        "message": request.message,

        "response": (
            f"I identified this as a "
            f"{analysis['subcategory']} issue. "
            f"Category: {analysis['category']}. "
            f"Priority: {analysis['priority']}."
        ),

        **analysis,

        "knowledge_base": knowledge_base
    }