from sentence_transformers import SentenceTransformer
from app.database.mongodb import get_database
import numpy as np


MODEL_NAME = "all-MiniLM-L6-v2"

# Load the embedding model once when the service starts
model = SentenceTransformer(MODEL_NAME)


def calculate_similarity(query_embedding, article_embedding):
    """
    Calculate cosine similarity between two embeddings.
    """

    query_vector = np.array(query_embedding)
    article_vector = np.array(article_embedding)

    query_norm = np.linalg.norm(query_vector)
    article_norm = np.linalg.norm(article_vector)

    if query_norm == 0 or article_norm == 0:
        return 0.0

    similarity = np.dot(
        query_vector,
        article_vector
    ) / (
        query_norm * article_norm
    )

    return float(similarity)


def normalize_words(text):
    """
    Convert text into normalized words.
    """

    return set(
        word.strip(".,!?;:()[]{}").lower()
        for word in text.split()
        if len(word.strip(".,!?;:()[]{}")) > 1
    )


def search_knowledge_base(query: str):
    """
    Hybrid Knowledge Base search.

    Combines:
    1. Semantic similarity
    2. Keyword matching
    3. Title matching

    Final score is normalized between 0 and 1.
    """

    db = get_database()
    collection = db["knowledge_articles"]

    articles = list(
        collection.find(
            {
                "embedding": {
                    "$exists": True
                }
            },
            {
                "_id": 0
            }
        )
    )

    if not articles:
        return []

    # Create embedding for the user's query
    query_embedding = model.encode(query).tolist()

    query_words = normalize_words(query)

    results = []

    for article in articles:

        article_embedding = article.get("embedding")

        if not article_embedding:
            continue

        # ---------------------------------
        # 1. Semantic similarity
        # ---------------------------------
        similarity = calculate_similarity(
            query_embedding,
            article_embedding
        )

        # Keep similarity inside 0-1
        similarity = max(0.0, min(similarity, 1.0))

        # ---------------------------------
        # 2. Keyword matching
        # ---------------------------------
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

        if query_words:
            keyword_score = (
                keyword_matches / len(query_words)
            )
        else:
            keyword_score = 0.0

        keyword_score = max(
            0.0,
            min(keyword_score, 1.0)
        )

        # ---------------------------------
        # 3. Title matching
        # ---------------------------------
        title = str(
            article.get("title", "")
        ).lower()

        title_words = normalize_words(title)

        title_matches = 0

        for word in query_words:

            for title_word in title_words:

                if (
                    word == title_word
                    or word in title_word
                    or title_word in word
                ):
                    title_matches += 1
                    break

        if query_words:
            title_score = (
                title_matches / len(query_words)
            )
        else:
            title_score = 0.0

        title_score = max(
            0.0,
            min(title_score, 1.0)
        )

        # ---------------------------------
        # 4. Final hybrid score
        # ---------------------------------
        #
        # Semantic similarity has the highest
        # weight because it understands meaning.
        #
        # Keywords provide exact IT terminology.
        #
        # Title matching gives a small additional
        # boost when the issue matches the article.
        #
        final_score = (
            (similarity * 0.65)
            + (keyword_score * 0.25)
            + (title_score * 0.10)
        )

        clean_article = {
            "id": article.get("id"),
            "title": article.get("title"),
            "category": article.get("category"),
            "keywords": article.get("keywords", []),
            "content": article.get("content")
        }

        results.append(
            {
                "article": clean_article,
                "score": round(final_score, 4)
            }
        )

    # Highest relevance first
    results.sort(
        key=lambda item: item["score"],
        reverse=True
    )

    return results