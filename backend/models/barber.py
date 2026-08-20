from sqlalchemy import Float, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class Barber(Base):
    __tablename__ = "barbers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120), index=True)
    specialty: Mapped[str] = mapped_column(String(160))
    experience: Mapped[str | None] = mapped_column(String(40), nullable=True)
    location: Mapped[str] = mapped_column(String(160))
    rating: Mapped[float] = mapped_column(Float, default=0.0)
    total_reviews: Mapped[int] = mapped_column(Integer, default=0)
    avatar: Mapped[str | None] = mapped_column(String(16), nullable=True)
    story: Mapped[str | None] = mapped_column(Text, nullable=True)
    badges: Mapped[list] = mapped_column(JSON, default=list)

    services: Mapped[list["Service"]] = relationship(
        back_populates="barber", cascade="all, delete-orphan"
    )
    reviews: Mapped[list["Review"]] = relationship(
        back_populates="barber", cascade="all, delete-orphan"
    )
    bookings: Mapped[list["Booking"]] = relationship(
        back_populates="barber", cascade="all, delete-orphan"
    )