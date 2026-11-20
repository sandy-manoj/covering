import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Save } from 'lucide-react';
import { getAdminCategories, createAdminCategory, deleteAdminCategory } from '../services/api';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  const fetchCats = () => {
    getAdminCategories().then((res) => setCategories(res.data?.data || [])).catch(console.error);
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const slug = newCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    await createAdminCategory({
      name: newCatName.trim(),
      slug,
      description: newCatDesc.trim(),
      displayOrder: categories.length + 1
    });

    setNewCatName('');
    setNewCatDesc('');
    fetchCats();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete category?')) {
      await deleteAdminCategory(id);
      fetchCats();
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-stone-900">Chain Categories</h1>
        <p className="text-xs text-stone-500 mt-1">Add or remove chain category classifications</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Add Category Form */}
        <form onSubmit={handleAdd} className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4 text-xs h-fit">
          <h3 className="font-serif font-bold text-base text-stone-900">Add New Category</h3>

          <div>
            <label className="font-semibold text-stone-700 block mb-1">Category Name *</label>
            <input
              type="text"
              required
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g. Navaratna Chains"
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg"
            />
          </div>

          <div>
            <label className="font-semibold text-stone-700 block mb-1">Description</label>
            <textarea
              rows={2}
              value={newCatDesc}
              onChange={(e) => setNewCatDesc(e.target.value)}
              placeholder="e.g. Traditional nine precious gem micro gold chains"
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl shadow-md flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </form>

        {/* Existing Categories List */}
        <div className="md:col-span-2 space-y-3">
          {categories.map((c) => (
            <div key={c._id} className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
              <div>
                <h4 className="font-bold text-stone-900 text-sm">{c.name}</h4>
                <p className="text-xs text-stone-500 mt-0.5">{c.description || 'No description'}</p>
                <span className="text-[10px] font-mono text-stone-400 mt-1 block">slug: {c.slug}</span>
              </div>
              <button
                onClick={() => handleDelete(c._id)}
                className="p-2 text-stone-400 hover:text-rose-600 rounded-lg"
                title="Delete category"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;

