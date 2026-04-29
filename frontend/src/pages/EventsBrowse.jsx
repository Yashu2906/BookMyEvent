import { API_BASE_URL } from '../api';
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const EventsBrowse = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedDateFilter, setSelectedDateFilter] = useState('All Dates');
  const [sortBy, setSortBy] = useState('Newest');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        const url = user
          ? `${API_BASE_URL}/api/events?userId=${user.id}`
          : `${API_BASE_URL}/api/events`;

        const eventsRes = await fetch(url);
        if (eventsRes.ok) {
          const allEvents = await eventsRes.json();
          setEvents(allEvents);
          setFilteredEvents(allEvents);
        }
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    let result = [...events];
    if (searchQuery) {
      result = result.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.venue_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (selectedCategory !== 'All') {
      result = result.filter(event => event.category === selectedCategory);
    }
    if (selectedCity !== 'All Cities') {
      result = result.filter(event => event.city === selectedCity);
    }
    if (sortBy === 'Price Low-High') {
      result.sort((a, b) => Number(a.base_price) - Number(b.base_price));
    } else if (sortBy === 'Popularity') {
      result.sort((a, b) => (a.total_capacity - a.available_seats) - (b.total_capacity - b.available_seats));
    } else {
      result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    setFilteredEvents(result);
  }, [searchQuery, selectedCategory, selectedCity, selectedDateFilter, sortBy, events]);

  const categories = ['All', 'Music', 'Technology', 'Festival', 'Sports', 'Classical', 'Comedy'];
  const cities = ['All Cities', ...new Set(events.map(e => e.city))];

  return (
    <div className="flex flex-col min-h-screen bg-[#09090b]">
      <Navbar />

      <main className="pt-28 pb-20 px-6 max-w-7xl mx-auto flex-grow w-full">
        <header className="mb-12">
          <div className="inline-block px-3 py-1 mb-4 bg-red-600/10 border border-red-600/20 rounded-full">
            <span className="text-[8px] font-black tracking-[0.2em] text-red-500 uppercase">BROWSE EVENTS</span>
          </div>
          <h1 className="text-xl md:text-2xl font-black font-headline  mb-8 text-white leading-none uppercase">
            Upcoming <span className="text-red-600">Events</span>
          </h1>
          <div className="relative group max-w-2xl">
            <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-zinc-600 text-sm group-focus-within:text-red-500 transition-colors">search</span>
            <input
              className="w-full pl-14 pr-6 py-4 bg-zinc-900/50 border border-white/5 rounded-2xl focus:ring-1 focus:ring-red-600/50 text-white placeholder:text-zinc-700 font-medium text-xs transition-all outline-none"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        <section className="mb-12 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex gap-2 items-center overflow-x-auto scrollbar-hide w-full md:w-auto">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex-none px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${selectedCategory === cat
                      ? 'bg-red-600 text-white shadow-lg shadow-red-950/20'
                      : 'bg-zinc-900 text-zinc-500 hover:text-white border border-white/5'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="h-px flex-grow bg-white/5 hidden md:block"></div>
            <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto">
              <select
                className="bg-transparent text-[10px] text-zinc-500 font-black uppercase tracking-widest border-none outline-none cursor-pointer hover:text-white transition-colors"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                {cities.map(city => <option key={city} className="bg-zinc-950" value={city}>{city}</option>)}
              </select>
              <select
                className="bg-transparent text-[10px] text-zinc-500 font-black uppercase tracking-widest border-none outline-none cursor-pointer hover:text-white transition-colors"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option className="bg-zinc-950">Newest</option>
                <option className="bg-zinc-950">Price Low-High</option>
                <option className="bg-zinc-950">Popularity</option>
              </select>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-black text-zinc-600 uppercase tracking-[0.2em]">
              {loading ? 'LOADING...' : `${filteredEvents.length} READY`}
            </h3>
            <div className="w-12 h-[2px] bg-red-600/30"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredEvents.map((event) => {
              let dateStr = event.event_date;
              try {
                const d = new Date(event.event_date);
                dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              } catch (e) { }

              return (
                <Link to={`/events/${event.id}`} key={event.id} className="group relative bg-zinc-900 rounded-[2rem] overflow-hidden transition-all duration-500 hover:bg-zinc-800 border border-white/5 active:scale-[0.98]">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      alt={event.title}
                      src={event.image_url || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=2070&auto=format&fit=crop'}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent"></div>
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-zinc-950/60 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-widest border border-white/5 rounded-full">
                        {event.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="max-w-[70%]">
                        <h4 className="text-sm font-black text-white group-hover:text-red-500 transition-colors uppercase tracking-tight truncate leading-none mb-1">
                          {event.title}
                        </h4>
                        <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest truncate">{event.city}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-red-500 tracking-tighter">₹{parseFloat(event.base_price).toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-headline">
                        <span className="material-symbols-outlined text-[10px] text-zinc-700">calendar_today</span>
                        <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">{dateStr}</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-red-600 transition-all shadow-inner">
                        <span className="material-symbols-outlined text-xs text-white">arrow_forward</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="w-full py-12 bg-zinc-950 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="text-xs font-black text-zinc-700 uppercase tracking-[0.4em]">BookMyEvent</span>
          <div className="flex gap-8">
            <a className="text-[9px] font-black text-zinc-600 hover:text-white uppercase tracking-widest transition-colors" href="#">Legal</a>
            <a className="text-[9px] font-black text-zinc-600 hover:text-white uppercase tracking-widest transition-colors" href="#">Support</a>
            <a className="text-[9px] font-black text-zinc-600 hover:text-white uppercase tracking-widest transition-colors" href="#">Help</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EventsBrowse;
