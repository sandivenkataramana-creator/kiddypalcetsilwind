import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { API_BASE_URL } from "./config";

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and user info in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // If user is admin, also store admin credentials so admin features work.
        if (data.user && (data.user.role === 'admin' || data.user.role === 'super_admin')) {
          localStorage.setItem('adminToken', data.token);
          localStorage.setItem('adminUser', JSON.stringify(data.user));
        }

        // Notify app that user context changed (for per-user cart)
        try {
          window.dispatchEvent(new Event('user-changed'));
        } catch {
          // ignore
        }

        // Show centered popup and then redirect
        setToast({ show: true, message: 'Login successful!' });
        setTimeout(() => {
          setToast({ show: false, message: '' });
          navigate('/');
        }, 1200);
      } else {
        setError(data.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };


  const handleCancel = () => {
    navigate('/');
  };

  const inputBaseClass =
    'w-full rounded-xl border-2 border-[#e0e0e0] bg-[#f9f9f9] px-4 py-3 text-sm text-[#273c2e] transition focus:-translate-y-0.5 focus:border-[#b69e6a] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#b69e6a]/20';
  const labelClass = 'mb-2 block text-sm font-semibold text-[#273c2e]';

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="w-full max-w-[480px]">
          <div className="overflow-hidden rounded-[20px] border border-[#ede6d9] bg-white shadow-[0_25px_60px_rgba(39,60,46,0.12)]">
            <div className="bg-[#2e79e3] px-6 py-5 text-center text-white">
              <h2 className="text-3xl font-black tracking-tight sm:text-[2rem]">Welcome Back!</h2>
              <p className="mt-1 text-sm text-white/85 sm:text-base">Login to continue shopping</p>
            </div>

            <div className="bg-white px-5 py-6 sm:px-8 sm:py-8">
              {error && (
                <div className="mb-5 rounded-xl border border-[#fcc] bg-[#ffeeee] px-4 py-3 text-sm font-medium text-[#b42828]">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-5">
                  <label htmlFor="email" className={labelClass}>Email:</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className={inputBaseClass}
                    required
                  />
                </div>

                <div className="mb-5">
                  <label htmlFor="password" className={labelClass}>Password:</label>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className={`${inputBaseClass} pr-12`}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 inline-flex h-7 w-7 items-center justify-center rounded-full text-base transition hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-[#b69e6a]/35"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? '🙈' : '👁'}
                    </button>
                  </div>
                </div>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-gradient-to-r from-[#bca67a] to-[#a48c65] px-4 py-3 text-sm font-bold uppercase tracking-[0.08em] text-[#fff7eb] shadow-[0_10px_24px_rgba(182,158,106,0.42)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_26px_rgba(182,158,106,0.5)] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
                    disabled={loading}
                  >
                    {loading ? 'Logging In...' : 'Login'}
                  </button>
                  <button
                    type="button"
                    className="flex-1 rounded-xl border-2 border-[#ede6d9] bg-[#fff7eb] px-4 py-3 text-sm font-bold uppercase tracking-[0.08em] text-[#273c2e] transition hover:-translate-y-0.5 hover:bg-[#fff1de]"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                </div>

                <div className="mt-6 border-t border-[#e0e0e0] pt-6 text-center">
                  <p className="text-sm text-[#666]">
                    Don't have an account?{' '}
                    <Link to="/signup" className="font-semibold text-[#b69e6a] hover:underline">
                      Sign Up
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Centered Popup Toast */}
      {toast.show && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
          <div className="relative w-[min(92vw,440px)] rounded-[18px] border border-[rgba(182,158,106,0.35)] bg-[#fff7eb] px-7 py-6 text-center font-bold text-[#273c2e] shadow-[0_18px_40px_rgba(39,60,46,0.18)] animate-[kpScaleIn_240ms_ease-out]">
            <div className="mx-auto mb-3 grid h-[54px] w-[54px] place-items-center rounded-full border-2 border-white/55 bg-gradient-to-br from-[#6fbf8c] to-[#4f8f70] text-[#fff7eb] shadow-[0_8px_20px_rgba(111,191,140,0.35)]">
              ✓
            </div>
            <div className="mb-1 text-lg tracking-[0.2px]">
              {toast.message}
            </div>
            <div className="text-[13px] font-medium text-[#4f6354]">
              Redirecting to home...
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
