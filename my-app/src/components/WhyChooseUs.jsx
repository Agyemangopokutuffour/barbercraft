import React from 'react';

const WhyChooseUs = () => {
  const benefits = [
    { title: 'Expert Barbers', icon: '✂️', description: 'Skilled professionals with years of experience.' },
    { title: 'Flexible Booking', icon: '📅', description: 'Book anytime, anywhere with ease.' },
    { title: 'Top Ratings', icon: '⭐', description: 'Highly reviewed by our happy clients.' },
  ];

  return (
    <section className="why-choose-us py-12 bg-gray-100">
      <h2 className="text-3xl font-bold text-center mb-8">Why Choose Us</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {benefits.map((benefit) => (
          <div key={benefit.title} className="p-6 text-center border rounded-lg shadow hover:bg-gray-200 transition">
            <span className="text-4xl mb-2">{benefit.icon}</span>
            <h3 className="text-xl font-semibold">{benefit.title}</h3>
            <p className="text-gray-600 mt-2">{benefit.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default WhyChooseUs;