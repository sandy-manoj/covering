import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, Sparkles, Eye, Upload, Check, X } from 'lucide-react';
import { getAdminProducts, createAdminProduct, updateAdminProduct, deleteAdminProduct, getAdminCategories, uploadFile } from '../services/api';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Form Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Form Data
  const initialFormState = {
    name: '',
    productCode: '',
    categoryName: 'Rope & Box Chains',
    description: '',
    type: 'Both', // Buy, Rent, Both
    images: ['/images/products/chain_1.jpg'],
    tryOnImage: '',
    model3dUrl: '',
    price: 1500,
    hasOffer: false,
    offerPrice: 0,
    rental: {
      pricePerDay: 150,
      pricePerWeek: 600,
      deposit: 800,
      isAvailable: true
    },
    specs: {
      length: '22 inches',
      weight: '25 grams',
      thickness: '3.5 mm',
      style: 'Rope',
      plating: '1 Gram 24K Micro Gold Plated'
    },
    customizable: {
      isCustomizable: false,
      extraPrice: 200
    },
    tryOnCalibration: {
      scale: 1.0,
      offsetY: 0,
      offsetX: 0
    },
    stock: 15,
    isActive: true,
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: false
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchProducts = () => {
    setLoading(true);
    getAdminProducts({ search })
      .then((res) => {
        setProducts(res.data?.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
    getAdminCategories().then((res) => setCategories(res.data?.data || [])).catch(console.error);
  }, [search]);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod) => {
    setEditingProduct(prod);
    setFormData({
      ...initialFormState,
      ...prod,
      specs: { ...initialFormState.specs, ...(prod.specs || {}) },
      rental: { ...initialFormState.rental, ...(prod.rental || {}) },
      customizable: { ...initialFormState.customizable, ...(prod.customizable || {}) },
      tryOnCalibration: { ...initialFormState.tryOnCalibration, ...(prod.tryOnCalibration || {}) }
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this chain? This will instantly remove it from the User store.')) {
      await deleteAdminProduct(id);
      fetchProducts();
    }
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await uploadFile(file);
      const fileUrl = res.data?.data?.url;
      if (field === 'images') {
        setFormData((prev) => ({ ...prev, images: [fileUrl, ...prev.images] }));
      } else {
        setFormData((prev) => ({ ...prev, [field]: fileUrl }));
      }
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await updateAdminProduct(editingProduct._id, formData);
      } else {
        await createAdminProduct(formData);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving product');
    }
  };

  return (
    <div className="p-8 space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-stone-900">Product Management</h1>
          <p className="text-xs text-stone-500 mt-1">Changes made here instantly reflect on the customer website</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md flex items-center gap-1.5 transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" /> Add New Chain
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <input
            type="text"
            placeholder="Search by name or product code (e.g. GC-ROPE-01)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:border-amber-500"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
        </div>
        <span className="text-xs text-stone-500 font-medium">{products.length} Products</span>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-4">Chain Product</th>
                <th className="p-4">Code</th>
                <th className="p-4">Type</th>
                <th className="p-4">Price / Offer</th>
                <th className="p-4">Rental Rate</th>
                <th className="p-4">Stock</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {products.map((p) => (
                <tr key={p._id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <img
                      src={p.images?.[0] || '/images/products/chain_1.jpg'}
                      alt={p.name}
                      className="w-12 h-12 rounded-lg object-cover bg-stone-100 shrink-0 border border-stone-200"
                    />
                    <div>
                      <p className="font-bold text-stone-900 line-clamp-1">{p.name}</p>
                      <p className="text-[11px] text-stone-500">{p.categoryName} • {p.specs?.style}</p>
                    </div>
                  </td>
                  <td className="p-4 font-mono font-semibold text-stone-700">{p.productCode}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      p.type === 'Rent' ? 'bg-purple-100 text-purple-800' :
                      p.type === 'Buy' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {p.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-stone-900">
                      ₹{p.hasOffer && p.offerPrice > 0 ? p.offerPrice : p.price}
                    </div>
                    {p.hasOffer && p.offerPrice > 0 && (
                      <div className="text-[10px] text-stone-400 line-through">₹{p.price}</div>
                    )}
                  </td>
                  <td className="p-4 text-stone-700">
                    {p.type !== 'Buy' ? `₹${p.rental?.pricePerDay || 0}/day` : '—'}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.stock <= 3 ? 'bg-rose-100 text-rose-700' : 'bg-stone-100 text-stone-700'}`}>
                      {p.stock} in stock
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 text-stone-500 hover:text-amber-600 rounded-lg hover:bg-stone-100"
                        title="Edit product"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="p-1.5 text-stone-500 hover:text-rose-600 rounded-lg hover:bg-stone-100"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit / Create Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50">
              <h3 className="font-serif font-bold text-lg text-stone-900">
                {editingProduct ? 'Edit Chain Item' : 'Add New Chain Item'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-xs">
              
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="font-bold text-stone-700 block mb-1">Chain Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Product Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.productCode}
                    onChange={(e) => setFormData({ ...formData, productCode: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Category</label>
                  <select
                    value={formData.categoryName}
                    onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c.name}>{c.name}</option>
                    ))}
                    <option value="Rope & Box Chains">Rope & Box Chains</option>
                    <option value="Mugappu Chains">Mugappu Chains</option>
                    <option value="Traditional Chains">Traditional Chains</option>
                    <option value="Bridal Rental Chains">Bridal Rental Chains</option>
                    <option value="Customized Name Chains">Customized Name Chains</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg"
                  >
                    <option value="Both">Both (Buy & Rent)</option>
                    <option value="Buy">Buy Only</option>
                    <option value="Rent">Rent Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg"
                />
              </div>

              {/* Pricing & Offer */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <h4 className="font-bold text-stone-900 text-xs">Pricing & Offer Details</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 block mb-1">Regular Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full p-2 bg-white border border-stone-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 block mb-1">Enable Offer</label>
                    <select
                      value={formData.hasOffer ? 'true' : 'false'}
                      onChange={(e) => setFormData({ ...formData, hasOffer: e.target.value === 'true' })}
                      className="w-full p-2 bg-white border border-stone-200 rounded-lg"
                    >
                      <option value="false">No Offer</option>
                      <option value="true">Yes (Active Offer)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 block mb-1">Offer Price (₹)</label>
                    <input
                      type="number"
                      disabled={!formData.hasOffer}
                      value={formData.offerPrice}
                      onChange={(e) => setFormData({ ...formData, offerPrice: Number(e.target.value) })}
                      className="w-full p-2 bg-white border border-stone-200 rounded-lg disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              {/* Rental Settings */}
              {formData.type !== 'Buy' && (
                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 space-y-3">
                  <h4 className="font-bold text-purple-900 text-xs">Rental Parameters</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-purple-900 block mb-1">Price per Day (₹)</label>
                      <input
                        type="number"
                        value={formData.rental?.pricePerDay || 0}
                        onChange={(e) => setFormData({ ...formData, rental: { ...formData.rental, pricePerDay: Number(e.target.value) } })}
                        className="w-full p-2 bg-white border border-purple-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-purple-900 block mb-1">Price per Week (₹)</label>
                      <input
                        type="number"
                        value={formData.rental?.pricePerWeek || 0}
                        onChange={(e) => setFormData({ ...formData, rental: { ...formData.rental, pricePerWeek: Number(e.target.value) } })}
                        className="w-full p-2 bg-white border border-purple-200 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-purple-900 block mb-1">Refundable Deposit (₹)</label>
                      <input
                        type="number"
                        value={formData.rental?.deposit || 0}
                        onChange={(e) => setFormData({ ...formData, rental: { ...formData.rental, deposit: Number(e.target.value) } })}
                        className="w-full p-2 bg-white border border-purple-200 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Uploads (Main image, Tryon PNG, 3D glb) */}
              <div className="space-y-3">
                <h4 className="font-bold text-stone-900 text-xs">Files & Try-On Calibration</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <label className="text-[11px] font-semibold block mb-1">Main Image URL / Upload</label>
                    <input
                      type="text"
                      value={formData.images[0] || ''}
                      onChange={(e) => setFormData({ ...formData, images: [e.target.value] })}
                      className="w-full p-2 bg-white border border-stone-200 rounded-lg mb-2"
                    />
                    <label className="cursor-pointer text-[10px] text-amber-700 bg-amber-50 px-3 py-1.5 rounded-md border border-amber-200 font-semibold inline-flex items-center gap-1">
                      <Upload className="w-3 h-3" /> Upload Chain Photo
                      <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'images')} className="hidden" />
                    </label>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                    <label className="text-[11px] font-semibold block mb-1">3D .glb File (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. /models/chain.glb"
                      value={formData.model3dUrl || ''}
                      onChange={(e) => setFormData({ ...formData, model3dUrl: e.target.value })}
                      className="w-full p-2 bg-white border border-stone-200 rounded-lg mb-2"
                    />
                    <label className="cursor-pointer text-[10px] text-stone-700 bg-stone-200 px-3 py-1.5 rounded-md font-semibold inline-flex items-center gap-1">
                      <Upload className="w-3 h-3" /> Upload .glb Model
                      <input type="file" accept=".glb,.gltf" onChange={(e) => handleFileUpload(e, 'model3dUrl')} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t border-stone-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md"
                >
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;

