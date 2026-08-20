import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import BookingModal from './BookingModal';
import RazorRule from './RazorRule';
import { formatPrice } from '../config';

const BarberProfile = ({ barbers: initialBarbers, updateAvailability }) => {
  const { id } = useParams();
  const [barber, setBarber] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [showConsultation, setShowConsultation] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [consultationData, setConsultationData] = useState({ photo: null, faceShape: '', hairType: '' });
  const [recommendation, setRecommendation] = useState(null);
  const [likeCount, setLikeCount] = useState(0);
  const [newReview, setNewReview] = useState({ name: '', rating: 0, text: '' });
  const [isBooking, setIsBooking] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [activeTab, setActiveTab] = useState('portfolio');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const loadBarber = async () => {
      try {
        const foundBarber = initialBarbers.find(b => b.id === parseInt(id)) || {
          id: 1,
          name: 'Marcus "The Fade King" Johnson',
          specialty: 'Modern Fades & Beard Sculpting',
          experience: '8 years',
          location: 'Downtown Barbershop, Accra',
          rating: 4.9,
          totalReviews: 247,
          avatar: '✂️',
          coverImage: 'linear-gradient(135deg, #d4af37 0%, #ffd700 100%)',
          skills: [
            { name: 'Skin Fades', level: 95, verified: true },
            { name: 'Beard Design', level: 90, verified: true },
            { name: 'Hot Towel Shave', level: 88, verified: true },
          ],
          services: [
            { name: 'Classic Fade', price: 3500, duration_minutes: 45 },
            { name: 'Beard Sculpting', price: 2500, duration_minutes: 30 },
            { name: 'Hot Towel Shave', price: 2000, duration_minutes: 25 },
          ],
          story: "Started cutting hair at 16 in my neighborhood...",
          portfolio: [
            { id: 1, type: 'before-after', before: '🧔', after: '✨', style: 'Modern Fade', description: 'Complete transformation - skin fade with styled top' },
          ],
          reviews: [
            { id: 1, name: 'James K.', rating: 5, text: 'Best fade in the city!', date: '2 days ago' },
          ],
          availability: {
            status: 'available',
            nextSlot: 'Today 3:30 PM',
            queueLength: 0,
            spotsLeft: 5,
            text: 'Available - 5 spots left',
            icon: '🟢',
          },
          badges: ['Master Craftsman', 'Customer Favorite'],
          buttonText: 'Book Now',
        };
        setBarber(foundBarber);
        setReviews(foundBarber.reviews || []);
        setLikeCount(foundBarber.likeCount || 0);
        console.log('Loaded barber:', foundBarber);
      } catch (error) {
        console.error('Error loading barber:', error);
      }
    };
    loadBarber();
  }, [id, initialBarbers]);

  const handleBooking = () => {
    if (!isBooking) {
      setIsBooking(true);
      setTimeout(() => {
        setShowBookingModal(true);
        setIsBooking(false);
      }, 100);
    }
  };

  const isBookingDisabled = isBooking;

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (newReview.name && newReview.text && newReview.rating > 0) {
      const updatedReviews = [
        ...reviews,
        {
          id: Date.now(),
          name: newReview.name,
          rating: newReview.rating,
          text: newReview.text,
          date: 'Just now',
        },
      ];
      setReviews(updatedReviews);
      setBarber((prev) => ({
        ...prev,
        reviews: updatedReviews,
        totalReviews: updatedReviews.length,
        rating: (updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1),
      }));
      setNewReview({ name: '', rating: 0, text: '' });
    }
  };

    const handleConsultationSubmit = (e) => {
  e.preventDefault();
  console.log('Submitting consultation with data:', consultationData, 'Face Shape:', consultationData.faceShape, 'Hair Type:', consultationData.hairType);
  if (consultationData.photo && consultationData.faceShape && consultationData.hairType) {
    const skillRelevance = {
      oval: { curly: ['Beard Design', 'Braiding'], straight: ['Skin Fades', 'Hairline Design'], wavy: ['Beard Design', 'Styling'] },
      round: { curly: ['Braiding', 'Hair Dye'], straight: ['Precision Cuts', 'Hairline Design'], wavy: ['Styling', 'Trimming'] },
      square: { curly: ['Beard Design', 'Facial Massage'], straight: ['Straight Razor Shave', 'Precision Cuts'], wavy: ['Beard Design', 'Styling'] },
    };

    const scores = initialBarbers.map((b) => {
      let skillScore = 0;
      const relevantSkills = skillRelevance[consultationData.faceShape][consultationData.hairType] || [];
      relevantSkills.forEach((skill) => {
        if (b.skills && Array.isArray(b.skills) && b.skills.includes(skill)) {
          skillScore += 30; // 30 points per relevant skill
        }
      });

      const availabilityScore = b.availability?.spotsLeft > 0 ? 20 : 0;
      const totalScore = skillScore + availabilityScore;
      console.log(`Barber: ${b.name}, Skills: ${JSON.stringify(b.skills)}, Score: ${totalScore}, Skill Score: ${skillScore}, Availability Score: ${availabilityScore}`);

      return { barber: b, score: totalScore };
    });

    const sortedBarbers = scores.sort((a, b) => {
      // Primary sort by score, secondary sort by ID to break ties
      if (b.score !== a.score) return b.score - a.score;
      return a.barber.id - b.barber.id; // Lower ID wins tie
    });
    const recommendedBarber = sortedBarbers[0].barber;

    if (recommendedBarber && sortedBarbers[0].score > 0) {
      setRecommendation(recommendedBarber);
      console.log('Recommended barber:', recommendedBarber.name, 'Score:', sortedBarbers[0].score, 'ID:', recommendedBarber.id);
    } else {
      setRecommendation({ name: 'No match found', specialty: 'No suitable barber available with current skills or availability' });
      console.log('No recommended barber found. faceShape:', consultationData.faceShape, 'hairType:', consultationData.hairType, 'Scores:', scores);
    }
    setPreviewUrl(null);
  } else {
    console.log('Please fill all fields: photo, face shape, and hair type');
  }
};

  const handleLike = () => {
    setLikeCount((prev) => prev + 1);
  };

  if (!barber) return <div className="flex min-h-screen items-center justify-center bg-ink text-silver">Loading…</div>;

  const tabs = ['portfolio', 'story', 'services', 'reviews', 'consultation'];

  return (
    <div className="min-h-screen bg-ink pb-20 pt-24 text-towel">
      <div className="mx-auto max-w-6xl px-6">
        {/* ——— Header ——— */}
        <div className="overflow-hidden rounded-sm border border-white/10">
          <div className="fade-sheen relative flex items-end">
            <div className="w-full p-6 md:p-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
                  <span className="avatar-ring h-24 w-24 text-5xl">{barber.avatar}</span>
                  <div>
                    <h1 className="font-display text-2xl font-semibold uppercase leading-tight tracking-tight md:text-3xl">
                      {barber.name}
                      <span className="ml-2 text-amber">{barber.specialty}</span>
                    </h1>
                    <p className="mt-1.5 font-mono text-xs uppercase tracking-wider text-silver">{barber.location}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[0.8rem] text-silver">
                      <span className="text-amber">★ {barber.rating}</span>
                      <span>({barber.totalReviews} reviews)</span>
                      {barber.experience && <span>{barber.experience} experience</span>}
                    </div>
                    {barber.badges && barber.badges.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {barber.badges.map((badge) => (
                          <span key={badge} className="meta-tag border-amber/30 text-amber/90">{badge}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button className="btn-primary" onClick={handleBooking} disabled={isBookingDisabled}>
                    {isBooking ? 'In Process' : isBookingDisabled ? 'Unavailable' : 'Book Now'}
                  </button>
                  <button
                    className="inline-flex cursor-pointer items-center gap-2 rounded-sm border border-white/20 px-6 py-3 font-mono text-[0.78rem] font-bold uppercase tracking-[0.2em] text-towel transition-colors hover:border-amber hover:text-amber"
                    onClick={handleLike}
                  >
                    ❤️ {likeCount} Likes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ——— Tabs ——— */}
        <div className="mt-8 flex flex-wrap justify-center gap-1 border-b border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`cursor-pointer border-b-2 px-4 py-3 font-mono text-[0.75rem] font-bold uppercase tracking-[0.2em] transition-colors ${
                activeTab === tab
                  ? 'border-amber text-amber'
                  : 'border-transparent text-silver hover:text-towel'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* ——— Content ——— */}
        <div className="mt-8">
          {activeTab === 'portfolio' && (
            <section className="rounded-sm border border-white/10 bg-ink-raised p-6 md:p-8">
              <h3 className="font-display text-2xl font-semibold uppercase tracking-tight text-towel">
                Portfolio Gallery
              </h3>
              <RazorRule className="mt-3 w-32" />
              <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {barber.portfolio && barber.portfolio.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedImage(item)}
                    className="group cursor-pointer rounded-sm border border-white/10 bg-ink p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:border-amber/40"
                  >
                    {item.type === 'before-after' && (
                      <div className="mb-4 flex gap-3">
                        <div className="flex flex-1 flex-col items-center rounded-sm border border-white/10 bg-steel-raised py-5">
                          <span className="text-3xl">{item.before}</span>
                          <span className="mt-2 font-mono text-[0.65rem] uppercase tracking-widest text-silver">Before</span>
                        </div>
                        <div className="flex flex-1 flex-col items-center rounded-sm border border-amber/30 bg-steel-raised py-5">
                          <span className="text-3xl">{item.after}</span>
                          <span className="mt-2 font-mono text-[0.65rem] uppercase tracking-widest text-amber">After</span>
                        </div>
                      </div>
                    )}
                    <h4 className="font-display text-lg font-medium uppercase tracking-tight text-towel">{item.style}</h4>
                    <p className="mt-1 text-sm text-silver">{item.description}</p>
                  </button>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'story' && (
            <section className="rounded-sm border border-white/10 bg-ink-raised p-6 md:p-8">
              <h3 className="font-display text-2xl font-semibold uppercase tracking-tight text-towel">My Journey</h3>
              <RazorRule className="mt-3 w-32" />
              <div className="mt-6 border-l-2 border-amber/40 pl-6">
                <p className="max-w-3xl text-base leading-relaxed text-silver">{barber.story || 'No story available.'}</p>
              </div>
            </section>
          )}

          {activeTab === 'services' && (
            <section className="rounded-sm border border-white/10 bg-ink-raised p-6 md:p-8">
              <h3 className="font-display text-2xl font-semibold uppercase tracking-tight text-towel">Services &amp; Pricing</h3>
              <RazorRule className="mt-3 w-32" />
              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {barber.services && barber.services.map((service, index) => {
                  const added = selectedServices.find((s) => s.name === service.name);
                  return (
                    <div key={index} className="flex items-center justify-between gap-4 rounded-sm border border-white/10 bg-ink p-5">
                      <div>
                        <h4 className="font-display text-lg font-medium uppercase tracking-tight text-towel">{service.name}</h4>
                        <p className="mt-1 font-mono text-xs uppercase tracking-wider text-silver">⏱ {service.duration_minutes} min</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="font-mono text-base font-bold text-amber">{formatPrice(service.price)}</span>
                        <button
                          type="button"
                          className="cursor-pointer rounded-sm border border-amber/40 px-3 py-1.5 font-mono text-[0.68rem] font-bold uppercase tracking-wider text-amber transition-colors hover:bg-amber/10 disabled:cursor-not-allowed disabled:opacity-40"
                          onClick={() => {
                            if (!selectedServices.find((s) => s.name === service.name)) {
                              setSelectedServices([...selectedServices, service]);
                            }
                          }}
                          disabled={!!added}
                        >
                          {added ? 'Added' : 'Add'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedServices.length > 0 && (
                <div className="mt-6 rounded-sm border border-amber/30 bg-ink p-5">
                  <h3 className="font-display text-lg font-medium uppercase tracking-tight text-amber">Selected Services</h3>
                  <ul className="mt-3 space-y-2">
                    {selectedServices.map((service, index) => (
                      <li key={index} className="flex items-center justify-between font-mono text-sm text-towel">
                        <span>{service.name} ({formatPrice(service.price)}, {service.duration_minutes} min)</span>
                        <button
                          type="button"
                          className="cursor-pointer font-mono text-xs uppercase tracking-wider text-[#e0705a] transition-colors hover:text-[#f08a72]"
                          onClick={() => setSelectedServices(selectedServices.filter((s) => s.name !== service.name))}
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 font-mono text-sm text-towel">
                    Total: <span className="font-bold text-amber">{formatPrice(selectedServices.reduce((total, s) => total + Number(s.price), 0))}</span>
                  </p>
                  <button
                    type="button"
                    className="btn-primary mt-4"
                    onClick={() => {
                      if (!isBookingDisabled) setShowBookingModal(true);
                    }}
                    disabled={isBookingDisabled}
                  >
                    {isBooking ? 'In Process' : isBookingDisabled ? 'Unavailable' : 'Proceed to Booking'}
                  </button>
                </div>
              )}

              {barber.availability && (
                <div className="mt-6">
                  <h4 className="font-mono text-[0.72rem] font-bold uppercase tracking-[0.25em] text-silver">Current Availability</h4>
                  <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-sm text-towel">
                    <span>{barber.availability.icon} Next available: {barber.availability.nextSlot}</span>
                    <span className="text-silver">Queue: {barber.availability.queueLength} people</span>
                    <span className="text-amber">Spots left: {barber.availability.spotsLeft}</span>
                  </div>
                </div>
              )}
            </section>
          )}

          {activeTab === 'reviews' && (
            <section className="rounded-sm border border-white/10 bg-ink-raised p-6 md:p-8">
              <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
                <div>
                  <h3 className="font-display text-2xl font-semibold uppercase tracking-tight text-towel">Client Reviews</h3>
                  <RazorRule className="mt-3 w-32" />
                </div>
                <div className="rounded-sm border border-white/10 bg-ink px-8 py-5 text-center">
                  <div className="font-display text-5xl font-semibold text-amber">{barber.rating}</div>
                  <div className="mt-1 text-lg text-amber">{'★'.repeat(Math.round(barber.rating))}</div>
                  <div className="mt-1 font-mono text-xs uppercase tracking-wider text-silver">{barber.totalReviews} reviews</div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                {reviews.map((review) => (
                  <div key={review.id} className="rounded-sm border border-white/10 bg-ink p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-display font-medium uppercase tracking-tight text-towel">{review.name}</span>
                        <span className="text-sm text-amber">{'★'.repeat(review.rating)}</span>
                      </div>
                      <span className="font-mono text-xs text-silver">{review.date}</span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-silver">{review.text}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 rounded-sm border border-white/10 bg-ink p-5">
                <h4 className="font-display text-lg font-medium uppercase tracking-tight text-towel">Add a Review</h4>
                <form onSubmit={handleReviewSubmit} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={newReview.name}
                    onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                    required
                    className="input-dark"
                  />
                  <input
                    type="number"
                    min="1"
                    max="5"
                    placeholder="Rating (1-5)"
                    value={newReview.rating}
                    onChange={(e) => setNewReview({ ...newReview, rating: parseInt(e.target.value) || 0 })}
                    required
                    className="input-dark"
                  />
                  <div className="sm:col-span-1" />
                  <textarea
                    placeholder="Your Review"
                    value={newReview.text}
                    onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                    required
                    className="input-dark sm:col-span-3"
                    rows="3"
                  />
                  <button type="submit" className="btn-primary sm:col-span-3 sm:justify-self-start">Submit Review</button>
                </form>
              </div>
            </section>
          )}

          {activeTab === 'consultation' && (
            <section className="rounded-sm border border-white/10 bg-ink-raised p-6 text-center md:p-8">
              <h3 className="font-display text-2xl font-semibold uppercase tracking-tight text-towel">Style Consultation</h3>
              <RazorRule className="mx-auto mt-3 w-32" />
              <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-silver">
                Get personalized barber recommendations based on your face shape and hair type.
              </p>
              <button
                type="button"
                className="btn-primary mt-6"
                onClick={() => {
                  console.log('Consultation button clicked, setting showConsultation to true');
                  setShowConsultation(true);
                }}
              >
                Start Consultation
              </button>
              {recommendation && (
                <div className="mx-auto mt-8 max-w-md rounded-sm border border-amber/30 bg-ink p-6 text-left">
                  <h4 className="font-display text-lg font-medium uppercase tracking-tight text-amber">
                    Recommended Barber: {recommendation.name}
                  </h4>
                  <p className="mt-2 text-sm text-silver">Specialty: {recommendation.specialty}</p>
                  <button
                    type="button"
                    className="btn-primary mt-5"
                    onClick={() => {
                      setBarber(recommendation);
                      setShowBookingModal(true);
                    }}
                    disabled={isBookingDisabled}
                  >
                    {isBooking ? 'In Process' : isBookingDisabled ? 'Unavailable' : 'Book Now'}
                  </button>
                </div>
              )}
            </section>
          )}
        </div>
      </div>

      {/* ——— Portfolio image modal ——— */}
      {selectedImage && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/85 p-4" onClick={() => setSelectedImage(null)}>
          <div className="animate-settle-in relative w-full max-w-lg rounded-sm border border-white/10 bg-ink-raised p-8 text-center" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute right-4 top-4 cursor-pointer font-mono text-sm text-silver transition-colors hover:text-towel"
              onClick={() => setSelectedImage(null)}
              aria-label="Close"
            >
              ✕
            </button>
            <div className="flex gap-4">
              <div className="flex flex-1 flex-col items-center rounded-sm border border-white/10 bg-ink py-8">
                <span className="text-5xl">{selectedImage.before}</span>
                <span className="mt-3 font-mono text-[0.7rem] uppercase tracking-widest text-silver">Before</span>
              </div>
              <div className="flex flex-1 flex-col items-center rounded-sm border border-amber/30 bg-ink py-8">
                <span className="text-5xl">{selectedImage.after}</span>
                <span className="mt-3 font-mono text-[0.7rem] uppercase tracking-widest text-amber">After</span>
              </div>
            </div>
            <h3 className="mt-6 font-display text-xl font-semibold uppercase tracking-tight text-towel">{selectedImage.style}</h3>
            <p className="mt-2 text-sm text-silver">{selectedImage.description}</p>
          </div>
        </div>
      )}

      {/* ——— Consultation modal ——— */}
      {showConsultation && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/85 p-4"
          onClick={() => {
            console.log('Closing modal, setting showConsultation to false');
            setShowConsultation(false);
          }}
        >
          <div className="animate-settle-in relative w-full max-w-md rounded-sm border border-white/10 bg-ink-raised p-8" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute right-4 top-4 cursor-pointer font-mono text-sm text-silver transition-colors hover:text-towel"
              onClick={() => setShowConsultation(false)}
              aria-label="Close"
            >
              ✕
            </button>
            <h3 className="font-display text-xl font-semibold uppercase tracking-tight text-towel">Style Consultation</h3>
            <form onSubmit={handleConsultationSubmit} className="mt-6 grid grid-cols-1 gap-4">
              {previewUrl && (
                <img src={previewUrl} alt="Preview" className="mx-auto max-h-48 rounded-sm border border-white/10 object-contain" />
              )}
              <div>
                <label className="mb-1.5 block font-mono text-[0.68rem] uppercase tracking-[0.2em] text-silver">Your Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  className="input-dark cursor-pointer file:mr-3 file:cursor-pointer file:rounded-sm file:border-0 file:bg-steel-raised file:px-3 file:py-1.5 file:font-mono file:text-xs file:text-amber"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setPreviewUrl(reader.result);
                      reader.readAsDataURL(file);
                      setConsultationData({ ...consultationData, photo: file });
                    }
                  }}
                  required
                />
              </div>
              <select
                className="select-dark cursor-pointer"
                value={consultationData.faceShape}
                onChange={(e) => setConsultationData({ ...consultationData, faceShape: e.target.value })}
                required
              >
                <option value="">Select Face Shape</option>
                <option value="oval">Oval</option>
                <option value="round">Round</option>
                <option value="square">Square</option>
              </select>
              <select
                className="select-dark cursor-pointer"
                value={consultationData.hairType}
                onChange={(e) => setConsultationData({ ...consultationData, hairType: e.target.value })}
                required
              >
                <option value="">Select Hair Type</option>
                <option value="curly">Curly</option>
                <option value="straight">Straight</option>
                <option value="wavy">Wavy</option>
              </select>
              <button type="submit" className="btn-primary mt-2">Get Recommendation</button>
            </form>
            {recommendation && (
              <div className="mt-6 rounded-sm border border-amber/30 bg-ink p-4">
                <h4 className="font-mono text-[0.72rem] font-bold uppercase tracking-[0.2em] text-amber">Recommended Barber</h4>
                <p className="mt-2 text-sm text-towel">{recommendation.name} — {recommendation.specialty}</p>
                <p className="mt-1 font-mono text-xs text-silver">Skills: {recommendation.skills?.join(', ') || 'N/A'}</p>
              </div>
            )}
            <p className="mt-5 font-mono text-xs leading-relaxed text-silver">
              <span className="text-amber">Note:</span> Please manually select your face shape and hair type for accurate recommendations.
            </p>
          </div>
        </div>
      )}

      <BookingModal
        isOpen={showBookingModal}
        onClose={() => {
          setShowBookingModal(false);
          setSelectedServices([]);
        }}
        barber={barber}
        initialServices={selectedServices}
        updateAvailability={updateAvailability}
      />
    </div>
  );
};

export default BarberProfile;