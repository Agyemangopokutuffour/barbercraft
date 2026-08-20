# BarberCraft Backend

FastAPI + SQLAlchemy + SQLite backend for the BarberCraft barber-booking app.
Replaces the frontend's hardcoded arrays and mock (console.log-only) booking flow
with a real, persistent API.

## Setup

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # macOS / Linux

pip install -r requirements.txt
```

## Run

```bash
# Seed the database with the 6 mock barbers (first run, or to reset)
python seed.py

# Start the API
uvicorn main:app --reload
```

Interactive docs: http://127.0.0.1:8000/docs

## Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/` | API info |
| GET | `/barbers` | All barbers, services + rating nested |
| GET | `/barbers/{id}` | Full barber detail including reviews |
| GET | `/barbers/{id}/availability?date=YYYY-MM-DD` | Booked time slots for that barber/date |
| POST | `/bookings` | Create a booking (validates slot, returns confirmation code) |
| GET | `/bookings/{id}` | Booking details for the confirmation screen |
| GET | `/services` | All services across all barbers |

## Notes

- Prices are stored as **integer cents** (e.g. `3500` for ₵35) — the `₵` string
  formatting stays in the frontend.
- Durations are stored as integer minutes.
- Booking validation: date cannot be in the past, and the same barber/date/time
  slot cannot be double-booked (confirmed bookings only).
- CORS is enabled for the Vite dev server origins (`localhost:5173` / `5174`).
- The database is a single file `barbercraft.db` created next to `main.py`
  (zero setup). Delete it and re-run `python seed.py` to reset.