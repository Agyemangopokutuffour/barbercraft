"""Test script for the RAG chat endpoint."""
import json
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

import httpx
from dotenv import load_dotenv

load_dotenv()

BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:8003")


async def test_curly_hair():
    """Test that 'who does curly hair' surfaces Zara."""
    async with httpx.AsyncClient() as client:
        resp = await client.post(f"{BASE_URL}/chat", json={"message": "who does curly hair"})
        data = resp.json()
        print("=== Test: who does curly hair ===")
        print(f"Reply: {data['reply'][:200]}")
        print(f"Retrieved context: {data.get('retrieved_context')}")
        print(f"Tool calls made: {data.get('tool_calls_made')}")
        # Check if Zara is mentioned in the reply
        if "Zara" in data['reply'] or "curly" in data['reply'].lower():
            print("✓ Zara/curly hair mentioned in reply")
        else:
            print("✗ Zara/curly hair NOT mentioned in reply")
        print()


async def test_afro():
    """Test afro query."""
    async with httpx.AsyncClient() as client:
        resp = await client.post(f"{BASE_URL}/chat", json={"message": "I want an afro"})
        data = resp.json()
        print("=== Test: I want an afro ===")
        print(f"Reply: {data['reply'][:200]}")
        print(f"Retrieved context: {data.get('retrieved_context')}")
        print()


async def test_beards():
    """Test beard query."""
    async with httpx.AsyncClient() as client:
        resp = await client.post(f"{BASE_URL}/chat", json={"message": "someone good with beards"})
        data = resp.json()
        print("=== Test: someone good with beards ===")
        print(f"Reply: {data['reply'][:200]}")
        print(f"Retrieved context: {data.get('retrieved_context')}")
        print()


if __name__ == "__main__":
    import asyncio
    asyncio.run(test_curly_hair())
    asyncio.run(test_afro())
    asyncio.run(test_beards())