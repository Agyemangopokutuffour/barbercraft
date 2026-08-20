import React from 'react';
import RazorRule from './RazorRule';

const Features = () => {
  const featuresData = [
    {
      title: 'Portfolio Showcase',
      description: 'View detailed portfolios of barbers to choose your perfect stylist.',
      icon: '📸',
    },
    {
      title: 'Skill-Based Matching',
      description: 'Get matched with barbers who specialize in your preferred styles.',
      icon: '🎯',
    },
    {
      title: 'Live Queue System',
      description: 'Check real-time wait times and join the queue from your phone.',
      icon: '⏳',
    },
    {
      title: 'AR Style Preview',
      description: 'Preview your new haircut in augmented reality before the scissors touch.',
      icon: '🕶️',
    },
    {
      title: 'Master Craftsmen',
      description: 'Get your haircut from the most experienced professionals in the field.',
      icon: '✂️',
    },
    {
      title: 'Style Consultation',
      description: 'Receive expert advice on the best style for your face shape and hair type.',
      icon: '💬',
    },
  ];

  return (
    <section className="bg-ink-raised px-6 py-20 text-center md:py-24">
      <div className="mx-auto max-w-6xl">
        <p className="eyebrow">Why BarberCraft</p>
        <h2 className="mt-3 font-display text-3xl font-semibold uppercase tracking-tight text-towel md:text-4xl">
          The Craft, Brought Online
        </h2>
        <RazorRule className="mt-5 w-44" />

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuresData.map((feature, index) => (
            <div
              key={index}
              className="group rounded-sm border border-white/10 bg-ink p-7 text-left transition-all duration-300 hover:-translate-y-1 hover:border-amber/40"
            >
              <span
                className="flex h-12 w-12 items-center justify-center rounded-sm border border-white/10 bg-steel-raised text-2xl transition-colors group-hover:border-amber/50"
                aria-hidden="true"
              >
                {feature.icon}
              </span>
              <h3 className="mt-5 font-display text-xl font-medium uppercase tracking-tight text-towel">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-silver">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;