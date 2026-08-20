import React from 'react';
import { useNavigate } from 'react-router-dom';
import BarberCard from './BarberCard';
import RazorRule from './RazorRule';

const AboutPage = ({ barbers }) => {
  const navigate = useNavigate();

  const values = [
    'Precision in every cut and shave.',
    'Customer satisfaction is our priority.',
    'Community-driven grooming excellence.',
  ];

  return (
    <section className="relative overflow-hidden bg-ink px-6 pb-24 pt-32">
      <div className="fade-sheen pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative z-10 mx-auto max-w-6xl text-center">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow">Est. 2018 · Accra</p>
          <h2 className="mt-3 font-display text-3xl font-semibold uppercase tracking-tight text-towel md:text-5xl">
            About BarberCraft
          </h2>
          <RazorRule className="mx-auto mt-6 w-52" />
          <p className="mt-6 text-base leading-relaxed text-silver md:text-lg">
            Founded in 2018, BarberCraft is dedicated to transforming grooming with precision cuts,
            classic shaves, and personalized care. Our mission is to bring top-tier barbering to every
            community in Accra and beyond.
          </p>
          <a href="/book" className="btn-primary mt-8 no-underline">
            Book Your Style
          </a>
        </div>

        <h3 className="mt-20 font-display text-2xl font-semibold uppercase tracking-tight text-towel md:text-3xl">
          Meet Our Team
        </h3>
        <RazorRule className="mx-auto mt-4 w-40" />

        <div className="mt-10 grid grid-cols-1 gap-6 text-left sm:grid-cols-2 lg:grid-cols-3">
          {barbers.map((barber) => (
            <BarberCard key={barber.id} barber={barber} onView={(id) => navigate(`/barber/${id}`)} />
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-3xl rounded-sm border border-white/10 bg-ink-raised p-8 text-left">
          <h3 className="font-display text-xl font-semibold uppercase tracking-tight text-amber">Our Values</h3>
          <RazorRule className="mt-4 w-36" />
          <ul className="mt-6 space-y-3">
            {values.map((value, index) => (
              <li key={index} className="flex items-start gap-3 text-sm leading-relaxed text-silver">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-amber" aria-hidden="true" />
                {value}
              </li>
            ))}
          </ul>
          <p className="mt-6 border-t border-white/10 pt-5 text-sm leading-relaxed text-silver">
            Our vision is to expand to every major city, bringing the BarberCraft experience to more clients.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AboutPage;