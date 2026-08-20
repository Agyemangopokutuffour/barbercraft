from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from database import Base, engine
from models import Barber, Booking, Review, Service  # noqa: F401 — register tables
from routes import barbers_router, bookings_router, services_router

app = FastAPI(
    title="BarberCraft API",
    description="Backend for the BarberCraft barber-booking app.",
    version="1.0.0",
)

# Vite dev server origins (plus the alternate port Vite can pick up),
# and the production frontend origin via the FRONTEND_URL env var.
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

Base.metadata.create_all(bind=engine)

app.include_router(barbers_router)
app.include_router(bookings_router)
app.include_router(services_router)


@app.get("/")
def root():
    return {"app": "BarberCraft API", "docs": "/docs"}