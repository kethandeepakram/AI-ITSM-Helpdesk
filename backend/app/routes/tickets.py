from fastapi import APIRouter, HTTPException

from app.models.ticket import TicketCreate
from app.services.ticket_service import create_ticket
from app.database.mongodb import get_tickets_collection


router = APIRouter(
    prefix="/api/tickets",
    tags=["ITSM Tickets"]
)


@router.post("")
def create_new_ticket(request: TicketCreate):
    try:
        ticket = create_ticket(request.message)

        return {
            "success": True,
            "ticket": ticket
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@router.get("")
def get_all_tickets():
    try:
        collection = get_tickets_collection()

        tickets = list(
            collection.find(
                {},
                {"_id": 0}
            ).sort(
                "created_at",
                -1
            )
        )

        return {
            "success": True,
            "count": len(tickets),
            "tickets": tickets
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )