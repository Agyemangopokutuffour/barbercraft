import React from 'react';
import { useLocation } from 'react-router-dom';
import RazorRule from './RazorRule';

const BookingSuccess = () => {
  const { state } = useLocation();
  const bookingData = state || {};

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-ink px-6 py-32">
      <div className="fade-sheen pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative z-10 mx-auto w-full max-w-2xl text-center">
        <p className="eyebrow">Appointment Secured</p>
        <h2 className="mt-3 font-display text-3xl font-semibold uppercase tracking-tight text-towel md:text-5xl">
          Booking Confirmed!
        </h2>
        <RazorRule className="mx-auto mt-6 w-52" />
        <p className="mt-6 text-base leading-relaxed text-silver md:text-lg">
          Thank you for your booking. Here are your details:
        </p>

        <dl className="mx-auto mt-8 max-w-md rounded-sm border border-white/10 bg-ink-raised p-6 text-left">
          {bookingData.barber && (
            <div className="flex items-center justify-between gap-4 py-1.5">
              <dt className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-silver">Barber</dt>
              <dd className="font-mono text-sm text-towel">{bookingData.barber}</dd>
            </div>
          )}
          {bookingData.service && (
            <div className="flex items-center justify-between gap-4 border-t border-white/10 py-1.5">
              <dt className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-silver">Service</dt>
              <dd className="font-mono text-sm text-towel">{bookingData.service}</dd>
            </div>
          )}
          {bookingData.date && (
            <div className="flex items-center justify-between gap-4 border-t border-white/10 py-1.5">
              <dt className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-silver">Date</dt>
              <dd className="font-mono text-sm text-towel">{bookingData.date}</dd>
            </div>
          )}
          {bookingData.time && (
            <div className="flex items-center justify-between gap-4 border-t border-white/10 py-1.5">
              <dt className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-silver">Time</dt>
              <dd className="font-mono text-sm text-towel">{bookingData.time}</dd>
            </div>
          )}
        </dl>

        <p className="mt-8 text-sm text-silver">
          We'll send you a confirmation soon. Back to <a href="/" className="font-mono uppercase tracking-wider text-amber no-underline hover:text-towel">Home</a>.
        </p>
      </div>
    </section>
  );
};

export default BookingSuccess;