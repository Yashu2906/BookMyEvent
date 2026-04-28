import { API_BASE_URL } from '../api';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import AdminSidebar from '../components/AdminSidebar';

const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('${API_BASE_URL}/api/events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event? This cannot be undone.')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/events/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setEvents(events.filter(e => e.id !== id));
        toast.success('Event deleted successfully');
      } else {
        toast.error('Failed to delete event');
      }
    } catch (err) {
      toast.error('An error occurred');
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-on-background font-body selection:bg-primary-container selection:text-white overflow-hidden">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0 pt-16 md:pt-0">
        <header className="hidden md:flex justify-between items-center px-8 sticky top-0 z-40 w-full bg-zinc-950/70 backdrop-blur-xl h-16 font-headline text-base">
          <div className="flex items-center gap-6">
            <div className="relative w-72">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-lg">search</span>
              <input className="w-full bg-zinc-900/50 border-none outline-none rounded-xl py-2 pl-10 text-zinc-200 placeholder-zinc-500 focus:ring-1 focus:ring-red-600 transition-all" placeholder="Quick search..." type="text"/>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-8 space-y-8 md:space-y-12 max-w-7xl mx-auto w-full overflow-x-hidden">
          <section className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="space-y-4">
              <h1 className="text-xl md:text-2xl font-black font-headline tracking-tighter text-white leading-none uppercase">
                Manage <span className="text-red-600">Events</span>
              </h1>
              <p className="text-zinc-500 text-sm font-black uppercase tracking-[0.2em] max-w-xl">Oversee the complete event list from the dashboard.</p>
            </div>
            <div className="flex justify-start md:justify-end">
              <Link to="/admin/events/create" className="w-full md:w-auto">
                <button className="w-full md:w-auto bg-gradient-to-br from-primary-container to-secondary-container text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 text-lg active:scale-95 transition-all shadow-xl shadow-red-900/20 cursor-pointer">
                  <span className="material-symbols-outlined">add</span>
                  Create Event
                </button>
              </Link>
            </div>
          </section>

          <div className="bg-zinc-900/10 rounded-2xl overflow-hidden border border-zinc-800/50">
            {loading ? (
              <div className="p-20 text-center text-zinc-500 uppercase tracking-widest font-black text-base">Syncing with database...</div>
            ) : (
              <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-left min-w-[700px]">
                  <thead>
                    <tr className="bg-zinc-900/80 text-zinc-500 uppercase text-base tracking-[0.2em] font-bold">
                      <th className="px-6 py-4">Title</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4 text-right">Price</th>
                      <th className="px-6 py-4 text-right">Capacity</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {events.map(event => (
                      <tr key={event.id} className="hover:bg-zinc-800/30 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="text-white font-semibold font-headline text-lg">{event.title}</div>
                          <div className="text-zinc-500 text-sm mt-1">ID: EVT-{event.id}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-zinc-400 text-sm font-medium">{event.category}</span>
                        </td>
                        <td className="px-6 py-4 text-zinc-400 text-sm">
                          {new Date(event.event_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right text-white font-mono text-base">₹{Number(event.base_price).toFixed(2)}</td>
                        <td className="px-6 py-4 text-right text-zinc-400 text-sm">{event.available_seats} / {event.total_capacity}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 text-zinc-500">
                            <Link to={`/admin/events/${event.id}/bookings`} className="p-2 hover:text-emerald-500 transition-colors cursor-pointer mr-2" title="View Bookings">
                              <span className="material-symbols-outlined text-lg">bar_chart</span>
                            </Link>
                            <button onClick={() => handleDelete(event.id)} className="p-2 hover:text-red-500 transition-colors cursor-pointer" title="Delete Event">
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManageEvents;
