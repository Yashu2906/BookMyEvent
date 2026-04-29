import { API_BASE_URL } from '../api';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';

const Register = () => {
  const [role, setRole] = useState('user');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpStep, setShowOtpStep] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !phone) {
      toast.error('Please fill all details');
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to send OTP');

      toast.success('OTP sent to your email!');
      
      if (data._dev_otp) {
        console.log(`[DEV OTP]: ${data._dev_otp}`);
      }

      // Navigate to dedicated VerifyOTP page with registration data
      navigate('/verify-otp', { state: { name, email, password, phone, role } });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Google login failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success(`Welcome, ${data.user.name}!`);
      navigate('/');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-6 relative bg-[#09090b] overflow-hidden selection:bg-primary-container selection:text-white">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-container/10 blur-[120px] rounded-full z-0 pointer-events-none"></div>

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

      <main className="w-full max-w-md relative z-10 py-20 mt-8">
        <div className="bg-surface-container-high rounded-3xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.7)] border border-white/[0.03]">
          <div className="flex flex-col items-center mb-8 text-center space-y-2">
            <span className="text-5xl mb-2">🎉</span>
            <h1 className="font-headline text-xl font-extrabold tracking-tighter text-white uppercase leading-none">Register</h1>
            <p className="font-body text-zinc-500 font-medium text-xs">Join us today to start booking events.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSendOTP}>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-zinc-400 mb-2 ml-1">Full Name</label>
                <input required className="w-full bg-zinc-800/80 border border-zinc-700/50 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-red-600 transition-all outline-none" type="text" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-zinc-400 mb-2 ml-1">Email Address</label>
                <input required className="w-full bg-zinc-800/80 border border-zinc-700/50 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-red-600 transition-all outline-none" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-zinc-400 mb-2 ml-1">Phone Number</label>
                <input required className="w-full bg-zinc-800/80 border border-zinc-700/50 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-red-600 transition-all outline-none" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-widest text-zinc-400 mb-2 ml-1">Password</label>
                <div className="relative">
                  <input required className="w-full bg-zinc-800/80 border border-zinc-700/50 rounded-xl px-4 py-3 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-red-600 transition-all outline-none" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors">
                    <span className="material-symbols-outlined text-lg">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-zinc-800/50 p-1 rounded-xl flex items-center border border-zinc-700/30">
              <button type="button" onClick={() => setRole('user')} className={`flex-1 py-2 px-4 rounded-lg text-[10px] uppercase tracking-widest font-black transition-all cursor-pointer ${role === 'user' ? 'bg-zinc-700 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>Join as User</button>
              <button type="button" onClick={() => setRole('admin')} className={`flex-1 py-2 px-4 rounded-lg text-[10px] uppercase tracking-widest font-black transition-all cursor-pointer ${role === 'admin' ? 'bg-red-600/20 text-red-500 shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>Join as Admin</button>
            </div>

            <button disabled={loading} className="w-full py-4 px-6 bg-gradient-to-br from-red-600 to-[#89231E] hover:from-red-500 hover:to-red-700 text-white font-headline font-black rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-2xl shadow-red-950/20 cursor-pointer disabled:opacity-50 uppercase tracking-widest text-xs" type="submit">
              {loading ? 'SENDING CODE...' : 'Create Account'}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-800/50"></div></div>
            <div className="relative flex justify-center"><span className="bg-surface-container-high px-4 text-[10px] font-black text-zinc-600 uppercase tracking-widest">OR REGISTER WITH</span></div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => toast.error('Google Sign-in failed')} theme="dark" shape="pill" size="large" width="350" />
          </div>

          <div className="mt-8 text-center">
            <p className="font-body text-sm text-zinc-400 font-medium">
              Already have an account? <Link className="text-red-500 font-bold hover:text-red-400 transition-colors ml-1 uppercase" to="/login">Login</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;
