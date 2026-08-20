from datetime import date as date_cls

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from database import get_db
from models.barber import Barber
from models.booking import Booking
from schemas.barber import BarberDetail, BarberOut
from schemas.booking import AvailabilityOut

router = APIRouter(prefix="/barbers", tags=["barbers"])


@router.get("", response_model=list[BarberOut])
def list_barbers(db: Session = Depends(get_db)):
    """List all barbers, with their services and rating nested."""
    stmt = (
        select(Barber)
        .options(selectinload(Barber.services))
        .order_by(Barber.id)
    )
    return db.scalars(stmt).all()


@router.get("/{barber_id}", response_model=BarberDetail)
def get_barber(barber_id: int, db: Session = Depends(get_db)):
    """Full barber detail including services and reviews."""
    stmt = (
        select(Barber)
        .options(
            selectinload(Barber.services),
            selectinload(Barber.reviews),
        )
        .where(Barber.id == barber_id)
    )
    barber = db.scalars(stmt).first()
    if not barber:
        raise HTTPException(status_code=404, detail="Barber not found")
    return barber


@router.get("/{barber_id}/availability", response_model=AvailabilityOut)
def get_availability(
    barber_id: int,
    date: str = Query(..., description="YYYY-MM-DD"),
    db: Session = Depends(get_db),
):
    """Return the already-booked time slots for a barber on a given date."""
    if not db.get(Barber, barber_id):
        raise HTTPException(status_code=404, detail="Barber not found")

    try:
        date_cls.fromisoformat(date)
    except ValueError as exc:
        raise HTTPException(
            status_code=422, detail="date must be in YYYY-MM-DD format"
        ) from exc

    stmt = (
        select(Booking.time)
        .where(
            Booking.barber_id == barber_id,
            Booking.date == date,
            Booking.status == "confirmed",
        )
        .order_by(Booking.time)
    )
    booked = list(db.scalars(stmt).all())
    return AvailabilityOut(date=date, booked_slots=booked)