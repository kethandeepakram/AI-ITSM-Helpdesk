from datetime import datetime

from app.database.mongodb import get_database


def create_servicenow_incident(ticket):
    """
    Simulated ServiceNow integration.

    Creates a ServiceNow-style incident record in MongoDB.
    This allows us to demonstrate the ServiceNow integration
    workflow without requiring a real ServiceNow account.
    """

    db = get_database()

    # Generate a simulated ServiceNow incident number
    count = db["servicenow_incidents"].count_documents({})

    incident_number = f"INC-SNOW-{count + 1:04d}"

    incident = {
        "incident_number": incident_number,
        "source_ticket_id": ticket["ticket_id"],
        "short_description": ticket["message"],
        "category": ticket.get("category"),
        "subcategory": ticket.get("subcategory"),
        "priority": ticket.get("priority"),
        "urgency": ticket.get("urgency"),
        "assignment_group": ticket.get("assignment_group"),
        "status": ticket.get("status", "Open"),
        "created_at": datetime.utcnow()
    }

    db["servicenow_incidents"].insert_one(incident)

    return {
        "success": True,
        "incident_number": incident_number,
        "message": "Incident successfully synchronized with ServiceNow.",
        "status": "Created"
    }