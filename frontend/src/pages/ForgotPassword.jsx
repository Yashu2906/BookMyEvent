import { API_BASE_URL } from '../api';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Request failed');

      toast.success('Reset token generated! (Check console for simulation)');
      console.log('RESET TOKEN:', data.token); // Simulation
      
      // In a real app, we'd navigate to a page where they enter the token
      navigate('/reset-password', { state: { email } });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#09090b] selection:bg-primary-container selection:text-white relative overflow-hidden">
      {/* Visual Polish: Background Accents */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-container/10 blur-[120px] rounded-full z-0 pointer-events-none"></div>

      {/* Top Navigation Logo */}
      <header className="absolute top-0 w-full z-50 flex justify-center py-10">
        <Link className="flex items-center gap-3 group select-none" to="/">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.3)] group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-white text-2xl font-black">event</span>
          </div>
          <span className="text-2xl font-black tracking-tighter text-white font-headline uppercase leading-none">
            BookMy<span className="text-red-600">Event</span>
          </span>
        </Link>
      </header>

      <main className="flex-grow flex items-center justify-center px-4 py-20 relative z-10">
        <div className="w-full mx-auto max-w-md">
          {/* Heading Area */}
          <div className="text-center mb-10 space-y-2">
            <div className="text-5xl mb-4">🔐</div>
            <h1 className="text-xl font-extrabold font-headline tracking-tighter text-white uppercase leading-none">Forgot Password</h1>
            <p className="text-zinc-500 font-medium text-xs">We'll send you a reset code to your email.</p>
          </div>

          <div className="bg-surface-container-high p-8 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] border border-white/[0.03]">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="block text-[10px] uppercase font-bold tracking-widest text-zinc-400 mb-2 ml-1">Email Address</label>
                <input 
                  required
                  className="w-full bg-zinc-800/80 border border-zinc-700/50 rounded-xl py-3.5 px-4 text-on-surface placeholder:text-zinc-500 focus:ring-2 focus:ring-red-600 transition-all outline-none text-sm" 
                  placeholder="name@example.com" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button disabled={loading} className="w-full bg-gradient-to-br from-red-600 to-[#89231E] hover:from-red-500 hover:to-red-700 text-white font-headline font-black py-4 rounded-xl flex items-center justify-center gap-2 group shadow-2xl shadow-red-950/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 uppercase tracking-widest text-xs" type="submit">
                {loading ? 'SENDING...' : 'SEND RESET CODE'}
                {!loading && <span className="material-symbols-outlined font-bold group-hover:translate-x-1 transition-transform">arrow_forward</span>}
              </button>
            </form>

            <div className="mt-8 text-center">
              <Link className="text-[10px] font-bold text-zinc-500 hover:text-white transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-2" to="/login">
                <span className="material-symbols-outlined text-sm font-bold">arrow_back</span>
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full py-8 mt-auto border-t border-white/5 relative z-10 text-center">
        <span className="font-headline font-black text-[10px] uppercase tracking-[0.4em] select-none opacity-20 text-zinc-400">
          BookMyEvent — Event Management
        </span>
      </footer>
    </div>
  );
};

export default ForgotPassword;
