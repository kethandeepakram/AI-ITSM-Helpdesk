from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.chatbot import router as chatbot_router
from app.routes.tickets import router as tickets_router
from app.routes.provisioning import router as provisioning_router
from app.routes.knowledge import router as knowledge_router
from app.routes.servicenow import router as servicenow_router

app = FastAPI(
    title="AI-Powered ITSM Helpdesk",
    description="AI-powered ITSM Helpdesk Automation Platform",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chatbot_router)
app.include_router(tickets_router)
app.include_router(provisioning_router)
app.include_router(knowledge_router)
app.include_router(servicenow_router)

@app.get("/")
def root():
    return {
        "message": "AI-Powered ITSM Helpdesk API",
        "status": "running"
    }


@app.get("/health")
def health():
    return {
        "status": "healthy"
    }