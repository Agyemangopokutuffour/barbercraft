from routes.barbers import router as barbers_router
from routes.bookings import router as bookings_router
from routes.services import router as services_router

__all__ = ["barbers_router", "bookings_router", "services_router"]