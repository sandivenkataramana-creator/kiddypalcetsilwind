import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import AddressForm from './AddressForm';
import AddressCard from './AddressCard';
import {API_BASE_URL } from "./config";

const ManageAddresses = () => {
  const navigate = useNavigate();
  const API_BASE = process.env.REACT_APP_API_BASE || `${API_BASE_URL}`;
  
  const [currentUser, setCurrentUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Initialize user
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    setCurrentUser(JSON.parse(storedUser));
  }, [navigate]);

  // Fetch addresses when user is loaded
  useEffect(() => {
    if (currentUser?.id) {
      fetchAddresses();
    }
  }, [currentUser]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(
        `${API_BASE}/api/shipping-addresses?user_id=${currentUser.id}`,
        { credentials: 'include' }
      );
      const data = await response.json();
      
      if (data.success) {
        setAddresses(data.addresses);
      } else {
        setError(data.message || 'Failed to fetch addresses');
      }
    } catch (err) {
      console.error('[ManageAddresses] Fetch error:', err);
      setError('Failed to load addresses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const handleAddressAdded = (newAddress) => {
    setAddresses([newAddress, ...addresses]);
    setShowForm(false);
    showToast('Address added successfully!', 'success');
  };

  const handleAddressUpdated = (updatedAddress) => {
    setAddresses(
      addresses.map(addr => addr.id === updatedAddress.id ? updatedAddress : addr)
    );
    setEditingAddressId(null);
    setShowForm(false);
    showToast('Address updated successfully!', 'success');
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;

    try {
      const response = await fetch(
        `${API_BASE}/api/shipping-addresses/${addressId}`,
        {
          method: 'DELETE',
          credentials: 'include'
        }
      );
      const data = await response.json();

      if (data.success) {
        setAddresses(addresses.filter(addr => addr.id !== addressId));
        showToast('Address deleted successfully!', 'success');
      } else {
        showToast(data.message || 'Failed to delete address', 'error');
      }
    } catch (err) {
      console.error('[ManageAddresses] Delete error:', err);
      showToast('Failed to delete address', 'error');
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const addressToUpdate = addresses.find(a => a.id === addressId);
      const response = await fetch(
        `${API_BASE}/api/shipping-addresses/${addressId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            user_id: currentUser.id,
            first_name: addressToUpdate.first_name,
            last_name: addressToUpdate.last_name,
            email: addressToUpdate.email,
            phone: addressToUpdate.phone,
            street_address: addressToUpdate.street_address,
            city: addressToUpdate.city,
            state: addressToUpdate.state,
            zip_code: addressToUpdate.zip_code,
            country: addressToUpdate.country,
            is_default: true
          })
        }
      );
      const data = await response.json();

      if (data.success) {
        setAddresses(
          addresses.map(addr => ({
            ...addr,
            is_default: addr.id === addressId ? 1 : 0
          }))
        );
        showToast('Default address updated!', 'success');
      } else {
        showToast(data.message || 'Failed to update default', 'error');
      }
    } catch (err) {
      console.error('[ManageAddresses] Set default error:', err);
      showToast('Failed to update default address', 'error');
    }
  };

  const handleEditClick = (addressId) => {
    setEditingAddressId(addressId);
    setShowForm(true);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingAddressId(null);
  };

  if (!currentUser) {
    return <div className="flex min-h-screen items-center justify-center bg-[#f5f5f5] text-[#666]">Loading...</div>;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#f5f5f5] py-8 sm:py-10">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Header Section */}
          <div className="mb-10 flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)] lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-[-0.04em] text-[#1a1a1a] sm:text-3xl">Manage Addresses</h1>
              <p className="mt-2 text-sm text-[#666]">Save and manage your delivery addresses</p>
            </div>
            {!showForm && (
              <button 
                className="rounded-md bg-[#e74c8b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#d43c7d] hover:shadow-[0_2px_8px_rgba(231,76,140,0.25)] active:scale-[0.98]"
                onClick={() => {
                  setEditingAddressId(null);
                  setShowForm(true);
                }}
              >
                + Add New Address
              </button>
            )}
          </div>

          {/* Toast Notification */}
          {toast.show && (
            <div className={`mb-5 rounded-md border px-5 py-4 font-medium ${toast.type === 'error' ? 'border-[#f5c6cb] bg-[#f8d7da] text-[#721c24]' : 'border-[#c3e6cb] bg-[#d4edda] text-[#155724]'}`}>
              {toast.message}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-5 flex items-center justify-between gap-3 rounded-md border border-[#f5c6cb] bg-[#f8d7da] px-5 py-4 text-[#721c24]">
              <span>{error}</span>
              <button onClick={fetchAddresses} className="rounded-md bg-[#721c24] px-3 py-1.5 text-sm text-white transition hover:bg-[#5a1520]">Retry</button>
            </div>
          )}

          {/* Form Section */}
          {showForm && (
            <div className="mb-10 rounded-xl bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.08)] sm:p-7">
              <h2 className="mb-6 text-2xl font-semibold text-[#1a1a1a]">{editingAddressId ? 'Edit Address' : 'Add New Address'}</h2>
              <AddressForm
                userId={currentUser.id}
                editingAddressId={editingAddressId}
                addresses={addresses}
                onAddressAdded={handleAddressAdded}
                onAddressUpdated={handleAddressUpdated}
                onCancel={handleFormCancel}
              />
            </div>
          )}

          {/* Addresses Grid */}
          {loading ? (
            <div className="rounded-xl bg-white px-5 py-12 text-center shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
              <p className="text-base text-[#666]">Loading addresses...</p>
            </div>
          ) : addresses.length === 0 ? (
            <div className="rounded-xl bg-white px-5 py-12 text-center shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
              <p className="text-base text-[#666]">No addresses yet</p>
              <button 
                className="mt-3 rounded-md bg-[#e74c8b] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#d43c7d] hover:shadow-[0_2px_8px_rgba(231,76,140,0.25)] active:scale-[0.98]"
                onClick={() => {
                  setEditingAddressId(null);
                  setShowForm(true);
                }}
              >
                Add Your First Address
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {addresses.map(address => (
                <AddressCard
                  key={address.id}
                  address={address}
                  onEdit={() => handleEditClick(address.id)}
                  onDelete={() => handleDeleteAddress(address.id)}
                  onSetDefault={() => handleSetDefault(address.id)}
                  isDefault={address.is_default === 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ManageAddresses;
