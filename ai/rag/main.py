import os
import sys
import asyncio
from typing import List, Dict, Any

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'chatbot'))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from openrouter import OpenRouterError, run_chat, _complete
from tools import TOOL_SCHEMAS, dispatch_tool
from vectorstore import search as vector_search

SYSTEM_PROMPT = (
    "You are the BarberCraft assistant for a barber-booking app based in Accra, Ghana. "
    "You are friendly but efficient, and you keep replies short and useful. "
    "You MUST ground every factual answer (prices, services, barbers, availability) "
    "in the results of the tools available to you — never invent, guess, or repeat "
    "prices, barbers, or availability that did not come back from a tool call. "
    "If a question needs data (prices, who's free, the service list, availability), "
    "call the relevant tool before answering. For general chat or small talk, answer "
    "directly without a tool call. If a tool returns an error, say you couldn't reach "
    "the data and suggest trying again. Prices returned by tools are already in "
    "Ghana cedis (₵) with the ₵ symbol included."
)

app = FastAPI(
    title="BarberCraft RAG Chat",
    description="AI assistant with semantic search over barber bios + tool-grounded API calls.",
    version="0.1.0",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-build the index if the Chroma collection is empty
    await build_index_if_empty()
    yield


async def build_index_if_empty():
    from vectorstore import get_collection
    coll = get_collection()
    if coll.count() == 0:
        print("DEBUG: Vector store empty, building index...", flush=True)
        from build_index import fetch_and_enrich_barbers
        enriched = await fetch_and_enrich_barbers()
        from vectorstore import add_barbers
        add_barbers(enriched)
        print(f"DEBUG: Index built, {coll.count()} documents embedded.", flush=True)
    else:
        print(f"DEBUG: Vector store already has {coll.count()} documents, skipping build.", flush=True)


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    conversation_history: list[dict] = Field(default_factory=list)

class ChatResponse(BaseModel):
    reply: str
    response: str  # Added duplicate key for frontend compatibility
    tool_calls_made: list[dict]
    retrieved_context: list[dict]

def _build_messages(req: ChatRequest, retrieved_context: str | None = None) -> list[dict]:
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    if retrieved_context:
        messages.append(
            {"role": "system", "content": f"Relevant barber information: {retrieved_context}"}
        )
    for msg in req.conversation_history:
        role = msg.get("role")
        content = msg.get("content")
        if role in ("user", "assistant") and isinstance(content, str) and content.strip():
            messages.append({"role": role, "content": content})
    messages.append({"role": "user", "content": req.message})
    return messages

@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest) -> ChatResponse:
    try:
        # Step 1: Run vector search without blocking async event loop
        retrieved = await asyncio.to_thread(vector_search, req.message, 3)
    except Exception as e:
        print(f"Vector search failed: {e}")
        retrieved = []

    context_parts: list[str] = []
    for r in retrieved:
        name = r.get("name", "Unknown") if isinstance(r, dict) else "Unknown"
        specialty = r.get("specialty", "") if isinstance(r, dict) else ""
        context_parts.append(f"{name} ({specialty})")
    retrieved_context = "; ".join(context_parts) if context_parts else ""

    messages = _build_messages(req, retrieved_context)

    try:
        reply, tool_calls_made = await run_chat(messages, TOOL_SCHEMAS, dispatch_tool)
    except OpenRouterError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception as exc:
        print(f"Chat Execution Error: {exc}")
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return ChatResponse(
        reply=reply,
        response=reply,
        tool_calls_made=tool_calls_made,
        retrieved_context=[
            {"name": r.get("name"), "specialty": r.get("specialty"), "chunk": r.get("chunk", "")}
            for r in retrieved if isinstance(r, dict)
        ],
    )

@app.get("/")
def root() -> dict:
    return {"app": "BarberCraft RAG Chat", "chat": "/chat", "docs": "/docs"}