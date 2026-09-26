def analyze_ticket(message: str):
    """
    Basic IT ticket analysis.
    This is our first AI/mock-AI layer.
    Later we will replace/enhance this with Hugging Face + RAG.
    """

    text = message.lower()

    # Default values
    intent = "incident"
    category = "General IT"
    subcategory = "General"
    priority = "P3"
    urgency = "Medium"
    assignment_group = "IT Support"
    suggested_action = "An IT support agent should investigate the issue."
    software_name = None

    # VPN
    if "vpn" in text:
        category = "Network"
        subcategory = "VPN"
        priority = "P2"
        urgency = "High"
        assignment_group = "Network Support"
        suggested_action = (
            "Check VPN credentials, verify network connectivity, "
            "restart the VPN client and reconnect."
        )

    # Password
    elif "password" in text or "forgot my password" in text:
        category = "Account & Access"
        subcategory = "Password Reset"
        priority = "P2"
        urgency = "High"
        assignment_group = "Identity & Access Management"
        suggested_action = (
            "Verify the user's identity and initiate a password reset."
        )

    # Account locked
    elif "locked" in text or "account locked" in text:
        category = "Account & Access"
        subcategory = "Account Unlock"
        priority = "P2"
        urgency = "High"
        assignment_group = "Identity & Access Management"
        suggested_action = (
            "Verify the user's identity and unlock the user account."
        )

    # Outlook
    elif "outlook" in text or "email" in text:
        category = "Software"
        subcategory = "Email / Outlook"
        priority = "P3"
        urgency = "Medium"
        assignment_group = "Application Support"
        suggested_action = (
            "Check Outlook connectivity, mailbox synchronization "
            "and account configuration."
        )

    # WiFi
    elif "wifi" in text or "wi-fi" in text:
        category = "Network"
        subcategory = "WiFi"
        priority = "P2"
        urgency = "High"
        assignment_group = "Network Support"
        suggested_action = (
            "Check WiFi connectivity, network availability and "
            "device network configuration."
        )

    # Software installation
    elif (
        "install" in text
        or "installation" in text
        or "software" in text
    ):
        intent = "service_request"
        category = "Software"
        subcategory = "Software Installation"
        priority = "P3"
        urgency = "Medium"
        assignment_group = "IT Service Desk"
        suggested_action = (
            "Check the software catalogue and create a software "
            "provisioning request."
        )

        # Detect commonly requested software
        software_list = [
            "vs code",
            "visual studio code",
            "python",
            "java",
            "node.js",
            "nodejs",
            "docker",
            "git",
            "google chrome",
            "chrome",
            "postman",
            "intellij",
            "intellij idea",
            "eclipse",
            "zoom",
            "slack",
            "teams",
        ]

        for software in software_list:
            if software in text:
                software_name = software
                break

        if software_name == "vs code":
            software_name = "VS Code"
        elif software_name == "visual studio code":
            software_name = "Visual Studio Code"
        elif software_name == "node.js" or software_name == "nodejs":
            software_name = "Node.js"
        elif software_name == "google chrome":
            software_name = "Google Chrome"
        elif software_name == "intellij":
            software_name = "IntelliJ IDEA"
        elif software_name == "intellij idea":
            software_name = "IntelliJ IDEA"

    # Determine whether automation can be attempted
    automation_possible = (
        subcategory in [
            "Password Reset",
            "Account Unlock",
            "Software Installation"
        ]
    )

    return {
        "intent": intent,
        "category": category,
        "subcategory": subcategory,
        "priority": priority,
        "urgency": urgency,
        "assignment_group": assignment_group,
        "suggested_action": suggested_action,
        "automation_possible": automation_possible,
        "software_name": software_name
    }