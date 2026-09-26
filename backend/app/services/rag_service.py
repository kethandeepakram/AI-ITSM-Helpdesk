import os

import numpy as np
from dotenv import load_dotenv
from huggingface_hub import InferenceClient

from app.database.mongodb import get_database

load_dotenv()

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

HF_TOKEN = os.getenv("HF_TOKEN")

if not HF_TOKEN:
    raise RuntimeError("HF_TOKEN is not configured in the .env file")

client = InferenceClient(
    provider="hf-inference",
    api_key=HF_TOKEN
)


def calculate_similarity(query_embedding, article_embedding):
    query_vector = np.array(query_embedding, dtype=float).reshape(-1)
    article_vector = np.array(article_embedding, dtype=float).reshape(-1)

    if query_vector.size == 0 or article_vector.size == 0:
        return 0.0

    if query_vector.shape != article_vector.shape:
        return 0.0

    query_norm = np.linalg.norm(query_vector)
    article_norm = np.linalg.norm(article_vector)

    if query_norm == 0 or article_norm == 0:
        return 0.0

    similarity = np.dot(query_vector, article_vector) / (
        query_norm * article_norm
    )

    return float(similarity)


def get_query_embedding(query: str):
    """
    Generate a query embedding using Hugging Face Inference.
    The model runs remotely instead of loading PyTorch locally.
    """

    embedding = client.feature_extraction(
        query,
        model=MODEL_NAME
    )

    return np.array(embedding, dtype=float).reshape(-1)


def search_knowledge_base(query: str):
    db = get_database()
    collection = db["knowledge_articles"]

    articles = list(
        collection.find(
            {"embedding": {"$exists": True}},
            {"_id": 0}
        )
    )

    if not articles:
        return []

    query_embedding = get_query_embedding(query)

    query_words = set(
        word.strip(".,!?;:()[]{}").lower()
        for word in query.split()
        if len(word.strip(".,!?;:()[]{}")) > 1
    )

    results = []

    for article in articles:
        article_embedding = article.get("embedding")

        if not article_embedding:
            continue

        similarity = calculate_similarity(
            query_embedding,
            article_embedding
        )

        keywords = [
            str(keyword).lower()
            for keyword in article.get("keywords", [])
        ]

        keyword_matches = 0

        for word in query_words:
            for keyword in keywords:
                if (
                    word == keyword
                    or word in keyword
                    or keyword in word
                ):
                    keyword_matches += 1
                    break

        keyword_score = min(
            keyword_matches * 0.20,
            0.60
        )

        title = str(
            article.get("title", "")
        ).lower()

        title_score = 0.0

        for word in query_words:
            if word in title:
                title_score += 0.20

        title_score = min(
            title_score,
            0.40
        )

        final_score = (
            similarity
            + keyword_score
            + title_score
        )

        clean_article = {
            "id": article.get("id"),
            "title": article.get("title"),
            "category": article.get("category"),
            "keywords": article.get("keywords", []),
            "content": article.get("content")
        }

        results.append({
            "article": clean_article,
            "score": round(final_score, 4)
        })

    results.sort(
        key=lambda item: item["score"],
        reverse=True
    )

    return results