import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const FloatingFeatures = ({ isAuthenticated = false, onToggleChat }) => {
  const navigate = useNavigate();
  const [features, setFeatures] = useState([
    { id: 1, icon: '📷', title: 'AR Try-On', action: 'ar-tryon' },
    { id: 2, icon: '📍', title: 'Find Nearby', action: 'find-nearby' },
    { id: 3, icon: '📅', title: 'My Bookings', action: 'my-bookings' },
    { id: 4, icon: '💬', title: 'Chat Support', action: 'chat-support' },
  ]);

  // Dynamic feature adjustment based on authentication
  useEffect(() => {
    if (!isAuthenticated) {
      setFeatures([
        { id: 1, icon: '📍', title: 'Find Nearby', action: 'find-nearby' },
        { id: 2, icon: '💬', title: 'Chat Support', action: 'chat-support' },
        { id: 3, icon: '👤', title: 'Join as Barber', action: 'join' },
      ]);
    }
  }, [isAuthenticated]);

  const handleFeatureClick = (feature) => {
    switch (feature.action) {
      case 'ar-tryon':
        alert('AR Try-On feature is under development!'); // Placeholder for future AR implementation
        break;
      case 'find-nearby':
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => navigate(`/barbers?lat=${position.coords.latitude}&lon=${position.coords.longitude}`),
            () => alert('Unable to access location. Please enable geolocation.')
          );
        } else {
          alert('Geolocation is not supported by your browser.');
        }
        break;
      case 'my-bookings':
        navigate('/bookings'); // Assume a bookings route exists
        break;
      case 'chat-support':
        onToggleChat();
        break;
      case 'join':
        navigate('/join');
        break;
      default:
        alert(`${feature.title} feature is coming soon!`);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
      {features.map((feature) => (
        <div key={feature.id} className="group relative">
          <button
            title={feature.title}
            onClick={() => handleFeatureClick(feature)}
            aria-label={feature.title}
            className="flex h-14 w-14 cursor-pointer items-center justify-center rounded-sm border border-white/15 bg-ink-raised text-xl text-towel shadow-[0_10px_30px_-12px_rgba(0,0,0,0.8)] transition-all duration-200 hover:scale-110 hover:border-amber hover:text-amber"
          >
            {feature.icon}
          </button>
          <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-sm border border-white/10 bg-ink px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-wider text-towel opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            {feature.title}
          </span>
        </div>
      ))}
    </div>
  );
};

export default FloatingFeatures;