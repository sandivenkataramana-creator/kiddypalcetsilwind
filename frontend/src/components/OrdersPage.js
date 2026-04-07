import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { API_BASE_URL } from "./config";
const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
});

const statusLabels = {
  pending: 'Pending',
  processing: 'Processing',
  accepted: 'Accepted',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const OrdersPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [addressEditOrderId, setAddressEditOrderId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  });
  const [savingAddress, setSavingAddress] = useState(false);
  const [trackingByItem, setTrackingByItem] = useState({}); // key: `${orderId}-${itemId}` -> { open, loading, error, data }

  useEffect(() => {
    let isMounted = true;
    const storedUser = localStorage.getItem('user');

    if (!storedUser) {
      navigate('/login');
      return undefined;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);

    const loadOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${API_BASE_URL}/api/orders/user/${parsedUser.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load orders');
        }

        if (isMounted) {
          setOrders(Array.isArray(data.orders) ? data.orders : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Unable to fetch orders right now.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const refreshOrders = async () => {
    if (!user) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/user/${user.id}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to refresh orders');
      }
      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (err) {
      setError(err.message || 'Unable to refresh orders right now.');
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!user) return;
    const confirmCancel = window.confirm('Are you sure you want to cancel this order?');
    if (!confirmCancel) return;

    setActionLoadingId(orderId);
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel order');
      }

      await refreshOrders();
    } catch (err) {
      alert(err.message || 'Could not cancel the order. Please try again later.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleOpenAddressForm = (order) => {
    setAddressEditOrderId(order.id);
    setAddressForm({
      fullName: order.shipping_full_name || '',
      email: order.shipping_email || '',
      phone: order.shipping_phone || '',
      address: order.shipping_address || '',
      city: order.shipping_city || '',
      state: order.shipping_state || '',
      zipCode: order.shipping_zip_code || '',
      country: order.shipping_country || 'India',
    });
  };

  const handleAddressInputChange = (event) => {
    const { name, value } = event.target;
    setAddressForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressSubmit = async (event) => {
    event.preventDefault();
    if (!user || !addressEditOrderId) return;

    setSavingAddress(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${addressEditOrderId}/address`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          shippingAddress: addressForm,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update address');
      }

      await refreshOrders();
      setAddressEditOrderId(null);
    } catch (err) {
      alert(err.message || 'Could not update the address. Please try again later.');
    } finally {
      setSavingAddress(false);
    }
  };

  const closeAddressForm = () => {
    setAddressEditOrderId(null);
  };

  const toggleTracking = async (orderId, item) => {
    const key = `${orderId}-${item.id}`;
    const existing = trackingByItem[key];

    // Toggle close if already open and loaded
    if (existing?.open && !existing.loading) {
      setTrackingByItem(prev => ({
        ...prev,
        [key]: { ...existing, open: false }
      }));
      return;
    }

    // If we have data but closed, just open without refetch
    if (existing && existing.data && !existing.open) {
      setTrackingByItem(prev => ({
        ...prev,
        [key]: { ...existing, open: true }
      }));
      return;
    }

    // Fetch fresh
    setTrackingByItem(prev => ({
      ...prev,
      [key]: { open: true, loading: true, error: '', data: null }
    }));

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/items/${item.id}/tracking`);
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to fetch tracking');
      }
      setTrackingByItem(prev => ({
        ...prev,
        [key]: { open: true, loading: false, error: '', data: data.tracking }
      }));
    } catch (err) {
      setTrackingByItem(prev => ({
        ...prev,
        [key]: { open: true, loading: false, error: err.message || 'Unable to load tracking', data: null }
      }));
    }
  };

  const groupedOrders = useMemo(() => {
    const completed = [];
    const active = [];

    orders.forEach((order) => {
      if (order.order_status === 'delivered' || order.order_status === 'cancelled') {
        completed.push(order);
      } else {
        active.push(order);
      }
    });

    return { active, completed };
  }, [orders]);

  const renderOrderCard = (order) => {
    const orderDate = order.created_at
      ? new Date(order.created_at).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : 'Unknown date';

    const statusLabel = statusLabels[order.order_status] || order.order_status;

    return (
      <div className="mb-5 rounded-2xl border border-[#ede6d9] bg-white p-5 shadow-[0_12px_24px_rgba(0,0,0,0.08)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_32px_rgba(0,0,0,0.1)]" key={order.id}>
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-base font-semibold text-[#1f2933]">Order #{order.order_number}</div>
            <div className="mt-1 text-sm text-[#5f6b7c]">Placed on {orderDate}</div>
          </div>
          <div className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.04em] ${
            order.order_status === 'processing' ? 'bg-[#fff4e5] text-[#d9822b]' :
            order.order_status === 'pending' ? 'bg-[#fff4e5] text-[#c56a1a]' :
            order.order_status === 'shipped' ? 'bg-[#e5f8ff] text-[#127fbf]' :
            order.order_status === 'delivered' ? 'bg-[#e4f7e7] text-[#2f8132]' :
            order.order_status === 'cancelled' ? 'bg-[#fde8e8] text-[#c81e1e]' :
            'bg-[#e5f0ff] text-[#2251cc]'
          }`}>
            {statusLabel}
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-4 rounded-xl bg-[#f8fafc] p-4">
          <div>
            <span className="mr-1 font-semibold">Total:</span>
            <span>{currencyFormatter.format(Number(order.total_amount) || 0)}</span>
          </div>
          <div>
            <span className="mr-1 font-semibold">Payment:</span>
            <span className="ml-1 inline-block rounded-xl bg-[#eef2f7] px-2.5 py-1 text-xs font-semibold">{(order.payment_method || '').toUpperCase()}</span>
          </div>
          <div>
            <span className="mr-1 font-semibold">Status:</span>
            <span className="ml-1 inline-block rounded-xl bg-[#fff4e5] px-2.5 py-1 text-xs font-semibold text-[#c56a1a]">{(order.payment_status || 'pending').toUpperCase()}</span>
          </div>
        </div>

        <div className="mb-4 border-y border-[#eef2f6] py-4">
          {Array.isArray(order.items) && order.items.length > 0 ? (
            order.items.map((item) => (
              <div className="border-b border-dashed border-[#e1e5eb] py-2 last:border-b-0" key={`${order.id}-${item.id}`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="font-semibold text-[#1f2933]">{item.product_name}</div>
                <div className="flex gap-5 text-sm text-[#4f5d75]">
                  <span>Qty: {item.quantity}</span>
                  <span>{currencyFormatter.format(Number(item.item_total) || 0)}</span>
                </div>
                <div>
                  <button
                    className="rounded-lg bg-[#E74C8B] px-3 py-2 text-xs font-semibold text-white transition hover:-translate-y-0.5"
                    onClick={() => toggleTracking(order.id, item)}
                  >
                    Track
                  </button>
                </div>
                </div>

                {/* Inline tracking area */}
                {(() => {
                  const key = `${order.id}-${item.id}`;
                  const t = trackingByItem[key];
                  if (!t?.open) return null;
                  return (
                    <div className="mt-3 rounded-lg border border-[#eee] bg-[#fafafa] p-3">
                      {t.loading && <div>Loading tracking...</div>}
                      {t.error && !t.loading && <div className="rounded-xl bg-[#fde8e8] px-3 py-2 text-sm text-[#c81e1e]">{t.error}</div>}
                      {!t.loading && !t.error && t.data && (
                        <div>
                          <div className="mb-2 space-y-0.5 text-sm">
                            <div><strong>Status:</strong> {statusLabels[t.data.status] || t.data.status}</div>
                            {t.data.trackingNumber && (
                              <div><strong>Tracking #:</strong> {t.data.trackingNumber}</div>
                            )}
                            {t.data.carrier && (
                              <div><strong>Carrier:</strong> {t.data.carrier}</div>
                            )}
                          </div>

                          {/* If cancelled, show single line */}
                          {t.data.status === 'cancelled' ? (
                            <div className="border-l-[3px] border-[#e9ecef] pl-4">
                              <div className="relative">
                                <span className="absolute -left-[22px] top-1 h-3.5 w-3.5 rounded-full bg-[#43e97b] ring-4 ring-[#43e97b]/20" />
                                <div>
                                  <h4 className="text-sm font-semibold">Order Cancelled</h4>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3 border-l-[3px] border-[#e9ecef] pl-4">
                              {Array.isArray(t.data.timeline) && t.data.timeline.map(step => (
                                <div key={step.key} className="relative">
                                  <span className={`absolute -left-[22px] top-1 h-3.5 w-3.5 rounded-full ring-4 ${step.completed ? 'bg-[#43e97b] ring-[#43e97b]/20' : 'bg-[#e9ecef] ring-[#e9ecef]'}`} />
                                  <div>
                                    <h4 className="text-sm font-semibold">{step.label}</h4>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            ))
          ) : (
            <div className="py-3 text-center text-sm text-[#8795a1]">No items found for this order.</div>
          )}
        </div>

        <div className="mb-4 rounded-xl bg-[#fbfcfe] p-4">
          <h4 className="mb-2 font-semibold text-[#27364b]">Shipping Address</h4>
          <p className="text-sm text-[#4f5d75]">{order.shipping_full_name}</p>
          <p className="text-sm text-[#4f5d75]">{order.shipping_address}</p>
          <p className="text-sm text-[#4f5d75]">
            {order.shipping_city}, {order.shipping_state} {order.shipping_zip_code}
          </p>
          <p className="text-sm text-[#4f5d75]">{order.shipping_country}</p>
          <p className="text-sm text-[#4f5d75]">📞 {order.shipping_phone}</p>
          <p className="text-sm text-[#4f5d75]">✉️ {order.shipping_email}</p>
        </div>

        <div className="mb-3 flex flex-wrap gap-3">
          {order.isCancelable && (
            <button
              className="rounded-lg bg-[#fde8e8] px-4 py-2 text-sm font-semibold text-black transition hover:-translate-y-0.5"
              onClick={() => handleCancelOrder(order.id)}
              disabled={actionLoadingId === order.id}
            >
              {actionLoadingId === order.id ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}

          {order.canUpdateAddress && (
            <button
              className="rounded-lg bg-[#E74C8B] px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              onClick={() => handleOpenAddressForm(order)}
            >
              Change Address
            </button>
          )}
        </div>

        {addressEditOrderId === order.id && (
          <form className="mt-4 space-y-4 border-t border-[#eef2f6] pt-4" onSubmit={handleAddressSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm text-[#2b3844]">
                Full Name
                <input
                  type="text"
                  name="fullName"
                  value={addressForm.fullName}
                  onChange={handleAddressInputChange}
                  className="rounded-lg border border-[#cbd2d9] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2251cc]/20"
                  required
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-[#2b3844]">
                Email
                <input
                  type="email"
                  name="email"
                  value={addressForm.email}
                  onChange={handleAddressInputChange}
                  className="rounded-lg border border-[#cbd2d9] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2251cc]/20"
                  required
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-sm text-[#2b3844]">
                Phone
                <input
                  type="tel"
                  name="phone"
                  value={addressForm.phone}
                  onChange={handleAddressInputChange}
                  className="rounded-lg border border-[#cbd2d9] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2251cc]/20"
                  required
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-[#2b3844]">
                Pincode
                <input
                  type="text"
                  name="zipCode"
                  value={addressForm.zipCode}
                  onChange={handleAddressInputChange}
                  className="rounded-lg border border-[#cbd2d9] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2251cc]/20"
                  required
                />
              </label>
            </div>

            <label className="flex flex-col gap-1 text-sm text-[#2b3844]">
              Address
              <textarea
                name="address"
                value={addressForm.address}
                onChange={handleAddressInputChange}
                rows={3}
                className="rounded-lg border border-[#cbd2d9] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2251cc]/20"
                required
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="flex flex-col gap-1 text-sm text-[#2b3844]">
                City
                <input
                  type="text"
                  name="city"
                  value={addressForm.city}
                  onChange={handleAddressInputChange}
                  className="rounded-lg border border-[#cbd2d9] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2251cc]/20"
                  required
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-[#2b3844]">
                State
                <input
                  type="text"
                  name="state"
                  value={addressForm.state}
                  onChange={handleAddressInputChange}
                  className="rounded-lg border border-[#cbd2d9] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2251cc]/20"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm text-[#2b3844]">
                Country
                <input
                  type="text"
                  name="country"
                  value={addressForm.country}
                  onChange={handleAddressInputChange}
                  className="rounded-lg border border-[#cbd2d9] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2251cc]/20"
                  required
                />
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button type="button" className="rounded-lg border border-[#cbd2d9] bg-transparent px-4 py-2 text-sm font-semibold text-[#4f5d75] transition hover:bg-[#f8fafc]" onClick={closeAddressForm}>
                Cancel
              </button>
              <button type="submit" className="rounded-lg bg-[#E74C8B] px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:opacity-60" disabled={savingAddress}>
                {savingAddress ? 'Saving...' : 'Save Address'}
              </button>
            </div>
          </form>
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f5f5]">
      <Header />
      <main className="flex-1 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:pb-14">
        <div className="mx-auto w-full max-w-5xl">
          <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-[#1f2933]">My Orders</h1>

          {loading && <div className="rounded-xl bg-[#fff7e6] px-4 py-3 text-sm text-[#885114]">Loading your orders...</div>}
          {error && !loading && <div className="rounded-xl bg-[#fde8e8] px-4 py-3 text-sm text-[#c81e1e]">{error}</div>}

          {!loading && !error && orders.length === 0 && (
            <div className="rounded-2xl bg-white p-10 text-center shadow-[0_12px_24px_rgba(0,0,0,0.08)]">
              <p className="mb-5 text-base text-[#4f5d75]">You have not placed any orders yet.</p>
              <button className="rounded-lg bg-[#E74C8B] px-4 py-2 text-sm font-semibold text-white" onClick={() => navigate('/products')}>
                Start Shopping
              </button>
            </div>
          )}

          {!loading && !error && orders.length > 0 && (
            <>
              {groupedOrders.active.length > 0 && (
                <section>
                  <h2 className="mb-4 mt-8 text-2xl font-bold text-[#2b3844]">Active Orders</h2>
                  {groupedOrders.active.map(renderOrderCard)}
                </section>
              )}

              {groupedOrders.completed.length > 0 && (
                <section>
                  <h2 className="mb-4 mt-8 text-2xl font-bold text-[#2b3844]">Completed Orders</h2>
                  {groupedOrders.completed.map(renderOrderCard)}
                </section>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrdersPage;

