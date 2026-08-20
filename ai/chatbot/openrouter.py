"""OpenRouter API wrapper — OpenAI-compatible chat completions with tool calling.

The tool-call loop lives here so main.py stays thin: run_chat() sends the
conversation to OpenRouter, executes any tool calls the model requests by
invoking the supplied executor, feeds the results back, and repeats until the
model replies with plain text.
"""

import json
import os

import httpx
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("OPENROUTER_API_KEY", "").strip()
MODEL = os.getenv("OPENROUTER_MODEL", "").strip()
API_URL = "https://openrouter.ai/api/v1/chat/completions"
APP_URL = os.getenv("CHATBOT_URL", "http://127.0.0.1:8002")
MAX_TOOL_ROUNDS = 6


class OpenRouterError(Exception):
    """Raised when OpenRouter can't be configured, reached, or returns an error."""


def _headers() -> dict:
    if not API_KEY:
        raise OpenRouterError(
            "OPENROUTER_API_KEY is not set. Add it to ai/chatbot/.env."
        )
    return {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": APP_URL,  # shows in the OpenRouter dashboard
        "X-Title": "BarberCraft Assistant",
    }


async def _complete(messages: list[dict], tools: list[dict] | None) -> dict:
    if not MODEL:
        raise OpenRouterError(
            "OPENROUTER_MODEL is not set. Add it to ai/chatbot/.env."
        )

    payload: dict = {"model": MODEL, "messages": messages}
    if tools:
        payload["tools"] = tools
        payload["tool_choice"] = "auto"

    try:
        async with httpx.AsyncClient(timeout=90.0) as client:
            resp = await client.post(API_URL, headers=_headers(), json=payload)
    except httpx.HTTPError as exc:
        raise OpenRouterError(f"Could not reach OpenRouter: {exc}") from exc

    if resp.status_code != 200:
        raise OpenRouterError(
            f"OpenRouter returned {resp.status_code}: {resp.text[:500]}"
        )
    return resp.json()


async def run_chat(messages: list[dict], tools: list[dict] | None, execute_tool):
    """Run the model against `messages`, executing tool calls until it answers.

    Returns (reply, tool_calls_made). `execute_tool(name, arguments)` is an
    async callable that runs a tool against the main backend.
    """
    tool_calls_made: list[dict] = []

    for _ in range(MAX_TOOL_ROUNDS):
        data = await _complete(messages, tools)
        message = data["choices"][0]["message"]
        tool_calls = message.get("tool_calls") or []

        if not tool_calls:
            reply = (message.get("content") or "").strip()
            return reply, tool_calls_made

        # Assistant message with tool_calls must be echoed back verbatim.
        messages.append(message)

        for call in tool_calls:
            fn = call["function"]
            name = fn.get("name", "")
            try:
                arguments = json.loads(fn.get("arguments") or "{}")
            except json.JSONDecodeError:
                arguments = {}

            result = await execute_tool(name, arguments)
            tool_calls_made.append({"name": name, "arguments": arguments})
            messages.append(
                {
                    "role": "tool",
                    "tool_call_id": call["id"],
                    "content": json.dumps(result, ensure_ascii=False),
                }
            )

    return (
        "I had trouble finishing that request. Could you rephrase it?",
        tool_calls_made,
    )