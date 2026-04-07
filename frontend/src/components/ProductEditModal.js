import React, { useState, useEffect } from 'react';
import Select from "react-select";
import { API_BASE_URL } from "./config";

const ProductEditModal = ({ product, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: product.name || '',
    description: product.description || '',
    age_range: product.age_range || '',
    brand_name: product.brand_name || product.brand || '',
    gender: product.gender || '',
    tag_ids: product.tag_ids || [],
    customized: product.customized || 0,
    category_id: product.category_id || product.category_id || null,
    subcategory_id: product.subcategory_id || null,
    mrp: product.mrp != null ? Number(product.mrp) : '',
    price: product.price != null ? Number(product.price) : '',
    discount: product.discount != null ? Number(product.discount) : 0
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tags, setTags] = useState([]);
  const [tagsLoading, setTagsLoading] = useState(true);

  // Categories for editing category
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Fetch available tags & categories
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/tags`);
        const data = await res.json();
        if (data.success) {
          setTags(data.tags || []);
        }
      } catch (err) {
        console.error('Error fetching tags:', err);
      } finally {
        setTagsLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/categories`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setCategories(data || []);
        } else if (data.success && data.length !== undefined) {
          setCategories(data || []);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setCategoriesLoading(false);
      }
    };

    const fetchSubcategories = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/subcategories`);
    const data = await res.json();

    if (data.success) {
      setSubcategories(data.subcategories || []);
    } else if (Array.isArray(data)) {
      setSubcategories(data);
    }
  } catch (err) {
    console.error("Error fetching subcategories:", err);
  }
};


    fetchTags();
    fetchCategories();
    fetchSubcategories(); 
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const next = { ...prev };

      // Handle numeric fields
      if (name === 'mrp' || name === 'price' || name === 'discount') {
        const num = value === '' ? '' : Number(value);
        next[name] = value === '' ? '' : (isNaN(num) ? prev[name] : num);
      } else if (name === 'customized') {
        next[name] = parseInt(value, 10);
      } else {
        next[name] = value;
      }

      // Recalculate relationships
      const mrpVal = next.mrp !== '' && next.mrp != null ? Number(next.mrp) : null;
      const priceVal = next.price !== '' && next.price != null ? Number(next.price) : null;
      const discVal = next.discount !== '' && next.discount != null ? Number(next.discount) : null;

      // If user changed mrp or price, compute discount
      if (name === 'mrp' || name === 'price') {
        if (mrpVal && priceVal != null && !isNaN(mrpVal) && mrpVal > 0) {
          next.discount = parseFloat((((mrpVal - priceVal) / mrpVal) * 100).toFixed(2));
        }
      }

      // If user changed discount, compute price from mrp (if mrp available)
      if (name === 'discount') {
        if (mrpVal && discVal != null && !isNaN(discVal)) {
          const p = parseFloat((mrpVal * (1 - discVal / 100)).toFixed(2));
          next.price = p;
        }
      }

      return next;
    });
    setError('');
  };

  const handleTagChange = (tagId) => {
    setFormData((prev) => {
      const currentTags = prev.tag_ids || [];
      const isSelected = currentTags.includes(tagId);
      const updatedTags = isSelected
        ? currentTags.filter(id => id !== tagId)
        : [...currentTags, tagId];
      return {
        ...prev,
        tag_ids: updatedTags,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Get admin token - check multiple possible storage locations
      let authToken = localStorage.getItem('adminToken');
      console.log('🔍 Checking adminToken:', authToken); // Debug
      
      // If no adminToken, try getting token from regular user login
      if (!authToken) {
        authToken = localStorage.getItem('token');
        console.log('🔍 Checking token:', authToken); // Debug
      }
      
      // Also check for token in session storage as backup
      if (!authToken) {
        authToken = sessionStorage.getItem('token');
        console.log('🔍 Checking sessionStorage token:', authToken); // Debug
      }
      
      if (!authToken) {
        console.error('❌ No token found in any storage'); // Debug
        throw new Error('Admin authentication required. Please login as admin first.');
      }

      console.log('✅ Using token for request'); // Debug
      // Ensure customized, category_id, and subcategory_id are sent as numbers
      const dataToSend = {
        ...formData,
        customized: parseInt(formData.customized, 10),
        category_id: formData.category_id ? parseInt(formData.category_id, 10) : null,
        subcategory_id: formData.subcategory_id ? parseInt(formData.subcategory_id, 10) : null,
      };
      const response = await fetch(
        `${API_BASE_URL}/api/products/${product.id}/details`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify(dataToSend),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Admin login required. Please login as admin to edit products.');
        }
        throw new Error(data.message || 'Failed to update product');
      }

      // Call onSave with updated product data
      onSave({ ...product, ...formData });
      onClose();
    } catch (err) {
      setError(err.message || 'An error occurred while updating the product');
      console.error('Update error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-[0_8px_24px_rgba(0,0,0,0.15)] animate-[slideIn_0.3s_ease-out]" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
          <h2 className="text-xl font-semibold text-slate-900 sm:text-[22px]">Edit Product Details</h2>
          <button className="flex h-8 w-8 items-center justify-center rounded-full border-0 text-3xl leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" onClick={onClose}>&times;</button>
        </div>

        {error && <div className="mx-5 mt-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:mx-6">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-semibold text-slate-700">Product Name *</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="Enter product name" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
          </div>

          <div className="space-y-2">
            <label htmlFor="brand_name" className="block text-sm font-semibold text-slate-700">Brand Name</label>
            <input type="text" id="brand_name" name="brand_name" value={formData.brand_name} onChange={handleChange} placeholder="Enter brand name" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="age_range" className="block text-sm font-semibold text-slate-700">Age Range</label>
              <input type="text" id="age_range" name="age_range" value={formData.age_range} onChange={handleChange} placeholder="e.g., 3-8 years" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
            </div>

            <div className="space-y-2">
              <label htmlFor="gender" className="block text-sm font-semibold text-slate-700">Gender</label>
              <select id="gender" name="gender" value={formData.gender} onChange={handleChange} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
                <option value="">Select Gender</option>
                <option value="Boys">Boys</option>
                <option value="Girls">Girls</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label htmlFor="customized" className="block text-sm font-semibold text-slate-700">Customized Product</label>
              <select id="customized" name="customized" value={formData.customized} onChange={handleChange} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
                <option value="0">No - Regular Product (0)</option>
                <option value="1">Yes - Add to Customized Products (1)</option>
              </select>
              <p className="mt-1 text-xs text-slate-500">💡 Select "Yes" to add this product to the Customized Products section</p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Tags / Characters & Themes</label>
            {tagsLoading ? (
              <p className="text-sm text-slate-400">Loading tags...</p>
            ) : (
              <Select
                isMulti
                options={tags.map(tag => ({ value: tag.id, label: tag.name }))}
                value={tags.filter(tag => formData.tag_ids.includes(tag.id)).map(tag => ({ value: tag.id, label: tag.name }))}
                onChange={(selectedOptions) =>
                  setFormData(prev => ({
                    ...prev,
                    tag_ids: selectedOptions ? selectedOptions.map(opt => opt.value) : []
                  }))
                }
                placeholder="Select tags..."
                classNamePrefix="react-select"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    borderColor: state.isFocused ? '#3b82f6' : '#e2e8f0',
                    boxShadow: state.isFocused ? '0 0 0 4px rgba(219,234,254,1)' : 'none',
                    minHeight: '44px',
                    borderRadius: '0.5rem',
                  }),
                  multiValue: (base) => ({ ...base, backgroundColor: '#eff6ff', borderRadius: '9999px' }),
                  multiValueLabel: (base) => ({ ...base, color: '#1f2937', fontSize: '13px' }),
                  multiValueRemove: (base) => ({ ...base, borderRadius: '9999px' }),
                }}
              />
            )}
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="category_id" className="block text-sm font-semibold text-slate-700">Category</label>
              {categoriesLoading ? (
                <p className="text-sm text-slate-400">Loading categories...</p>
              ) : (
                <select id="category_id" name="category_id" value={formData.category_id || ""} onChange={(e) => setFormData((prev) => ({ ...prev, category_id: e.target.value ? parseInt(e.target.value, 10) : null, subcategory_id: null }))} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100">
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id || c.sno} value={c.id || c.sno}>{c.name || c.category_name}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="subcategory_id" className="block text-sm font-semibold text-slate-700">Sub Category</label>
              <select id="subcategory_id" name="subcategory_id" value={formData.subcategory_id || ""} onChange={(e) => setFormData((prev) => ({ ...prev, subcategory_id: e.target.value ? parseInt(e.target.value, 10) : null }))} disabled={!formData.category_id} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100">
                <option value="">{formData.category_id ? 'Select sub category' : 'Select category first'}</option>
                {subcategories.filter((sub) => String(sub.category_id) === String(formData.category_id)).map((sub) => (
                  <option key={sub.id || sub.sno} value={sub.id || sub.sno}>{sub.subcategory_name || sub.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="mrp" className="block text-sm font-semibold text-slate-700">MRP (₹)</label>
              <input type="number" id="mrp" name="mrp" min="0" step="0.01" value={formData.mrp} onChange={handleChange} placeholder="Enter MRP" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
            </div>

            <div className="space-y-2">
              <label htmlFor="price" className="block text-sm font-semibold text-slate-700">Price (₹)</label>
              <input type="number" id="price" name="price" min="0" step="0.01" value={formData.price} onChange={handleChange} placeholder="Enter selling price" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
            </div>

            <div className="space-y-2">
              <label htmlFor="discount" className="block text-sm font-semibold text-slate-700">Discount (%)</label>
              <input type="number" id="discount" name="discount" min="0" max="100" step="0.01" value={formData.discount} onChange={handleChange} placeholder="Enter discount percentage" className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" />
            </div>
          </div>

          <div className="sticky bottom-0 flex flex-col gap-3 border-t border-slate-200 bg-white pt-4 sm:flex-row sm:justify-end">
            <button type="button" className="rounded-lg border border-slate-200 bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 hover:shadow-[0_4px_12px_rgba(40,116,240,0.3)] disabled:cursor-not-allowed disabled:opacity-60" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductEditModal;
