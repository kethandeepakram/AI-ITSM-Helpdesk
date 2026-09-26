from sentence_transformers import SentenceTransformer
from app.database.mongodb import get_database


MODEL_NAME = "all-MiniLM-L6-v2"


def create_embeddings():
    print("Loading embedding model...")

    model = SentenceTransformer(MODEL_NAME)

    db = get_database()
    collection = db["knowledge_articles"]

    articles = list(collection.find({}))

    if not articles:
        print("No Knowledge Base articles found.")
        return

    print(f"Found {len(articles)} Knowledge Base articles.")

    for article in articles:
        text = (
            f"{article.get('title', '')}. "
            f"{article.get('category', '')}. "
            f"{article.get('content', '')}"
        )

        embedding = model.encode(text).tolist()

        collection.update_one(
            {"_id": article["_id"]},
            {
                "$set": {
                    "embedding": embedding,
                    "embedding_model": MODEL_NAME
                }
            }
        )

        print(
            f"Embedding created: "
            f"{article.get('title')}"
        )

    print("All Knowledge Base embeddings created successfully.")


if __name__ == "__main__":
    create_embeddings()