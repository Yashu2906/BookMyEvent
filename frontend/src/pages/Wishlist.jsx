import { API_BASE_URL } from '../api';
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const Wishlist = () => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (user) {
            fetchWishlist();
        } else {
            setLoading(false);
        }
    }, []);

    const fetchWishlist = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/wishlist`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setWishlist(data);
            }
        } catch (error) {
            console.error(' Error fetching wishlist:', error);
            toast.error('Failed to load wishlist');
        } finally {
            setLoading(false);
        }
    };

    const removeFromWishlist = async (eventId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/wishlist/remove/${eventId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                setWishlist(wishlist.filter(item => item.id !== eventId));
                toast.success('Removed from wishlist');
            }
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            toast.error('Failed to remove from wishlist');
        }
    };

    if (!user) {
        return (
            <>
                <Navbar />
                <div className="pt-32 pb-24 px-8 min-h-screen flex flex-col items-center justify-center text-center">
                    <h2 className="text-3xl font-bold mb-4">Please log in to view your wishlist</h2>
                    <Link to="/login" className="px-8 py-3 bg-red-600 text-white rounded-xl font-bold">Log In</Link>
                </div>
            </>
        );
    }

    return (
        <div className="bg-background text-on-surface min-h-screen selection:bg-primary-container selection:text-white">
            <Navbar />
            <main className="pt-32 pb-24 px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header Section */}
                    <header className="mb-10 md:mb-16">
                        <p className="text-red-500 font-black tracking-[0.3em] text-[10px] md:text-sm mb-2 font-headline uppercase leading-none opacity-50">SAVED EXPERIENCES</p>
                        <h1 className="text-3xl md:text-3xl font-black text-white font-headline leading-none uppercase">My <span className="text-red-600">Wishlist</span></h1>
                    </header>

                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {wishlist.length === 0 ? (
                                <div className="col-span-full py-20 text-center border border-dashed border-zinc-800 rounded-3xl">
                                    <span className="material-symbols-outlined text-6xl text-zinc-700 mb-4">favorite_border</span>
                                    <h3 className="text-2xl font-bold text-zinc-400 mb-2">Your wishlist is empty</h3>
                                    <p className="text-zinc-500 mb-8">Start exploring and save events you love!</p>
                                    <Link to="/events" className="text-red-600 font-bold hover:underline">Browse Events</Link>
                                </div>
                            ) : (
                                wishlist.map((event) => {
                                    let dateStr = event.event_date;
                                    try {
                                        const d = new Date(event.event_date);
                                        dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                                    } catch (e) { }

                                    return (
                                        <div key={event.id} className="group relative bg-surface-container-low rounded-2xl overflow-hidden transition-all duration-300 hover:bg-surface-container-high hover:-translate-y-1">
                                            <div className="aspect-[3/4] relative overflow-hidden">
                                                <img
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                    alt={event.title}
                                                    src={event.image_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDiXERkxDgl1W0VM9bnF15evSINvo2h1356xXVuNseXw8D37cnXJhWXRIsONVZR7xVw3OP0hk1OIFyjHiW3YDOetVnq2Im9t3s_vReXPL0EEPPaOOI0peya5-bKK-8gktr8OcFUHSyAicOWrsH3y-ZqGRe7pbqnsJ175zPTYv-nrckcb9oRpPZlBJjkvjyf4t9YIMp10-icUBE2S9BZg_IPERynDqMgkAuF4-GlIaqOPflJ6sbo6DV6R5SaNUYOCeMFQdY2Dcq7ZOjp'}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-80"></div>
                                                <button
                                                    onClick={() => removeFromWishlist(event.id)}
                                                    className="absolute top-4 right-4 z-10 p-2 bg-zinc-950/40 backdrop-blur-md rounded-full group/heart overflow-visible"
                                                    title="Remove from Wishlist"
                                                >
                                                    <span className="material-symbols-outlined text-red-600 transition-transform group-hover/heart:scale-110" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
                                                </button>
                                            </div>
                                            <div className="p-6">
                                                <p className="text-primary-container font-bold text-xs mb-1 font-headline tracking-wide uppercase">{event.category}</p>
                                                <h3 className="text-xl font-bold text-zinc-100 leading-tight mb-4 font-headline">{event.title}</h3>
                                                <div className="flex items-center gap-4 text-zinc-400 text-xs">
                                                    <div className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-sm">calendar_today</span>
                                                        <span>{dateStr}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-sm">location_on</span>
                                                        <span>{event.city}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="absolute bottom-4 left-6 right-6 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                                                <Link to={`/events/${event.id}`}>
                                                    <button className="w-full py-3 bg-gradient-to-r from-primary-container to-secondary-container rounded-xl font-bold text-sm text-white">View Details</button>
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })
                            )}

                            {wishlist.length > 0 && (
                                <div className="group relative bg-surface-container-lowest border border-dashed border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-center p-8 transition-colors hover:border-red-600/30">
                                    <span className="material-symbols-outlined text-5xl text-zinc-800 group-hover:text-red-900/30 mb-4 transition-colors">add_circle</span>
                                    <h4 className="text-zinc-600 font-bold mb-2">Discover More</h4>
                                    <p className="text-zinc-700 text-sm mb-6">Keep exploring the stage and find your next favorite experience.</p>
                                    <Link className="text-red-600 font-bold text-sm hover:underline" to="/events">Browse Events</Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
            {/* Footer */}
            <footer className="bg-zinc-950 w-full py-12 px-8 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-zinc-900/50">
                <div className="flex flex-col items-center md:items-start gap-4">
                    <span className="text-lg font-black text-zinc-100 font-headline">BookMyEvent</span>
                    <p className="text-zinc-500 font-inter text-sm">© 2024 BookMyEvent. The Nocturnal Stage.</p>
                </div>
                <div className="flex gap-8">
                    <a className="text-zinc-500 font-inter text-sm hover:text-red-500 transition-colors" href="#">Privacy Policy</a>
                    <a className="text-zinc-500 font-inter text-sm hover:text-red-500 transition-colors" href="#">Terms of Service</a>
                    <a className="text-zinc-500 font-inter text-sm hover:text-red-500 transition-colors" href="#">Help Center</a>
                </div>
            </footer>
        </div>
    );
};

export default Wishlist;
