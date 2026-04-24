import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import EventsBrowse from './pages/EventsBrowse';
import EventDetails from './pages/EventDetails';
import BookingConfirmed from './pages/BookingConfirmed';
import UserProfile from './pages/UserProfile';
import AdminDashboard from './pages/AdminDashboard';
import SeatSelection from './pages/SeatSelection';
import Payment from './pages/Payment';
import MyBookings from './pages/MyBookings';
import ManageEvents from './pages/ManageEvents';
import CreateEvent from './pages/CreateEvent';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Wishlist from './pages/Wishlist';
import VerifyOTP from './pages/VerifyOTP';
import AdminBookings from './pages/AdminBookings';
import AdminEventBookings from './pages/AdminEventBookings';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  return (
    <GoogleOAuthProvider clientId="603907937077-mhutaglhjaea17il9tp96tqmg950vjqo.apps.googleusercontent.com">
      <Router>
        <Toaster position="top-right" toastOptions={{ style: { background: '#18181b', color: '#fff' } }} />
        <div className="bg-background text-on-background font-body selection:bg-primary-container selection:text-white min-h-screen">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/events" element={<EventsBrowse />} />
            <Route path="/events/:id" element={<EventDetails />} />
            <Route path="/seat-selection" element={<ProtectedRoute><SeatSelection /></ProtectedRoute>} />
            <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
            <Route path="/booking-confirmed" element={<ProtectedRoute><BookingConfirmed /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
            <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
            <Route path="/my-bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/events" element={<ProtectedRoute adminOnly={true}><ManageEvents /></ProtectedRoute>} />
            <Route path="/admin/events/create" element={<ProtectedRoute adminOnly={true}><CreateEvent /></ProtectedRoute>} />
            <Route path="/admin/events/:id/bookings" element={<ProtectedRoute adminOnly={true}><AdminEventBookings /></ProtectedRoute>} />
            <Route path="/admin/bookings" element={<ProtectedRoute adminOnly={true}><AdminBookings /></ProtectedRoute>} />
          </Routes>
        </div>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
