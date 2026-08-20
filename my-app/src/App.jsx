import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import FloatingFeatures from './components/FloatingFeatures'; // Updated
import ServiceHighlights from './components/ServiceHighlights';
import CallToAction from './components/CallToAction';
import BarbersPage from './components/BarbersPage';
import BarberProfile from './components/BarberProfile';
import BookingPage from './components/BookingPage';
import BookingSuccess from './components/BookingSuccess';
import ServicePage from './components/ServicePage';
import AboutPage from './components/AboutPage';
import JoinAsBarberPage from './components/JoinAsBarberPage';
import ErrorBoundary from './components/ErrorBoundary';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';
import { API_BASE_URL } from './config';

const App = () => {
  const [barbers, setBarbers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadBarbers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/barbers`);
        if (!res.ok) throw new Error(`Failed to load barbers (${res.status})`);
        const data = await res.json();
        if (!cancelled) setBarbers(data);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load barbers.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    loadBarbers();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateAvailability = (barberId) => {
    console.log('Updating availability for barberId:', barberId);
    const updatedBarbers = JSON.parse(JSON.stringify(barbers)).map((barber) =>
      barber.id === Number(barberId) && barber.availability
        ? {
            ...barber,
            availability: {
              ...barber.availability,
              spotsLeft: Math.max(barber.availability.spotsLeft - 1, 0),
              queueLength: barber.availability.queueLength + 1,
              text: `Available - ${Math.max(barber.availability.spotsLeft - 1, 0)} spots left, Queue: ${barber.availability.queueLength + 1}`,
            },
          }
        : { ...barber }
    );
    console.log('Updated barbers before set:', [...updatedBarbers]);
    setBarbers(updatedBarbers);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/15 border-t-amber" aria-hidden="true" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink px-6 text-center">
        <div>
          <p className="eyebrow">Connection Error</p>
          <p className="mt-4 text-silver">{error}</p>
          <p className="mt-2 font-mono text-xs text-silver/70">
            Make sure the BarberCraft API is running at {API_BASE_URL}.
          </p>
          <button className="btn-primary mt-6" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
     <Router>
    <ErrorBoundary>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Hero barbers={barbers} />
              <Features />
              <FloatingFeatures isAuthenticated={false} onToggleChat={() => setIsChatOpen((v) => !v)} /> {/* Placeholder; replace with real auth state */}
              <ServiceHighlights barbers={barbers} />
              <CallToAction />
            </>
          }
        />
        <Route path="/barbers" element={<BarbersPage barbers={barbers} key={Date.now()} />} />
        <Route
          path="/barber/:id"
          element={<BarberProfile barbers={barbers} updateAvailability={updateAvailability} />}
        />
        <Route path="/book" element={<BookingPage barbers={barbers} updateAvailability={updateAvailability} />} />
        <Route path="/book/success" element={<BookingSuccess />} />
        <Route path="/services" element={<ServicePage barbers={barbers} />} />
        <Route path="/about" element={<AboutPage barbers={barbers} />} />
        <Route path="/join" element={<JoinAsBarberPage />} />
      </Routes>
      <Footer />
      <ChatWidget open={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </ErrorBoundary>
  </Router>
  );
};

export default App;