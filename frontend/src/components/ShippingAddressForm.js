import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from "./config";
const ShippingAddressForm = ({ userId, initialData = null, onSaved, onCancel }) => {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    street_address: '',
    city: '',
    state: '',
    zip_code: '',
    country: '',
    is_default: false
  });

  useEffect(() => {
    if (initialData) setForm({ ...initialData });
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const API_BASE = process.env.REACT_APP_API_BASE || `${API_BASE_URL}`;
      const payload = { ...form, user_id: userId };
      console.log('[shipping UI] submit payload=', payload);
      if (initialData && initialData.id) {
        // update
        const url = `${API_BASE}/api/shipping-addresses/${initialData.id}`;
        console.log('[shipping UI] update ->', url);
        const res = await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });
        console.log('[shipping UI] update status=', res.status);
        const data = await res.json();
        console.log('[shipping UI] update response=', data);
        if (data.success) onSaved(data.address);
        else alert('Failed to update: ' + (data.message || JSON.stringify(data)));
      } else {
        // create
        const url = `${API_BASE}/api/shipping-addresses`;
        console.log('[shipping UI] create ->', url);
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });
        console.log('[shipping UI] create status=', res.status);
        const data = await res.json();
        console.log('[shipping UI] create response=', data);
        if (data.success) onSaved(data.address);
        else alert('Failed to create: ' + (data.message || JSON.stringify(data)));
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save address');
    }
  };

  return (
    <form className="flex flex-col gap-4 rounded-2xl border border-amber-100 bg-white p-4 shadow-sm sm:p-6 lg:p-8" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <input
          name="first_name"
          placeholder="First name"
          value={form.first_name}
          onChange={handleChange}
          required
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-100"
        />
        <input
          name="last_name"
          placeholder="Last name"
          value={form.last_name}
          onChange={handleChange}
          required
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-100"
        />
      </div>
      <input
        name="email"
        placeholder="Email (optional)"
        value={form.email}
        onChange={handleChange}
        className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-100"
      />
      <input
        name="phone"
        placeholder="Phone"
        value={form.phone}
        onChange={handleChange}
        required
        className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-100"
      />
      <textarea
        name="street_address"
        placeholder="Street address"
        value={form.street_address}
        onChange={handleChange}
        required
        className="min-h-24 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-100"
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <input
          name="city"
          placeholder="City"
          value={form.city}
          onChange={handleChange}
          required
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-100"
        />
        <input
          name="state"
          placeholder="State"
          value={form.state}
          onChange={handleChange}
          required
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-100"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <input
          name="zip_code"
          placeholder="ZIP / Pincode"
          value={form.zip_code}
          onChange={handleChange}
          required
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-100"
        />
        <input
          name="country"
          placeholder="Country"
          value={form.country}
          onChange={handleChange}
          required
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-500 focus:bg-white focus:ring-4 focus:ring-rose-100"
        />
      </div>
      <label className="flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-medium text-slate-700">
        <input
          type="checkbox"
          name="is_default"
          checked={form.is_default}
          onChange={handleChange}
          className="h-5 w-5 cursor-pointer accent-rose-500"
        />
        Set as default
      </label>

      <div className="flex flex-col-reverse gap-3 border-t border-amber-100 pt-4 sm:flex-row sm:justify-end">
        <button
          type="submit"
          className="rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-rose-200 transition hover:-translate-y-0.5 hover:from-rose-600 hover:to-pink-700"
        >
          Save
        </button>
        <button
          type="button"
          className="rounded-xl border border-amber-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ShippingAddressForm;
