"""BarberCraft RAG chat — a FastAPI app that adds semantic search over barber
bios/specialties to the existing tool-grounded chatbot.

Run:  uvicorn main:app --port 8003
Docs:  http://127.0.0.1:8003/docs
"""

import os
from typing import List, Dict, Any

import sys
import os
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

    # RAG context injection — populated by the /chat endpoint below.
    # This will be overwritten at runtime with the retrieved chunks.
    # Example format:
    # "Here are the barbers most relevant to this query: ..."
)


app = FastAPI(
    title="BarberCraft RAG Chat",
    description="AI assistant with semantic search over barber bios + tool-grounded API calls.",
    version="0.1.0",
)


# Vite dev server origins, plus the production frontend origin via FRONTEND_URL.
origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
if os.getenv("FRONTEND_URL"):
    origins.append(os.getenv("FRONTEND_URL"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    conversation_history: list[dict] = Field(default_factory=list)


class ChatResponse(BaseModel):
    reply: str
    tool_calls_made: list[dict]
    retrieved_context: list[dict]


def _build_messages(req: ChatRequest, retrieved_context: str | None = None) -> list[dict]:
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    # Inject RAG context if available
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
    # Step 1: Embed the user's message and retrieve top relevant barber chunks
    retrieved = vector_search(req.message, n=3)
    # Build a human-readable summary of retrieved chunks for the system prompt
    context_parts: list[str] = []
    for r in retrieved:
        name = r.get("name", "Unknown")
        specialty = r.get("specialty", "")
        context_parts.append(f"{name} ({specialty})")
    retrieved_context = "; ".join(context_parts) if context_parts else ""

    # Step 2: Build messages with RAG context injected
    messages = _build_messages(req, retrieved_context)

    try:
        # Step 3: Run the model with tools (RAG context is in the system prompt,
        # tools are still available for live data)
        reply, tool_calls_made = await run_chat(messages, TOOL_SCHEMAS, dispatch_tool)
    except OpenRouterError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    # Step 4: Return response including what RAG retrieved (for debugging)
    return ChatResponse(
        reply=reply,
        tool_calls_made=tool_calls_made,
        retrieved_context=[{"name": r.get("name"), "specialty": r.get("specialty"), "chunk": r.get("chunk", "")} for r in retrieved],
    )


@app.get("/")
def root() -> dict:
    return {"app": "BarberCraft RAG Chat", "chat": "/chat", "docs": "/docs"}