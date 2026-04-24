import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const AdminSidebar = () => {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: 'dashboard' },
    { name: 'Events', path: '/admin/events', icon: 'event' },
    { name: 'Bookings', path: '/admin/bookings', icon: 'receipt_long' },
    { name: 'Profile', path: '/profile', icon: 'account_circle' },
  ];

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5 z-[60] flex items-center justify-between px-6">
        <Link to="/" className="text-red-600 font-black text-sm tracking-[0.4em] uppercase">BME // ADMIN</Link>
        <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="text-white p-2">
          <span className="material-symbols-outlined text-sm">{isMobileOpen ? 'close' : 'menu_open'}</span>
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-[70] w-64 border-r border-white/5 bg-zinc-950 transition-transform duration-500 md:translate-x-0 md:sticky md:top-0 h-screen flex flex-col
        ${isMobileOpen ? 'translate-x-0shad' : '-translate-x-full'}
      `}>
        <div className="p-10">
          <Link to="/" className="group" onClick={() => setIsMobileOpen(false)}>
            <div className="text-sm font-black tracking-[0.5em] text-red-600 mb-2 uppercase group-hover:text-white transition-colors">BOOKMYEVENT</div>
          </Link>
          <div className="text-zinc-700 text-xs uppercase tracking-widest font-black">Admin Panel v1.0</div>
        </div>

        <nav className="flex-1 px-6 space-y-2 mt-8">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-500 group relative ${isActive
                  ? 'text-white'
                  : 'text-zinc-600 hover:text-white'
                  }`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-white/[0.03] rounded-2xl -z-10 animate-in fade-in duration-500"></div>
                )}
                {isActive && (
                  <div className="absolute left-0 w-1 h-4 bg-red-600 rounded-full"></div>
                )}
                <span className={`material-symbols-outlined text-lg transition-transform ${isActive ? 'text-red-600' : 'group-hover:scale-110'}`}>
                  {item.icon}
                </span>
                <span className={`text-sm font-black uppercase tracking-widest ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1 transition-transform'}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-8">
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
            <p className="text-xs text-zinc-700 uppercase tracking-widest font-black mb-3">Server Status</p>
            <div className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-red-600 animate-ping"></div>
              <span className="text-xs font-black text-zinc-400 uppercase tracking-[0.22em]">Online</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[65] md:hidden"
          onClick={() => setIsMobileOpen(false)}
        ></div>
      )}
    </>
  );
};

export default AdminSidebar;
