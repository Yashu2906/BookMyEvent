import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

const BookingConfirmed = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { bookingId, eventTitle, total, ticketCount, selectedSeats } = location.state || {};

  useEffect(() => {
    if (!bookingId) {
      navigate('/');
    }
  }, [bookingId, navigate]);

  const qrValue = JSON.stringify({
    bookingId: bookingId,
    event: eventTitle,
    seats: selectedSeats,
    passengers: ticketCount
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#09090b] text-white font-body selection:bg-red-600">
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-6 py-20">
        <div className="text-center space-y-8 max-w-2xl">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-green-500">Payment Complete</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black font-headline tracking-tighter uppercase italic leading-none">Booking <span className="text-red-600">Successful</span></h1>
          </div>

          {/* Holographic QR Ticket */}
          <div className="relative group perspective-1000">
            <div className="bg-zinc-900 p-8 rounded-[3rem] border border-white/5 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] flex flex-col items-center gap-8 relative overflow-hidden group-hover:rotate-y-12 transition-transform duration-700">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-50"></div>

              <div className="bg-white p-4 rounded-3xl shadow-inner">
                <QRCodeSVG
                  value={qrValue}
                  size={160}
                  level="H"
                  includeMargin={false}
                />
              </div>

              <div className="space-y-2 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Ticket Details</p>
                <code className="text-xs font-black text-red-600 bg-red-600/5 px-4 py-1 rounded-full border border-red-600/10 tracking-widest leading-none">
                  BME-{bookingId}-{Date.now().toString().slice(-4)}
                </code>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-zinc-500 text-xs md:text-sm font-medium tracking-wide leading-relaxed max-w-lg mx-auto">
              Your digital ticket is active. Show the QR code at the venue gate for entry. A confirmation email has been sent to you.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 text-left">
                <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest block mb-2">Stage</span>
                <span className="text-[10px] font-black text-white uppercase truncate block">{eventTitle}</span>
              </div>
              <div className="p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 text-left">
                <span className="text-[8px] font-black text-zinc-700 uppercase tracking-widest block mb-2">Seats</span>
                <span className="text-[9px] font-black text-red-500 uppercase tracking-tighter block">{selectedSeats?.join(', ')}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-10">
            <Link to="/events" className="px-10 py-5 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl shadow-red-950/20 hover:bg-red-500 transition-all text-center flex items-center justify-center gap-2">
              Explore Events <span className="material-symbols-outlined text-sm font-black">arrow_forward</span>
            </Link>
            <Link to="/my-bookings" className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-white/10 transition-all text-center">
              View My Bookings
            </Link>
          </div>
        </div>
      </main>

      <footer className="w-full py-8 text-center border-t border-white/5">
        <span className="text-[8px] font-black text-zinc-800 uppercase tracking-[0.5em]">BookMyEvent // Secure Ticketing</span>
      </footer>
    </div>
  );
};

export default BookingConfirmed;
