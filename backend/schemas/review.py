from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ReviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    barber_id: int
    reviewer_name: str
    rating: float
    text: str
    created_at: datetime