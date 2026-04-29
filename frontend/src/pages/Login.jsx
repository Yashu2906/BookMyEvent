import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import { API_BASE_URL } from '../api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: `POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      toast.success(`Welcome back, ${data.user.name}!`);
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/google-login`, {
        method: `POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Google login failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#09090b] selection:bg-primary-container selection:text-white relative overflow-hidden">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-container/10 blur-[120px] rounded-full -z-10 pointer-events-none text-center"></div>

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

      <main className="flex-grow flex items-center justify-center px-4  relative z-10 mt-25">
        <div className="w-full mx-auto max-w-md">


          <div className="bg-surface-container-high p-8 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] border border-white/[0.03]">
            <div className="text-center mb-10 space-y-2">
              <div className="text-5xl mb-4">👋</div>
              <h1 className="text-3xl font-extrabold font-headline tracking-tighter text-white uppercase leading-none">Welcome Back</h1>
              <p className="text-zinc-500 font-medium text-sm">Log in to your account</p>
            </div>
            <form className="space-y-6" onSubmit={handleLogin}>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 ml-1" htmlFor="email">Email</label>
                <input
                  className="w-full bg-zinc-800/80 border border-zinc-700/50 rounded-xl py-3.5 px-4 text-on-surface placeholder:text-zinc-600 focus:ring-2 focus:ring-red-600 transition-all outline-none"
                  id="email"
                  placeholder="name@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400" htmlFor="password">Password</label>
                  <Link className="text-[10px] font-bold text-red-500 hover:text-red-400 transition-colors uppercase tracking-widest" to="/forgot-password">Forgot Password?</Link>
                </div>
                <div className="relative">
                  <input
                    className="w-full bg-zinc-800/80 border border-zinc-700/50 rounded-xl py-3.5 px-4 text-on-surface placeholder:text-zinc-600 focus:ring-2 focus:ring-red-600 transition-all outline-none"
                    id="password"
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
                    <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              <button disabled={loading} className="w-full bg-gradient-to-br from-red-600 to-[#89231E] hover:from-red-500 hover:to-red-700 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 shadow-2xl shadow-red-950/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50" type="submit">
                {loading ? 'LOGGING IN...' : 'LOGIN'}
                {!loading && <span className="material-symbols-outlined font-bold">arrow_forward</span>}
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-800/50"></div></div>
              <div className="relative flex justify-center"><span className="bg-surface-container-high px-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest">OR LOGIN WITH</span></div>
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => toast.error('Google Sign-in failed')}
                theme="filled_black"
                shape="pill"
                width="350"
              />
            </div>
          </div>

          <p className="text-center mt-10 text-zinc-500 font-medium text-sm">
            Don't have an account?
            <Link className="text-red-500 font-bold hover:text-red-400 transition-colors ml-1 uppercase" to="/register">Sign up</Link>
          </p>
        </div>
      </main>

      <footer className="w-full py-8 mt-auto border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div className="text-[10px] font-bold text-zinc-600 font-label uppercase tracking-widest">© 2024 BookMyEvent. Secure Ticketing Stage.</div>
          <div className="flex gap-6">
            <a className="text-[10px] font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest" href="#">Legal</a>
            <a className="text-[10px] font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest" href="#">Privacy</a>
            <a className="text-[10px] font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest" href="#">System</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Login;
