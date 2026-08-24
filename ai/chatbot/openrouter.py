import json
import os

import httpx
from dotenv import load_dotenv

load_dotenv()

API_URL = "https://openrouter.ai/api/v1/chat/completions"
MAX_TOOL_ROUNDS = 6


class OpenRouterError(Exception):
    """Raised when OpenRouter can't be configured, reached, or returns an error."""


def get_api_key() -> str:
    key = os.getenv("OPENROUTER_API_KEY", "").strip()
    if not key:
        raise OpenRouterError(
            "OPENROUTER_API_KEY is not set in environment variables."
        )
    return key


def get_model() -> str:
    # Falls back to a reliable free model if OPENROUTER_MODEL isn't set in Render
    return os.getenv("OPENROUTER_MODEL", "qwen-2.5-72b-instruct:free").strip()


def _headers() -> dict:
    api_key = get_api_key()
    app_url = os.getenv("CHATBOT_URL", "https://barbercraft-one.vercel.app")
    return {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": app_url,
        "X-Title": "BarberCraft Assistant",
    }


async def _complete(messages: list[dict], tools: list[dict] | None) -> dict:
    model = get_model()
    payload: dict = {"model": model, "messages": messages}
    
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
    tool_calls_made: list[dict] = []

    for _ in range(MAX_TOOL_ROUNDS):
        data = await _complete(messages, tools)
        message = data["choices"][0]["message"]
        tool_calls = message.get("tool_calls") or []

        if not tool_calls:
            reply = (message.get("content") or "").strip()
            return reply, tool_calls_made

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