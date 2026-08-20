from pydantic import BaseModel, ConfigDict


class ServiceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    barber_id: int
    name: str
    price: int  # integer cents, e.g. 3500 for ₵35
    duration_minutes: int


class ServiceWithBarber(ServiceOut):
    barber_name: str | None = None