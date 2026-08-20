import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { Link } from 'react-router-dom';

const FeaturedServices = () => {
  const services = [
    { name: 'Classic Fade', image: 'fade.jpg', price: '₵35', description: 'Sharp and stylish cut' },
    { name: 'Beard Sculpting', image: 'beard.jpg', price: '₵25', description: 'Perfect beard shape' },
    { name: 'Razor Shave', image: 'shave.jpg', price: '₵20', description: 'Smooth and clean' },
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <section className="featured-services py-12 bg-gray-100">
      <h2 className="text-3xl font-bold text-center mb-8">Featured Services</h2>
      <Slider {...settings}>
        {services.map((service) => (
          <div key={service.name} className="p-4">
            <img src={service.image} alt={service.name} className="w-full h-48 object-cover rounded-lg" />
            <h3 className="text-xl font-semibold mt-2">{service.name}</h3>
            <p className="text-gray-600">{service.description}</p>
            <p className="text-lg font-bold">{service.price}</p>
            <Link to="/barbers" className="btn btn-primary mt-2 inline-block">Book Now</Link>
          </div>
        ))}
      </Slider>
    </section>
  );
};

export default FeaturedServices;