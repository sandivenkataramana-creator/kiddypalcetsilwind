import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from "./config";

const AddressForm = ({ userId, editingAddressId, addresses, onAddressAdded, onAddressUpdated, onCancel }) => {
  const API_BASE = process.env.REACT_APP_API_BASE || `${API_BASE_URL}`;
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    isDefault: false
  });
  const [errors, setErrors] = useState({});

  // Load existing address if editing
  useEffect(() => {
    if (editingAddressId) {
      const addressToEdit = addresses.find(a => a.id === editingAddressId);
      if (addressToEdit) {
        setFormData({
          firstName: addressToEdit.first_name,
          lastName: addressToEdit.last_name,
          email: addressToEdit.email || '',
          phone: addressToEdit.phone,
          streetAddress: addressToEdit.street_address,
          city: addressToEdit.city,
          state: addressToEdit.state,
          zipCode: addressToEdit.zip_code,
          country: addressToEdit.country,
          isDefault: addressToEdit.is_default === 1
        });
      }
    }
  }, [editingAddressId, addresses]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
    if (!/^[0-9\-\+\(\)\s]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Invalid phone number';
    }
    if (!formData.streetAddress.trim()) newErrors.streetAddress = 'Street address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'Zip code is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        user_id: userId,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        street_address: formData.streetAddress,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zipCode,
        country: formData.country,
        is_default: formData.isDefault
      };

      let response;
      if (editingAddressId) {
        response = await fetch(`${API_BASE}/api/shipping-addresses/${editingAddressId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch(`${API_BASE}/api/shipping-addresses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload)
        });
      }

      const data = await response.json();
      if (data.success) {
        if (editingAddressId) {
          onAddressUpdated(data.address);
        } else {
          onAddressAdded(data.address);
        }
      } else {
        setErrors({ submit: data.message || 'Failed to save address' });
      }
    } catch (err) {
      console.error('[AddressForm] Submit error:', err);
      setErrors({ submit: 'Failed to save address. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
      {errors.submit && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {errors.submit}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="firstName" className="text-sm font-semibold text-slate-900">
            First Name *
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Enter first name"
            className={`rounded-lg border px-3 py-3 text-sm outline-none transition focus:ring-4 ${
              errors.firstName
                ? 'border-rose-400 bg-rose-50 focus:border-rose-500 focus:ring-rose-100'
                : 'border-slate-200 bg-white focus:border-rose-500 focus:ring-rose-100'
            }`}
          />
          {errors.firstName && <span className="text-sm text-rose-600">{errors.firstName}</span>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="lastName" className="text-sm font-semibold text-slate-900">
            Last Name *
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Enter last name"
            className={`rounded-lg border px-3 py-3 text-sm outline-none transition focus:ring-4 ${
              errors.lastName
                ? 'border-rose-400 bg-rose-50 focus:border-rose-500 focus:ring-rose-100'
                : 'border-slate-200 bg-white focus:border-rose-500 focus:ring-rose-100'
            }`}
          />
          {errors.lastName && <span className="text-sm text-rose-600">{errors.lastName}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-semibold text-slate-900">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email"
            className={`rounded-lg border px-3 py-3 text-sm outline-none transition focus:ring-4 ${
              errors.email
                ? 'border-rose-400 bg-rose-50 focus:border-rose-500 focus:ring-rose-100'
                : 'border-slate-200 bg-white focus:border-rose-500 focus:ring-rose-100'
            }`}
          />
          {errors.email && <span className="text-sm text-rose-600">{errors.email}</span>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="phone" className="text-sm font-semibold text-slate-900">
            Phone *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter phone number"
            className={`rounded-lg border px-3 py-3 text-sm outline-none transition focus:ring-4 ${
              errors.phone
                ? 'border-rose-400 bg-rose-50 focus:border-rose-500 focus:ring-rose-100'
                : 'border-slate-200 bg-white focus:border-rose-500 focus:ring-rose-100'
            }`}
          />
          {errors.phone && <span className="text-sm text-rose-600">{errors.phone}</span>}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="streetAddress" className="text-sm font-semibold text-slate-900">
          Street Address *
        </label>
        <input
          type="text"
          id="streetAddress"
          name="streetAddress"
          value={formData.streetAddress}
          onChange={handleChange}
          placeholder="Enter street address"
          className={`rounded-lg border px-3 py-3 text-sm outline-none transition focus:ring-4 ${
            errors.streetAddress
              ? 'border-rose-400 bg-rose-50 focus:border-rose-500 focus:ring-rose-100'
              : 'border-slate-200 bg-white focus:border-rose-500 focus:ring-rose-100'
          }`}
        />
        {errors.streetAddress && <span className="text-sm text-rose-600">{errors.streetAddress}</span>}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="city" className="text-sm font-semibold text-slate-900">
            City *
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Enter city"
            className={`rounded-lg border px-3 py-3 text-sm outline-none transition focus:ring-4 ${
              errors.city
                ? 'border-rose-400 bg-rose-50 focus:border-rose-500 focus:ring-rose-100'
                : 'border-slate-200 bg-white focus:border-rose-500 focus:ring-rose-100'
            }`}
          />
          {errors.city && <span className="text-sm text-rose-600">{errors.city}</span>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="state" className="text-sm font-semibold text-slate-900">
            State/Province *
          </label>
          <input
            type="text"
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="Enter state"
            className={`rounded-lg border px-3 py-3 text-sm outline-none transition focus:ring-4 ${
              errors.state
                ? 'border-rose-400 bg-rose-50 focus:border-rose-500 focus:ring-rose-100'
                : 'border-slate-200 bg-white focus:border-rose-500 focus:ring-rose-100'
            }`}
          />
          {errors.state && <span className="text-sm text-rose-600">{errors.state}</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="zipCode" className="text-sm font-semibold text-slate-900">
            Zip Code *
          </label>
          <input
            type="text"
            id="zipCode"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            placeholder="Enter zip code"
            className={`rounded-lg border px-3 py-3 text-sm outline-none transition focus:ring-4 ${
              errors.zipCode
                ? 'border-rose-400 bg-rose-50 focus:border-rose-500 focus:ring-rose-100'
                : 'border-slate-200 bg-white focus:border-rose-500 focus:ring-rose-100'
            }`}
          />
          {errors.zipCode && <span className="text-sm text-rose-600">{errors.zipCode}</span>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="country" className="text-sm font-semibold text-slate-900">
            Country *
          </label>
          <select
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            className={`rounded-lg border px-3 py-3 text-sm outline-none transition focus:ring-4 ${
              errors.country
                ? 'border-rose-400 bg-rose-50 focus:border-rose-500 focus:ring-rose-100'
                : 'border-slate-200 bg-white focus:border-rose-500 focus:ring-rose-100'
            }`}
          >
            <option value="India">India</option>
            <option value="United States">United States</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Canada">Canada</option>
            <option value="Australia">Australia</option>
          </select>
          {errors.country && <span className="text-sm text-rose-600">{errors.country}</span>}
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-4">
        <input
          type="checkbox"
          id="isDefault"
          name="isDefault"
          checked={formData.isDefault}
          onChange={handleChange}
          className="h-5 w-5 cursor-pointer accent-rose-500"
        />
        <label htmlFor="isDefault" className="cursor-pointer select-none text-sm font-medium text-slate-700">
          Set as default address
        </label>
      </div>

      <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
        <button
          type="submit"
          className="rounded-lg bg-rose-500 px-7 py-3 text-sm font-semibold text-white transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={loading}
        >
          {loading ? 'Saving...' : (editingAddressId ? 'Update Address' : 'Save Address')}
        </button>
        <button
          type="button"
          className="rounded-lg border border-slate-200 bg-white px-7 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AddressForm;
