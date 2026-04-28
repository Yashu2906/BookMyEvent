import { API_BASE_URL } from '../api';
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  
  const regData = location.state || {};
  const { email, name, password, phone, role } = regData;

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const finalOtp = otp.join('');
    if (finalOtp.length !== 6) {
      toast.error('Please enter all 6 digits');
      return;
    }
    setLoading(true);

    try {
      const response = await fetch('${API_BASE_URL}/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone, role, otp: finalOtp }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Verification failed');

      toast.success('Registration successful! Welcome aboard.');
      navigate('/login');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    try {
      const response = await fetch('${API_BASE_URL}/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error('Failed to resend OTP');
      toast.success('New code sent to your email');
      setTimer(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b] text-zinc-500 font-body">
        <div className="text-center group">
          <p className="mb-4 text-sm tracking-widest uppercase opacity-50">Verification data missing</p>
          <Link to="/register" className="text-red-500 font-black hover:text-red-400 flex items-center gap-2 justify-center transition-all">
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Registration
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-6 relative bg-[#09090b] overflow-hidden selection:bg-red-500 selection:text-white font-body">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-red-600/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-900/10 blur-[120px] rounded-full animate-pulse delay-700"></div>
      </div>

      <header className="absolute top-0 w-full z-50 flex justify-center py-10 scale-90 md:scale-100">
        <Link className="flex items-center gap-3 group select-none" to="/">
          <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.3)] group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-white text-2xl font-black">event</span>
          </div>
          <span className="text-2xl font-black tracking-tighter text-white font-headline uppercase leading-none">
            BookMy<span className="text-red-600">Event</span>
          </span>
        </Link>
      </header>

      <main className="w-full max-w-lg relative z-10 py-20">
        <div className="bg-[#121214]/60 backdrop-blur-3xl rounded-[2.5rem] p-10 md:p-14 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] border border-white/[0.05]">
          <div className="text-center mb-12 space-y-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-red-600/10 border border-red-600/20 text-4xl mb-6 shadow-inner animate-bounce-subtle">
              🛡️
            </div>
            <h1 className="font-headline text-xl font-black tracking-tighter text-white uppercase leading-none italic">Verify OTP</h1>
            <p className="text-zinc-500 font-medium text-xs leading-relaxed max-w-[20ch] mx-auto">
              We've sent a code to <br/><span className="text-red-500 font-bold">{email}</span>
            </p>
          </div>

          <form className="space-y-10" onSubmit={handleVerify}>
            <div className="flex justify-between gap-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={loading}
                  className="w-full aspect-square bg-zinc-900/50 border-2 border-zinc-800 rounded-2xl text-center text-3xl font-black text-red-600 focus:border-red-600 focus:bg-red-600/5 focus:ring-4 focus:ring-red-600/10 transition-all outline-none"
                />
              ))}
            </div>

            <button 
              disabled={loading} 
              className="group relative w-full py-5 px-8 bg-red-600 hover:bg-red-500 text-white font-headline font-black rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 shadow-[0_20px_40px_-10px_rgba(220,38,38,0.3)] disabled:opacity-50 overflow-hidden" 
              type="submit"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <span className="material-symbols-outlined font-bold">verified_user</span>
              <span className="uppercase tracking-widest text-xs">{loading ? 'Verifying...' : 'Finish Registration'}</span>
            </button>

            <div className="flex flex-col items-center gap-4">
              <div className="h-px w-20 bg-zinc-800"></div>
              <button 
                type="button" 
                onClick={handleResend}
                disabled={timer > 0 || loading}
                className={`text-xs font-black uppercase tracking-[0.2em] transition-all ${timer > 0 ? 'text-zinc-700 cursor-not-allowed' : 'text-zinc-500 hover:text-white cursor-pointer'}`}
              >
                {timer > 0 ? `Resend Code in ${timer}s` : 'Request New Code'}
              </button>
            </div>
          </form>

          <div className="mt-14 text-center">
            <Link className="text-[10px] font-black text-zinc-600 hover:text-red-500 transition-all uppercase tracking-widest flex items-center justify-center gap-2" to="/register">
              <span className="material-symbols-outlined text-xs">close</span>
              Cancel & Change Email
            </Link>
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 4s ease-in-out infinite;
        }
      `}} />
    </div>
  );
};

export default VerifyOTP;
