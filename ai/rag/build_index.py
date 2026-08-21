"""One-time script: pull barber data from the live backend, chunk it, embed it,
store in ChromaDB.

Run:  python -m ai.rag.build_index
or:  python ai/rag/build_index.py
"""
import json
import os
import sys

from dotenv import load_dotenv
from sentence_transformers import SentenceTransformer

import httpx

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))
from vectorstore import add_barbers

load_dotenv()

BACKEND_URL = os.getenv("BACKEND_URL", "http://127.0.0.1:8001").rstrip("/")


async def _get(path: str):
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(f"{BACKEND_URL}{path}")
        resp.raise_for_status()
        return resp.json()


async def main():
    print("Fetching barbers from backend...")
    barbers = await _get("/barbers")
    print(f"Fetched {len(barbers)} barbers.")

    # Transform each barber into a rich dict with all fields we'll embed.
    enriched: list[dict] = []
    for b in barbers:
        barber_id = b["id"]
        services = await _get(f"/barbers/{barber_id}")
        # services is the single barber object with its services
        enriched.append(
            {
                "id": b["id"],
                "name": b["name"],
                "specialty": b.get("specialty", ""),
                "story": b.get("story", ""),
                "badges": b.get("badges", []),
                "services": [
                    {
                        "name": s["name"],
                        "price": s.get("price", 0),
                        "duration_minutes": s.get("duration_minutes", 0),
                    }
                    for s in services.get("services", [])
                ],
                "total_reviews": b.get("total_reviews"),
                "rating": b.get("rating"),
                "location": b.get("location"),
                "experience": b.get("experience"),
            }
        )

    print("Embedding and storing barbers in Chroma...")
    add_barbers(enriched)
    print("Done. Run the RAG chatbot on port 8003.")


if __name__ == "__main__":
    import asyncio

    try:
        asyncio.run(main())
    except Exception as exc:
        print(f"Error: {exc}", file=sys.stderr)
        sys.exit(1)