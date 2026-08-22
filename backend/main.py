from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os

from database import Base, engine
from models import Barber, Booking, Review, Service  # noqa: F401 — register tables
from routes import barbers_router, bookings_router, services_router

app = FastAPI(
    title="BarberCraft API",
    description="Backend for the BarberCraft barber-booking app.",
    version="1.0.0",
)

RAG_SERVICE_URL = os.getenv("RAG_SERVICE_URL", "https://barbercraft-rag.onrender.com")

async def get_rag_context(query: str):
    async with httpx.AsyncClient() as client:
        # Update endpoint path to match vectorstore search route
        response = await client.post(
            f"{RAG_SERVICE_URL}/search", 
            json={"query": query}
        )
        if response.status_code == 200:
            return response.json()
        return []

# Vite dev server origins (plus the alternate port Vite can pick up),
# and the production frontend origin via the FRONTEND_URL env var.
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://barbercraft-one.vercel.app",
]
if os.getenv("FRONTEND_URL"):
    origins.append(os.getenv("FRONTEND_URL"))

print(f"DEBUG: CORS origins configured as: {origins}", flush=True)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

from database import SessionLocal
from models import Barber

def seed_if_empty():
    db = SessionLocal()
    try:
        if db.query(Barber).count() == 0:
            print("DEBUG: Database empty, running seed...", flush=True)
            from seed import seed
            seed()
            print("DEBUG: Seed complete.", flush=True)
        else:
            print(f"DEBUG: Database already has {db.query(Barber).count()} barbers, skipping seed.", flush=True)
    finally:
        db.close()

seed_if_empty()

app.include_router(barbers_router)
app.include_router(bookings_router)
app.include_router(services_router)


@app.get("/")
def root():
    return {"app": "BarberCraft API", "docs": "/docs"}