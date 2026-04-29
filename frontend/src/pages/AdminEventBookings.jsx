import { API_BASE_URL } from '../api';
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import toast from 'react-hot-toast';

const AdminEventBookings = () => {
  const { id } = useParams();
  const [data, setData] = useState({ event_title: '', revenue: 0, bookings: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/bookings/event/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const result = await response.json();
          setData(result);
        } else {
          toast.error(' Failed to fetch event bookings data');
        }
      } catch (err) {
        console.error(err);
        toast.error('Server error');
      } finally {
        setLoading(false);
      }
    };
    fetchEventBookings();
  }, [id]);

  return (
    <div className="flex min-h-screen bg-[#09090b] text-white font-body selection:bg-red-600">
      <AdminSidebar />

      <main className="flex-1 flex flex-col min-w-0">
        <header className="flex justify-between items-center px-10 h-20 bg-zinc-950/50 backdrop-blur-xl border-b border-white/5">
          <div className="text-zinc-600 font-black uppercase tracking-[0.4em] text-sm">
            <Link to="/admin/events" className="hover:text-white transition-colors">Events</Link> / Bookings
          </div>
        </header>

        <div className="flex-1 p-10 space-y-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-black font-headline tracking-tighter uppercase leading-none mb-2">
                Event <span className="text-red-600">Overview</span>
              </h1>
              <p className="text-zinc-700 text-sm font-black uppercase tracking-[0.2em]">{data.event_title || 'Loading...'}</p>
            </div>

            <div className="bg-zinc-900 border border-white/5 rounded-2xl p-6 flex flex-col items-end min-w-[200px] shadow-2xl">
              <span className="text-base font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">Total Revenue</span>
              <span className="text-2xl font-black text-emerald-500">₹{data.revenue}</span>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-20">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-600"></div>
            </div>
          ) : (
            <div className="overflow-hidden bg-zinc-900 border border-white/5 rounded-[2.5rem] shadow-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="px-8 py-6 text-sm font-black uppercase tracking-widest text-zinc-500">ID / Date</th>
                    <th className="px-8 py-6 text-sm font-black uppercase tracking-widest text-zinc-500">Tickets</th>
                    <th className="px-8 py-6 text-sm font-black uppercase tracking-widest text-zinc-500">User Details</th>
                    <th className="px-8 py-6 text-sm font-black uppercase tracking-widest text-zinc-500">Seat Selection</th>
                    <th className="px-8 py-6 text-sm font-black uppercase tracking-widest text-zinc-500">Amount / Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-white/[0.01] transition-all group">
                      <td className="px-8 py-8">
                        <div className="text-sm font-black text-red-600 mb-1">#{booking.id}</div>
                        <div className="text-sm font-bold text-zinc-500">{new Date(booking.booking_date).toLocaleDateString()}</div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="text-lg font-black text-white/90">{booking.number_of_tickets} Tickets</div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="text-sm font-black text-white uppercase">{booking.user_name}</div>
                        <div className="text-sm font-medium text-zinc-600 lowercase">{booking.user_email}</div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex flex-wrap gap-2">
                          {booking.seats && booking.seats.length > 0 ? (
                            booking.seats.map(seat => (
                              <span key={seat} className="px-2 py-1 bg-white/[0.05] border border-white/5 rounded-md text-xs font-black text-zinc-400">{seat}</span>
                            ))
                          ) : (
                            <span className="text-xs text-zinc-700 italic">No seat allocation</span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="text-lg font-black text-emerald-500 mb-1">₹{booking.total_amount}</div>
                        <div className={`text-xs font-black uppercase tracking-widest px-2 py-1 rounded-full inline-block ${booking.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                          {booking.status}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.bookings.length === 0 && (
                <div className="p-20 text-center space-y-4">
                  <span className="material-symbols-outlined text-4xl text-zinc-800">receipt_long</span>
                  <p className="text-base font-black uppercase tracking-widest text-zinc-700">No booking records found for this event.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminEventBookings;
