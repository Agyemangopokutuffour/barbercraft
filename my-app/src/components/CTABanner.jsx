import React from 'react';
import { Link } from 'react-router-dom';

const CallToAction = () => {
  const containerStyle = {
    padding: '4rem 2rem',
    background: 'linear-gradient(135deg, #e6f0fa, #d4e4f1)',
    textAlign: 'center',
    color: '#1a2e44',
  };

  const headingStyle = {
    fontSize: '2.5rem',
    marginBottom: '1rem',
    fontWeight: '700',
  };

  const textStyle = {
    fontSize: '1.2rem',
    marginBottom: '2rem',
    color: '#4a5568',
    maxWidth: '600px',
    margin: '0 auto',
  };

  const buttonStyle = {
    background: 'linear-gradient(45deg, #d4af37, #ffd700)',
    padding: '1rem 2rem',
    border: 'none',
    borderRadius: '25px',
    color: 'black',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    textDecoration: 'none',
    display: 'inline-block', // Ensure proper button behavior
  };

  return (
    <section style={containerStyle}>
      <h2 style={headingStyle}>Ready to Look Your Best?</h2>
      <p style={textStyle}>
        Book your appointment today and experience top-notch barber services tailored just for you!
      </p>
      <Link
        to="/book"
        style={buttonStyle}
        onMouseOver={(e) => {
          e.target.style.transform = 'scale(1.05)';
          e.target.style.boxShadow = '0 5px 15px rgba(212, 175, 55, 0.4)';
        }}
        onMouseOut={(e) => {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = 'none';
        }}
      >
        Book Now
      </Link>
    </section>
  );
};

export default CallToAction;