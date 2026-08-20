import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BarberCard from './BarberCard';
import RazorRule from './RazorRule';

const BarbersPage = ({ barbers: initialBarbers }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [filteredBarbers, setFilteredBarbers] = useState(initialBarbers);
  const [sortOption, setSortOption] = useState('name-asc');
  const [minRating, setMinRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Filter and sort barbers
  useEffect(() => {
    setIsLoading(true);
    const query = searchParams.get('query') || '';
    const lowerCaseQuery = query.toLowerCase();

    const filtered = initialBarbers.filter(
      (barber) =>
        (!query ||
          barber.name.toLowerCase().includes(lowerCaseQuery) ||
          barber.location.toLowerCase().includes(lowerCaseQuery) ||
          barber.specialty.toLowerCase().includes(lowerCaseQuery) ||
          barber.services.some((service) => service.name.toLowerCase().includes(lowerCaseQuery))) &&
        (minRating === 0 || barber.rating >= minRating)
    );

    const sorted = [...filtered].sort((a, b) => {
      if (sortOption === 'name-asc') return a.name.localeCompare(b.name);
      if (sortOption === 'name-desc') return b.name.localeCompare(a.name);
      if (sortOption === 'rating-asc') return a.rating - b.rating;
      if (sortOption === 'rating-desc') return b.rating - a.rating;
      return 0;
    });

    setFilteredBarbers(sorted);
    setTimeout(() => setIsLoading(false), 300); // Simulate loading for larger datasets
  }, [searchParams, initialBarbers, sortOption, minRating]);

  const handleViewProfile = (id) => {
    navigate(`/barber/${id}`);
  };

  return (
    <div className="bg-ink px-6 pb-24 pt-32 text-center">
      <div className="mx-auto max-w-6xl">
        <p className="eyebrow">The Crew</p>
        <h1 className="mt-3 font-display text-3xl font-semibold uppercase tracking-tight text-towel md:text-5xl">
          Find Your Perfect Barber
        </h1>
        <RazorRule className="mx-auto mt-6 w-52" />
        {searchParams.get('query') && (
          <p className="mt-4 font-mono text-xs uppercase tracking-wider text-amber">
            Showing results for: "{searchParams.get('query')}"
          </p>
        )}

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="select-dark w-auto cursor-pointer"
            aria-label="Sort barbers"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="rating-asc">Rating (Low to High)</option>
            <option value="rating-desc">Rating (High to Low)</option>
          </select>
          <select
            value={minRating}
            onChange={(e) => setMinRating(parseFloat(e.target.value))}
            className="select-dark w-auto cursor-pointer"
            aria-label="Minimum rating"
          >
            <option value={0}>All Ratings</option>
            <option value={4.0}>4.0+</option>
            <option value={4.5}>4.5+</option>
            <option value={4.8}>4.8+</option>
          </select>
        </div>

        {isLoading ? (
          <p className="mt-16 animate-pulse font-mono text-sm uppercase tracking-widest text-silver">
            Sharpening the razors…
          </p>
        ) : filteredBarbers && filteredBarbers.length > 0 ? (
          <div className="mt-12 grid grid-cols-1 gap-6 text-left sm:grid-cols-2 lg:grid-cols-3">
            {filteredBarbers.map((barber) => (
              <BarberCard key={barber.id} barber={barber} onView={handleViewProfile} />
            ))}
          </div>
        ) : (
          <p className="mt-16 text-silver">
            No barbers found{searchParams.get('query') ? ` for "${searchParams.get('query')}"` : ''}.
          </p>
        )}
      </div>
    </div>
  );
};

export default BarbersPage;