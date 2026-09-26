from datetime import datetime

from app.database.mongodb import get_database


def execute_automation(
    action: str,
    ticket_id: str,
    software_name: str = "requested software"
):
    """
    Simulated automation service.

    Supported workflows:
    - password reset
    - account unlock
    - software provisioning

    This does not modify a real user account or install
    software on the machine. It simulates the workflow
    and records an audit entry in MongoDB.
    """

    if action == "password_reset":
        result_message = (
            "Password reset workflow completed successfully."
        )

    elif action == "account_unlock":
        result_message = (
            "Account unlock workflow completed successfully."
        )

    elif action == "software_install":
        result_message = (
            f"Software provisioning workflow completed successfully "
            f"for {software_name}."
        )

    else:
        return {
            "success": False,
            "action": action,
            "message": "Automation is not supported for this action."
        }

    audit_record = {
        "ticket_id": ticket_id,
        "action": action,
        "actor": "AI Self-Healing Agent",
        "status": "Success",
        "message": result_message,
        "created_at": datetime.utcnow()
    }

    # Add software information to the audit record
    # when the workflow is software provisioning.
    if action == "software_install":
        audit_record["software_name"] = software_name

    db = get_database()

    db["automation_audit"].insert_one(audit_record)

    return {
        "success": True,
        "ticket_id": ticket_id,
        "action": action,
        "status": "Success",
        "message": result_message
    }