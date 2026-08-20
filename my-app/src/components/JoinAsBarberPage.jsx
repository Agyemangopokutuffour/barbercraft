import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import RazorRule from './RazorRule';

const JoinAsBarberPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    experience: '',
    location: '',
    portfolioLink: '',
    availability: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Application Submitted:', formData);
    alert('Thank you for applying! We will review your submission and contact you soon.');
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      experience: '',
      location: '',
      portfolioLink: '',
      availability: '',
    });
  };

  const fields = [
    { name: 'fullName', label: 'Full Name', type: 'text', placeholder: 'Full Name', required: true },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'Email', required: true },
    { name: 'phone', label: 'Phone Number', type: 'tel', placeholder: 'Phone Number', required: true },
    { name: 'experience', label: 'Years of Experience', type: 'text', placeholder: 'Years of Experience', required: true },
    { name: 'location', label: 'Location', type: 'text', placeholder: 'Location', required: true },
    { name: 'portfolioLink', label: 'Portfolio Link', type: 'url', placeholder: 'Portfolio Link (e.g., Instagram or Website)', required: false },
    { name: 'availability', label: 'Availability', type: 'text', placeholder: 'Availability (e.g., Mon-Fri, 9 AM-5 PM)', required: false },
  ];

  const benefits = [
    'Competitive pay and tips.',
    'Access to a loyal client base.',
    'Ongoing training and support.',
    'Flexible scheduling options.',
  ];

  return (
    <section className="relative overflow-hidden bg-ink px-6 pb-24 pt-32">
      <div className="fade-sheen pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative z-10 mx-auto max-w-6xl text-center">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow">Join the Crew</p>
          <h2 className="mt-3 font-display text-3xl font-semibold uppercase tracking-tight text-towel md:text-5xl">
            Become a BarberCraft Professional
          </h2>
          <RazorRule className="mx-auto mt-6 w-52" />
          <p className="mt-6 text-base leading-relaxed text-silver md:text-lg">
            Join our elite team of barbers and elevate your career with a growing network,
            competitive pay, and flexible scheduling.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-12 max-w-xl grid grid-cols-1 gap-5 rounded-sm border border-white/10 bg-ink-raised p-6 text-left shadow-2xl md:p-8"
        >
          {fields.map((field) => (
            <div key={field.name}>
              <label className="mb-1.5 block font-mono text-[0.68rem] uppercase tracking-[0.2em] text-silver">
                {field.label} {field.required && <span className="text-amber">*</span>}
              </label>
              <input
                type={field.type}
                name={field.name}
                placeholder={field.placeholder}
                value={formData[field.name]}
                onChange={handleChange}
                className="input-dark"
                required={field.required}
              />
            </div>
          ))}
          <button type="submit" className="btn-primary mt-2 w-full">
            Submit Application
          </button>
        </form>

        <div className="mx-auto mt-16 max-w-2xl rounded-sm border border-white/10 bg-ink-raised p-8 text-left">
          <h3 className="font-display text-xl font-semibold uppercase tracking-tight text-amber">Why Join Us?</h3>
          <RazorRule className="mt-4 w-36" />
          <ul className="mt-6 space-y-3">
            {benefits.map((benefit, index) => (
              <li key={index} className="flex items-start gap-3 text-sm leading-relaxed text-silver">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rotate-45 bg-amber" aria-hidden="true" />
                {benefit}
              </li>
            ))}
          </ul>
          <p className="mt-6 border-t border-white/10 pt-5 text-sm leading-relaxed text-silver">
            Requirements: Minimum 2 years experience, valid barber license.{' '}
            <Link to="/contact" className="font-mono uppercase tracking-wider text-amber no-underline hover:text-towel">
              Contact us
            </Link>{' '}
            for more details.
          </p>
        </div>
      </div>
    </section>
  );
};

export default JoinAsBarberPage;