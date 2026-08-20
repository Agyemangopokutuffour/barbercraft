import React from 'react';
import RazorRule from './RazorRule';

const CallToAction = () => {
  return (
    <section className="fade-sheen relative overflow-hidden px-6 py-20 text-center md:py-24">
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow">Your Chair Awaits</p>
        <h2 className="mt-3 font-display text-3xl font-semibold uppercase tracking-tight text-towel md:text-5xl">
          Ready to Look Your Best?
        </h2>
        <RazorRule className="mx-auto mt-6 w-52" />
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-silver md:text-lg">
          Book your appointment today and experience top-notch barber services tailored just for you.
        </p>
        <a href="/book" className="btn-primary mt-10 no-underline">
          Book Now
        </a>
      </div>
    </section>
  );
};

export default CallToAction;