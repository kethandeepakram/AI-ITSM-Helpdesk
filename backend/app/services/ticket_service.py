from datetime import datetime

from app.database.mongodb import get_tickets_collection
from app.services.ai_service import analyze_ticket
from app.services.automation_service import execute_automation
from app.services.servicenow_service import create_servicenow_incident

def generate_ticket_id():
    collection = get_tickets_collection()

    today = datetime.now().strftime("%Y%m%d")

    count = collection.count_documents({
        "ticket_id": {
            "$regex": f"^INC-{today}-"
        }
    })

    return f"INC-{today}-{count + 1:04d}"


def create_ticket(message: str):

    # 1. Analyze the user's request
    analysis = analyze_ticket(message)

    # 2. Generate ticket ID
    ticket_id = generate_ticket_id()

    # 3. Create the ticket
    ticket = {
        "ticket_id": ticket_id,
        "message": message,

        "intent": analysis["intent"],
        "category": analysis["category"],
        "subcategory": analysis["subcategory"],
        "priority": analysis["priority"],
        "urgency": analysis["urgency"],
        "assignment_group": analysis["assignment_group"],

        "suggested_action": analysis["suggested_action"],
        "automation_possible": analysis["automation_possible"],
        "software_name": analysis.get("software_name"),

        "status": "Open",

        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

    collection = get_tickets_collection()

    collection.insert_one(ticket)

        # 3.5. Synchronize ticket with ServiceNow
    servicenow_result = create_servicenow_incident(ticket)

    if servicenow_result["success"]:
        collection.update_one(
        {"ticket_id": ticket_id},
        {
            "$set": {
                "servicenow_incident": servicenow_result["incident_number"],
                "servicenow_status": servicenow_result["status"]
            }
        }
       )

    # 4. Try self-healing / provisioning automation
    automation_result = None

    if analysis["automation_possible"]:

        if analysis["subcategory"] == "Password Reset":
            action = "password_reset"

        elif analysis["subcategory"] == "Account Unlock":
            action = "account_unlock"

        elif analysis["subcategory"] == "Software Installation":
            action = "software_install"

        else:
            action = None

        if action:

            automation_result = execute_automation(
                action=action,
                ticket_id=ticket_id,
                software_name=analysis.get(
                    "software_name",
                    "requested software"
                )
            )

            # Update ticket based on automation result
            if automation_result["success"]:
                collection.update_one(
                    {"ticket_id": ticket_id},
                    {
                        "$set": {
                            "status": "Resolved",
                            "updated_at": datetime.utcnow(),
                            "automation_status": "Success",
                            "automation_action": action
                        }
                    }
                )

    # 5. Return complete result
    return {
        "ticket_id": ticket_id,
        "status": (
            "Resolved"
            if automation_result and automation_result["success"]
            else "Open"
        ),
        "message": message,
        **analysis,
        "automation": automation_result,
        "servicenow": servicenow_result
    }