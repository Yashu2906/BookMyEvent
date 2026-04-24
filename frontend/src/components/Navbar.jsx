import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    setIsMenuOpen(false); // Close menu on route change
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-[100] bg-zinc-950/80 backdrop-blur-2xl border-b border-white/[0.05] transition-all">
        <div className="flex justify-between items-center px-4 md:px-8 py-4 max-w-full mx-auto">
          <div className="flex items-center gap-4 md:gap-12">
            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-zinc-100 p-1"
            >
              <span className="material-symbols-outlined text-2xl">
                {isMenuOpen ? 'close' : 'menu'}
              </span>
            </button>

            <Link className="flex items-center gap-2 group" to="/">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-red-600 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                <span className="material-symbols-outlined text-white text-xl md:text-2xl font-black">event</span>
              </div>
              <span className="text-xl md:text-2xl font-black tracking-tighter text-white font-headline uppercase leading-none">
                BookMy<span className="text-red-600">Event</span>
              </span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-8">
               <Link className={`text-sm font-black tracking-tight uppercase hover:text-red-500 transition-all ${location.pathname === '/events' ? 'text-red-500' : 'text-zinc-500'}`} to="/events">Events</Link>
              {user && (
                <Link className={`text-sm font-black tracking-tight uppercase hover:text-red-500 transition-all ${location.pathname === '/my-bookings' ? 'text-red-500' : 'text-zinc-500'}`} to="/my-bookings">My Bookings</Link>
              )}
              <Link className={`text-sm font-black tracking-tight uppercase hover:text-red-500 transition-all ${location.pathname === '/wishlist' ? 'text-red-500' : 'text-zinc-500'}`} to="/wishlist">Wishlist</Link>
              {user?.role === 'admin' && (
                <Link className="px-3 py-1 bg-red-600/10 text-red-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-600/20" to="/admin">Admin Dashboard</Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-6">
            <div className="hidden lg:flex items-center bg-zinc-900/50 rounded-xl px-4 py-2 gap-3 border border-white/[0.05] focus-within:border-red-600/50 transition-all group">
              <span className="material-symbols-outlined text-zinc-600 group-focus-within:text-red-500 text-sm">search</span>
              <input className="bg-transparent border-none text-xs text-white placeholder:text-zinc-600 w-32 xl:w-48 outline-none" placeholder="Search events..." type="text"/>
            </div>
            
            {user ? (
              <div className="flex items-center gap-2 md:gap-4">
                <Link to="/profile" className="flex items-center gap-3 pl-2 pr-4 py-1.5 md:py-2 bg-zinc-900/50 rounded-full border border-white/[0.05] hover:bg-zinc-800 transition-all group">
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-white font-black text-[10px] md:text-xs">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-zinc-400 text-xs font-bold hidden sm:block group-hover:text-white transition-colors">{user.name?.split(' ')[0]}</span>
                </Link>
                <button onClick={handleLogout} className="text-zinc-600 hover:text-red-500 transition-colors p-2" title="Logout">
                  <span className="material-symbols-outlined text-xl">logout</span>
                </button>
              </div>
            ) : (
              <Link to="/login" className="bg-red-600 hover:bg-red-500 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-black text-xs md:text-sm uppercase tracking-widest shadow-xl shadow-red-950/20 active:scale-95 transition-all">
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <div className={`fixed inset-0 z-[110] transition-all duration-500 md:hidden ${isMenuOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'}`}>
        <div className={`absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-500 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsMenuOpen(false)}></div>
        <div className={`absolute left-0 top-0 bottom-0 w-[280px] bg-zinc-950 shadow-2xl transition-transform duration-500 ease-out border-r border-white/[0.05] ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-8 space-y-12">
            <Link className="flex items-center gap-2" to="/" onClick={() => setIsMenuOpen(false)}>
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-xl font-black">event</span>
              </div>
              <span className="text-xl font-black tracking-tighter text-white font-headline uppercase">BookMyEvent</span>
            </Link>

            <nav className="flex flex-col gap-2">
               <Link className="p-4 rounded-2xl text-zinc-400 hover:bg-zinc-900 hover:text-white font-black text-xs uppercase tracking-[0.2em] flex items-center gap-4 transition-all" to="/events">
                <span className="material-symbols-outlined">explore</span> Explore Events
              </Link>
              {user && (
                <Link className="p-4 rounded-2xl text-zinc-400 hover:bg-zinc-900 hover:text-white font-black text-xs uppercase tracking-[0.2em] flex items-center gap-4 transition-all" to="/my-bookings">
                  <span className="material-symbols-outlined">confirmation_number</span> My Bookings
                </Link>
              )}
              <Link className="p-4 rounded-2xl text-zinc-400 hover:bg-zinc-900 hover:text-white font-black text-xs uppercase tracking-[0.2em] flex items-center gap-4 transition-all" to="/wishlist">
                <span className="material-symbols-outlined">favorite</span> My Wishlist
              </Link>
              <Link className="p-4 rounded-2xl text-zinc-400 hover:bg-zinc-900 hover:text-white font-black text-xs uppercase tracking-[0.2em] flex items-center gap-4 transition-all" to="/profile">
                <span className="material-symbols-outlined">person</span> My Profile
              </Link>
              {user?.role === 'admin' && (
                <div className="pt-4 mt-4 border-t border-white/5">
                  <Link className="p-4 rounded-2xl bg-red-600/10 text-red-500 font-black text-xs uppercase tracking-[0.2em] flex items-center gap-4" to="/admin">
                    <span className="material-symbols-outlined">admin_panel_settings</span> Admin Panel
                  </Link>
                </div>
              )}
            </nav>

            {user && (
              <div className="absolute bottom-8 left-8 right-8">
                <button onClick={handleLogout} className="w-full p-4 rounded-2xl border border-zinc-900 text-zinc-500 font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4">
                  <span className="material-symbols-outlined text-lg">logout</span> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
