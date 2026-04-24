import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AdminSidebar from '../components/AdminSidebar';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Music',
    event_date: '',
    venue_name: '',
    city: '',
    address: '',
    base_price: '',
    total_capacity: '',
    image_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDz1-M4cP3SrlbUS_FPZ2nWZYROmitHWR1I5TbEsjKNvIw9i1ilcT5hvG6p2sAowDiR10yuAV5K6luo7oOpgsqzwLDItIbbzw721NjRYawVutP_t55oNuK8fHRr-IblVl-TRJWvX-rfnhCH11zliZE9tv1czmCWFHJes1EJKFa8aualh9j2obOmd6rEPYF41oaZa-LC97NRFm7RekujNXJ3gbjPgOJjEPXUYFfPBIZ6pdDP7A12u0kQaQllfgYiXzXZ-94zBWU7OfG_',
    status: 'published'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Admin authorization required');
      setLoading(false);
      return;
    }

    let finalImageUrl = formData.image_url;

    try {
      // If a file is selected, upload it first
      if (imageFile) {
        setUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append('image', imageFile);

        const uploadRes = await fetch('http://localhost:5000/api/upload', {
          method: 'POST',
          body: uploadFormData
        });

        if (!uploadRes.ok) throw new Error('Image upload failed');
        const uploadData = await uploadRes.json();
        finalImageUrl = uploadData.imageUrl;
      }

      const response = await fetch('http://localhost:5000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          image_url: finalImageUrl,
          available_seats: formData.total_capacity
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Creation failed');

      toast.success('Event Published successfully!');
      navigate('/admin/events');
    } catch (err) {
      toast.error(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex overflow-hidden font-body selection:bg-primary-container selection:text-white">
      <AdminSidebar />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="flex justify-between items-center px-8 sticky top-0 z-40 w-full bg-zinc-950/70 backdrop-blur-xl h-16">
          <div className="text-white font-headline font-bold">Admin / Create Event</div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-black tracking-widest mb-4 leading-none font-headline text-white uppercase">Create Event</h2>
            {error && <p className="mb-6 p-4 bg-red-600/10 text-red-600 rounded-xl text-sm border border-red-600/20">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-8 pb-24">
              <div className="bg-surface-container-low p-8 rounded-3xl space-y-6">
                <div className="space-y-2">
                  <label className="text-base font-bold uppercase tracking-widest text-zinc-500">Event Title</label>
                  <input required name="title" value={formData.title} onChange={handleChange} className="w-full bg-surface-container-highest border-none outline-none rounded-2xl p-4 text-xl font-headline font-semibold text-white placeholder:text-zinc-600 focus:ring-1 focus:ring-red-600" placeholder="e.g. Midnight Symphony 2024" type="text" />
                </div>

                <div className="space-y-2">
                  <label className="text-base font-bold uppercase tracking-widest text-zinc-500">Description</label>
                  <textarea required name="description" value={formData.description} onChange={handleChange} className="w-full bg-surface-container-highest border-none outline-none rounded-2xl p-4 text-white placeholder:text-zinc-600 resize-none focus:ring-1 focus:ring-red-600 font-body" placeholder="Describe the atmosphere..." rows="5"></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-base font-bold uppercase tracking-widest text-zinc-500">Category</label>
                    <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-surface-container-highest border-none outline-none rounded-2xl p-4 text-white focus:ring-1 focus:ring-red-600 appearance-none font-bold">
                      <option value="Music">Music</option>
                      <option value="Technology">Technology</option>
                      <option value="Festival">Festival</option>
                      <option value="Sports">Sports</option>
                      <option value="Classical">Classical</option>
                      <option value="Comedy">Comedy</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-base font-bold uppercase tracking-widest text-zinc-500">Date & Time</label>
                    <input required name="event_date" value={formData.event_date} onChange={handleChange} className="w-full bg-surface-container-highest border-none outline-none rounded-2xl p-4 text-white focus:ring-1 focus:ring-red-600" type="datetime-local" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-base font-bold uppercase tracking-widest text-zinc-500">Venue Name</label>
                    <input required name="venue_name" value={formData.venue_name} onChange={handleChange} className="w-full bg-surface-container-highest border-none outline-none rounded-2xl p-4 text-white focus:ring-1 focus:ring-red-600" placeholder="Stadium / Arena" type="text" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-base font-bold uppercase tracking-widest text-zinc-500">City</label>
                    <input required name="city" value={formData.city} onChange={handleChange} className="w-full bg-surface-container-highest border-none outline-none rounded-2xl p-4 text-white focus:ring-1 focus:ring-red-600" placeholder="Mumbai / London" type="text" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-base font-bold uppercase tracking-widest text-zinc-500">Address</label>
                  <input required name="address" value={formData.address} onChange={handleChange} className="w-full bg-surface-container-highest border-none outline-none rounded-2xl p-4 text-white focus:ring-1 focus:ring-red-600" placeholder="Full street address..." type="text" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-base font-bold uppercase tracking-widest text-zinc-500">Base Price (₹)</label>
                    <input required name="base_price" value={formData.base_price} onChange={handleChange} className="w-full bg-surface-container-highest border-none outline-none rounded-2xl p-4 text-white focus:ring-1 focus:ring-red-600 font-mono" placeholder="45.00" type="number" step="0.01" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-base font-bold uppercase tracking-widest text-zinc-500">Total Capacity</label>
                    <input required name="total_capacity" value={formData.total_capacity} onChange={handleChange} className="w-full bg-surface-container-highest border-none outline-none rounded-2xl p-4 text-white focus:ring-1 focus:ring-red-600 font-mono" placeholder="500" type="number" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="text-base font-bold uppercase tracking-widest text-zinc-500">Event Image</label>
                    <div className="flex flex-col gap-4">
                      <div className="relative group/upload h-32 rounded-2xl bg-zinc-800/50 border-2 border-dashed border-white/5 flex items-center justify-center hover:border-red-600/30 transition-all overflow-hidden">
                        {imageFile ? (
                          <div className="text-center">
                            <span className="material-symbols-outlined text-red-500 block">check_circle</span>
                            <span className="text-sm text-zinc-300 font-bold uppercase">{imageFile.name}</span>
                          </div>
                        ) : (
                          <div className="text-center opacity-40">
                            <span className="material-symbols-outlined block">upload_file</span>
                            <span className="text-base font-black uppercase">Upload Image</span>
                          </div>
                        )}
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => setImageFile(e.target.files[0])}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                      <p className="text-sm text-zinc-600 font-bold uppercase">Or provide URL below</p>
                      <input name="image_url" value={formData.image_url} onChange={handleChange} className="w-full bg-surface-container-highest border-none outline-none rounded-2xl p-4 text-sm text-zinc-400 focus:ring-1 focus:ring-red-600 font-mono" placeholder="https://..." type="text" />
                    </div>
                  </div>
                </div>

                <button disabled={loading || uploading} type="submit" className="w-full bg-gradient-to-br from-primary-container to-secondary-container text-white py-5 rounded-2xl font-black text-base uppercase tracking-[0.2em] shadow-2xl shadow-red-900/40 hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50">
                  {loading || uploading ? (uploading ? 'UPLOADING...' : 'CREATING...') : 'CREATE EVENT'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateEvent;
