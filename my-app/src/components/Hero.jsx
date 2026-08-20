import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RazorRule from './RazorRule';

function Hero({ barbers }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showHint, setShowHint] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Derive dynamic suggestions from barbers data
  useEffect(() => {
    if (searchTerm && barbers) {
      setIsLoading(true);
      const uniqueSuggestions = new Set();
      barbers.forEach((barber) => {
        // Add locations
        uniqueSuggestions.add(barber.location);
        // Add specialties
        uniqueSuggestions.add(barber.specialty);
        // Add names
        uniqueSuggestions.add(barber.name);
        // Add services
        barber.services.forEach((service) => uniqueSuggestions.add(service.name));
      });
      const filteredSuggestions = Array.from(uniqueSuggestions).filter((suggestion) =>
        suggestion.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSuggestions(filteredSuggestions.slice(0, 5)); // Limit to 5 suggestions
      setIsLoading(false);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm, barbers]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (validateInput(searchTerm)) {
      setIsLoading(true);
      navigate(`/barbers?query=${encodeURIComponent(searchTerm.trim())}`);
      setShowHint(false); // Hide hint after first search
      setTimeout(() => setIsLoading(false), 500); // Simulate API delay
    }
  };

  const validateInput = (value) => {
    return value.trim().length > 0 && value.trim().length <= 50; // Basic length validation
  };

  const isValid = validateInput(searchTerm);
  const openSpots = barbers?.reduce((sum, b) => sum + (b.availability?.spotsLeft || 0), 0) || 0;
  const avgRating = barbers?.length
    ? (barbers.reduce((sum, b) => sum + b.rating, 0) / barbers.length).toFixed(1)
    : '4.9';

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-ink">
      {/* Signature fade sheen rising from the bottom edge */}
      <div className="fade-sheen pointer-events-none absolute inset-0" aria-hidden="true" />

      {/* Thin brass fade bar anchoring the right edge */}
      <div
        className="fade-bar-v pointer-events-none absolute right-0 top-1/4 hidden h-1/2 w-1.5 md:block"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 py-32 md:py-40">
        <div className="max-w-3xl">
          <p className="eyebrow">Accra · Est. 2018</p>

          <h1 className="mt-6 font-display text-5xl font-semibold uppercase leading-[0.95] tracking-tight text-towel sm:text-6xl md:text-7xl">
            Crafted by
            <span className="block text-amber">Master Barbers</span>
          </h1>

          <RazorRule className="mt-6 w-52 md:w-64" />

          <p className="mt-6 max-w-xl text-base leading-relaxed text-silver md:text-lg">
            Connect with skilled artisan barbers who craft more than just haircuts — they create
            your signature style.
          </p>

          <form
            onSubmit={handleSearch}
            className={`relative mt-10 max-w-xl transition-transform duration-300 focus-within:scale-[1.01] ${isLoading ? 'pointer-events-none opacity-70' : ''}`}
          >
            <div className="flex items-center gap-2 rounded-sm bg-towel p-2 shadow-[0_18px_50px_-20px_rgba(192,138,45,0.4)]">
              <input
                type="text"
                placeholder="Search by location, style, or barber name..."
                className={`w-full bg-transparent px-4 py-2.5 font-body text-base text-ink placeholder:text-ink/45 focus:outline-none ${!isValid && searchTerm ? 'ring-2 ring-[#b3402a]' : ''}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                type="submit"
                className="shrink-0 cursor-pointer rounded-sm bg-leather px-6 py-2.5 font-mono text-[0.78rem] font-bold uppercase tracking-[0.18em] text-towel transition-colors hover:bg-[#8f2a3a] disabled:cursor-not-allowed disabled:opacity-40"
                disabled={!isValid}
              >
                {isLoading ? 'Searching…' : 'Find My Barber'}
              </button>
            </div>

            {suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-sm border border-white/10 bg-ink-raised shadow-2xl">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    className="block w-full cursor-pointer px-4 py-2.5 text-left text-sm text-towel transition-colors hover:bg-amber/15 hover:text-amber"
                    onClick={() => {
                      setSearchTerm(suggestion);
                      setSuggestions([]);
                      handleSearch({ preventDefault: () => {} });
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </form>

          <div className="mt-4 h-5">
            {showHint && <p className="font-mono text-xs tracking-wide text-amber/80">Try 'Accra' or 'Fade' to get started!</p>}
            {!isValid && searchTerm && (
              <p className="font-mono text-xs tracking-wide text-[#e0705a]">
                Please enter a valid search term (1-50 characters).
              </p>
            )}
          </div>

          <dl className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/10 pt-6">
            {[
              { k: 'Barbers', v: `${barbers?.length || 0}` },
              { k: 'Avg rating', v: avgRating },
              { k: 'Spots open today', v: `${openSpots}` },
            ].map((item) => (
              <div key={item.k} className="flex items-baseline gap-2">
                <dt className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-silver">{item.k}</dt>
                <dd className="font-mono text-sm font-bold text-amber">{item.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

export default Hero;