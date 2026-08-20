import random
import string
import time
from datetime import date as date_cls

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from database import get_db
from models.barber import Barber
from models.booking import Booking
from schemas.booking import BookingCreate, BookingOut

router = APIRouter(prefix="/bookings", tags=["bookings"])


def generate_confirmation_code(db: Session) -> str:
    """Generate a unique confirmation code like the frontend's BC… format."""
    while True:
        suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
        code = f"BC{int(time.time())}{suffix}"
        exists = db.scalars(
            select(Booking.id).where(Booking.confirmation_code == code)
        ).first()
        if not exists:
            return code


@router.get("", response_model=list[BookingOut])
def list_bookings(
    barber_id: int | None = None,
    date: str | None = None,
    db: Session = Depends(get_db),
):
    """List bookings, optionally filtered by barber and/or date."""
    stmt = select(Booking).order_by(Booking.created_at.desc())
    if barber_id is not None:
        stmt = stmt.where(Booking.barber_id == barber_id)
    if date is not None:
        stmt = stmt.where(Booking.date == date)
    return db.scalars(stmt).all()


@router.post("", response_model=BookingOut, status_code=201)
def create_booking(payload: BookingCreate, db: Session = Depends(get_db)):
    """Create a booking. Validates the slot isn't already taken and the date
    isn't in the past."""
    if not db.get(Barber, payload.barber_id):
        raise HTTPException(status_code=404, detail="Barber not found")

    try:
        booking_date = date_cls.fromisoformat(payload.date)
    except ValueError:
        raise HTTPException(
            status_code=422, detail="date must be in YYYY-MM-DD format"
        )

    if booking_date < date_cls.today():
        raise HTTPException(
            status_code=400, detail="Booking date cannot be in the past"
        )

    existing = db.scalars(
        select(Booking).where(
            Booking.barber_id == payload.barber_id,
            Booking.date == payload.date,
            Booking.time == payload.time,
            Booking.status == "confirmed",
        )
    ).first()
    if existing:
        raise HTTPException(
            status_code=409,
            detail="That time slot is already booked for this barber",
        )

    booking = Booking(
        barber_id=payload.barber_id,
        date=payload.date,
        time=payload.time,
        customer_name=payload.customer_name,
        customer_phone=payload.customer_phone,
        customer_email=payload.customer_email,
        notes=payload.notes,
        payment_method=payload.payment_method,
        total_price=payload.total_price,
        status="confirmed",
        confirmation_code=generate_confirmation_code(db),
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


@router.get("/{booking_id}", response_model=BookingOut)
def get_booking(booking_id: int, db: Session = Depends(get_db)):
    """Booking details for the confirmation screen."""
    booking = db.get(Booking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking