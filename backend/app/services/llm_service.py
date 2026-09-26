import os

from dotenv import load_dotenv
from huggingface_hub import InferenceClient

load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN")
HF_LLM_MODEL = os.getenv(
    "HF_LLM_MODEL",
    "Qwen/Qwen2.5-3B-Instruct"
)

_client = None

if HF_TOKEN:
    _client = InferenceClient(
        provider="auto",
        api_key=HF_TOKEN
    )


def generate_ai_response(
    message: str,
    analysis: dict,
    knowledge_base: dict | None
):
    """
    Generate a concise IT-support response using an open-source
    instruction-tuned model through Hugging Face Inference Providers.
    """

    if _client is None:
        return None

    article_context = "No Knowledge Base article was retrieved."

    if knowledge_base:
        article = knowledge_base.get("article", {})
        article_context = (
            f"Title: {article.get('title', '')}\n"
            f"Content: {article.get('content', '')}"
        )

    prompt = (
        "You are an enterprise IT support assistant. "
        "Give a concise, practical response. "
        "Do not invent company policies, credentials, or actions. "
        "Use the supplied Knowledge Base content when available. "
        "If automation is possible, explain what the helpdesk workflow "
        "will do rather than claiming a real machine was changed.\n\n"
        f"User issue: {message}\n"
        f"Category: {analysis.get('category')}\n"
        f"Subcategory: {analysis.get('subcategory')}\n"
        f"Priority: {analysis.get('priority')}\n"
        f"Suggested action: {analysis.get('suggested_action')}\n"
        f"Knowledge Base:\n{article_context}"
    )

    try:
        completion = _client.chat.completions.create(
            model=HF_LLM_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a helpful enterprise IT helpdesk assistant."
                    )
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_tokens=180,
            temperature=0.2
        )

        content = completion.choices[0].message.content

        if content:
            return content.strip()

    except Exception:
        return None

    return None
