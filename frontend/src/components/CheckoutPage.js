import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Header from './Header';
import Footer from './Footer';
import { API_BASE_URL } from "./config";
import ShippingAddressForm from './ShippingAddressForm';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, getCartTotal } = useCart();
  // ✅ Detect if coming from "Buy Now"
const singleProduct = location.state?.product;
const itemsToCheckout = singleProduct ? [singleProduct] : cartItems;


  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  });
  const [errors, setErrors] = useState({});
   // API and user info used by shipping/address logic
   const API_BASE = process.env.REACT_APP_API_BASE || `${API_BASE_URL}`;
   const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
   const userIdForAddresses = currentUser?.id || null;

   // Shipping addresses state (integrated from ShippingAddresses page)
   const [addresses, setAddresses] = useState([]);
   const [showAddressForm, setShowAddressForm] = useState(false);
   const [editingAddress, setEditingAddress] = useState(null);
   const [selectedAddress, setSelectedAddress] = useState(null);
   const [addressesLoaded, setAddressesLoaded] = useState(userIdForAddresses ? false : true);

  

  useEffect(() => {
    if (userIdForAddresses) fetchAddresses();
  }, [userIdForAddresses]);

  const fetchAddresses = async () => {
    try {
      const url = `${API_BASE}/api/shipping-addresses?user_id=${userIdForAddresses}`;
      console.log('[checkout] fetchAddresses ->', url);
      const res = await fetch(url, { credentials: 'include' });
      const data = await res.json();
      console.log('[checkout] fetchAddresses response=', data);
      if (data.success) setAddresses(data.addresses);
    } catch (err) {
      console.error('[checkout] fetchAddresses error', err);
    }
    finally {
      setAddressesLoaded(true);
    }
  };

  const deleteAddress = async (id) => {
    if (!confirm('Delete this address?')) return;
    try {
      const url = `${API_BASE}/api/shipping-addresses/${id}`;
      console.log('[checkout] delete ->', url);
      const res = await fetch(url, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      console.log('[checkout] delete response=', data);
      if (data.success) {
        if (selectedAddress && selectedAddress.id === id) setSelectedAddress(null);
        fetchAddresses();
      } else {
        alert('Failed to delete address');
      }
    } catch (err) {
      console.error('[checkout] delete error', err);
      alert('Error deleting address');
    }
  };

  const mapBackendToForm = (addr) => ({
    firstName: addr.first_name || '',
    lastName: addr.last_name || '',
    email: addr.email || '',
    phone: addr.phone || '',
    address: addr.street_address || '',
    city: addr.city || '',
    state: addr.state || '',
    zipCode: addr.zip_code || '',
    country: addr.country || 'India'
  });

  const handleAddressSelect = (addr) => {
    setSelectedAddress(addr);
    const mapped = mapBackendToForm(addr);
    setFormData(mapped);
    // scroll to form area (optional)
    const el = document.querySelector('.shipping-form-section');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleAddressEdit = (addr) => {
    setEditingAddress(addr);
    setShowAddressForm(true);
  };

  const handleAddressSaved = (addr) => {
    // addr is backend saved object
    console.log('[checkout] address saved', addr);
    setShowAddressForm(false);
    setEditingAddress(null);
    fetchAddresses();
    // auto-select saved address
    setSelectedAddress(addr);
    setFormData(mapBackendToForm(addr));
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/[-\s]/g, ''))) {
      newErrors.phone = 'Phone must be 10 digits';
    }
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.zipCode.trim()) {
      newErrors.zipCode = 'ZIP code is required';
    } else if (!/^\d{5,6}$/.test(formData.zipCode)) {
      newErrors.zipCode = 'ZIP code must be 5-6 digits';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // If a saved address is selected, skip manual validation and use it
    let shippingAddressData = null;
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (selectedAddress) {
      shippingAddressData = {
        fullName: `${selectedAddress.first_name} ${selectedAddress.last_name}`,
        email: selectedAddress.email,
        phone: selectedAddress.phone,
        address: selectedAddress.street_address,
        city: selectedAddress.city,
        state: selectedAddress.state,
        zipCode: selectedAddress.zip_code,
        country: selectedAddress.country
      };
    } else {
      const newErrors = validate();
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      shippingAddressData = {
        fullName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country
      };
    }

    // Calculate order totals
    const subtotal = singleProduct ? singleProduct.price : getCartTotal();
    const total = subtotal;

    // Prepare order data
    const orderData = {
      userId: user.id || null,
      items: singleProduct ? [singleProduct] : cartItems,
      subtotal: subtotal,
      total: total,
      shippingAddress: shippingAddressData
    };

    // Navigate to payment page with order data
    navigate('/payment', { state: { orderData } });
  };

  if (!itemsToCheckout || itemsToCheckout.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-white text-[#273c2e]">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="w-full max-w-5xl rounded-3xl border border-[#ede6d9] bg-[#fff7eb] p-8 text-center shadow-[0_10px_40px_rgba(39,60,46,0.18)] sm:p-12">
            <h1 className="mb-6 text-3xl font-extrabold tracking-tight sm:text-4xl">Checkout</h1>
            <div className="rounded-2xl bg-white p-6 ring-1 ring-[#ede6d9]">
              <p>Your cart is empty. Please add items before checking out.</p>
              <button
                className="mt-5 rounded-xl bg-[#E74C8B] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_26px_rgba(182,158,106,0.5)] transition hover:-translate-y-0.5"
                onClick={() => navigate('/products')}
              >
                Go to Products
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#273c2e]">
      <Header />
      <main className="flex-1 bg-white px-3 py-4 sm:px-6 lg:px-8 lg:py-8 overflow-x-hidden">
        
        <div className="mx-auto w-full max-w-[1400px] px-1 sm:px-0">
          <h1 className="mb-7 text-center text-4xl font-black tracking-tight text-[#273c2e] sm:text-5xl">Checkout</h1>
          
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_400px]">
            <div className="relative rounded-3xl border border-[#ede6d9] bg-white p-3 shadow-[0_20px_60px_rgba(39,60,46,0.12)] sm:p-5 lg:p-7">
              <div className="absolute inset-x-0 top-0 h-[3px] rounded-t-3xl bg-gradient-to-r from-transparent via-[#e74c8b] to-transparent" />
              <h2 className="mb-5 border-b-2 border-[#ede6d9] pb-3 text-2xl font-extrabold tracking-tight text-[#273c2e]">📍 Shipping Information</h2>

              {/* Show form if no saved addresses yet, or when user clicks Add New */}
              {addresses.length === 0 && !showAddressForm ? (
                // First-time user: show the form directly
                <div className="rounded-2xl bg-[#fafaf8] p-3 ring-1 ring-[#ede6d9]">
                  <ShippingAddressForm 
                    userId={userIdForAddresses} 
                    initialData={null} 
                    onSaved={handleAddressSaved} 
                    onCancel={() => { setShowAddressForm(false); setEditingAddress(null); }} 
                  />
                </div>
              ) : addresses.length > 0 ? (
                // User has saved addresses - show form only when editing
                <>
                  {showAddressForm ? (
                    <div className="rounded-2xl bg-[#fafaf8] p-3 ring-1 ring-[#ede6d9]">
                      <ShippingAddressForm 
                        userId={userIdForAddresses} 
                        initialData={editingAddress} 
                        onSaved={handleAddressSaved} 
                        onCancel={() => { setShowAddressForm(false); setEditingAddress(null); }} 
                      />
                    </div>
                  ) : (
                    <div className="mb-5 rounded-2xl border-2 border-dashed border-[#a8d5ff] bg-[#f0f8ff] p-5 text-center">
                      <p className="mb-4 text-sm font-medium text-[#4a7ba7]">✓ Select a saved address from the right panel or create a new one</p>
                      <button 
                        type="button" 
                        className="rounded-lg bg-gradient-to-r from-[#e74c8b] to-[#d93d7a] px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_12px_rgba(231,76,139,0.3)] transition hover:-translate-y-0.5"
                        onClick={() => { setShowAddressForm(true); setEditingAddress(null); }}
                      >
                        + Add New Address
                      </button>
                    </div>
                  )}
                </>
              ) : null}

              {/* Continue to payment button - shown only when address is selected */}
              {addresses.length > 0 && selectedAddress && (
                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-between w-full">
                  <button
                    type="button"
                    className="flex-1 rounded-xl border-2 border-[#e8e0d5] bg-white px-4 py-3 text-sm font-bold text-[#555] transition hover:bg-[#f5f3f0]"
                    onClick={() => navigate('/cart')}
                  >
                    ← Back to Cart
                  </button>
                  <button
                    type="button"
                    className="flex-1 rounded-xl bg-gradient-to-r from-[#e74c8b] to-[#d93d7a] px-4 py-3 text-sm font-bold uppercase tracking-[0.04em] text-white shadow-[0_4px_14px_rgba(231,76,139,0.3)] transition hover:-translate-y-0.5"
                    onClick={handleSubmit}
                  >
                    Continue to Payment →
                  </button>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-5">
              <div className="rounded-3xl border border-[#ede6d9] bg-white p-5 shadow-[0_12px_35px_rgba(39,60,46,0.12)]">
                <h2 className="mb-4 border-b-2 border-[#ede6d9] pb-2 text-xl font-extrabold text-[#273c2e]">🛒 Order Summary</h2>
                <div className="mb-3 space-y-2">
  {itemsToCheckout.map((item) => (
    <div key={item.id} className="flex items-center justify-between gap-3 border-b border-[#f0ece6] pb-2 text-sm">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <span className="truncate font-semibold text-[#273c2e]">{item.name}</span>
        <span className="shrink-0 text-xs text-[#777]">× {item.quantity || 1}</span>
      </div>
      <span className="shrink-0 font-semibold text-[#273c2e]">
        ₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
      </span>
    </div>
  ))}
</div>

<div className="mt-3 space-y-1 text-sm text-[#4f6354]">
  <div className="flex items-center justify-between py-1">
    <span>Subtotal:</span>
    <span className="font-semibold text-[#273c2e]">₹{(Number(singleProduct ? singleProduct.price : getCartTotal())).toFixed(2)}</span>
  </div>
  <div className="flex items-center justify-between py-1">
    <span>Shipping:</span>
    <span className="font-semibold text-[#6fbf8c]">FREE</span>
  </div>
  <div className="my-3 h-px bg-[#ede6d9]"></div>
  <div className="flex items-center justify-between py-1 text-xl font-extrabold text-[#273c2e]">
    <span>Total:</span>
    <span>₹{(Number(singleProduct ? singleProduct.price : getCartTotal())).toFixed(2)}</span>
  </div>
</div>
              </div>

              {/* Saved addresses section - under order summary */}
              {addresses.length > 0 && (
                <div className="flex min-h-[300px] max-h-[550px] flex-col overflow-hidden rounded-3xl border border-[#ede6d9] bg-white p-5 shadow-[0_12px_35px_rgba(39,60,46,0.12)]">
                  <h2 className="mb-4 border-b-2 border-[#ede6d9] pb-2 text-xl font-extrabold text-[#273c2e]">📍 Saved Addresses</h2>
                  {!addressesLoaded ? (
                    <div className="rounded-xl bg-[#fafaf8] px-3 py-2 text-sm text-[#666] ring-1 ring-[#ede6d9]">Loading saved addresses...</div>
                  ) : (
                  <div className="space-y-3 overflow-y-auto pr-1">
                    {addresses.map((a) => (
                      <div
                        key={a.id}
                        className={`cursor-pointer rounded-xl border-2 p-3 transition ${
                          selectedAddress && selectedAddress.id === a.id
                            ? 'border-[#e74c8b] bg-[#fff5f9] shadow-[0_4px_12px_rgba(231,76,139,0.15)]'
                            : 'border-[#e8e0d5] bg-[#fafaf8] hover:border-[#d0c5b8] hover:bg-white'
                        }`}
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-bold text-[#273c2e]">{a.first_name} {a.last_name}</span>
                            {a.is_default && <span className="rounded-md bg-gradient-to-r from-[#e74c8b] to-[#d93d7a] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.03em] text-white">Default</span>}
                          </div>
                          <div className="text-xs text-[#666]">{a.phone}</div>
                          <div className="text-xs text-[#555]">{a.street_address}</div>
                          <div className="text-xs text-[#888]">{a.city}, {a.state} - {a.zip_code}</div>
                        </div>

                        <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#ede6d9] pt-2">
                          <label className="flex flex-1 cursor-pointer items-center gap-2 text-sm font-semibold text-[#555]">
                            <input
                              type="radio"
                              name="savedAddress"
                              className="h-4 w-4 accent-[#e74c8b]"
                              checked={selectedAddress && selectedAddress.id === a.id}
                              onChange={() => handleAddressSelect(a)}
                            />
                            <span>Use</span>
                          </label>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="rounded-md px-2 py-1 text-base transition hover:bg-[#f0e8f7]"
                              onClick={() => handleAddressEdit(a)}
                              title="Edit"
                            >
                              ✏️
                            </button>
                            <button
                              type="button"
                              className="rounded-md px-2 py-1 text-base transition hover:bg-[#feecec]"
                              onClick={() => deleteAddress(a.id)}
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutPage;
