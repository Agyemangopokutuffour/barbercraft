from pydantic import BaseModel, ConfigDict

from schemas.review import ReviewOut
from schemas.service import ServiceOut


class BarberBase(BaseModel):
    id: int
    name: str
    specialty: str
    experience: str | None = None
    location: str
    rating: float
    total_reviews: int
    avatar: str | None = None
    story: str | None = None
    badges: list[str] = []


class BarberOut(BarberBase):
    model_config = ConfigDict(from_attributes=True)

    services: list[ServiceOut] = []


class BarberDetail(BarberOut):
    reviews: list[ReviewOut] = []