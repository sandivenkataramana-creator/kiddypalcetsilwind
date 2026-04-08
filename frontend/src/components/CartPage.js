import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Header from './Header';
import Footer from './Footer';
import { API_BASE_URL } from './config';
import { X } from "lucide-react";

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const [toast, setToast] = useState({ show: false, message: '' });

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, parseInt(newQuantity, 10));
  };

  const handleProductClick = (item) => {
    navigate(`/product/${item.id}`, { state: { product: item } });
  };

  const resolveImageSrc = (item) => {
    const raw = item.image_url || item.image || item.imageUrl || '';
    if (!raw || typeof raw !== 'string') return '';

    const trimmed = raw.trim();
    if (trimmed.startsWith('http') || trimmed.startsWith('data:')) return trimmed;
    if (trimmed.startsWith('/')) return `${API_BASE_URL}${trimmed}`;
    return `${API_BASE_URL}/${trimmed}`;
  };

  const handleCheckout = () => {
    const user = localStorage.getItem('user');
    if (!user) {
      setToast({ show: true, message: 'Please login to proceed to checkout' });
      setTimeout(() => {
        setToast({ show: false, message: '' });
        navigate('/login');
      }, 1200);
      return;
    }
    navigate('/checkout');
  };

  const originalSubtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.original_price || item.mrp || item.price || 0) * Number(item.quantity || 0),
    0
  );
  const discountedSubtotal = getCartTotal();
  const discountAmount = Math.max(0, originalSubtotal - discountedSubtotal);

  if (cartItems.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-white text-[#273c2e]">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
          <div className="w-full max-w-4xl rounded-3xl border border-[#ede6d9] bg-[#fff7eb] p-8 text-center shadow-[0_10px_40px_rgba(39,60,46,0.18)] sm:p-12">
            <h1 className="mb-6 text-3xl sm:text-4xl font-extrabold tracking-tight">Shopping Cart</h1>
            <div className="mb-4 text-6xl">🛒</div>
            <h2 className="text-2xl font-bold text-[#273c2e]">Your cart is empty</h2>
            <p className="mt-2 text-base text-[#4f6354]">Add some products to get started.</p>
            <button
              className="mt-7 rounded-xl bg-[#E74C8B] px-6 py-3 text-sm font-bold text-white shadow-[0_8px_26px_rgba(182,158,106,0.5)] transition hover:-translate-y-0.5"
              onClick={() => navigate('/products')}
            >
              Continue Shopping
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#273c2e]">
      <Header />

      <main className="flex-1 bg-white px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mx-auto w-full max-w-[1400px]">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#273c2e]">
              Shopping Cart ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
            </h1>
            <button
              className="rounded-xl border border-[#E74C8B] bg-[#E74C8B] px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              onClick={clearCart}
            >
              Clear Cart
            </button>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
            <div className="flex flex-col gap-5">
              {cartItems.map((item) => {
                const imageSrc = resolveImageSrc(item);
                const unitPrice = Number(item.price || 0);
                const originalPrice = Number(item.original_price || item.mrp || item.price || 0);
                const lineTotal = unitPrice * Number(item.quantity || 0);
                const hasDiscount = originalPrice > unitPrice;
                const saved = hasDiscount ? originalPrice - unitPrice : 0;
                const discountPercent = hasDiscount ? Math.round((saved / originalPrice) * 100) : 0;

                return (
                  <div
                    key={item.id}
                    className="relative grid gap-4 rounded-2xl border border-[#ede6d9] bg-white p-4 shadow-[0_8px_24px_rgba(39,60,46,0.12)] transition hover:translate-x-1 sm:grid-cols-[120px_1fr] lg:grid-cols-[120px_1fr_auto_auto]"
                  >
                   <button
  className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[#f44336] text-white hover:bg-[#d32f2f]"
  onClick={() => removeFromCart(item.id)}
  title="Remove from cart"
>
  <X size={16} />
</button>

                    <div
                      className="flex h-[120px] w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-[#ede6d9]"
                      onClick={() => handleProductClick(item)}
                    >
                      {imageSrc ? (
                        <img
                          src={imageSrc}
                          alt={item.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="text-4xl">📦</div>
                      )}
                    </div>

                    <div className="cursor-pointer" onClick={() => handleProductClick(item)}>
                      <h3 className="text-xl sm:text-2xl font-bold text-[#273c2e] tracking-tight">{item.name}</h3>
                      <p className="mt-1 text-xs sm:text-sm text-[#4f6354] line-clamp-2">{item.description}</p>
                      {item.age_range ? (
                        <span className="mt-3 inline-flex rounded-full bg-[#f2f6ff] px-3 py-1 text-xs font-medium text-[#2e79e3]">
                          {item.age_range}
                        </span>
                      ) : null}
                    </div>

                    <div className="flex flex-col items-start gap-2 sm:items-center lg:items-center">
                      <label className="text-sm font-medium text-[#666]">Quantity:</label>
                      <div className="flex items-center overflow-hidden rounded-lg border-2 border-[#ede6d9]">
                        <button
                          className="h-9 w-9 border-r border-[#ede6d9] bg-[#2e79e3] text-lg text-white transition hover:bg-[#245fb1] disabled:cursor-not-allowed disabled:opacity-40"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                          min="1"
                          max={item.stock_quantity}
                          className="h-9 w-14 border-none text-center text-sm font-semibold text-[#273c2e] outline-none"
                        />
                        <button
                          className="h-9 w-9 border-l border-[#ede6d9] bg-[#2e79e3] text-lg text-white transition hover:bg-[#245fb1] disabled:cursor-not-allowed disabled:opacity-40"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock_quantity}
                        >
                          +
                        </button>
                      </div>
                      <span className="text-xs text-[#666]">(Max: {item.stock_quantity})</span>
                    </div>

                    <div className="text-left sm:text-right pr-10">
                      <div className="text-xs text-[#4f6354]">Price</div>
                      <div className="mt-1 text-lg font-bold text-[#222]">₹{unitPrice.toFixed(2)}</div>
                      {hasDiscount ? (
                        <div className="mt-1 text-sm text-[#888] line-through">₹{originalPrice.toFixed(2)}</div>
                      ) : null}
                      {hasDiscount ? (
                        <div className="mt-1 text-xs font-bold text-green-600">{discountPercent}% off • Save ₹{saved.toFixed(0)}</div>
                      ) : null}
                      <div className="mt-2 text-base font-extrabold text-black">Total: ₹{lineTotal.toFixed(2)}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <aside className="h-fit rounded-2xl border border-[#ede6d9] bg-white p-6 shadow-[0_8px_24px_rgba(39,60,46,0.12)] xl:sticky xl:top-6">
              <h2 className="mb-5 border-b-2 border-[#ede6d9] pb-3 text-2xl sm:text-3xl font-bold text-[#273c2e]">Order Summary</h2>

              <div className="space-y-2 text-sm text-[#4f6354]">
                <div className="flex items-center justify-between py-1">
                  <span>Subtotal (Original):</span>
                  <span className="font-semibold">₹{originalSubtotal.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between py-1 text-green-600">
                  <span>Discount:</span>
                  <span className="font-semibold">-₹{discountAmount.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span>Subtotal (After Discount):</span>
                  <span className="font-semibold">₹{discountedSubtotal.toFixed(2)}</span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span>Shipping:</span>
                  <span className="font-semibold text-[#6fbf8c]">FREE</span>
                </div>
              </div>

              <div className="my-4 h-px bg-[#ede6d9]" />

              <div className="flex items-center justify-between text-2xl font-extrabold text-[#273c2e]">
                <span>Total:</span>
                <span>₹{discountedSubtotal.toFixed(2)}</span>
              </div>

              <button
                className="mt-6 w-full rounded-xl bg-[#E74C8B] px-4 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(182,158,106,0.45)] transition hover:-translate-y-0.5"
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </button>

              <button
                className="mt-3 w-full rounded-xl border-2 border-[#2e79e3] bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-[#f6f9ff]"
                onClick={() => navigate('/products')}
              >
                ← Continue Shopping
              </button>
            </aside>
          </div>
        </div>
      </main>

      <Footer />

      {toast.show && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
          <div className="w-[min(92vw,440px)] rounded-2xl border border-[#b69e6a]/35 bg-[#fff7eb] p-6 text-center font-bold text-[#273c2e] shadow-[0_18px_40px_rgba(39,60,46,0.18)]">
            <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full border-2 border-white/60 bg-gradient-to-br from-amber-500 to-amber-600 text-xl text-[#fff7eb] shadow-[0_8px_20px_rgba(245,158,11,0.35)]">
              !
            </div>
            <div className="text-lg">{toast.message}</div>
            <div className="mt-1 text-xs font-medium text-[#4f6354]">Redirecting to login...</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
