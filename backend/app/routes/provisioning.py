from fastapi import APIRouter
from pydantic import BaseModel

from app.services.automation_service import execute_automation


router = APIRouter(
    prefix="/api/provisioning",
    tags=["Self-Healing Automation"]
)


class AutomationRequest(BaseModel):
    ticket_id: str
    action: str
    software_name: str = "requested software"


@router.post("/execute")
def execute_self_healing(request: AutomationRequest):

    return execute_automation(
        action=request.action,
        ticket_id=request.ticket_id,
        software_name=request.software_name
    )