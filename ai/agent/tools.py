"""Tools the agent can call, backed by requests to the main BarberCraft backend.

The base URL is MAIN_BACKEND_URL (https://barbercraft.onrender.com).
Errors are returned as dicts with an "error" key so the ReAct loop can
continue instead of raising exceptions.
"""

import os
import json
import logging
from typing import Any, Dict, List

import httpx
from dotenv import load_dotenv

load_dotenv()

MAIN_BACKEND_URL = os.getenv(
    "MAIN_BACKEND_URL", "https://barbercraft.onrender.com"
).rstrip("/")

logger = logging.getLogger("barbercraft.agent.tools")
TIMEOUT = httpx.Timeout(20.0)


class ToolError(Exception):
    """Raised when the main backend is unreachable or returns an error."""


async def _get(path: str) -> dict:
    """Perform a GET request to the main backend."""
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            resp = await client.get(f"{MAIN_BACKEND_URL}{path}")
    except httpx.HTTPError as exc:
        raise ToolError(f"Could not reach the main backend at {MAIN_BACKEND_URL}: {exc}") from exc

    if resp.status_code >= 400:
        raise ToolError(
            f"Main backend returned {resp.status_code} for {path}: {resp.text[:300]}"
        )
    return resp.json()


async def _post(path: str, json: dict) -> dict:
    """Perform a POST request to the main backend."""
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT) as client:
            resp = await client.post(f"{MAIN_BACKEND_URL}{path}", json=json)
    except httpx.HTTPError as exc:
        raise ToolError(f"Could not reach the main backend at {MAIN_BACKEND_URL}: {exc}") from exc

    if resp.status_code >= 400:
        raise ToolError(
            f"Main backend returned {resp.status_code} for {path}: {resp.text[:300]}"
        )
    return resp.json()


# ── Barber API tools ─────────────────────────────────────────────────────

async def get_barbers() -> Dict[str, Any]:
    """List all barbers with specialty, rating, and location."""
    data = await _get("/barbers")
    return {
        "barbers": [
            {
                "id": b["id"],
                "name": b["name"],
                "specialty": b.get("specialty", ""),
                "rating": b.get("rating"),
                "location": b.get("location"),
                "experience": b.get("experience"),
                "total_reviews": b.get("total_reviews"),
            }
            for b in data
        ]
    }


async def get_barber_services(barber_id: int) -> Dict[str, Any]:
    """Services and prices for one barber (prices already in Ghana cedis)."""
    data = await _get(f"/barbers/{barber_id}")
    return {
        "barber_id": data["id"],
        "barber_name": data["name"],
        "services": [
            {
                "id": s["id"],
                "name": s["name"],
                "price": s.get("price"),
                "duration_minutes": s.get("duration_minutes"),
            }
            for s in data.get("services", [])
        ],
    }


async def check_availability(barber_id: int, date: str) -> Dict[str, Any]:
    """Check open 30-minute slots for a barber on a given date (YYYY-MM-DD)."""
    data = await _get(f"/barbers/{barber_id}/availability?date={date}")
    booked = set(data.get("booked_slots") or [])
    # The frontend uses slots 09:00–17:30 in 30-min steps
    all_slots = [f"{h:02d}:{m:02d}" for h in range(9, 18) for m in (0, 30)]
    open_slots = [t for t in all_slots if t not in booked]
    return {
        "barber_id": barber_id,
        "date": date,
        "open_slots": open_slots,
        "booked_slots": sorted(booked),
    }


async def get_all_services() -> Dict[str, Any]:
    """Full service catalog across all barbers (prices in Ghana cedis)."""
    data = await _get("/services")
    return {"services": data}


# ── Booking tools ────────────────────────────────────────────────────────

async def book_slot(barber_id: int, date: str, slot: str, service_id: int) -> Dict[str, Any]:
    """Book a time slot for a barber."""
    payload = {
        "barber_id": barber_id,
        "date": date,
        "slot": slot,
        "service_id": service_id,
    }
    data = await _post("/bookings", payload)
    return data


# ── Dispatch ─────────────────────────────────────────────────────────────

TOOLS = {
    "get_barbers": get_barbers,
    "get_barber_services": get_barber_services,
    "check_availability": check_availability,
    "get_all_services": get_all_services,
    "book_slot": book_slot,
}


async def dispatch_tool(name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
    """Execute a tool by name. Always returns a dict, never raises (errors are
    captured as {"error": ...} so the ReAct loop can continue gracefully."""
    fn = TOOLS.get(name)
    if not fn:
        return {"error": "Unknown tool " + name}

    try:
        result = await fn(**arguments)
        return result
    except ToolError as exc:
        logger.warning("ToolError for %s: %s", name, exc)
        return {"error": str(exc)}
    except Exception as exc:  # pylint: disable=broad-except
        logger.exception("Unexpected error in tool %s", name)
        return {"error": f"Unexpected error in {name}: {exc}"}


TOOL_SCHEMAS = [
    {
        "type": "function",
        "function": {
            "name": "get_barbers",
            "description": "List all barbers with specialty, rating, and location.",
            "parameters": {
                "type": "object",
                "properties": {},
                "additionalProperties": False,
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_barber_services",
            "description": "Get services and prices for one barber by id. Prices are in Ghana cedis (₵).",
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
    {
        "type": "function",
        "function": {
            "name": "book_slot",
            "description": "Book a time slot for a barber. Provides barber_id, date, slot (e.g. 10:00), and service_id.",
            "parameters": {
                "type": "object",
                "properties": {
                    "barber_id": {
                        "type": "integer",
                        "description": "The barber's id.",
                    },
                    "date": {
                        "type": "string",
                        "description": "Date in YYYY-MM-DD format.",
                    },
                    "slot": {
                        "type": "string",
                        "description": "Time slot in HH:MM format, e.g. 10:00.",
                    },
                    "service_id": {
                        "type": "integer",
                        "description": "The service id to book.",
                    },
                },
                "required": ["barber_id", "date", "slot", "service_id"],
                "additionalProperties": False,
            },
        },
    },
]