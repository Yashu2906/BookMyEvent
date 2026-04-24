import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const SeatSelection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { eventId, category, ticketType, ticketCount, total, eventTitle, basePrice } = location.state || {};

  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setPageError] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedZoneName, setSelectedZoneName] = useState(null);

  const isZoneBased = ['Music', 'Festival', 'Sports'].includes(category);
  const serviceFee = 50.00;

  const fetchSeats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/events/${eventId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.seats && data.seats.length > 0) {
          setSeats(data.seats);
        } else {
          setPageError('No seats available for this event.');
        }
      } else {
        setPageError('Failed to fetch event seat map.');
      }
    } catch (error) {
      console.error('Error fetching seats:', error);
      setPageError('Network error while connecting to secure terminal.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!eventId) {
      navigate('/events');
      return;
    }

    fetchSeats();

    socket.emit('joinEvent', eventId);
    socket.on('seatsUpdated', () => {
      fetchSeats();
    });

    return () => {
      socket.off('seatsUpdated');
    };
  }, [eventId]);

  const groupedSeats = useMemo(() => {
    if (isZoneBased) return {};
    return seats.reduce((acc, seat) => {
      const prefix = seat.seatNumber?.match(/[A-Z]+/)?.[0] || 'GA';
      if (!acc[prefix]) acc[prefix] = [];
      acc[prefix].push(seat);
      return acc;
    }, {});
  }, [seats, isZoneBased]);

  const zones = useMemo(() => {
    if (!isZoneBased) return [];
    const classMap = {};
    seats.forEach(seat => {
      if (!classMap[seat.seatClass]) {
        classMap[seat.seatClass] = {
           name: seat.seatClass, 
           multiplier: parseFloat(seat.priceMultiplier) || 1.0, 
           available: 0, 
           total: 0,
           seats: []
        };
      }
      classMap[seat.seatClass].total++;
      if (!seat.isBooked) {
         classMap[seat.seatClass].available++;
         classMap[seat.seatClass].seats.push(seat);
      }
    });
    return Object.values(classMap).sort((a,b) => b.multiplier - a.multiplier);
  }, [seats, isZoneBased]);

  const toggleSeat = (seat) => {
    if (seat.isBooked) return;

    if (selectedSeats.find(s => s.id === seat.id)) {
      setSelectedSeats(prev => prev.filter(s => s.id !== seat.id));
    } else {
      if (selectedSeats.length < ticketCount) {
        setSelectedSeats(prev => [...prev, seat]);
      } else {
        toast.error(`Limited to ${ticketCount} seats`);
      }
    }
  };

  const selectZone = (zone) => {
    if (zone.available < ticketCount) {
      toast.error(`Not enough seats available in ${zone.name}`);
      return;
    }
    const seatsToSelect = zone.seats.slice(0, ticketCount);
    setSelectedSeats(seatsToSelect);
    setSelectedZoneName(zone.name);
  };

  const currentTotal = useMemo(() => {
    if (selectedSeats.length === 0) return 0;
    const itemsTotal = selectedSeats.reduce((sum, seat) => {
      const mult = parseFloat(seat.priceMultiplier) || 1.0;
      return sum + (basePrice * mult);
    }, 0);
    return itemsTotal + serviceFee;
  }, [selectedSeats, basePrice]);

  const handleProceed = () => {
    navigate('/payment', {
      state: {
        eventId,
        eventTitle,
        category,
        ticketType: selectedSeats[0]?.seatClass || 'Standard',
        ticketCount,
        total: currentTotal,
        selectedSeats: selectedSeats.map(s => s.seatNumber),
        seatIds: selectedSeats.map(s => s.id)
      }
    });
  };

  if (loading) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-r-2 border-red-600"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-red-600/20 animate-pulse"></div>
        </div>
      </div>
      <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] animate-pulse">Syncing Seat Telemetry...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-8 p-12 text-center">
      <span className="material-symbols-outlined text-6xl text-red-600/20">error</span>
      <div className="space-y-2">
        <h2 className="text-xl font-black uppercase tracking-widest text-white">System Override Failed</h2>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest opacity-60">{error}</p>
      </div>
      <button onClick={() => navigate('/events')} className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
        Return to Lineup
      </button>
    </div>
  );

  return (
    <div className="bg-background text-on-surface font-body min-h-screen flex flex-col selection:bg-primary-container selection:text-white">
      <Navbar />

      <main className="pt-24 min-h-screen px-6 lg:px-12 max-w-[1600px] mx-auto pb-12 w-full">
        <header className="mb-12 text-white">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-red-500 font-semibold text-sm tracking-widest uppercase">
                <span className="material-symbols-outlined text-sm">confirmation_number</span>
                {category || 'Standard'} Layout
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold font-headline uppercase">{eventTitle || 'Seat Selection'}</h1>
              <p className="text-zinc-400 flex items-center gap-3">
                <span className="material-symbols-outlined text-red-500 text-sm">event_seat</span>
                Allocating {ticketCount} {selectedSeats.length === ticketCount ? 'Tickets Confirmed' : 'Available Spaces'}
              </p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
          <section className="xl:col-span-8 flex flex-col gap-12">
            
            {isZoneBased ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {zones.map((zone, idx) => {
                    const isSelected = selectedZoneName === zone.name;
                    const zonePrice = basePrice * zone.multiplier;
                    return (
                      <div 
                        key={idx}
                        onClick={() => selectZone(zone)}
                        className={`relative p-8 rounded-[2rem] border transition-all duration-300 cursor-pointer overflow-hidden group
                           ${zone.available < ticketCount ? 'opacity-50 grayscale cursor-not-allowed border-white/5 bg-zinc-900/50' :
                             isSelected ? 'border-red-500 bg-red-950/20 scale-[1.02] shadow-[0_0_30px_rgba(220,38,38,0.2)]' : 
                             'border-white/10 bg-zinc-900/80 hover:border-red-500/50 hover:bg-zinc-800'
                           }
                        `}
                      >
                         {isSelected && <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/20 blur-3xl rounded-full"></div>}
                         <div className="flex justify-between items-start mb-6">
                            <h3 className="text-xl font-black font-headline uppercase tracking-tighter text-white">{zone.name}</h3>
                            {isSelected && <span className="material-symbols-outlined text-red-500">check_circle</span>}
                         </div>
                         <div className="space-y-1 mb-8">
                            <p className="text-3xl font-black text-white">₹{zonePrice.toFixed(2)}</p>
                            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Per Ticket</p>
                         </div>
                         <div className="pt-6 border-t border-white/10 flex justify-between items-center text-[11px] font-black uppercase tracking-widest">
                            <span className="text-zinc-500">Availability</span>
                            <span className={zone.available < 10 ? 'text-red-500' : 'text-emerald-500'}>{zone.available} Left</span>
                         </div>
                      </div>
                    )
                 })}
              </div>
            ) : (
             <>
              <div className="relative w-full h-16 bg-gradient-to-b from-red-600/20 to-transparent flex items-end justify-center overflow-hidden rounded-t-[3rem]">
                <div className="absolute bottom-0 w-3/4 h-8 bg-zinc-800 flex items-center justify-center border-t border-zinc-700" style={{ clipPath: 'ellipse(70% 100% at 50% 100%)' }}>
                  <span className="text-[10px] font-black tracking-[0.5em] text-zinc-500 uppercase italic">STAGE</span>
                </div>
              </div>

              <div className="overflow-x-auto pb-12 custom-scrollbar">
                <div className="min-w-[700px] flex flex-col gap-8 items-center bg-white/[0.01] p-16 rounded-[4rem] border border-white/5 shadow-inner">
                  {Object.keys(groupedSeats).length === 0 ? (
                    <div className="p-20 text-center opacity-20">
                      <span className="material-symbols-outlined text-6xl">grid_off</span>
                      <p className="text-[10px] font-black uppercase mt-4">Grid Data Missing</p>
                    </div>
                  ) : Object.keys(groupedSeats).map(row => (
                    <div key={row} className="flex items-center gap-8">
                      <span className="w-10 text-[10px] font-black text-zinc-700 uppercase tracking-tighter text-right">{row}</span>
                      <div className="flex flex-wrap gap-3 justify-center max-w-4xl">
                        {groupedSeats[row].map(seat => {
                          const isSelected = selectedSeats.find(s => s.id === seat.id);
                          return (
                            <div
                              key={seat.id}
                              onClick={() => toggleSeat(seat)}
                              title={seat.seatNumber}
                              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 relative group border
                                ${seat.isBooked
                                  ? 'bg-zinc-900/50 border-white/5 cursor-not-allowed opacity-20'
                                  : isSelected
                                    ? 'bg-red-600 border-red-400 scale-110 shadow-2xl shadow-red-600/40 text-white'
                                    : 'bg-zinc-800/80 border-white/10 hover:border-red-600/50 hover:bg-zinc-700 cursor-pointer text-zinc-500 hover:text-white'
                                }`}
                            >
                              <span className="text-[9px] font-black tracking-tighter">{seat.seatNumber.replace(row, '')}</span>
                              {seat.isBooked && (
                                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-zinc-950 rounded-full border border-white/10 flex items-center justify-center shadow-lg">
                                  <span className="text-[8px] text-zinc-700 material-symbols-outlined scale-[0.6]">lock</span>
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <span className="w-10 text-[10px] font-black text-zinc-700 uppercase tracking-tighter">{row}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-zinc-900/40 p-10 rounded-[2.5rem] flex flex-wrap justify-center gap-16 items-center border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-7 h-7 rounded-xl bg-zinc-800 border border-white/10"></div>
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Available</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-7 h-7 rounded-xl bg-zinc-900/50 border border-white/5 opacity-20 flex items-center justify-center relative">
                    <span className="text-[10px] text-zinc-700 material-symbols-outlined scale-75">lock</span>
                  </div>
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Reserved</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-7 h-7 rounded-xl bg-red-600 border border-red-400 shadow-[0_0_20px_rgba(220,38,38,0.3)]"></div>
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Selected</span>
                </div>
              </div>
            </>
            )}
          </section>

          <aside className="xl:col-span-4">
            <div className="sticky top-28 space-y-6">
              <div className="bg-zinc-900 p-10 rounded-[3rem] border border-white/5 shadow-2xl text-white relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-600/5 rounded-full blur-3xl"></div>
                <h2 className="text-xl font-black font-headline mb-10 uppercase italic">Summary</h2>

                <div className="space-y-4 mb-10">
                  {selectedSeats.length === 0 ? (
                    <div className="text-zinc-800 bg-white/[0.01] border-2 border-dashed border-white/5 rounded-[2rem] p-16 text-center group hover:border-red-600/20 transition-all">
                      <span className="material-symbols-outlined text-5xl mb-6 opacity-10 group-hover:opacity-20 transition-opacity">event_seat</span>
                      <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">System awaiting selection<br />Expected count: {ticketCount}</p>
                    </div>
                  ) : (
                     <div className="flex items-center justify-between p-6 bg-white/[0.03] rounded-[2rem] border border-white/5 relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-1 h-full bg-red-600/40"></div>
                       <div>
                         <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-600 font-black mb-1">Passes Selected</p>
                         <p className="text-xl font-black font-headline uppercase leading-none tracking-tighter">{selectedSeats.length} Tickets</p>
                       </div>
                       <div className="text-right">
                         <p className="text-[9px] text-zinc-600 font-bold uppercase mb-1 tracking-widest">Level</p>
                         <p className="text-xs font-black text-red-500 uppercase">{selectedSeats[0]?.seatClass || 'Standard'}</p>
                       </div>
                     </div>
                  )}
                </div>

                <div className="border-t border-white/5 my-10 pt-10 space-y-5">
                  <div className="flex justify-between items-center text-zinc-600 text-[10px] font-black uppercase tracking-widest">
                    <span>Base Ticket Rate</span>
                    <span className="text-zinc-400">₹{basePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-600 text-[10px] font-black uppercase tracking-widest">
                    <span>Tickets x{selectedSeats.length} (incl. Tier Multiplier)</span>
                    <span className="text-zinc-400">₹{(selectedSeats.length > 0 ? (currentTotal - serviceFee) : 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-600 text-[10px] font-black uppercase tracking-widest">
                    <span>Service Fee</span>
                    <span className="text-zinc-400">₹{serviceFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-8 border-t border-white/[0.02]">
                    <span className="text-sm font-black uppercase tracking-widest text-zinc-400">Total Amount</span>
                    <span className="text-4xl font-black text-white font-headline tracking-tighter leading-none italic">
                     ₹{selectedSeats.length > 0 ? currentTotal.toFixed(2) : "0.00"}
                    </span>
                  </div>
                </div>

                <button
                  disabled={selectedSeats.length !== ticketCount}
                  onClick={handleProceed}
                  className="w-full bg-red-600 disabled:opacity-20 disabled:grayscale text-white py-6 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-500 active:scale-[0.98] transition-all shadow-2xl shadow-red-950/40 flex items-center justify-center gap-4 cursor-pointer"
                >
                  Authorize Payment
                  <span className="material-symbols-outlined text-sm font-black">arrow_forward</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default SeatSelection;
