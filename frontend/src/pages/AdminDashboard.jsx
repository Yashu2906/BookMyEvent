import { API_BASE_URL } from '../api';
import React, { useState, useEffect } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    events: 0,
    bookings: 0,
    revenue: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [eventsRes, bookingsRes] = await Promise.all([
          fetch('${API_BASE_URL}/api/events'),
          fetch('${API_BASE_URL}/api/bookings', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          })
        ]);

        if (eventsRes.ok && bookingsRes.ok) {
          const events = await eventsRes.json();
          const bookings = await bookingsRes.json();

          const totalRev = bookings.reduce((sum, b) => sum + Number(b.total_amount), 0);
          setStats({
            events: events.length,
            bookings: bookings.length,
            revenue: totalRev
          });
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#09090b] text-white font-body selection:bg-red-600">
      <AdminSidebar />

      <main className="flex-1 flex flex-col min-w-0 pt-16 md:pt-0">
        <header className="hidden md:flex justify-between items-center px-10 h-20 bg-zinc-950/50 backdrop-blur-xl border-b border-white/5">
          <div className="text-zinc-600 font-black uppercase tracking-[0.4em] text-sm">Admin Dashboard / Statistics</div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/5 flex items-center justify-center">
              <span className="material-symbols-outlined text-base text-zinc-500">notifications</span>
            </div>
          </div>
        </header>

        <div className="flex-1 p-6 md:p-10 space-y-10">
          <div>
            <h1 className="text-2xl md:text-3xl font-black font-headline tracking-tighter uppercase leading-none mb-2">Admin Overview</h1>
            <p className="text-zinc-700 text-sm font-black uppercase tracking-[0.2em]">Live system data and earnings performance.</p>
          </div>

          {/* Stats Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/[0.02] p-8 rounded-[2rem] border border-white/5 hover:bg-white/[0.04] transition-all group font-headline">
              <span className="text-zinc-600 text-base font-black uppercase tracking-widest block mb-4">Total Earnings</span>
              <div className="text-2xl md:text-3xl font-black text-white tracking-tighter flex items-baseline gap-1">
                <span className="text-red-600 font-black italic">₹</span>{stats.revenue.toLocaleString()}
              </div>
              <div className="mt-4 h-1 w-8 bg-red-600 opacity-20 group-hover:opacity-100 transition-opacity"></div>
            </div>

            <div className="bg-white/[0.02] p-8 rounded-[2rem] border border-white/5 hover:bg-white/[0.04] transition-all group font-headline">
              <span className="text-zinc-600 text-base font-black uppercase tracking-widest block mb-4">Total Bookings</span>
              <div className="text-2xl md:text-3xl font-black text-white tracking-tighter">{stats.bookings}</div>
              <div className="mt-4 h-1 w-8 bg-zinc-700 opacity-20 group-hover:opacity-100 transition-opacity"></div>
            </div>

            <div className="bg-white/[0.02] p-8 rounded-[2rem] border border-white/5 hover:bg-white/[0.04] transition-all group font-headline">
              <span className="text-zinc-600 text-base font-black uppercase tracking-widest block mb-4">Total Events</span>
              <div className="text-2xl md:text-3xl font-black text-white tracking-tighter">{stats.events}</div>
              <div className="mt-4 h-1 w-8 bg-zinc-700 opacity-20 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-8 rounded-[2.5rem] bg-zinc-900 border border-white/5">
              <h3 className="text-base font-black text-zinc-600 uppercase tracking-widest mb-6">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <Link to="/admin/events/create" className="p-6 rounded-2xl bg-white/5 hover:bg-red-600 transition-all group text-center border border-white/5">
                  <span className="material-symbols-outlined mb-2 block group-hover:scale-110 transition-transform">add_circle</span>
                  <span className="text-sm font-black uppercase tracking-widest"> Create Event</span>
                </Link>
                <Link to="/admin/events" className="p-6 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group text-center border border-white/5">
                  <span className="material-symbols-outlined mb-2 block group-hover:scale-110 transition-transform">inventory</span>
                  <span className="text-sm font-black uppercase tracking-widest"> Manage Events</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
