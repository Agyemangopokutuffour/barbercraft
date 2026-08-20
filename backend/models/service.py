from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class Service(Base):
    __tablename__ = "services"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    barber_id: Mapped[int] = mapped_column(
        ForeignKey("barbers.id"), index=True
    )
    name: Mapped[str] = mapped_column(String(120))
    # Integer cents, e.g. 3500 for ₵35 — string formatting lives in the frontend.
    price: Mapped[int] = mapped_column(Integer, default=0)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=0)

    barber: Mapped["Barber"] = relationship(back_populates="services")