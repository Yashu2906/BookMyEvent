import React from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <>
      <Navbar />
      <main className="pt-0">
        {/* Hero Section */}
        <section className="relative min-h-[700px] md:h-[870px] w-full overflow-hidden flex items-center">
          <div className="absolute inset-0 z-0">
            <img className="w-full h-full object-cover" alt="concert" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDopywfwqtb7YSVAeko_YDXGAmZzNO6yFtyb592C2ACzEZp_DjMIbmJ0XR93CS2VlrYVJO6UBqMRzn8LGPit8DEQDwPHCRDMEcRLEG2eAo_qDxsf5-caIX2ArR33kMxm2M0yhuCbvRO8-E8rJzSrH_5sHwoMrkjOfnxA6v72pdTiqj5gffTY6ADudzYKDc3TjD8WSdkR47_2f4_-ySSx9I19cfJEASHYrwhlDexulOVX2fK675gIgghv_MQWOvu8tmEHWT5fINUowpd"/>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/20 to-transparent"></div>
          </div>
          <div className="relative z-10 w-full px-6 md:px-16 max-w-7xl mx-auto pt-20 pb-12">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary-container/20 border border-primary-container/30 text-red-500 text-[10px] md:text-xs font-bold tracking-widest mb-6 w-fit uppercase">
              🔥 INDIA'S #1 EVENT PLATFORM
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black font-headline text-white leading-[1.1] md:leading-[1] tracking-tighter mb-6 max-w-4xl uppercase">
              Discover & <br className="hidden md:block" />Book <span className="text-red-600">Live</span> Events
            </h1>
            <p className="text-zinc-400 text-sm md:text-lg max-w-xl mb-10 font-medium leading-relaxed opacity-90 tracking-wide">
              From underground techno basements to grand arena world tours. Experience the pulse of your city with curated live performances.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/events" className="px-10 py-5 rounded-full bg-red-600 text-white font-black text-sm md:text-base uppercase tracking-[0.2em] hover:bg-red-500 transition-all shadow-xl shadow-red-950/20 text-center">
                Explore Events
              </Link>
              {!localStorage.getItem('user') && (
                <Link to="/login" className="px-10 py-5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-white font-black text-sm md:text-base uppercase tracking-[0.2em] hover:bg-white/10 transition-all text-center">
                  Sign Up Free
                </Link>
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Home;
