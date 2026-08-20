import React, { useState, useEffect } from 'react';
import { API_BASE_URL, formatPrice } from '../config';

const BookingModal = ({ isOpen, onClose, barber, initialServices, updateAvailability }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState(initialServices || []); // Use initialServices from prop
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [bookingCode, setBookingCode] = useState('');
  const [bookingId, setBookingId] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState('');

  // Use barber.services
  const services = barber?.services || [];

  // Load real booked slots when a date is picked
  useEffect(() => {
    if (!isOpen || !barber?.id || !selectedDate) return;
    let cancelled = false;
    const loadAvailability = async () => {
      setAvailabilityLoading(true);
      setAvailabilityError('');
      try {
        const res = await fetch(`${API_BASE_URL}/barbers/${barber.id}/availability?date=${selectedDate}`);
        if (!res.ok) throw new Error(`Failed to load availability (${res.status})`);
        const data = await res.json();
        if (!cancelled) setBookedSlots(data.booked_slots || []);
      } catch (err) {
        if (!cancelled) setAvailabilityError(err.message || 'Failed to load availability.');
      } finally {
        if (!cancelled) setAvailabilityLoading(false);
      }
    };
    loadAvailability();
    return () => {
      cancelled = true;
    };
  }, [isOpen, barber?.id, selectedDate]);

  // Generate time slots, marking returned booked slots as unavailable
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 9;
    const endHour = 18;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minutes of [0, 30]) {
        const time = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        slots.push({ time, available: !bookedSlots.includes(time) });
      }
    }
    return slots;
  };

  if (!isOpen) return null; // Only one check needed

  // Generate 14-day calendar
  const generateDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNumber = date.getDate();
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      const fullDate = date.toISOString().split('T')[0];

      dates.push({
        dayName,
        dayNumber,
        monthName,
        fullDate,
        isToday: i === 0,
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
      });
    }
    return dates;
  };

  const timeSlots = generateTimeSlots();
  const availableDates = generateDates();

  // Toggle service selection
  const toggleService = (service) => {
    setSelectedServices((prev) => {
      const exists = prev.find((s) => s.name === service.name);
      if (exists) {
        return prev.filter((s) => s.name !== service.name);
      } else {
        return [...prev, service];
      }
    });
  };

  // Calculate total price and duration
  const getTotalPrice = () => {
    return selectedServices.reduce((total, service) => total + Number(service.price), 0);
  };

  const getTotalDuration = () => {
    return selectedServices.reduce((total, service) => total + Number(service.duration_minutes), 0);
  };

  // Form validation
  const validateStep = () => {
    const newErrors = {};
    if (currentStep === 1 && selectedServices.length === 0) {
      newErrors.services = 'Please select at least one service';
    }
    if (currentStep === 2 && (!selectedDate || !selectedTime)) {
      newErrors.dateTime = 'Please select both a date and time';
    }
    if (currentStep === 3) {
      if (!customerInfo.name.trim()) newErrors.name = 'Name is required';
      if (!customerInfo.phone.trim()) newErrors.phone = 'Phone number is required';
      if (customerInfo.email && !/\S+@\S+\.\S+/.test(customerInfo.email)) {
        newErrors.email = 'Invalid email format';
      }
    }
    if (currentStep === 4 && !paymentMethod) {
      newErrors.payment = 'Please select a payment method';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle step navigation
  const handleNext = () => {
    if (validateStep() && currentStep < 4) {
      setIsLoading(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsLoading(false);
      }, 500);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setIsLoading(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsLoading(false);
      }, 500);
    }
  };

  // Handle booking submission
  const handleBooking = async () => {
    if (!validateStep()) return;

    setIsLoading(true);
    setErrors({});
    try {
      const payload = {
        barber_id: barber.id,
        date: selectedDate,
        time: selectedTime,
        customer_name: customerInfo.name,
        customer_phone: customerInfo.phone,
        customer_email: customerInfo.email || null,
        notes: customerInfo.notes || null,
        payment_method: paymentMethod,
        total_price: getTotalPrice(),
      };

      const res = await fetch(`${API_BASE_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 409) {
          setErrors({ api: 'That time slot has just been booked. Please pick another time.' });
        } else if (res.status === 400) {
          setErrors({ api: 'That date has already passed. Please pick a future date.' });
        } else {
          setErrors({ api: data.detail || 'Failed to process booking. Please try again.' });
        }
        return;
      }

      setBookingCode(data.confirmation_code);
      setBookingId(data.id);
      updateAvailability(barber.id); // Update availability after successful booking
      setCurrentStep(5); // Move to success step
    } catch {
      setErrors({ api: 'Failed to process booking. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Mock add to calendar
  const handleAddToCalendar = () => {
    const event = {
      title: `Barber Appointment with ${barber.name}`,
      start: new Date(`${selectedDate}T${selectedTime}`),
      duration: getTotalDuration(),
      location: barber.location,
    };
    console.log('Adding to calendar:', event);
    alert('Event added to calendar (mock implementation)');
  };

  // Reset modal state
  const resetModal = () => {
    setCurrentStep(1);
    setSelectedServices(initialServices || []);
    setSelectedDate('');
    setSelectedTime('');
    setCustomerInfo({ name: '', phone: '', email: '', notes: '' });
    setPaymentMethod('');
    setErrors({});
    setBookingCode('');
    setBookingId(null);
    setBookedSlots([]);
    setAvailabilityError('');
  };

  // Handle modal close
  const handleClose = () => {
    resetModal();
    onClose();
  };

  const stepLabels = ['Services', 'Date & Time', 'Details', 'Payment'];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/85 p-4" onClick={handleClose}>
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-sm border border-white/10 bg-ink-raised shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-ink/70">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/15 border-t-amber" aria-hidden="true" />
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-white/10 p-5">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-amber bg-ink text-2xl">
              {barber?.avatar || '✂️'}
            </span>
            <div>
              <h3 className="font-display text-lg font-medium uppercase tracking-tight text-towel">{barber?.name || 'Barber'}</h3>
              <p className="font-mono text-xs uppercase tracking-wider text-silver">{barber?.specialty || 'Barber Services'}</p>
            </div>
          </div>
          <button
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-sm border border-white/15 font-mono text-sm text-silver transition-colors hover:border-amber hover:text-amber disabled:opacity-40"
            onClick={handleClose}
            disabled={isLoading}
            aria-label="Close booking"
          >
            ✕
          </button>
        </div>

        {/* Progress — the fade bar */}
        <div className="flex border-b border-white/10 bg-ink px-5 py-4">
          {stepLabels.map((label, index) => {
            const active = currentStep >= index + 1;
            return (
              <div key={label} className="relative flex flex-1 flex-col items-center gap-2">
                {index > 0 && (
                  <span
                    className={`absolute left-[-50%] right-1/2 top-[11px] h-[2px] ${
                      currentStep >= index + 1 ? 'bg-amber' : 'bg-white/15'
                    }`}
                    aria-hidden="true"
                  />
                )}
                <span
                  className={`relative z-10 flex h-[22px] w-[22px] items-center justify-center rounded-full font-mono text-[0.7rem] font-bold transition-colors ${
                    active ? 'bg-amber text-ink' : 'bg-white/10 text-silver'
                  }`}
                >
                  {index + 1}
                </span>
                <span
                  className={`text-center font-mono text-[0.68rem] uppercase tracking-wider transition-colors ${
                    active ? 'text-towel' : 'text-silver/70'
                  }`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {currentStep === 1 && (
            <div>
              <h2 className="font-display text-2xl font-semibold uppercase tracking-tight text-towel">Select Services</h2>
              <p className="mt-1 text-sm text-silver">Choose the services you'd like to book</p>
              {errors.services && <p className="mt-3 font-mono text-xs text-[#e0705a]">{errors.services}</p>}

              <div className="mt-6 grid gap-3">
                {services.map((service) => {
                  const selected = selectedServices.find((s) => s.name === service.name);
                  return (
                    <button
                      key={service.name}
                      type="button"
                      className={`flex cursor-pointer items-center justify-between gap-4 rounded-sm border p-4 text-left transition-colors ${
                        selected ? 'border-amber bg-amber/10' : 'border-white/10 bg-ink hover:border-amber/40'
                      }`}
                      onClick={() => toggleService(service)}
                    >
                      <div>
                        <h4 className="font-display text-base font-medium uppercase tracking-tight text-towel">{service.name}</h4>
                        <p className="mt-0.5 font-mono text-xs uppercase tracking-wider text-silver">⏱ {service.duration_minutes} min</p>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <span className="font-mono text-base font-bold text-amber">{formatPrice(service.price)}</span>
                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-sm border text-[0.7rem] font-bold transition-colors ${
                            selected ? 'border-amber bg-amber text-ink' : 'border-white/25 text-transparent'
                          }`}
                          aria-hidden="true"
                        >
                          ✓
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedServices.length > 0 && (
                <div className="mt-6 flex items-center justify-between rounded-sm border border-white/10 bg-ink px-5 py-3">
                  <span className="font-mono text-xs uppercase tracking-wider text-silver">
                    Total duration: {getTotalDuration()} min
                  </span>
                  <span className="font-mono text-sm font-bold text-amber">{formatPrice(getTotalPrice())}</span>
                </div>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="font-display text-2xl font-semibold uppercase tracking-tight text-towel">Select Date &amp; Time</h2>
              <p className="mt-1 text-sm text-silver">Choose your preferred appointment slot</p>
              {errors.dateTime && <p className="mt-3 font-mono text-xs text-[#e0705a]">{errors.dateTime}</p>}

              <h3 className="mt-6 font-mono text-[0.72rem] font-bold uppercase tracking-[0.25em] text-silver">Available Dates</h3>
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-7">
                {availableDates.map((date) => {
                  const selected = selectedDate === date.fullDate;
                  return (
                    <button
                      key={date.fullDate}
                      type="button"
                      className={`relative cursor-pointer rounded-sm border px-2 py-3 text-center transition-colors ${
                        selected ? 'border-amber bg-amber/10' : 'border-white/10 bg-ink hover:border-amber/40'
                      }`}
                      onClick={() => setSelectedDate(date.fullDate)}
                    >
                      {date.isToday && (
                        <span className="absolute -right-2 -top-2 rounded-sm bg-amber px-1.5 py-0.5 font-mono text-[0.6rem] font-bold text-ink">
                          Today
                        </span>
                      )}
                      <div className="font-mono text-[0.65rem] uppercase tracking-wider text-silver">{date.dayName}</div>
                      <div className="mt-0.5 font-display text-lg font-semibold text-towel">{date.dayNumber}</div>
                      <div className="font-mono text-[0.65rem] uppercase tracking-wider text-silver">{date.monthName}</div>
                    </button>
                  );
                })}
              </div>

              {selectedDate && (
                <>
                  <h3 className="mt-6 font-mono text-[0.72rem] font-bold uppercase tracking-[0.25em] text-silver">Available Times</h3>
                  {availabilityLoading && (
                    <p className="mt-2 font-mono text-xs uppercase tracking-wider text-silver/70">Checking availability…</p>
                  )}
                  {availabilityError && (
                    <p className="mt-2 font-mono text-xs text-[#e0705a]">Could not load availability. Please try another date.</p>
                  )}
                  <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        className={`cursor-pointer rounded-sm border px-2 py-2.5 font-mono text-xs transition-colors ${
                          !slot.available
                            ? 'cursor-not-allowed border-white/5 bg-white/5 text-silver/40 line-through'
                            : selectedTime === slot.time
                              ? 'border-amber bg-amber/10 text-amber'
                              : 'border-white/10 bg-ink text-towel hover:border-amber/40'
                        }`}
                        onClick={() => slot.available && setSelectedTime(slot.time)}
                        disabled={!slot.available || isLoading}
                      >
                        {slot.time}
                        {!slot.available && <span className="ml-1 text-[0.6rem] no-underline">Booked</span>}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="font-display text-2xl font-semibold uppercase tracking-tight text-towel">Your Details</h2>
              <p className="mt-1 text-sm text-silver">Please provide your contact information</p>
              {errors.api && <p className="mt-3 font-mono text-xs text-[#e0705a]">{errors.api}</p>}

              <div className="mt-6 grid gap-5">
                <div>
                  <label className="mb-1.5 block font-mono text-[0.68rem] uppercase tracking-[0.2em] text-silver">
                    Full Name <span className="text-amber">*</span>
                  </label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    placeholder="Enter your full name"
                    required
                    className={`input-dark ${errors.name ? 'border-[#e0705a]' : ''}`}
                  />
                  {errors.name && <p className="mt-1.5 font-mono text-xs text-[#e0705a]">{errors.name}</p>}
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block font-mono text-[0.68rem] uppercase tracking-[0.2em] text-silver">
                      Phone Number <span className="text-amber">*</span>
                    </label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      placeholder="+233 XX XXX XXXX"
                      required
                      className={`input-dark ${errors.phone ? 'border-[#e0705a]' : ''}`}
                    />
                    {errors.phone && <p className="mt-1.5 font-mono text-xs text-[#e0705a]">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block font-mono text-[0.68rem] uppercase tracking-[0.2em] text-silver">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      placeholder="your@email.com"
                      className={`input-dark ${errors.email ? 'border-[#e0705a]' : ''}`}
                    />
                    {errors.email && <p className="mt-1.5 font-mono text-xs text-[#e0705a]">{errors.email}</p>}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block font-mono text-[0.68rem] uppercase tracking-[0.2em] text-silver">
                    Special Requests <span className="text-silver/60">(optional)</span>
                  </label>
                  <textarea
                    value={customerInfo.notes}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                    placeholder="Any specific requests or notes for your barber..."
                    rows="3"
                    className="input-dark"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <h2 className="font-display text-2xl font-semibold uppercase tracking-tight text-towel">Payment &amp; Confirmation</h2>
              <p className="mt-1 text-sm text-silver">Review your booking and choose payment method</p>
              {errors.payment && <p className="mt-3 font-mono text-xs text-[#e0705a]">{errors.payment}</p>}
              {errors.api && <p className="mt-3 font-mono text-xs text-[#e0705a]">{errors.api}</p>}

              <div className="mt-6 rounded-sm border border-white/10 bg-ink p-5">
                <h3 className="font-mono text-[0.72rem] font-bold uppercase tracking-[0.25em] text-amber">Booking Summary</h3>
                <dl className="mt-4 space-y-2.5 font-mono text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-silver">Barber</dt>
                    <dd className="text-right text-towel">{barber.name}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-silver">Date</dt>
                    <dd className="text-right text-towel">
                      {new Date(selectedDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-silver">Time</dt>
                    <dd className="text-right text-towel">{selectedTime}</dd>
                  </div>
                  <div className="border-t border-white/10 pt-2.5">
                    {selectedServices.map((service) => (
                      <div key={service.name} className="flex justify-between gap-4 text-[0.85rem]">
                        <dt className="text-silver">{service.name}</dt>
                        <dd className="text-towel">{formatPrice(service.price)}</dd>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between gap-4 border-t border-amber/30 pt-2.5">
                    <dt className="font-bold text-towel">Total</dt>
                    <dd className="font-bold text-amber">{formatPrice(getTotalPrice())}</dd>
                  </div>
                </dl>
              </div>

              <h3 className="mt-6 font-mono text-[0.72rem] font-bold uppercase tracking-[0.25em] text-silver">Payment Method</h3>
              <div className="mt-3 grid gap-2.5">
                {['Mobile Money', 'Credit Card', 'Pay at Shop'].map((method) => {
                  const selected = paymentMethod === method;
                  return (
                    <button
                      key={method}
                      type="button"
                      className={`flex cursor-pointer items-center gap-3 rounded-sm border p-4 text-left transition-colors ${
                        selected ? 'border-amber bg-amber/10' : 'border-white/10 bg-ink hover:border-amber/40'
                      }`}
                      onClick={() => setPaymentMethod(method)}
                    >
                      <span className="text-xl" aria-hidden="true">
                        {method === 'Mobile Money' && '📱'}
                        {method === 'Credit Card' && '💳'}
                        {method === 'Pay at Shop' && '🏪'}
                      </span>
                      <span className="flex-1 font-mono text-sm uppercase tracking-wider text-towel">{method}</span>
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-full border transition-colors ${
                          selected ? 'border-amber' : 'border-white/25'
                        }`}
                        aria-hidden="true"
                      >
                        {selected && <span className="h-2 w-2 rounded-full bg-amber" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="animate-settle-in py-4 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-amber bg-ink text-4xl" aria-hidden="true">
                ✓
              </div>
              <h2 className="mt-6 font-display text-3xl font-semibold uppercase tracking-tight text-towel">
                Booking Confirmed
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-silver">
                Your appointment has been successfully booked with <span className="text-amber">{barber.name}</span>
              </p>

              <div className="mx-auto mt-8 max-w-md rounded-sm border border-amber/30 bg-ink p-5 text-left">
                <div className="flex items-center justify-between gap-4 py-1.5">
                  <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-silver">Confirmation</span>
                  <span className="font-mono text-sm font-bold tracking-widest text-amber">{bookingCode}</span>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-white/10 py-1.5">
                  <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-silver">Booking ID</span>
                  <span className="font-mono text-sm text-towel">#{bookingId}</span>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-white/10 py-1.5">
                  <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-silver">Date &amp; Time</span>
                  <span className="font-mono text-sm text-towel">
                    {new Date(selectedDate).toLocaleDateString()} at {selectedTime}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-white/10 py-1.5">
                  <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-silver">Total</span>
                  <span className="font-mono text-sm font-bold text-amber">{formatPrice(getTotalPrice())}</span>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-white/10 py-1.5">
                  <span className="font-mono text-[0.7rem] uppercase tracking-[0.2em] text-silver">Services</span>
                  <span className="font-mono text-sm text-towel">{selectedServices.map((s) => s.name).join(', ')}</span>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <button className="btn-primary" onClick={handleClose}>
                  Done
                </button>
                <button className="btn-outline" onClick={handleAddToCalendar}>
                  📅 Add to Calendar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {currentStep < 5 && (
          <div className="flex items-center justify-between border-t border-white/10 p-5">
            {currentStep > 1 ? (
              <button className="btn-outline" onClick={handleBack} disabled={isLoading}>
                ← Back
              </button>
            ) : (
              <span />
            )}
            {currentStep < 4 && (
              <button className="btn-primary" onClick={handleNext} disabled={isLoading}>
                Next →
              </button>
            )}
            {currentStep === 4 && (
              <button className="btn-primary" onClick={handleBooking} disabled={isLoading}>
                {isLoading ? 'Booking…' : `Confirm Booking — ${formatPrice(getTotalPrice())}`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingModal;