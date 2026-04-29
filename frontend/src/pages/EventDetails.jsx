import { API_BASE_URL } from '../api';
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [ticketCount, setTicketCount] = useState(1);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/events/${id}`);
        if (response.ok) {
          const data = await response.json();
          setEventData(data);
          
          if (user) {
            const token = localStorage.getItem(`token');
            const wishRes = await fetch(`${API_BASE_URL}/api/wishlist/check/${id}`, {
              headers: { `Authorization': `Bearer ${token}` }
            });
            const wishData = await wishRes.json();
            setIsWishlisted(wishData.isInWishlist);
          }
        }
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEventData();
  }, [id, user?.id]);

  const toggleWishlist = async () => {
    if (!user) {
      toast.error('Please login to save events');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const method = isWishlisted ? 'DELETE' : 'POST';
      const url = isWishlisted 
        ? `${API_BASE_URL}/api/wishlist/remove/${id}`
        : `${API_BASE_URL}/api/wishlist/add`;
      
      const response = await fetch(url, {
        method,
        headers: { 
          `Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: isWishlisted ? null : JSON.stringify({ eventId: id })
      });

      if (response.ok) {
        setIsWishlisted(!isWishlisted);
        toast.success(isWishlisted ? 'Removed from wishlist' : 'Saved to wishlist');
      }
    } catch (error) {
      toast.error('Wishlist action failed');
    }
  };

  const handleBooking = () => {
    if (!user) {
      toast.error('Please login to proceed with booking');
      navigate('/login');
      return;
    }

    const serviceFee = 50.00;
    const total = (parseFloat(eventData.base_price) * ticketCount) + serviceFee;

    navigate('/seat-selection', {
      state: {
        eventId: id,
        eventTitle: eventData.title,
        category: eventData.category,
        ticketType: 'Standard',
        ticketCount: ticketCount,
        basePrice: parseFloat(eventData.base_price) || 0,
        total: total
      }
    });
  };

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-600"></div>
    </div>
  );

  if (!eventData) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-8 text-center text-zinc-500">
      <span className="material-symbols-outlined text-4xl mb-4">error</span>
      <h2 className="text-xl font-black uppercase tracking-widest mb-4">Event Unavailable</h2>
      <Link to="/events" className="text-red-600 font-black text-xs uppercase tracking-widest hover:underline">Return to Lineup</Link>
    </div>
  );

  const date = new Date(eventData.event_date);
  const dateStr = date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const base = parseFloat(eventData.base_price);
  const soldOutPercentage = Math.round((1 - (eventData.available_seats / eventData.total_capacity)) * 100);

  return (
    <div className="bg-[#09090b] text-white min-h-screen selection:bg-red-600 selection:text-white">
      <Navbar />

      <main className="pt-28 pb-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="lg:w-[65%] space-y-12">
            <div className="relative group">
              <div className="aspect-[16/9] w-full rounded-[2.5rem] overflow-hidden bg-zinc-900 border border-white/5 shadow-2xl">
                <img className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700" src={eventData.image_url} alt={eventData.title} />
              </div>
              <button 
                onClick={toggleWishlist}
                className={`absolute top-6 right-6 p-4 bg-zinc-950/60 backdrop-blur-xl rounded-full border border-white/10 transition-all active:scale-90 ${isWishlisted ? 'text-red-500' : 'text-zinc-500 hover:text-white'}`}
              >
                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: isWishlisted ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex gap-3">
                <span className="bg-red-600/10 text-red-500 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-red-600/20">{eventData.category}</span>
                <span className="bg-white/5 text-zinc-400 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/5">{eventData.city}</span>
              </div>
              <h1 className="text-xl md:text-2xl font-black font-headline tracking-tighter uppercase leading-none">{eventData.title}</h1>
              <p className="text-zinc-500 text-sm md:text-base leading-relaxed max-w-3xl font-medium opacity-80">{eventData.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-all">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4">Venue Location</p>
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-red-600">location_on</span>
                  <span className="text-xs md:text-sm font-bold opacity-90">{eventData.venue_name}, {eventData.city}</span>
                </div>
              </div>
              <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 group hover:bg-white/[0.04] transition-all">
                <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4">Event Schedule</p>
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-red-600">schedule</span>
                  <span className="text-xs md:text-sm font-bold opacity-90">{dateStr} • {timeStr}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-[35%]">
            <div className="sticky top-28 p-10 rounded-[2.5rem] bg-zinc-900 border border-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <span className="material-symbols-outlined text-8xl">confirmation_number</span>
              </div>
              
              <div className="relative space-y-8">
                <div>
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Ticket Price</p>
                  <div className="text-4xl font-black text-red-600 tracking-tighter uppercase leading-none">₹{base.toFixed(2)}</div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                    <span>No. of Tickets</span>
                    <span className="text-zinc-300">Max {eventData.available_seats} Seats</span>
                  </div>
                  <div className="flex items-center justify-between bg-white/[0.03] p-2 rounded-2xl border border-white/5">
                    <button 
                       onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                       className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-all text-white"
                    >-</button>
                    <span className="text-xl font-black font-headline">{ticketCount}</span>
                    <button 
                       onClick={() => setTicketCount(Math.min(eventData.available_seats, ticketCount + 1))}
                       className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center hover:bg-zinc-700 transition-all text-white"
                    >+</button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                    <span className="text-zinc-500">Seats Available</span>
                    <span className={eventData.available_seats < 10 ? "text-red-500 animate-pulse" : "text-zinc-300"}>
                      {eventData.available_seats} LEFT
                    </span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div className="h-full bg-red-600 rounded-full transition-all duration-1000" style={{ width: `${soldOutPercentage}%` }}></div>
                  </div>
                </div>

                <button 
                  onClick={handleBooking}
                  disabled={eventData.available_seats === 0}
                  className="w-full py-5 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-zinc-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
                >
                  {eventData.available_seats === 0 ? 'Sold Out' : 'Book Now'}
                </button>

                <p className="text-[9px] text-zinc-600 text-center font-bold uppercase tracking-widest leading-relaxed">
                  Digital fulfillment via email confirmation.<br/>No cancellations within 24hr of event start.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EventDetails;
