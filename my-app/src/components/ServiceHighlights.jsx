import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RazorRule from './RazorRule';
import { formatPrice } from '../config';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, service, barber, price }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/80 p-4">
      <div className="animate-settle-in w-full max-w-md rounded-sm border border-white/10 bg-ink-raised p-8 text-center shadow-2xl">
        <h3 className="font-display text-2xl font-semibold uppercase tracking-tight text-towel">
          Confirm Booking
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-silver">
          Are you sure you want to book <strong className="text-amber">{service}</strong> with{' '}
          <strong className="text-amber">{barber}</strong> for <strong className="text-amber">{price}</strong>?
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button className="btn-primary" onClick={onConfirm}>
            Yes, Book
          </button>
          <button className="btn-outline" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const ServiceHighlights = ({ barbers }) => {
  const navigate = useNavigate();
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const timeoutRef = useRef(null); // Ref to store timeout ID

  const services = [
    {
      name: 'Classic Fade',
      price: '₵35',
      description: 'Sharp and stylish cut',
      image: 'https://menhairstylesworld.com/wp-content/uploads/2022/04/Classic-Hard-Part-Comb-Over-with-Skin-Fade.jpg',
    },
    {
      name: 'Beard Sculpting',
      price: '₵25',
      description: 'Perfect beard shape',
      image: 'https://i.pinimg.com/236x/45/03/ab/4503abb8faf84b65a3f16d891d5f3579.jpg',
    },
    {
      name: 'Razor Shave',
      price: '₵20',
      description: 'Smooth and clean',
      image: 'https://barberhood.com.au/cdn/shop/products/09_traditional_shaving_wet_shaving_barber_razor_1024x1024_8cd26f02-2808-4e62-b04c-02bd597f75d4_800x.jpg?v=1621219399',
    },
  ];

  const cardsRef = useRef([]);

  useEffect(() => {
    cardsRef.current.forEach((card, index) => {
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 200);
    });
  }, []);

  const getBarberForService = (serviceName) => {
    return barbers.find((barber) => barber.services.some((s) => s.name === serviceName));
  };

  const getServicePrice = (serviceName) => {
    const barber = getBarberForService(serviceName);
    const service = barber?.services?.find((s) => s.name === serviceName);
    if (service && typeof service.price === 'number') return formatPrice(service.price);
    return services.find((s) => s.name === serviceName)?.price || '';
  };

  const handleBookNow = (service) => {
    const barber = getBarberForService(service.name);
    if (barber) {
      setSelectedService(service.name);
      setSelectedBarber(barber.name);
      setIsModalOpen(true);
    } else {
      setConfirmationMessage('No barber available for this service.');
      setTimeout(() => setConfirmationMessage(''), 3000);
    }
  };

  const handleConfirm = () => {
    setIsModalOpen(false);
    setConfirmationMessage(`Booking confirmed with ${selectedBarber} for ${selectedService}!`);
    setTimeout(() => {
      navigate(`/barber/${getBarberForService(selectedService).id}`);
    }, 500); // Delay navigation for feedback
    setTimeout(() => setConfirmationMessage(''), 3000); // Fade out message
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setConfirmationMessage('Booking cancelled.');
    setTimeout(() => setConfirmationMessage(''), 3000); // Fade out message
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    const timeout = timeoutRef.current;
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, []);

  return (
    <section className="bg-ink px-6 py-20 text-center md:py-24">
      <div className="mx-auto max-w-6xl">
        <p className="eyebrow">The Signature Cuts</p>
        <h2 className="mt-3 font-display text-3xl font-semibold uppercase tracking-tight text-towel md:text-4xl">
          Popular Services
        </h2>
        <RazorRule className="mt-5 w-44" />

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => {
            const barber = getBarberForService(service.name);
            return (
              <div
                key={index}
                ref={(el) => (cardsRef.current[index] = el)}
                className="flex translate-y-5 flex-col overflow-hidden rounded-sm border border-white/10 bg-ink-raised text-left opacity-0 transition-all duration-300 hover:-translate-y-1 hover:border-amber/40"
              >
                <div className="fade-sheen relative h-40 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.name}
                    className="h-full w-full object-cover mix-blend-luminosity opacity-80 transition-all duration-300 hover:opacity-100"
                    loading="lazy"
                  />
                  <span className="absolute bottom-3 left-3 rounded-sm bg-ink/85 px-2.5 py-1 font-mono text-[0.7rem] font-bold uppercase tracking-wider text-amber">
                    {service.price}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-2xl font-medium uppercase tracking-tight text-towel">
                    {service.name}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-silver">{service.description}</p>
                  {barber && (
                    <p className="mt-3 font-mono text-[0.7rem] uppercase tracking-wider text-silver">
                      With <span className="text-amber">{barber.name}</span>
                    </p>
                  )}
                  <button className="btn-primary mt-5 self-start" onClick={() => handleBookNow(service)}>
                    Book Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {confirmationMessage && (
          <p className="mt-8 font-mono text-sm tracking-wide text-[#7d9a6d]">{confirmationMessage}</p>
        )}
      </div>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        service={selectedService}
        barber={selectedBarber}
        price={selectedService ? getServicePrice(selectedService) : ''}
      />
    </section>
  );
};

export default ServiceHighlights;