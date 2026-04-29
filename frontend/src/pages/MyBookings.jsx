import { API_BASE_URL } from '../api';
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { QRCodeSVG } from 'qrcode.react';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch(`${API_BASE_URL}/api/bookings/my-bookings`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setBookings(data);
        }
      } catch (err) {
        console.error(' Failed to fetch bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  return (
    <div className="bg-background text-on-surface font-body selection:bg-primary-container selection:text-white min-h-screen">
      <Navbar />

      <main className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
        <header className="mb-12">
          <span className="text-red-600 font-headline font-bold text-xs tracking-widest uppercase">BOOKING HISTORY</span>
          <h1 className="text-2xl font-black tracking-widest font-headline mt-2 text-on-background uppercase italic">My Bookings</h1>
        </header>

        {loading ? (
          <div className="p-20 text-center text-zinc-500 font-headline uppercase tracking-widest">Gathering your tickets...</div>
        ) : bookings.length === 0 ? (
          <div className="p-20 text-center border-2 border-dashed border-zinc-800 rounded-3xl">
            <span className="material-symbols-outlined text-6xl text-zinc-700 mb-4 block">confirmation_number</span>
            <p className="text-zinc-500 font-medium">No bookings found. Time to explore!</p>
            <a href="/events" className="inline-block mt-6 text-red-500 font-bold hover:underline">Browse Events</a>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map(booking => (
              <div key={booking.id} className="group relative flex flex-col md:flex-row bg-surface-container-low rounded-2xl overflow-hidden hover:bg-surface-container transition-all duration-300">
                <div className="w-full md:w-64 h-48 md:h-auto overflow-hidden relative">
                  <img
                    alt={booking.event_title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={booking.image_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCPw-rpefZB44GzGYaUPBp1KRKIAy1QnESb1Abj4vIuCR7NiOXaxK9HymDFEmon19WcoA4VcX6_6Jrk43qD1e4eUKvZ6PNadhqFrS-M_SFN3q2KIvvVmrYtgG8rE8nvgs13rUyWYkvTlGA-S8I4lIChVbTPMmuhkWChL7TH5rI_9sraYnUZeUd3ioy8_v8Obz-MMkTwN_plN4QNFZ5U0fnBreJaNBI0fT3lmUQsdp0GUPmTZPyenXUS-6qE5bAXoUbR-FzjuNwoMP3u'}
                  />
                </div>
                <div className="flex-1 p-6 md:p-8 flex flex-col justify-between border-r border-dashed border-outline-variant/30">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-2xl font-bold font-headline text-on-background">{booking.event_title}</h3>
                      <span className={`flex items-center gap-1.5 px-3 py-1 bg-${booking.status === 'confirmed' ? 'green' : 'orange'}-500/10 text-${booking.status === 'confirmed' ? 'green' : 'orange'}-500 text-xs font-bold rounded-full capitalize`}>
                        <span className={`w-1.5 h-1.5 rounded-full bg-${booking.status === 'confirmed' ? 'green' : 'orange'}-500`}></span>
                        {booking.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
                      <div className="flex items-center gap-3 text-zinc-400">
                        <span className="material-symbols-outlined text-red-600 text-xl">calendar_today</span>
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-zinc-500">Date</span>
                          <span className="text-sm font-medium text-on-surface">{new Date(booking.event_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-zinc-400">
                        <span className="material-symbols-outlined text-red-600 text-xl">location_on</span>
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-zinc-500">Location</span>
                          <span className="text-sm font-medium text-on-surface">{booking.venue_name}, {booking.city}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-zinc-400">
                        <span className="material-symbols-outlined text-red-600 text-xl">confirmation_number</span>
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-zinc-500">Tickets</span>
                          <span className="text-sm font-medium text-on-surface">{booking.number_of_tickets} ticket(s)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-outline-variant/10">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="flex items-center gap-1 text-red-500 hover:text-red-400 text-xs font-bold uppercase tracking-widest group/btn transition-colors cursor-pointer"
                      >
                        Booking Details
                      </button>
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] uppercase font-bold text-zinc-500">Total Charged</span>
                      <span className="text-xl font-black text-white font-headline">₹{Number(booking.total_amount).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center px-6">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setSelectedBooking(null)}
          ></div>

          <div className="relative bg-zinc-900 w-full max-w-lg rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>

            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <span className="material-symbols-outlined text-zinc-500">close</span>
            </button>

            <div className="p-10 pt-12 text-center space-y-8">
              <div className="space-y-2">
                <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em]">Ticket QR Code</span>
                <h2 className="text-3xl font-black font-headline tracking-tighter uppercase italic text-white leading-none">
                  {selectedBooking.event_title}
                </h2>
              </div>

              <div className="bg-white p-6 rounded-[2.5rem] inline-block shadow-2xl">
                <QRCodeSVG
                  value={JSON.stringify({
                    id: selectedBooking.id,
                    event: selectedBooking.event_title,
                    seats: selectedBooking.seats,
                    user: selectedBooking.user_id
                  })}
                  size={200}
                  level="H"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 text-left">
                  <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest block mb-2">Booking ID</span>
                  <span className="text-[10px] font-black text-white uppercase tracking-wider block font-mono">
                    #BME-{selectedBooking.id}-{new Date(selectedBooking.booking_date).getTime().toString().slice(-4)}
                  </span>
                </div>
                <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 text-left">
                  <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest block mb-2">Gate Assignment</span>
                  <span className="text-[10px] font-black text-red-500 uppercase block">
                    {selectedBooking.seats?.length > 0 ? selectedBooking.seats.join(', ') : 'General Admission'}
                  </span>
                </div>
              </div>

              <p className="text-[10px] font-medium text-zinc-500 tracking-wide leading-relaxed">
                Show this QR code at the entrance. Each ticket allows one-time entry for {selectedBooking.number_of_tickets} people.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
