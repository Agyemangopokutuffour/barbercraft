"""Tools the chatbot model can call, backed by real requests to the BarberCraft API.

Tool errors are returned to the model as {"error": ...} results rather than
raised, so the assistant can tell the user it couldn't reach the data instead
of crashing the request.
"""

import os

import httpx
from dotenv import load_dotenv

load_dotenv()

BACKEND_URL = os.getenv("BACKEND_URL", "http://127.0.0.1:8001").rstrip("/")
TIMEOUT = httpx.Timeout(15.0)

# Same 30-minute slot grid the frontend booking modal uses: 09:00–17:30.
TIME_SLOTS = [f"{h:02d}:{m:02d}" for h in range(9, 18) for m in (0, 30)]


class ToolError(Exception):
    """Raised when the BarberCraft API is unreachable or returns an error."""


def _format_price(cents: int) -> str:
    return f"₵{cents / 100:.2f}"


async def _get(path: str) -> dict | list:
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            resp = await client.get(f"{BACKEND_URL}{path}")
    except httpx.HTTPError as exc:
        raise ToolError(f"Could not reach the BarberCraft API at {BACKEND_URL}: {exc}") from exc

    if resp.status_code >= 400:
        raise ToolError(f"BarberCraft API returned {resp.status_code} for {path}: {resp.text[:300]}")
    return resp.json()


async def get_barbers() -> dict:
    """List all barbers with specialty, rating, and location."""
    data = await _get("/barbers")
    return {
        "barbers": [
            {
                "id": b["id"],
                "name": b["name"],
                "specialty": b["specialty"],
                "rating": b["rating"],
                "location": b["location"],
                "experience": b.get("experience"),
                "total_reviews": b.get("total_reviews"),
            }
            for b in data
        ]
    }


async def get_barber_services(barber_id: int) -> dict:
    """Services and prices for one barber (prices already in Ghana cedis)."""
    data = await _get(f"/barbers/{barber_id}")
    return {
        "barber_id": data["id"],
        "barber_name": data["name"],
        "services": [
            {
                "id": s["id"],
                "name": s["name"],
                "price": _format_price(s["price"]),
                "price_cents": s["price"],
                "duration_minutes": s["duration_minutes"],
            }
            for s in data.get("services", [])
        ],
    }


async def check_availability(barber_id: int, date: str) -> dict:
    """Open 30-minute slots for a barber on a given date (YYYY-MM-DD)."""
    data = await _get(f"/barbers/{barber_id}/availability?date={date}")
    booked = set(data.get("booked_slots") or [])
    return {
        "barber_id": barber_id,
        "date": date,
        "open_slots": [t for t in TIME_SLOTS if t not in booked],
        "booked_slots": sorted(booked),
    }


async def get_all_services() -> dict:
    """Full service catalog across all barbers (prices already in Ghana cedis)."""
    data = await _get("/services")
    return {
        "services": [
            {
                "id": s["id"],
                "name": s["name"],
                "price": _format_price(s["price"]),
                "price_cents": s["price"],
                "duration_minutes": s["duration_minutes"],
                "barber_id": s["barber_id"],
                "barber_name": s.get("barber_name"),
            }
            for s in data
        ]
    }


TOOLS = {
    "get_barbers": get_barbers,
    "get_barber_services": get_barber_services,
    "check_availability": check_availability,
    "get_all_services": get_all_services,
}


async def dispatch_tool(name: str, arguments: dict) -> dict:
    """Execute a tool by name. Always returns a dict, never raises for API issues."""
    fn = TOOLS.get(name)
    if not fn:
        return {"error": f"Unknown tool '{name}'"}

    try:
        return await fn(**arguments)
    except ToolError as exc:
        return {"error": str(exc)}
    except TypeError as exc:
        return {"error": f"Bad arguments for tool '{name}': {exc}"}


TOOL_SCHEMAS = [
    {
        "type": "function",
        "function": {
            "name": "get_barbers",
            "description": "List all barbers: name, specialty, rating, location, experience, and review count.",
            "parameters": {"type": "object", "properties": {}, "additionalProperties": False},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_barber_services",
            "description": "Get the services and prices for one barber by id. Prices are in Ghana cedis (₵).",
            "parameters": {
                "type": "object",
                "properties": {
                    "barber_id": {
                        "type": "integer",
                        "description": "The barber's id, as returned by get_barbers.",
                    }
                },
                "required": ["barber_id"],
                "additionalProperties": False,
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "check_availability",
            "description": (
                "Check which 30-minute slots are still open for a barber on a date. "
                "Slots run 09:00–17:30."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "barber_id": {
                        "type": "integer",
                        "description": "The barber's id, as returned by get_barbers.",
                    },
                    "date": {
                        "type": "string",
                        "description": "Date in YYYY-MM-DD format, e.g. 2026-08-21.",
                    },
                },
                "required": ["barber_id", "date"],
                "additionalProperties": False,
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_all_services",
            "description": "Get the full service catalog across all barbers: name, price, duration, and which barber offers it.",
            "parameters": {"type": "object", "properties": {}, "additionalProperties": False},
        },
    },
]