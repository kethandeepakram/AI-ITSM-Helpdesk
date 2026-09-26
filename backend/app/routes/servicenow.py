from fastapi import APIRouter, HTTPException
from app.services.servicenow_service import create_servicenow_incident

router = APIRouter(
    prefix="/api/servicenow",
    tags=["ServiceNow Integration"]
)


@router.post("/create")
def create_incident(ticket: dict):

    try:
        result = create_servicenow_incident(ticket)
        return result

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )