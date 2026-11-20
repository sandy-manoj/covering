import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { getAdminBanners, createAdminBanner, deleteAdminBanner } from '../services/api';

const BannersPage = () => {
  const [banners, setBanners] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    badge: 'NEW COLLECTION',
    image: '/images/products/chain_1.jpg',
    linkUrl: '/shop',
    buttonText: 'Shop All Chains'
  });

  const fetchBanners = () => {
    getAdminBanners().then((res) => setBanners(res.data?.data || [])).catch(console.error);
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await createAdminBanner(formData);
    setFormData({
      title: '',
      subtitle: '',
      badge: 'NEW COLLECTION',
      image: '/images/products/chain_1.jpg',
      linkUrl: '/shop',
      buttonText: 'Shop All Chains'
    });
    fetchBanners();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete banner?')) {
      await deleteAdminBanner(id);
      fetchBanners();
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-stone-900">Homepage Banners</h1>
        <p className="text-xs text-stone-500 mt-1">Configure promotional hero banners on the user homepage</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Add Banner Form */}
        <form onSubmit={handleAdd} className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4 text-xs h-fit">
          <h3 className="font-serif font-bold text-base text-stone-900">Add Hero Banner</h3>

          <div>
            <label className="font-semibold text-stone-700 block mb-1">Badge Text</label>
            <input
              type="text"
              value={formData.badge}
              onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg"
            />
          </div>

          <div>
            <label className="font-semibold text-stone-700 block mb-1">Banner Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg"
            />
          </div>

          <div>
            <label className="font-semibold text-stone-700 block mb-1">Subtitle</label>
            <textarea
              rows={2}
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg"
            />
          </div>

          <div>
            <label className="font-semibold text-stone-700 block mb-1">Banner Image URL</label>
            <input
              type="text"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl shadow-md flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Save Banner
          </button>
        </form>

        {/* Existing Banners List */}
        <div className="md:col-span-2 space-y-4">
          {banners.map((b) => (
            <div key={b._id} className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden flex flex-col sm:flex-row">
              <img
                src={b.image}
                alt={b.title}
                className="w-full sm:w-48 h-32 object-cover bg-stone-100 shrink-0"
              />
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                    {b.badge}
                  </span>
                  <h4 className="font-serif font-bold text-stone-900 text-sm mt-1">{b.title}</h4>
                  <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">{b.subtitle}</p>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-stone-400">Link: {b.linkUrl}</span>
                  <button
                    onClick={() => handleDelete(b._id)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                    title="Delete banner"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BannersPage;

