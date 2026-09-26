from datetime import datetime
import uuid

from app.database.mongodb import get_database


SOFTWARE_CATALOG = {
    "VS Code": {"version": "Latest approved version", "status": "Available"},
    "Visual Studio Code": {"version": "Latest approved version", "status": "Available"},
    "Microsoft Teams": {"version": "Latest approved version", "status": "Available"},
    "Python": {"version": "Approved enterprise version", "status": "Available"},
    "Java": {"version": "Approved enterprise version", "status": "Available"},
    "Node.js": {"version": "Approved enterprise version", "status": "Available"},
    "Docker": {"version": "Approved enterprise version", "status": "Available"},
    "Git": {"version": "Approved enterprise version", "status": "Available"},
    "Google Chrome": {"version": "Latest approved version", "status": "Available"},
    "Postman": {"version": "Latest approved version", "status": "Available"},
    "IntelliJ IDEA": {"version": "Approved enterprise version", "status": "Available"},
    "Eclipse": {"version": "Approved enterprise version", "status": "Available"},
    "Zoom": {"version": "Latest approved version", "status": "Available"},
    "Slack": {"version": "Latest approved version", "status": "Available"}
}


def execute_automation(
    action: str,
    ticket_id: str,
    software_name: str = "requested software"
):
    """
    Prototype automation service.

    Password/account workflows are simulated.
    Software provisioning validates the software catalogue, creates
    a provisioning request, records an audit trail in MongoDB, and
    completes a simulated fulfillment workflow.

    No software is actually installed on an employee machine.
    """

    db = get_database()

    if action == "password_reset":
        result_message = "Password reset workflow completed successfully."

        db["automation_audit"].insert_one({
            "ticket_id": ticket_id,
            "action": action,
            "actor": "AI Self-Healing Agent",
            "status": "Success",
            "message": result_message,
            "created_at": datetime.utcnow()
        })

        return {
            "success": True,
            "ticket_id": ticket_id,
            "action": action,
            "status": "Success",
            "message": result_message
        }

    if action == "account_unlock":
        result_message = "Account unlock workflow completed successfully."

        db["automation_audit"].insert_one({
            "ticket_id": ticket_id,
            "action": action,
            "actor": "AI Self-Healing Agent",
            "status": "Success",
            "message": result_message,
            "created_at": datetime.utcnow()
        })

        return {
            "success": True,
            "ticket_id": ticket_id,
            "action": action,
            "status": "Success",
            "message": result_message
        }

    if action == "software_install":
        catalog_item = SOFTWARE_CATALOG.get(software_name)

        if not catalog_item:
            return {
                "success": False,
                "ticket_id": ticket_id,
                "action": action,
                "status": "Catalog Check Failed",
                "message": (
                    f"{software_name} is not currently available "
                    "in the software catalogue."
                )
            }

        request_id = (
            "REQ-"
            + datetime.utcnow().strftime("%Y%m%d")
            + "-"
            + uuid.uuid4().hex[:6].upper()
        )

        workflow = [
            "Request created",
            "Software catalogue validated",
            "Provisioning simulated",
            "Provisioning completed"
        ]

        provisioning_record = {
            "request_id": request_id,
            "ticket_id": ticket_id,
            "action": action,
            "software_name": software_name,
            "catalog_status": catalog_item["status"],
            "approved_version": catalog_item["version"],
            "requested_by": "Employee",
            "actor": "AI Provisioning Agent",
            "workflow": workflow,
            "status": "Completed",
            "message": (
                f"Software provisioning workflow completed for "
                f"{software_name}."
            ),
            "created_at": datetime.utcnow()
        }

        db["software_provisioning"].insert_one(provisioning_record)

        db["automation_audit"].insert_one({
            "ticket_id": ticket_id,
            "request_id": request_id,
            "action": action,
            "software_name": software_name,
            "actor": "AI Provisioning Agent",
            "status": "Success",
            "message": (
                f"Software provisioning completed for "
                f"{software_name}."
            ),
            "created_at": datetime.utcnow()
        })

        return {
            "success": True,
            "ticket_id": ticket_id,
            "request_id": request_id,
            "action": action,
            "software_name": software_name,
            "catalog_status": catalog_item["status"],
            "approved_version": catalog_item["version"],
            "status": "Completed",
            "workflow": workflow,
            "message": (
                f"Software provisioning completed successfully "
                f"for {software_name}."
            ),
            "note": (
                "Prototype simulation: no software was installed "
                "on a physical machine."
            )
        }

    return {
        "success": False,
        "action": action,
        "status": "Not Supported",
        "message": "Automation is not supported for this action."
    }
