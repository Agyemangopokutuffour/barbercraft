import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RazorRule from './RazorRule';
import { API_BASE_URL, formatPrice } from '../config';

const DEFAULT_SERVICE_IMAGE = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80';

const ServicePage = ({ barbers }) => {
  const navigate = useNavigate();

  const [allServices, setAllServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // State for filter, search, and sort
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('name-asc');

  useEffect(() => {
    let cancelled = false;
    const loadServices = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/services`);
        if (!res.ok) throw new Error(`Failed to load services (${res.status})`);
        const data = await res.json();
        if (!cancelled) {
          setAllServices(
            data.map((service) => ({
              ...service,
              name: service.name,
              price: service.price,
              duration: service.duration_minutes,
              barberName: service.barber_name,
              specialty: barbers.find((b) => b.name === service.barber_name)?.specialty || '—',
              serviceImage: service.serviceImage || DEFAULT_SERVICE_IMAGE,
            }))
          );
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load services.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    loadServices();
    return () => {
      cancelled = true;
    };
  }, [barbers]);

  const barbersList = [...new Set(allServices.map((service) => service.barberName).filter(Boolean))];

  // Filter and sort services
  const filteredServices = allServices
    .filter((service) =>
      filter === 'all' || service.barberName === filter
    )
    .filter((service) =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (service.barberName || '').toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOption === 'name-asc') return a.name.localeCompare(b.name);
      if (sortOption === 'name-desc') return b.name.localeCompare(a.name);
      if (sortOption === 'price-asc') return a.price - b.price;
      if (sortOption === 'price-desc') return b.price - a.price;
      return 0;
    });

  const handleBook = (serviceName, barberName) => {
    navigate('/book', { state: { selectedService: serviceName, selectedBarber: barberName } });
  };

  return (
    <section className="relative overflow-hidden bg-ink px-6 pb-24 pt-32">
      <div className="fade-sheen pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative z-10 mx-auto max-w-6xl text-center">
        <p className="eyebrow">The Menu</p>
        <h2 className="mt-3 font-display text-3xl font-semibold uppercase tracking-tight text-towel md:text-5xl">
          Our Services
        </h2>
        <RazorRule className="mx-auto mt-6 w-52" />

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <input
            type="text"
            placeholder="Search services or barbers..."
            className="input-dark w-56"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            className="select-dark w-auto cursor-pointer"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter by barber"
          >
            <option value="all">All Barbers</option>
            {barbersList.map((barber) => (
              <option key={barber} value={barber}>{barber}</option>
            ))}
          </select>
          <select
            className="select-dark w-auto cursor-pointer"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            aria-label="Sort services"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="price-asc">Price (Low to High)</option>
            <option value="price-desc">Price (High to Low)</option>
          </select>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 text-left sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <p className="col-span-full animate-pulse font-mono text-sm uppercase tracking-widest text-silver">
              Loading services…
            </p>
          ) : error ? (
            <p className="col-span-full font-mono text-sm text-[#e0705a]">{error}</p>
          ) : filteredServices.length === 0 ? (
            <p className="col-span-full text-silver">No services found.</p>
          ) : (
            filteredServices.map((service, index) => (
            <article
              key={service.id ?? index}
              className="flex flex-col overflow-hidden rounded-sm border border-white/10 bg-ink-raised transition-all duration-300 hover:-translate-y-1 hover:border-amber/40"
            >
              <div className="fade-sheen relative h-40 overflow-hidden">
                <img
                  src={service.serviceImage}
                  alt={service.name}
                  className="h-full w-full object-cover mix-blend-luminosity opacity-80"
                  loading="lazy"
                />
                <span className="absolute bottom-3 left-3 rounded-sm bg-ink/85 px-2.5 py-1 font-mono text-[0.7rem] font-bold uppercase tracking-wider text-amber">
                  {formatPrice(service.price)}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-display text-2xl font-medium uppercase tracking-tight text-towel">{service.name}</h3>
                <dl className="mt-4 space-y-1.5 font-mono text-[0.75rem] uppercase tracking-wider text-silver">
                  <div className="flex justify-between">
                    <dt>Duration</dt>
                    <dd className="text-towel">{service.duration} min</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Specialty</dt>
                    <dd className="text-towel">{service.specialty}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Crafted by</dt>
                    <dd className="text-amber">{service.barberName}</dd>
                  </div>
                </dl>
                <button
                  className="btn-primary mt-5 w-full"
                  onClick={() => handleBook(service.name, service.barberName)}
                >
                  Book Now
                </button>
              </div>
            </article>
            ))
          )}
        </div>

        <div className="mx-auto mt-16 max-w-3xl rounded-sm border border-white/10 bg-ink-raised p-8">
          <h3 className="font-display text-xl font-semibold uppercase tracking-tight text-amber">
            What Our Clients Say
          </h3>
          <RazorRule className="mx-auto mt-4 w-36" />
          <div className="mt-6 grid grid-cols-1 gap-4 text-left sm:grid-cols-3">
            {[
              { quote: 'Best fade in the city!', name: 'James K.', when: '2 days ago', rating: '5/5' },
              { quote: 'Amazing shave!', name: 'Sarah M.', when: '3 days ago', rating: '4.8/5' },
              { quote: 'Perfect beard work!', name: 'John D.', when: '1 day ago', rating: '4.9/5' },
            ].map((t) => (
              <figure key={t.name} className="rounded-sm border border-white/10 bg-ink p-4">
                <blockquote className="text-sm italic leading-relaxed text-silver">"{t.quote}"</blockquote>
                <figcaption className="mt-3 font-mono text-[0.68rem] uppercase tracking-wider text-towel">
                  {t.name} <span className="text-silver">· {t.when}</span>
                </figcaption>
                <figcaption className="mt-1 font-mono text-[0.68rem] text-amber">★ {t.rating}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicePage;