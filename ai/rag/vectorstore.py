"""Vector store for barber RAG — ChromaDB + sentence-transformers.

Responsibilities:
- Initialise a persistent ChromaDB client (chroma_data/).
- Provide an embedding function using all-MiniLM-L6-v2 via Chroma's
  SentenceTransformerEmbeddingFunction wrapper.
- Expose add_barbers() and search() so the chat endpoint can retrieve
  the most relevant barber chunks for a user query.
"""

import os

from typing import List, Dict, Any

from chromadb.utils.embedding_functions import OpenAIEmbeddingFunction
import chromadb

CHROMA_PATH = os.getenv("CHROMA_PATH", "chroma_data")
COLLECTION_NAME = "barbers"
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"

embedding_fn = OpenAIEmbeddingFunction(
    api_key = os.getenv("OPENROUTER_API_KEY"),
    model_name="text-embedding-3-small"
)

# Pass the API-based embedding function when initializing the collection
client = chromadb.PersistentClient(path="chroma_data")
collection = client.get_or_create_collection(
    name="barbercraft_rag",
    embedding_function=embedding_fn
)

import os
import chromadb
from chromadb.utils.embedding_functions import OpenAIEmbeddingFunction

class BarberEmbeddingFunction(OpenAIEmbeddingFunction):
    def __init__(self, model_name="text-embedding-3-small"):
        # Explicitly pass api_key to avoid Chroma falling back to CHROMA_OPENAI_API_KEY
        api_key = os.getenv("OPENROUTER_API_KEY") or os.getenv("OPENAI_API_KEY")
        super().__init__(api_key=api_key, model_name=model_name)

_embedding_fn = BarberEmbeddingFunction()


def _get_client():
    """Return a persistent ChromaDB client instance."""
    return chromadb.PersistentClient(path=CHROMA_PATH)


def _get_collection():
    """Get (or create) the barber collection."""
    client = _get_client()
    return client.get_or_create_collection(
        name=COLLECTION_NAME,
        embedding_function=_embedding_fn,
    )


def add_barbers(barbers: List[Dict[str, Any]]) -> None:
    """Embed and store the given barbers into the Chroma collection.

    Each barber dict is expected to contain at least: id, name, specialty,
    story, badges, services.  We build a single searchable text per barber
    from these fields.
    """
    coll = _get_collection()

    ids = []
    documents = []
    metadatas = []

    for barber in barbers:
        # Build a dense representation from the barber's descriptive fields.
        parts = [
            barber.get("name", ""),
            barber.get("specialty", ""),
            barber.get("story", ""),
            ", ".join(barber.get("badges", [])),
            ", ".join(
                f"{s.get('name', '')}" for s in barber.get("services", [])
            ),
        ]
        document = " | ".join(p for p in parts if p).strip()
        if not document:
            continue

        ids.append(str(barber["id"]))
        documents.append(document)
        metadatas.append(
            {
                "name": barber.get("name"),
                "specialty": barber.get("specialty"),
                "id": barber.get("id"),
            }
        )

    if ids:
        coll.add(ids=ids, documents=documents, metadatas=metadatas)


def search(query: str, n: int = 3) -> List[Dict[str, Any]]:
    """Search the vector store for the top-n most relevant barber chunks.

    Returns a list of metadata dicts (name, specialty, id) for the matched
    barbers, ordered by relevance (most relevant first).
    """
    coll = _get_collection()
    results = coll.query(query_texts=[query], n_results=min(n, coll.count()), include=["metadatas", "documents"])

    matches: List[Dict[str, Any]] = []
    if results and results.get("metadatas") and results["metadatas"][0]:
        for meta, doc in zip(results["metadatas"][0], results.get("documents", [[]])[0]):
            matches.append(
                {
                    "name": meta.get("name"),
                    "specialty": meta.get("specialty"),
                    "id": meta.get("id"),
                    "chunk": doc,
                }
            )
    return matches