import base64
import json
import os
from datetime import datetime
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from app.database.mongodb import get_database


def _create_real_servicenow_incident(ticket):
    """
    Create a real ServiceNow incident when credentials are configured.

    Required environment variables:
    SERVICENOW_INSTANCE_URL
    SERVICENOW_USERNAME
    SERVICENOW_PASSWORD
    """

    instance_url = os.getenv("SERVICENOW_INSTANCE_URL")
    username = os.getenv("SERVICENOW_USERNAME")
    password = os.getenv("SERVICENOW_PASSWORD")

    if not all([instance_url, username, password]):
        return None

    endpoint = (
        instance_url.rstrip("/")
        + "/api/now/table/incident"
    )

    payload = {
        "short_description": ticket["message"],
        "description": ticket["message"],
        "category": ticket.get("category"),
        "subcategory": ticket.get("subcategory"),
        "urgency": str(ticket.get("urgency", "Medium")),
        "assignment_group": ticket.get("assignment_group")
    }

    token = base64.b64encode(
        f"{username}:{password}".encode()
    ).decode()

    request = Request(
        endpoint,
        data=json.dumps(payload).encode(),
        method="POST",
        headers={
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": f"Basic {token}"
        }
    )

    try:
        with urlopen(request, timeout=10) as response:
            data = json.loads(response.read().decode())

        result = data.get("result", {})

        return {
            "success": True,
            "incident_number": result.get("number"),
            "message": "Incident successfully created in ServiceNow.",
            "status": "Created",
            "mode": "live"
        }

    except (HTTPError, URLError, TimeoutError, ValueError):
        return None


def create_servicenow_incident(ticket):
    """
    ServiceNow integration with a safe prototype fallback.

    If ServiceNow credentials are configured, the application attempts
    to create a real incident through the ServiceNow Table API.

    Without credentials, it stores a ServiceNow-style record in MongoDB
    so the prototype can still demonstrate the end-to-end workflow.
    """

    live_result = _create_real_servicenow_incident(ticket)

    if live_result:
        return live_result

    db = get_database()

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
        "mode": "prototype_simulation",
        "created_at": datetime.utcnow()
    }

    db["servicenow_incidents"].insert_one(incident)

    return {
        "success": True,
        "incident_number": incident_number,
        "message": (
            "Incident recorded in the prototype ServiceNow workflow."
        ),
        "status": "Created",
        "mode": "prototype_simulation"
    }
