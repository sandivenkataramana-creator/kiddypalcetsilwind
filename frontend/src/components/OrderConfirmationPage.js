import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Header from './Header';

const OrderConfirmationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCart();
  const { orderId, orderData, paymentMethod } = location.state || {};

  useEffect(() => {
    if (!orderId || !orderData) {
      navigate('/');
      return;
    }
    
    // Clear cart after successful order
    clearCart();
  }, [orderId, orderData, navigate, clearCart]);

  if (!orderId || !orderData) {
    return null;
  }

  const getEstimatedDelivery = () => {
    const today = new Date();
    const deliveryDate = new Date(today.setDate(today.getDate() + 5)); // 5 days from now
    return deliveryDate.toLocaleDateString('en-IN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getPaymentMethodDisplay = () => {
    switch(paymentMethod) {
      case 'upi':
        return '📱 UPI Payment';
      case 'card':
        return '💳 Credit/Debit Card';
      case 'netbanking':
        return '🏦 Net Banking';
      case 'razorpay':
        return '💳 Razorpay Payment';
      case 'cod':
        return '💵 Cash on Delivery';
      default:
        return 'Payment Method';
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white px-4 py-8 text-[#273c2e] sm:px-6 lg:px-8 lg:py-10">
        <div className="mx-auto w-full max-w-[1000px]">
          {/* Success Badge */}
          <div className="mb-4 flex justify-center">
            <div className="grid h-24 w-24 place-items-center rounded-full border-4 border-[#43e97b] bg-white text-4xl text-[#43e97b] shadow-[0_10px_24px_rgba(67,233,123,0.25)] sm:h-28 sm:w-28">
              ✓
            </div>
          </div>

          {/* Success Message */}
          <div className="mb-6 text-center text-[#273c2e]">
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Order Placed Successfully! 🎉</h1>
            <p className="mt-2 text-base text-[#4f6354]">Thank you for your purchase. Your order has been confirmed.</p>
          </div>

          {/* Order Details Card */}
          <div className="rounded-2xl border border-[#e7dccb] bg-white p-5 shadow-[0_8px_24px_rgba(39,60,46,0.12)] sm:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#ede6d9] pb-4">
              <div>
                <h2 className="text-lg font-semibold text-[#4f6354]">Order ID</h2>
                <p className="text-3xl font-extrabold text-[#2e79e3]">#{orderId}</p>
              </div>
              <div>
                <span className="rounded-full bg-[#fff4cf] px-3 py-1 text-sm font-bold text-[#333]">⏳ Processing</span>
              </div>
            </div>

            <div className="mb-6 grid gap-3 md:grid-cols-3">
              {/* Delivery Information */}
              <div className="rounded-2xl border border-[#ede6d9] bg-gradient-to-br from-[#fff7eb] to-[#fff1de] p-4 text-center">
                <div className="mb-2 text-4xl">🚚</div>
                <h3 className="text-base font-semibold text-[#4f6354]">Estimated Delivery</h3>
                <p className="mt-1 text-lg font-bold text-[#273c2e]">{getEstimatedDelivery()}</p>
                <p className="mt-1 text-xs text-[#999]">Your order will be delivered in 5-7 business days</p>
              </div>

              {/* Payment Information */}
              <div className="rounded-2xl border border-[#ede6d9] bg-gradient-to-br from-[#fff7eb] to-[#fff1de] p-4 text-center">
                <div className="mb-2 text-4xl">💰</div>
                <h3 className="text-base font-semibold text-[#4f6354]">Payment Method</h3>
                <p className="mt-1 text-lg font-bold text-[#273c2e]">{getPaymentMethodDisplay()}</p>
                <p className="mt-1 text-xs text-[#999]">
                  {paymentMethod === 'cod' 
                    ? 'Pay when you receive your order' 
                    : 'Payment completed successfully'}
                </p>
              </div>

              {/* Order Total */}
              <div className="rounded-2xl border border-[#ede6d9] bg-gradient-to-br from-[#fff7eb] to-[#fff1de] p-4 text-center">
                <div className="mb-2 text-4xl">💳</div>
                <h3 className="text-base font-semibold text-[#4f6354]">Order Total</h3>
                <p className="mt-1 text-2xl font-extrabold text-[#273c2e]">₹{(Number(orderData.total)).toFixed(2)}</p>
                <p className="mt-1 text-xs text-[#999]">Including all taxes</p>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="mt-6 border-t-2 border-black pt-6">
              <h3 className="mb-4 text-xl font-bold text-[#333]">📍 Shipping Address</h3>
              <div className="rounded-xl border border-[#ede6d9] border-l-4 border-l-[#2e79e3] bg-[#fff8ea] p-4">
                <p className="mb-1 text-base font-bold text-[#333]">{orderData.shippingAddress.fullName}</p>
                <p className="text-sm leading-7 text-[#666]">{orderData.shippingAddress.address}</p>
                <p className="text-sm leading-7 text-[#666]">{orderData.shippingAddress.city}, {orderData.shippingAddress.zipCode}</p>
                <p className="text-sm leading-7 text-[#666]">📞 {orderData.shippingAddress.phone}</p>
                <p className="text-sm leading-7 text-[#666]">✉️ {orderData.shippingAddress.email}</p>
              </div>
            </div>

            {/* Order Items */}
            <div className="mt-6 border-t-2 border-black pt-6">
              <h3 className="mb-4 text-xl font-bold text-[#333]">📦 Order Items ({orderData.items.length})</h3>
              <div className="mb-4 space-y-3">
                {orderData.items.map((item, index) => (
                  <div key={index} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#f8f9fa] p-4 transition hover:translate-x-1">
                    <div>
                      <h4 className="text-base font-semibold text-[#333]">{item.name}</h4>
                      <p className="text-sm text-[#666]">Quantity: {Number(item.quantity) || 1}</p>
                    </div>
                    <div className="text-lg font-bold text-black">
                      ₹{(Number(item.price) * Number(item.quantity || 1)).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-[#ede6d9] bg-[#fff8ea] p-4">
                <div className="flex items-center justify-between py-2 text-sm text-[#4f6354]">
                  <span>Subtotal</span>
                  <span>₹{(Number(orderData.subtotal)).toFixed(2)}</span>
                </div>
                {/* <div className="summary-row">
                  <span>GST (18%)</span>
                  <span>₹{orderData.gst.toFixed(2)}</span>
                </div> */}
                <div className="mt-2 flex items-center justify-between border-t-2 border-[#ede6d9] pt-3 text-xl font-bold text-[#273c2e]">
                  <span>Total Amount</span>
                  <span>₹{(Number(orderData.total)).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Order Tracking Timeline */}
            <div className="mt-6 border-t-2 border-black pt-6">
              <h3 className="mb-4 text-xl font-bold text-[#333]">📋 Order Status</h3>
              <div className="space-y-4 border-l-[3px] border-[#ede6d9] pl-4">
                <div className="relative">
                  <span className="absolute -left-[22px] top-1 h-3.5 w-3.5 rounded-full bg-[#43e97b] ring-4 ring-[#43e97b]/25" />
                  <div>
                    <h4 className="text-base font-semibold text-[#333]">Order Placed</h4>
                    <p className="text-sm text-[#666]">Your order has been received</p>
                    <span className="text-xs text-[#999]">Just now</span>
                  </div>
                </div>

                <div className="relative">
                  <span className="absolute -left-[22px] top-1 h-3.5 w-3.5 rounded-full bg-[#e9ecef] ring-4 ring-[#e9ecef]" />
                  <div>
                    <h4 className="text-base font-semibold text-[#333]">Processing</h4>
                    <p className="text-sm text-[#666]">We're preparing your items</p>
                    <span className="text-xs text-[#999]">In progress</span>
                  </div>
                </div>

                <div className="relative">
                  <span className="absolute -left-[22px] top-1 h-3.5 w-3.5 rounded-full bg-[#e9ecef] ring-4 ring-[#e9ecef]" />
                  <div>
                    <h4 className="text-base font-semibold text-[#333]">Shipped</h4>
                    <p className="text-sm text-[#666]">Your order is on the way</p>
                    <span className="text-xs text-[#999]">Pending</span>
                  </div>
                </div>

                <div className="relative">
                  <span className="absolute -left-[22px] top-1 h-3.5 w-3.5 rounded-full bg-[#e9ecef] ring-4 ring-[#e9ecef]" />
                  <div>
                    <h4 className="text-base font-semibold text-[#333]">Delivered</h4>
                    <p className="text-sm text-[#666]">Package delivered successfully</p>
                    <span className="text-xs text-[#999]">Pending</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col gap-3 border-t-2 border-[#f0f0f0] pt-6 sm:flex-row">
              <button 
                className="flex-1 rounded-xl bg-[#E74C8B] px-4 py-3 text-sm font-bold uppercase tracking-[0.05em] text-white shadow-[0_6px_20px_rgba(182,158,106,0.4)] transition hover:-translate-y-0.5"
                onClick={() => navigate('/products')}
              >
                Continue Shopping
              </button>
              <button 
                className="flex-1 rounded-xl border-2 border-[#b69e6a] bg-white px-4 py-3 text-sm font-bold uppercase tracking-[0.05em] text-[#b69e6a] transition hover:bg-[#f6f2e8]"
                onClick={() => navigate('/')}
              >
                Back to Home
              </button>
            </div>

            {/* Additional Info */}
            <div className="mt-6 rounded-xl border border-[#ede6d9] bg-[#fff8ea] p-4 text-center">
              <p className="text-sm leading-7 text-[#4f6354]">📧 A confirmation email has been sent to <strong>{orderData.shippingAddress.email}</strong></p>
              <p className="text-sm leading-7 text-[#4f6354]">💬 Need help? <a href="/contact" className="font-semibold text-[#b69e6a] hover:underline">Contact our support team</a></p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderConfirmationPage;
