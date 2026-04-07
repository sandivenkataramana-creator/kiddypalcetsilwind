import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { API_BASE_URL } from "./config";

const COUNTRY_OPTIONS = [
  { value: '+91', label: '🇮🇳 +91', pattern: '[0-9]{10}', description: '10-digit number' },
  { value: '+1', label: '🇺🇸 +1', pattern: '[0-9]{10}', description: '10-digit number' },
  { value: '+44', label: '🇬🇧 +44', pattern: '[0-9]{10}', description: '10-digit number' },
  { value: '+61', label: '🇦🇺 +61', pattern: '[0-9]{9}', description: '9-digit number' },
  { value: '+971', label: '🇦🇪 +971', pattern: '[0-9]{9}', description: '9-digit number' }
];

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    countryCode: COUNTRY_OPTIONS[0].value,
    mobileNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ show: false, message: '' });

  const selectedCountry =
    COUNTRY_OPTIONS.find((option) => option.value === formData.countryCode) || COUNTRY_OPTIONS[0];

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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    const sanitizedMobile = formData.mobileNumber.trim();
    const mobileRegex = new RegExp(`^${selectedCountry.pattern}$`);
    if (!mobileRegex.test(sanitizedMobile)) {
      setError(`Please enter a valid mobile number (${selectedCountry.description}) for ${selectedCountry.label}.`);
      return;
    }

    // Match UI hint and regex: minimum 8 characters.
    if (!formData.password || formData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          countryCode: formData.countryCode,
          mobileNumber: sanitizedMobile,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token in localStorage
        localStorage.setItem('token', data.token);
        //localStorage.setItem('user', JSON.stringify(data.user));

        // Show centered popup and then redirect to login
        setToast({ show: true, message: 'Signup successful!' });
        setTimeout(() => {
          setToast({ show: false, message: '' });
          navigate('/login');
        }, 1200);
      } else {
        setError(data.message || 'Signup failed. Please try again.');
      }
    } catch (err) {
      console.error('Signup error:', err);
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
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-white">
      <div className="pointer-events-none absolute inset-0 -z-0 bg-[radial-gradient(circle_at_15%_20%,rgba(46,121,227,0.09),transparent_45%),radial-gradient(circle_at_85%_10%,rgba(240,28,113,0.1),transparent_40%),radial-gradient(circle_at_50%_100%,rgba(182,158,106,0.16),transparent_48%)]" />
      <Header />
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="w-full max-w-5xl">
          <div className="overflow-hidden rounded-[30px] border border-white/45 bg-white/95 shadow-[0_30px_80px_rgba(0,0,0,0.2)] backdrop-blur-sm">
            <div className="relative overflow-hidden bg-[#2e79e3] px-6 py-6 text-[#fff7eb] sm:px-10">
              <div className="pointer-events-none absolute -right-28 -top-20 h-60 w-60 rounded-full bg-white/20 blur-2xl" />
              <h2 className="relative text-3xl font-black tracking-tight sm:text-4xl">Sign Up</h2>
              <p className="relative mt-2 text-sm text-[#fff7eb]/90 sm:text-base">Create your account to start shopping</p>
            </div>

            {error && (
              <div className="mx-5 mt-5 rounded-xl border border-[#fcc] bg-[#ffeeee] px-4 py-3 text-sm font-medium text-[#b42828] sm:mx-8">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white px-5 py-6 sm:px-8 sm:py-8">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className={labelClass}>First Name:</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={inputBaseClass}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className={labelClass}>Last Name:</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={inputBaseClass}
                    required
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="email" className={labelClass}>Email:</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputBaseClass}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="mobileNumber" className={labelClass}>Mobile Number:</label>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-[auto_1fr]">
                    <select
                      id="countryCode"
                      name="countryCode"
                      value={formData.countryCode}
                      onChange={handleChange}
                      aria-label="Country code"
                      className="min-w-[104px] rounded-xl border-2 border-[#e0e0e0] bg-[#f9f9f9] px-3 py-3 text-sm text-[#273c2e] transition focus:-translate-y-0.5 focus:border-[#b69e6a] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#b69e6a]/20"
                      required
                    >
                      {COUNTRY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      id="mobileNumber"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={handleChange}
                      pattern={selectedCountry.pattern}
                      inputMode="numeric"
                      placeholder={selectedCountry.description}
                      className={inputBaseClass}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="password" className={labelClass}>Password:</label>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`${inputBaseClass} pr-12`}
                      required
                      pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
                      title="Password must be at least 8 characters long and include uppercase, lowercase, number, and special character."
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

                <div>
                  <label htmlFor="confirmPassword" className={labelClass}>Confirm Password:</label>
                  <div className="relative flex items-center">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`${inputBaseClass} pr-12`}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 inline-flex h-7 w-7 items-center justify-center rounded-full text-base transition hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-[#b69e6a]/35"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirmPassword ? '🙈' : '👁'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-gradient-to-r from-[#bca67a] to-[#a48c65] px-4 py-3 text-sm font-bold uppercase tracking-[0.08em] text-white shadow-[0_10px_24px_rgba(182,158,106,0.42)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_26px_rgba(182,158,106,0.5)] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
                  disabled={loading}
                >
                  {loading ? 'Signing Up...' : 'Sign Up'}
                </button>
                <button
                  type="button"
                  className="flex-1 rounded-xl border-2 border-[#ede6d9] bg-[#fff7eb] px-4 py-3 text-sm font-bold uppercase tracking-[0.08em] text-[#273c2e] transition hover:-translate-y-0.5 hover:bg-[#fff1de]"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
              </div>
            </form>
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
              Redirecting to login...
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignupPage;
