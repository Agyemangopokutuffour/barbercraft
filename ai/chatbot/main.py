"""BarberCraft chatbot — a small FastAPI app.

Answers with an OpenRouter model, grounded in tools that query the main
BarberCraft backend. This is intentionally separate from backend/ so the
chatbot/RAG/agentic layer stays isolated from the booking API.

Run:  uvicorn main:app --port 8002
Docs:  http://127.0.0.1:8002/docs
"""

import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from openrouter import OpenRouterError, run_chat
from tools import TOOL_SCHEMAS, dispatch_tool

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
    title="BarberCraft Chatbot",
    description="AI assistant grounded in the BarberCraft API via tool calls.",
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


def _build_messages(req: ChatRequest) -> list[dict]:
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for msg in req.conversation_history:
        role = msg.get("role")
        content = msg.get("content")
        if role in ("user", "assistant") and isinstance(content, str) and content.strip():
            messages.append({"role": role, "content": content})
    messages.append({"role": "user", "content": req.message})
    return messages


@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest) -> ChatResponse:
    messages = _build_messages(req)
    try:
        reply, tool_calls_made = await run_chat(messages, TOOL_SCHEMAS, dispatch_tool)
    except OpenRouterError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return ChatResponse(reply=reply, tool_calls_made=tool_calls_made)


@app.get("/")
def root() -> dict:
    return {"app": "BarberCraft Chatbot", "chat": "/chat", "docs": "/docs"}