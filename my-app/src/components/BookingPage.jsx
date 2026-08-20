import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';
import RazorRule from './RazorRule';

const BookingPage = ({ barbers, updateAvailability }) => {
  const navigate = useNavigate();
  const [selectedBarber, setSelectedBarber] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');

 const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedBarber && selectedService && selectedDate && selectedTime) {
      const barber = barbers.find((b) => b.name === selectedBarber);
      const spotsLeft = barber?.availability?.spotsLeft;
      if (barber && (spotsLeft === undefined || spotsLeft > 0)) {
        const bookingData = {
          barber: selectedBarber,
          service: selectedService,
          date: selectedDate.toLocaleDateString(),
          time: selectedTime,
        };
        console.log('Booking for barber:', barber.name, 'ID:', barber.id); // Debug the ID
        updateAvailability(barber.id); // Use the barber's ID
        navigate('/book/success', { state: bookingData });
      } else {
        alert('No available spots for this barber. Please select another or try a different time.');
      }
    } else {
      alert('Please fill in all fields.');
    }
  };

  const allServices = [...new Set(barbers.flatMap((barber) => barber.services.map((s) => s.name)))];

  return (
    <section className="relative overflow-hidden bg-ink px-6 pb-24 pt-32">
      <div className="fade-sheen pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative z-10 mx-auto max-w-2xl text-center">
        <p className="eyebrow">The Booking Ledger</p>
        <h2 className="mt-3 font-display text-3xl font-semibold uppercase tracking-tight text-towel md:text-5xl">
          Book Your Appointment
        </h2>
        <RazorRule className="mx-auto mt-6 w-52" />

        <form
          onSubmit={handleSubmit}
          className="mt-10 grid grid-cols-1 gap-5 rounded-sm border border-white/10 bg-ink-raised p-6 text-left shadow-2xl md:p-8"
        >
          <div>
            <label className="mb-1.5 block font-mono text-[0.68rem] uppercase tracking-[0.2em] text-silver">
              Select a Barber <span className="text-amber">*</span>
            </label>
            <select
              className="select-dark cursor-pointer"
              value={selectedBarber}
              onChange={(e) => setSelectedBarber(e.target.value)}
              required
            >
              <option value="">Select a Barber</option>
              {barbers.map((barber) => (
                <option key={barber.id} value={barber.name} disabled={barber.availability?.spotsLeft === 0}>
                  {barber.name} ({barber.specialty}){barber.availability?.text ? ` — ${barber.availability.text}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block font-mono text-[0.68rem] uppercase tracking-[0.2em] text-silver">
              Select a Service <span className="text-amber">*</span>
            </label>
            <select
              className="select-dark cursor-pointer"
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              required
            >
              <option value="">Select a Service</option>
              {allServices.map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block font-mono text-[0.68rem] uppercase tracking-[0.2em] text-silver">
              Select a Date <span className="text-amber">*</span>
            </label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="MMMM d, yyyy"
              placeholderText="Select a Date"
              className="input-dark cursor-pointer"
              wrapperClassName="w-full"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block font-mono text-[0.68rem] uppercase tracking-[0.2em] text-silver">
              Select a Time <span className="text-amber">*</span>
            </label>
            <select
              className="select-dark cursor-pointer"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              required
            >
              <option value="">Select a Time</option>
              {['10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM'].map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn-primary mt-2 w-full">
            Submit Booking
          </button>
        </form>
      </div>
    </section>
  );
};

export default BookingPage;