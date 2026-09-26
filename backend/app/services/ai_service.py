import json
import logging
import os
import re

from dotenv import load_dotenv
from huggingface_hub import InferenceClient

load_dotenv()

logger = logging.getLogger(__name__)

MODEL_NAME = os.getenv(
    "HF_LLM_MODEL",
    "Qwen/Qwen3-4B-Instruct-2507"
)

HF_TOKEN = os.getenv("HF_TOKEN")

if not HF_TOKEN:
    raise RuntimeError("HF_TOKEN is not configured in the .env file")

client = InferenceClient(
    provider="auto",
    api_key=HF_TOKEN
)


def _rule_based_analysis(message: str):
    """Reliable fallback for Hugging Face failures."""
    text = message.lower()

    intent = "incident"
    category = "General IT"
    subcategory = "General"
    priority = "P3"
    urgency = "Medium"
    assignment_group = "IT Support"
    suggested_action = "An IT support agent should investigate the issue."
    software_name = None

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

    elif "password" in text or "forgot my password" in text:
        category = "Account & Access"
        subcategory = "Password Reset"
        priority = "P2"
        urgency = "High"
        assignment_group = "Identity & Access Management"
        suggested_action = (
            "Verify the user's identity and initiate a password reset."
        )

    elif "locked" in text or "account locked" in text:
        category = "Account & Access"
        subcategory = "Account Unlock"
        priority = "P2"
        urgency = "High"
        assignment_group = "Identity & Access Management"
        suggested_action = (
            "Verify the user's identity and unlock the user account."
        )

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

    elif "install" in text or "installation" in text or "software" in text:
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

        software_list = [
            "visual studio code", "vs code", "microsoft teams", "teams",
            "python", "java", "node.js", "nodejs", "docker", "git",
            "google chrome", "chrome", "postman", "intellij idea",
            "intellij", "eclipse", "zoom", "slack",
        ]

        software_names = {
            "vs code": "VS Code",
            "visual studio code": "Visual Studio Code",
            "microsoft teams": "Microsoft Teams",
            "teams": "Microsoft Teams",
            "node.js": "Node.js",
            "nodejs": "Node.js",
            "google chrome": "Google Chrome",
            "chrome": "Google Chrome",
            "intellij": "IntelliJ IDEA",
            "intellij idea": "IntelliJ IDEA",
        }

        for software in software_list:
            if software in text:
                software_name = software_names.get(
                    software, software.title()
                )
                break

    automation_possible = subcategory in [
        "Password Reset",
        "Account Unlock",
        "Software Installation"
    ]

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


def _extract_json(text: str):
    """Extract a JSON object from an LLM response."""
    cleaned = text.strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", cleaned, flags=re.DOTALL)
        if not match:
            return None

        try:
            return json.loads(match.group(0))
        except json.JSONDecodeError:
            return None


def _normalize_llm_result(result: dict, message: str):
    """Validate and normalize LLM output."""
    fallback = _rule_based_analysis(message)

    allowed_intents = {"incident", "service_request"}
    allowed_priorities = {"P1", "P2", "P3", "P4"}
    allowed_urgencies = {"Critical", "High", "Medium", "Low"}

    intent = result.get("intent")
    priority = result.get("priority")
    urgency = result.get("urgency")

    if intent not in allowed_intents:
        intent = fallback["intent"]
    if priority not in allowed_priorities:
        priority = fallback["priority"]
    if urgency not in allowed_urgencies:
        urgency = fallback["urgency"]

    subcategory = str(
        result.get("subcategory") or fallback["subcategory"]
    ).strip()

    automation_possible = subcategory in [
        "Password Reset",
        "Account Unlock",
        "Software Installation"
    ]

    software_name = result.get("software_name")
    if software_name is not None:
        software_name = str(software_name).strip() or None

    return {
        "intent": intent,
        "category": str(
            result.get("category") or fallback["category"]
        ).strip(),
        "subcategory": subcategory,
        "priority": priority,
        "urgency": urgency,
        "assignment_group": str(
            result.get("assignment_group") or fallback["assignment_group"]
        ).strip(),
        "suggested_action": str(
            result.get("suggested_action") or fallback["suggested_action"]
        ).strip(),
        "automation_possible": automation_possible,
        "software_name": software_name
    }


def _analyze_with_llm(message: str):
    """Use the Hugging Face open-source instruction LLM."""
    prompt = f"""
You are an enterprise IT service desk classification assistant.

Analyze this user ticket:
{message}

Return ONLY one valid JSON object. Do not use markdown.

The JSON must contain exactly these fields:
{{
  "intent": "incident" or "service_request",
  "category": "short IT category",
  "subcategory": "short IT subcategory",
  "priority": "P1", "P2", "P3", or "P4",
  "urgency": "Critical", "High", "Medium", or "Low",
  "assignment_group": "responsible IT support group",
  "suggested_action": "short recommended support action",
  "software_name": "requested software name or null"
}}

Rules:
- Use service_request for software installation or access requests.
- Use incident for problems, failures, or outages.
- Do not invent a software name if none is mentioned.
- Keep the suggested_action practical and concise.
""".strip()

    response = client.chat_completion(
        messages=[
            {
                "role": "system",
                "content": (
                    "You classify IT helpdesk tickets and return strict JSON."
                )
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        model=MODEL_NAME,
        max_tokens=300,
        temperature=0.1
    )

    content = response.choices[0].message.content

    if not content:
        raise ValueError("Hugging Face returned an empty response")

    parsed = _extract_json(content)

    if not isinstance(parsed, dict):
        raise ValueError("Hugging Face returned invalid JSON")

    return _normalize_llm_result(parsed, message)


def analyze_ticket(message: str):
    """
    Primary path: Hugging Face open-source LLM.
    Fallback path: existing rule-based classifier.
    """
    try:
        return _analyze_with_llm(message)
    except Exception as exc:
        logger.exception("Hugging Face LLM analysis failed: %s", exc)
        return _rule_based_analysis(message)
