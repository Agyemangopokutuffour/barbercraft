from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, field_validator


class BookingCreate(BaseModel):
    barber_id: int
    date: str  # YYYY-MM-DD
    time: str  # HH:MM (24h)
    customer_name: str
    customer_phone: str
    customer_email: str | None = None
    notes: str | None = None
    payment_method: str
    total_price: int = 0  # integer cents

    @field_validator("date")
    @classmethod
    def validate_date(cls, v: str) -> str:
        try:
            date.fromisoformat(v)
        except ValueError as exc:
            raise ValueError("date must be in YYYY-MM-DD format") from exc
        return v

    @field_validator("time")
    @classmethod
    def validate_time(cls, v: str) -> str:
        try:
            hours, minutes = v.split(":")
            hours_i, minutes_i = int(hours), int(minutes)
        except (ValueError, TypeError) as exc:
            raise ValueError("time must be in HH:MM format") from exc
        if not (0 <= hours_i < 24 and 0 <= minutes_i < 60):
            raise ValueError("time must be a valid 24h clock value")
        return v

    @field_validator("total_price")
    @classmethod
    def validate_price(cls, v: int) -> int:
        if v < 0:
            raise ValueError("total_price cannot be negative")
        return v


class BookingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    barber_id: int
    date: str
    time: str
    customer_name: str
    customer_phone: str
    customer_email: str | None
    notes: str | None
    payment_method: str
    total_price: int
    status: str
    confirmation_code: str
    created_at: datetime


class AvailabilityOut(BaseModel):
    date: str
    booked_slots: list[str]