import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from vectorstore import add_barbers, search

# Mock barber data similar to what the backend would return
barbers = [
    {
        "id": 1,
        "name": 'Marcus "The Fade King" Johnson',
        "specialty": 'Modern Fades & Beard Sculpting',
        "story": 'Started cutting hair at 16 in my neighborhood. Trained under master barber Miguel Rodriguez for 3 years.',
        "badges": ['Master Craftsman', 'Customer Favorite'],
        "services": [{"name": "Classic Fade", "price": "₵35", "duration": "45min"}, {"name": "Beard Sculpting", "price": "₵25", "duration": "30min"}]
    },
    {
        "id": 2,
        "name": 'Aisha "Precision Cut" Mensah',
        "specialty": 'Classic Cuts & Razor Shaves',
        "story": 'Trained in traditional barbering techniques and modern precision methods.',
        "badges": ['Precision Expert', 'Client Favorite'],
        "services": [{"name": "Classic Cut", "price": "₵30", "duration": "40min"}]
    },
    {
        "id": 6,
        "name": 'Zara "Curly Expert" Adebayo',
        "specialty": 'Curly Hair & Treatments',
        "story": 'Expert in curly hair care since 2019. Celebrating natural texture with cuts and treatments built around healthy curls.',
        "badges": ['Curly Hair Specialist', 'Highly Rated'],
        "services": [{"name": "Curly Cut", "price": "₵35", "duration": "45min"}]
    }
]

add_barbers(barbers)
print('Added barbers to Chroma')

# Test search results
results = search('who does curly hair')
print(f'Search for "who does curly hair": {results}')

results2 = search('I want an afro')
print(f'Search for "I want an afro": {results2}')

results3 = search('someone good with beards')
print(f'Search for "someone good with beards": {results3}')