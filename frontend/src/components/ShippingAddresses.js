import React, { useEffect, useState } from 'react';
import ShippingAddressForm from './ShippingAddressForm';
import { API_BASE_URL } from "./config";

const ShippingAddresses = ({ user }) => {
  const [addresses, setAddresses] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // API base can be configured via env `REACT_APP_API_BASE`, defaults to localhost:5000
  const API_BASE = process.env.REACT_APP_API_BASE || `${API_BASE_URL}`;
  const userId = user?.id || null;

  useEffect(() => {
    if (userId) fetchAddresses();
  }, [userId]);

  const fetchAddresses = async () => {
    try {
      const url = `${API_BASE}/api/shipping-addresses?user_id=${userId}`;
      console.log('[shipping UI] fetchAddresses ->', url);
      const res = await fetch(url, { credentials: 'include' });
      console.log('[shipping UI] fetchAddresses status=', res.status);
      const data = await res.json();
      console.log('[shipping UI] fetchAddresses response=', data);
      if (data.success) setAddresses(data.addresses);
      else console.warn('[shipping UI] fetchAddresses returned success=false', data);
    } catch (err) { console.error('[shipping UI] fetchAddresses error', err); }
  };

  const handleSaved = (addr) => {
    fetchAddresses();
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this address?')) return;
    try {
      const url = `${API_BASE}/api/shipping-addresses/${id}`;
      console.log('[shipping UI] delete ->', url);
      const res = await fetch(url, { method: 'DELETE', credentials: 'include' });
      console.log('[shipping UI] delete status=', res.status);
      const data = await res.json();
      console.log('[shipping UI] delete response=', data);
      if (data.success) fetchAddresses();
      else alert('Failed to delete address: ' + (data.message || JSON.stringify(data)));
    } catch (err) { console.error('[shipping UI] delete error', err); alert('Error deleting address'); }
  };

  const handleSelect = (addr) => {
    // Save selected address to session and redirect to payment
    sessionStorage.setItem('selectedShippingAddress', JSON.stringify(addr));
    // navigate to payment page
    window.location.href = '/payment';
  };

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-4 py-6 text-[#273c2e] sm:px-6 lg:px-8 lg:py-8">
      <div className="mb-4 flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)] sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-[#1a1a1a]">Shipping Addresses</h2>
        <button className="rounded-md bg-[#2e79e3] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#245fb1]" onClick={() => { setShowForm(true); setEditing(null); }}>+ Add New Address</button>
      </div>

      {showForm && (
        <div className="mb-4 rounded-xl border border-[#ede6d9] bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
          <ShippingAddressForm userId={userId} initialData={editing} onSaved={handleSaved} onCancel={() => { setShowForm(false); setEditing(null); }} />
        </div>
      )}

      <div className="space-y-3">
        {addresses.length === 0 && <div className="rounded-xl bg-white px-4 py-8 text-center text-sm text-[#666] shadow-[0_1px_3px_rgba(0,0,0,0.08)]">No saved addresses yet.</div>}
        {addresses.map((a) => (
          <div className={`rounded-xl border bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)] ${a.is_default ? 'border-[#2e79e3]' : 'border-[#ede6d9]'}`} key={a.id}>
            <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="font-bold text-[#1a1a1a]">{a.first_name} {a.last_name} {a.is_default ? <span className="ml-2 inline-block rounded-full bg-[#2e79e3] px-2 py-0.5 text-[11px] font-semibold text-white">Default</span> : null}</div>
              <div className="text-sm text-[#555]">📞 {a.phone}</div>
            </div>
            <div className="mb-1 text-sm text-[#333]">🏠 {a.street_address}</div>
            <div className="text-sm text-[#333]">{a.city}, {a.state} - {a.zip_code}, {a.country}</div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button className="rounded-md bg-[#4fbf8c] px-3 py-2 text-sm font-semibold text-white transition hover:brightness-95" onClick={() => handleSelect(a)}>Select Address</button>
              <button className="rounded-md border border-[#2e79e3] bg-white px-3 py-2 text-sm font-semibold text-[#2e79e3] transition hover:bg-[#f2f7ff]" onClick={() => { setEditing(a); setShowForm(true); }}>Edit</button>
              <button className="rounded-md border border-[#e63946] bg-white px-3 py-2 text-sm font-semibold text-[#e63946] transition hover:bg-[#fff5f5]" onClick={() => handleDelete(a.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShippingAddresses;
