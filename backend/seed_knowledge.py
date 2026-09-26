from app.database.mongodb import get_database


knowledge_articles = [
    {
        "id": 1,
        "title": "VPN Connection Troubleshooting",
        "category": "Network",
        "keywords": [
            "vpn",
            "network",
            "connection",
            "remote access"
        ],
        "content": (
            "Check your VPN credentials, verify your internet "
            "connection, restart the VPN client, and try "
            "connecting again. If the problem continues, "
            "contact Network Support."
        )
    },
    {
        "id": 2,
        "title": "Password Reset",
        "category": "Account & Access",
        "keywords": [
            "password",
            "reset",
            "forgot password",
            "account"
        ],
        "content": (
            "Use the organization's password reset process "
            "to create a new password. Make sure the new "
            "password follows the required security rules."
        )
    },
    {
        "id": 3,
        "title": "Account Unlock",
        "category": "Account & Access",
        "keywords": [
            "locked",
            "account locked",
            "unlock",
            "login"
        ],
        "content": (
            "If your account is locked, verify your identity "
            "and follow the account unlock process. Contact "
            "Identity & Access Management if you cannot "
            "unlock the account."
        )
    },
    {
        "id": 4,
        "title": "Wi-Fi Troubleshooting",
        "category": "Network",
        "keywords": [
            "wifi",
            "wi-fi",
            "wireless",
            "internet"
        ],
        "content": (
            "Check that Wi-Fi is enabled, reconnect to the "
            "correct network, restart your network adapter, "
            "and verify that other devices can connect."
        )
    },
    {
        "id": 5,
        "title": "Outlook Email Troubleshooting",
        "category": "Software",
        "keywords": [
            "outlook",
            "email",
            "mail"
        ],
        "content": (
            "Restart Outlook, verify your internet connection, "
            "check your account settings, and try sending "
            "or receiving email again."
        )
    },
    {
        "id": 6,
        "title": "Software Installation Request",
        "category": "Software",
        "keywords": [
            "install",
            "installation",
            "software",
            "application"
        ],
        "content": (
            "Submit a software installation request with the "
            "application name and business requirement. "
            "The IT Service Desk will review the request."
        )
    }
]


def seed_knowledge_base():
    db = get_database()
    collection = db["knowledge_articles"]

    existing_count = collection.count_documents({})

    if existing_count > 0:
        print(
            f"Knowledge Base already contains "
            f"{existing_count} articles."
        )
        return

    collection.insert_many(knowledge_articles)

    print(
        f"Successfully inserted "
        f"{len(knowledge_articles)} Knowledge Base articles."
    )


if __name__ == "__main__":
    seed_knowledge_base()