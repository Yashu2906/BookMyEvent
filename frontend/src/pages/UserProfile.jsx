import { API_BASE_URL } from '../api';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const storedUserString = localStorage.getItem('user');
      if (!storedUserString) {
        setLoading(false);
        return;
      }

      const storedUser = JSON.parse(storedUserString);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          headers: { `Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (response.ok) {
          setUser(data);
          setFormData({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || ''
          });
        } else {
          console.warn('Backend fetch failed, using localStorage fallback:', data.message);
          setUser(storedUser);
          setFormData({
            name: storedUser.name || '',
            email: storedUser.email || '',
            phone: storedUser.phone || ''
          });
        }
      } catch (error) {
        console.error('Connection to backend failed:', error);
        setUser(storedUser);
        setFormData({
          name: storedUser.name || '',
          email: storedUser.email || '',
          phone: storedUser.phone || ''
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        // Update localStorage to keep things in sync
        const updatedUser = { ...JSON.parse(localStorage.getItem('user')), ...data.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        toast.success('Profile updated successfully!');
      } else {
        toast.error(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Update profile error:', error);
      toast.error('Server error');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-surface">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-white">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen bg-surface">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-white">Please log in to view your profile.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-surface text-on-surface font-body selection:bg-primary-container selection:text-on-primary-container">
      <Navbar />

      <main className="pt-32 pb-24 max-w-7xl mx-auto px-6 lg:px-8 w-full flex-grow">
        {/* Profile Header */}
        <header className="flex flex-col md:flex-row items-center md:items-end gap-8 mb-12">
          <div className="relative">
            <div className="w-[120px] h-[120px] rounded-full overflow-hidden border-4 border-surface-container-high ring-2 ring-primary-container/20 bg-zinc-800 flex items-center justify-center text-4xl font-black text-red-600">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <button 
              onClick={() => document.getElementById('profile-name').focus()}
              className="absolute bottom-0 right-0 bg-primary-container text-on-primary-container p-2 rounded-full shadow-lg hover:scale-105 transition-transform active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
            </button>
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-black font-headline tracking-widest text-on-surface mb-1 uppercase italic">{user.name}</h1>
            <p className="text-zinc-400 font-medium mb-1">{user.email}</p>
            <p className="text-zinc-500 text-sm font-label uppercase tracking-widest">{user.role} Account</p>
          </div>
        </header>

         {/* Stats Row */}
        <section className="mb-12">
          <div className="bg-zinc-900 rounded-2xl p-6 flex flex-wrap justify-around items-center gap-4 shadow-2xl border border-zinc-800/50">
            <Link to="/my-bookings" className="text-center px-8 hover:bg-white/5 p-4 rounded-xl transition-colors cursor-pointer group">
              <span className="block text-3xl font-black text-red-500 font-headline italic group-hover:scale-110 transition-transform">
                {user.bookings_count || 0}
              </span>
              <span className="text-zinc-400 text-xs uppercase tracking-widest font-label">Bookings</span>
            </Link>
            <div className="w-px h-12 bg-zinc-800 hidden md:block"></div>
            <Link to="/wishlist" className="text-center px-8 hover:bg-white/5 p-4 rounded-xl transition-colors cursor-pointer group">
              <span className="block text-3xl font-black text-red-500 font-headline italic group-hover:scale-110 transition-transform">
                {user.wishlist_count || 0}
              </span>
              <span className="text-zinc-400 text-xs uppercase tracking-widest font-label">Wishlist</span>
            </Link>
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7">
            <section className="bg-surface-container-low rounded-2xl p-8 border border-zinc-800/30">
              <h2 className="text-lg font-black text-zinc-100 mb-8 tracking-widest font-headline italic">PERSONAL DETAILS</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">Full Name</label>
                    <input 
                      id="profile-name"
                      className="w-full bg-zinc-800 border-[1px] border-zinc-700 rounded-xl text-on-surface outline-none focus:border-red-500 transition-all py-3 px-4" 
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">Email Address</label>
                    <input 
                      className="w-full bg-zinc-800 border-[1px] border-zinc-700 rounded-xl text-on-surface outline-none focus:border-red-500 transition-all py-3 px-4" 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">Phone Number</label>
                    <input 
                      className="w-full bg-zinc-800 border-[1px] border-zinc-700 rounded-xl text-on-surface outline-none focus:border-red-500 transition-all py-3 px-4" 
                      type="tel" 
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 00000 00000"
                    />
                  </div>
                </div>
                <div className="pt-4 flex justify-end">
                  <button type="submit" className="bg-gradient-to-tr from-primary-container to-secondary-container text-on-primary-container px-8 py-4 rounded-xl font-bold text-sm tracking-wide hover:brightness-110 transition-all active:scale-95 cursor-pointer shadow-lg shadow-red-900/20">
                    SAVE CHANGES
                  </button>
                </div>
              </form>
            </section>
          </div>

          <div className="lg:col-span-5 space-y-8">
            <section className="bg-surface-container-low rounded-2xl p-8 border border-zinc-800/30">
              <h2 className="text-lg font-black text-zinc-100 mb-8 tracking-widest font-headline italic">SECURITY</h2>
              <div className="space-y-5">
                <button className="w-full bg-zinc-800/50 border border-zinc-700 py-4 rounded-xl text-white font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-zinc-700 transition-all cursor-pointer">
                  Update Account Password
                </button>
                <button className="w-full bg-red-600/10 border border-red-600/20 py-4 rounded-xl text-red-500 font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-red-600/20 transition-all cursor-pointer">
                  Deactivate Account
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;
