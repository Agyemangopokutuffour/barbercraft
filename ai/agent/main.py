"""BarberCraft agentic service — FastAPI app that runs a ReAct/tool-calling
loop against the OpenRouter LLM, with tools that query the main backend.

The `openrouter` module lives under `ai/chatbot/`, so we add it to the path
import so the import works regardless of the working directory.
"""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'chatbot'))

import asyncio
import logging
import os
from typing import List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from openrouter import run_chat, _complete, OpenRouterError

from agent.schemas import AgentRequest, AgentResponse
from agent.tools import dispatch_tool, TOOL_SCHEMAS

MAIN_BACKEND_URL = os.getenv("MAIN_BACKEND_URL", "https://barbercraft.onrender.com").rstrip("/")

logger = logging.getLogger("barbercraft.agent")

# ── FastAPI app ──────────────────────────────────────────────────────────────

app = FastAPI(
    title="BarberCraft Agentic Service",
    description="AI agent with tool-calling for barber-booking tasks.",
    version="0.1.0",
)

# CORSMiddleware — allow_origins=["*"] for Vercel preview URLs & local dev;
# allow_credentials=False as required.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health check ─────────────────────────────────────────────────────────────

@app.get("/")
def root() -> dict:
    return {"app": "BarberCraft Agentic Service", "docs": "/docs", "execute": "POST /agent/execute"}


# ── Agent execution loop ─────────────────────────────────────────────────────

async def _agent_loop(task: str, user_id: Optional[str], context: Optional[dict]) -> dict:
    """Run a ReAct/tool-calling loop and return the final result dict."""
    # Build the system prompt + user task
    system_prompt = (
        "You are the BarberCraft agent. Help users with barber-booking tasks: "
        "find barbers, check availability, get service info, and book slots. "
        "Always use the available tools when the user needs factual data. "
        "If a tool fails, report the error and try to recover. "
        "Keep replies short and useful. Prices are in Ghana cedis (₵)."
    )

    messages: List[dict] = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": task},
    ]

    # Attach user context if provided
    if context:
        messages.append(
            {"role": "system", "content": f"User context: {json.dumps(context, ensure_ascii=False)}"}
        )

    tool_calls_made: List[dict] = []

    for _ in range(6):  # max tool rounds
        try:
            data = await _complete(messages, TOOL_SCHEMAS)
        except OpenRouterError as exc:
            logger.error("OpenRouter error: %s", exc)
            return {
                "status": "error",
                "steps_taken": [
                    {"name": "openrouter_error", "error": str(exc)}
                ],
                "final_result": f"I'm having trouble reaching the AI service. Please try again shortly.",
            }

        message = data["choices"][0]["message"]
        tool_calls = message.get("tool_calls") or []

        if not tool_calls:
            # Model replied with final text
            reply = (message.get("content") or "").strip()
            return {
                "status": "completed",
                "steps_taken": tool_calls_made,
                "final_result": reply or "Task completed successfully.",
            }

        # Echo the assistant message with tool calls back verbatim
        messages.append(message)

        # Execute each tool call
        for call in tool_calls:
            fn = call.get("function") or {}
            name = fn.get("name", "")
            raw_args = fn.get("arguments") or "{}"

            try:
                arguments = json.loads(raw_args) if isinstance(raw_args, str) else dict(raw_args)
            except (json.JSONDecodeError, TypeError):
                arguments = {}

            result = await dispatch_tool(name, arguments)
            tool_calls_made.append(
                {"name": name, "arguments": arguments, "result": result}
            )

            # Append tool result to messages so the model can see it
            messages.append(
                {
                    "role": "tool",
                    "tool_call_id": call.get("id", ""),
                    "content": json.dumps(result, ensure_ascii=False),
                }
            )

    # Exceeded max rounds
    return {
        "status": "error",
        "steps_taken": tool_calls_made,
        "final_result": "I had trouble completing your request. Please rephrase or try again.",
    }


@app.post("/agent/execute", response_model=AgentResponse)
async def agent_execute(req: AgentRequest):
    """Execute an agentic task via ReAct/tool-calling loop."""
    try:
        result = await asyncio.to_thread(_agent_loop, req.task, req.user_id, req.context)
        return AgentResponse(**result)
    except Exception as exc:
        logger.exception("Unhandled error in /agent/execute")
        return AgentResponse(
            status="error",
            steps_taken=[],
            final_result=f"Internal error: {exc}",
        )