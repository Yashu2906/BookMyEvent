import { API_BASE_URL } from '../api';
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { eventId, eventTitle, ticketType, ticketCount, total, selectedSeats, seatIds } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!eventId) {
      navigate('/events');
    }
  }, [eventId, navigate]);

  // Load Razorpay SDK
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user) {
      setError('Please login to continue');
      navigate('/login');
      return;
    }

    try {
      // Step 1: Create local booking first
      const bookingResp = await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          event_id: eventId,
          number_of_tickets: ticketCount,
          seat_ids: seatIds
        })
      });

      const bookingData = await bookingResp.json();
      if (!bookingResp.ok) throw new Error(bookingData.message || 'Booking initiation failed');

      const bookingId = bookingData.booking_id;

      // Step 2: Create Razorpay Order
      const orderResp = await fetch(`${API_BASE_URL}/api/payments/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ booking_id: bookingId })
      });

      const orderData = await orderResp.json();
      if (!orderResp.ok) throw new Error(orderData.message || 'Razorpay Order failed');

      // Step 3: Trigger Razorpay Modal
      const res = await loadRazorpay();
      if (!res) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        return;
      }

      const options = {
        key: "rzp_test_SbQjBTW3Kqt9sg", // Synced with backend .env
        amount: orderData.amount,
        currency: "INR",
        name: "BookMyEvent",
        description: `Booking for ${eventTitle}`,
        order_id: orderData.id,
        handler: async (response) => {
          // Step 4: Verify Payment
          try {
            const verifyResp = await fetch(`${API_BASE_URL}/api/payments/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                booking_id: bookingId
              })
            });

            if (verifyResp.ok) {
              toast.success('Payment Verified! Booking Confirmed.');
              navigate('/booking-confirmed', {
                state: {
                  bookingId,
                  eventTitle,
                  total,
                  ticketCount,
                  selectedSeats
                }
              });
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (err) {
            toast.error(err.message);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: { color: '#dc2626' },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      toast.error(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#09090b] text-white font-body min-h-screen flex flex-col selection:bg-red-600 selection:text-white">
      <Navbar />

      <main className="flex-grow pt-32 pb-24 px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Payment Column */}
          <div className="lg:col-span-7 space-y-12">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600/10 border border-red-600/20 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-red-500">Secure Protocol v3.0</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-headline font-black uppercase leading-none italic">Secure Checkout</h1>
              <p className="text-zinc-500 text-sm font-medium">Initialize payment tunnel for <span className="text-white font-black">{eventTitle}</span>.</p>
            </div>

            <div className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <span className="material-symbols-outlined text-9xl">shield</span>
              </div>
              <div className="relative">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-zinc-600 mb-6">Payment Method Selection</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="flex items-center gap-6 p-6 rounded-[2rem] bg-white text-black font-black uppercase tracking-widest text-[10px] shadow-2xl transition-all">
                    <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
                    Razorpay Terminal
                  </button>
                  <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-white/5 text-zinc-600 font-extrabold uppercase tracking-widest text-[10px] border border-white/5 opacity-50">
                    <span className="material-symbols-outlined text-2xl">credit_card</span>
                    Credit Card (Locked)
                  </div>
                </div>
              </div>
              <div className="pt-8 border-t border-white/5 flex items-center gap-2 text-zinc-600 font-black uppercase text-[8px] tracking-[0.2em]">
                <span className="material-symbols-outlined text-sm text-green-600">lock_open</span>
                Encrypted Protocol via Razorpay SDK
              </div>
            </div>
          </div>

          {/* Summary Column */}
          <div className="lg:col-span-5">
            <div className="sticky top-32">
              <div className="bg-zinc-900 rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/5 p-10 space-y-10">
                <h3 className="text-xs font-black text-zinc-600 uppercase tracking-[0.3em]">Operational Summary</h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-white/[0.03] p-4 rounded-2xl border border-white/5">
                    <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Entry Passes</span>
                    <span className="text-xs font-black text-white uppercase">{ticketCount}x Standard</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/[0.03] p-4 rounded-2xl border border-white/5">
                    <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Seat Codes</span>
                    <span className="text-[9px] font-black text-red-500 uppercase tracking-tighter">{selectedSeats?.join(', ')}</span>
                  </div>
                </div>

                <div className="space-y-3 bg-[#000]/30 p-8 rounded-[2rem]">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-zinc-600">Gross Amount</span>
                    <span className="text-zinc-400">₹{(total - 50).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-zinc-600">Protocol Fee</span>
                    <span className="text-zinc-400">₹50.00</span>
                  </div>
                  <div className="pt-6 border-t border-white/5 flex justify-between items-baseline">
                    <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Payable</span>
                    <span className="text-4xl font-black font-headline text-white tracking-tighter italic">₹{total?.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  disabled={loading}
                  onClick={handlePayment}
                  className="w-full bg-red-600 hover:bg-red-500 text-white py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-2xl shadow-red-950/20 cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Initializing...' : 'Authorize Transaction'}
                  {!loading && <span className="material-symbols-outlined text-sm font-black">bolt</span>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Payment;
