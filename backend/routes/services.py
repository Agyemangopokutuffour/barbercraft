from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from database import get_db
from models.service import Service
from schemas.service import ServiceOut, ServiceWithBarber

router = APIRouter(prefix="/services", tags=["services"])


@router.get("", response_model=list[ServiceWithBarber])
def list_services(db: Session = Depends(get_db)):
    """List all services across all barbers, with the owning barber's name."""
    stmt = select(Service).options(joinedload(Service.barber)).order_by(Service.id)
    services = db.scalars(stmt).all()
    return [
        {
            **ServiceOut.model_validate(s).model_dump(),
            "barber_name": s.barber.name if s.barber else None,
        }
        for s in services
    ]