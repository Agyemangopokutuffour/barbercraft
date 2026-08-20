"""Interactive terminal client for the BarberCraft chatbot.

Run:  .venv\\Scripts\\python chat.py
"""

import httpx

CHAT_URL = "http://127.0.0.1:8002/chat"
TIMEOUT = httpx.Timeout(90.0)


def main() -> None:
    history: list[dict] = []
    print("BarberCraft assistant — type your message. 'exit' or Ctrl+C to quit.\n")

    while True:
        try:
            prompt = input("You: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\nBye!")
            break

        if not prompt or prompt.lower() in ("exit", "quit"):
            break

        try:
            resp = httpx.post(
                CHAT_URL,
                json={"message": prompt, "conversation_history": history},
                timeout=TIMEOUT,
            )
            resp.raise_for_status()
            data = resp.json()
        except httpx.HTTPError as exc:
            print(f"\nBot: (request failed: {exc})\n")
            continue

        history.append({"role": "user", "content": prompt})
        history.append({"role": "assistant", "content": data["reply"]})

        tools = data.get("tool_calls_made") or []
        if tools:
            names = ", ".join(t["name"] for t in tools)
            print(f"  [tools called: {names}]")

        print(f"\nBot: {data['reply']}\n")


if __name__ == "__main__":
    main()