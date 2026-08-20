from datetime import datetime, timezone

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    barber_id: Mapped[int] = mapped_column(
        ForeignKey("barbers.id"), index=True
    )
    reviewer_name: Mapped[str] = mapped_column(String(120))
    rating: Mapped[float] = mapped_column(Float, default=5.0)
    text: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=lambda: datetime.now(timezone.utc)
    )

    barber: Mapped["Barber"] = relationship(back_populates="reviews")