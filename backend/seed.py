"""Populate the database with the 6 barbers from the frontend mock data.

Run directly:  python seed.py
This is destructive — it drops and recreates all tables, then reseeds.
"""

import re
from datetime import datetime, timezone

from database import Base, SessionLocal, engine
from models import Barber, Booking, Review, Service

# Mirrors src/data/barbers.js from the React app (App.js mock data).
BARBERS = [
    {
        "name": 'Marcus "The Fade King" Johnson',
        "specialty": "Modern Fades & Beard Sculpting",
        "experience": "8 years",
        "location": "Downtown Barbershop, Accra",
        "rating": 4.9,
        "total_reviews": 247,
        "avatar": "✂️",
        "story": "Started cutting hair at 16 in my neighborhood. Trained under master barber "
        "Miguel Rodriguez for 3 years. Specialized in modern fade techniques and precision "
        "beard work. My philosophy: every cut tells a story, and every client leaves feeling "
        "like their best self.",
        "badges": ["Master Craftsman", "Customer Favorite"],
        "services": [
            {"name": "Classic Fade", "price": "₵35", "duration": "45min"},
            {"name": "Beard Sculpting", "price": "₵25", "duration": "30min"},
            {"name": "Hot Towel Shave", "price": "₵20", "duration": "25min"},
        ],
        "reviews": [
            {"reviewer_name": "James K.", "rating": 5, "text": "Best fade in the city!"},
        ],
    },
    {
        "name": 'Aisha "Precision Cut" Mensah',
        "specialty": "Classic Cuts & Razor Shaves",
        "experience": "6 years",
        "location": "Central Barbershop, Accra",
        "rating": 4.8,
        "total_reviews": 180,
        "avatar": "💈",
        "story": "Trained in traditional barbering techniques and modern precision methods. "
        "Known for razor-sharp lines and a meticulous eye for symmetry.",
        "badges": ["Precision Expert", "Client Favorite"],
        "services": [
            {"name": "Classic Cut", "price": "₵30", "duration": "40min"},
            {"name": "Razor Shave", "price": "₵20", "duration": "25min"},
            {"name": "Hair Coloring", "price": "₵40", "duration": "60min"},
        ],
        "reviews": [
            {"reviewer_name": "Sarah M.", "rating": 4.8, "text": "Amazing shave!"},
        ],
    },
    {
        "name": 'Kwame "The Beard Guru" Osei',
        "specialty": "Beard Styling & Trims",
        "experience": "7 years",
        "location": "North Barbershop, Accra",
        "rating": 4.9,
        "total_reviews": 220,
        "avatar": "🧔",
        "story": "Specializes in beard care since 2018. From sculpted lines to full "
        "reconstructions, every beard gets the attention it deserves.",
        "badges": ["Beard Specialist", "Top Rated"],
        "services": [
            {"name": "Beard Sculpting", "price": "₵25", "duration": "30min"},
            {"name": "Trim", "price": "₵15", "duration": "20min"},
            {"name": "Facial Massage", "price": "₵30", "duration": "40min"},
        ],
        "reviews": [
            {"reviewer_name": "John D.", "rating": 4.9, "text": "Best beard work!"},
        ],
    },
    {
        "name": 'Lina "The Trendsetter" Boateng',
        "specialty": "Trendy Cuts & Hair Coloring",
        "experience": "5 years",
        "location": "Eastside Studio, Cape Coast",
        "rating": 4.6,
        "total_reviews": 150,
        "avatar": "🎨",
        "story": "Brings the latest trends to haircuts. From bold colors to textured "
        "silhouettes, always a step ahead of the curve.",
        "badges": ["Trendsetter", "Creative Artist"],
        "services": [
            {"name": "Trendy Cut", "price": "₵40", "duration": "50min"},
            {"name": "Hair Coloring", "price": "₵45", "duration": "60min"},
        ],
        "reviews": [
            {"reviewer_name": "Emma R.", "rating": 4.7, "text": "Love the color!"},
        ],
    },
    {
        "name": 'Emmanuel "The Razor Master" Addo',
        "specialty": "Classic Shaves & Hairline Precision",
        "experience": "7 years",
        "location": "Westend Barbers, Takoradi",
        "rating": 4.7,
        "total_reviews": 190,
        "avatar": "🪒",
        "story": "Master of traditional shaving techniques. The straight razor is an "
        "instrument, and every pass is deliberate.",
        "badges": ["Razor Expert", "Precision Master"],
        "services": [
            {"name": "Classic Shave", "price": "₵30", "duration": "35min"},
            {"name": "Hairline Precision", "price": "₵25", "duration": "30min"},
        ],
        "reviews": [
            {"reviewer_name": "Peter L.", "rating": 4.8, "text": "Perfect shave!"},
        ],
    },
    {
        "name": 'Zara "Curly Expert" Adebayo',
        "specialty": "Curly Hair & Treatments",
        "experience": "6 years",
        "location": "Southside Salon, Accra",
        "rating": 4.9,
        "total_reviews": 160,
        "avatar": "✂️",
        "story": "Expert in curly hair care since 2019. Celebrating natural texture with "
        "cuts and treatments built around healthy curls.",
        "badges": ["Curly Hair Specialist", "Highly Rated"],
        "services": [
            {"name": "Curly Cut", "price": "₵35", "duration": "45min"},
            {"name": "Deep Conditioning", "price": "₵30", "duration": "40min"},
            {"name": "Twist Style", "price": "₵40", "duration": "50min"},
        ],
        "reviews": [
            {"reviewer_name": "Tina A.", "rating": 4.9, "text": "Amazing curls!"},
        ],
    },
]


def parse_price_cents(price_str: str) -> int:
    """'₵35' -> 3500 (integer cents)."""
    digits = re.sub(r"[^\d]", "", price_str)
    return int(digits or 0) * 100


def parse_duration_minutes(duration_str: str) -> int:
    """'45min' -> 45."""
    digits = re.sub(r"[^\d]", "", duration_str)
    return int(digits or 0)


def seed() -> None:
    print("Dropping and recreating tables…")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        for idx, data in enumerate(BARBERS, start=1):
            barber = Barber(
                id=idx,
                name=data["name"],
                specialty=data["specialty"],
                experience=data.get("experience"),
                location=data["location"],
                rating=data["rating"],
                total_reviews=data["total_reviews"],
                avatar=data.get("avatar"),
                story=data.get("story"),
                badges=data.get("badges", []),
            )
            db.add(barber)

            for s in data.get("services", []):
                db.add(
                    Service(
                        barber_id=idx,
                        name=s["name"],
                        price=parse_price_cents(s["price"]),
                        duration_minutes=parse_duration_minutes(s["duration"]),
                    )
                )

            for r in data.get("reviews", []):
                db.add(
                    Review(
                        barber_id=idx,
                        reviewer_name=r["reviewer_name"],
                        rating=r["rating"],
                        text=r["text"],
                        created_at=datetime.now(timezone.utc),
                    )
                )

        db.commit()
        print(f"Seeded {len(BARBERS)} barbers with their services and reviews.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()