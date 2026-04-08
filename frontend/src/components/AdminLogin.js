import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from "./config";

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is already logged in
    const adminToken = localStorage.getItem('adminToken');
    if (adminToken) {
      // Verify token is still valid
      verifyToken(adminToken);
    }
  }, []);

  const verifyToken = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      // ✅ Go to dashboard, not /admin
      navigate('/admin/adminpage');
    } else {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
    }
  } catch (error) {
    console.error('Token verification failed:', error);
  }
};


  // const verifyToken = async (token) => {
  //   try {
  //     const response = await fetch(`${API_BASE_URL}/api/admin/verify`, {
  //       headers: {
  //         'Authorization': `Bearer ${token}`
  //       }
  //     });

  //     if (response.ok) {
  //       navigate('/admin');
  //     } else {
  //       localStorage.removeItem('adminToken');
  //       localStorage.removeItem('adminUser');
  //     }
  //   } catch (error) {
  //     console.error('Token verification failed:', error);
  //   }
  // };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    console.log('LOGIN RESPONSE:', data);

    if (data.success && data.token) {
      // localStorage.setItem('adminToken', data.token);
      // localStorage.setItem('adminUser', JSON.stringify(data.admin));

      localStorage.setItem("adminToken", data.token);
localStorage.setItem("adminUser", JSON.stringify(data.admin));

      navigate('/admin/adminpage');
    } else {
      setError(data.message || 'Login failed');
    }
  } catch (error) {
    console.error('Login error:', error);
    setError('Server error. Please try again.');
  } finally {
    setLoading(false);
  }
};


//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     try {
//       const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ username, password }),
//       });

//       const data = await response.json();

//       if (data.success) {
//         // Store token and admin info
//         // localStorage.setItem('adminToken', data.token);
//         // localStorage.setItem('adminUser', JSON.stringify(data.admin));
//         localStorage.setItem("adminToken", response.data.token);
// localStorage.setItem("admin", JSON.stringify(response.data.admin));

//         // Redirect to admin dashboard
//         navigate('/admin');
//       } else {
//         setError(data.message || 'Login failed');
//       }
//     } catch (error) {
//       console.error('Login error:', error);
//       setError('Server error. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[linear-gradient(120deg,#fff7eb_0%,#ede6d9_40%,#dccaaa_70%,#bca67a_100%)] px-3 py-3 font-sans sm:px-6 sm:py-4 lg:px-8">
      <div className="absolute inset-0 opacity-100">
        <div className="absolute left-[5%] top-[5%] h-[150px] w-[150px] animate-[float_20s_ease-in-out_infinite] rounded-full bg-slate-900/10 backdrop-blur-[6px] md:h-[300px] md:w-[300px]" />
        <div className="absolute left-[65%] top-[55%] h-[100px] w-[100px] animate-[float_20s_ease-in-out_infinite_2s] rounded-full bg-slate-900/10 backdrop-blur-[6px] md:h-[200px] md:w-[200px]" />
        <div className="absolute left-[15%] bottom-[5%] h-[80px] w-[80px] animate-[float_20s_ease-in-out_infinite_4s] rounded-full bg-slate-900/10 backdrop-blur-[6px] md:h-[150px] md:w-[150px]" />
        <div className="absolute right-[5%] top-[10%] h-[120px] w-[120px] animate-[float_20s_ease-in-out_infinite_6s] rounded-full bg-slate-900/10 backdrop-blur-[6px] md:h-[250px] md:w-[250px]" />
      </div>

      <div className="relative z-10 w-full max-w-xs px-2.5 py-2 sm:max-w-md sm:px-4 sm:py-2.5 md:max-w-lg">
        <div className="animate-[slideUp_0.6s_ease-out] rounded-xl border border-white/30 bg-white/98 px-4 py-5 shadow-[0_16px_40px_rgba(39,60,46,0.12)] backdrop-blur-[12px] sm:px-5 sm:py-6 sm:rounded-2xl md:px-6 md:py-6.5 md:rounded-2xl">
          <div className="mb-4 text-center sm:mb-5 md:mb-6">
            <div className="mx-auto mb-2.5 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-[#2e79e3] to-[#1c5ac2] shadow-[0_8px_20px_rgba(46,121,227,0.32)] animate-[iconPulse_2s_ease-in-out_infinite] sm:h-14 sm:w-14 sm:rounded-xl md:h-16 md:w-16 md:rounded-xl">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white sm:h-7 sm:w-7 md:h-8 md:w-8">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="mb-0.5 text-xl font-bold tracking-tight text-[#1b3137] sm:text-2xl md:text-2xl">Admin Access</h1>
            <p className="text-xs text-[#666] sm:text-sm md:text-sm">Admin Dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="mb-3 sm:mb-4 md:mb-4">
            {error && (
            <div className="mb-3 flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#fef3f3] to-[#fde8e8] border border-[#fcc] px-3 py-2 text-xs font-medium text-[#b42828] sm:mb-3.5 sm:px-3.5 sm:py-2.5 sm:text-xs md:mb-4" style={{ animation: 'shake 0.5s ease-in-out' }}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="12" cy="16" r="1" fill="currentColor" />
              </svg>
              {error}
            </div>
            )}

            <div className="mb-3 sm:mb-3.5 md:mb-4">
              <label htmlFor="username" className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-[#273c2e] sm:text-xs md:text-sm">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-4 sm:w-4">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Username or Email
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                disabled={loading}
                className="w-full rounded border-2 border-[#e0e0e0] bg-white px-2.5 py-2 text-xs text-[#273c2e] transition focus:border-[#2e79e3] focus:bg-[#f0f7ff] focus:outline-none focus:ring-2 focus:ring-[#2e79e3]/20 disabled:cursor-not-allowed disabled:bg-slate-100 sm:rounded-lg sm:px-3 sm:py-2 sm:text-xs md:px-3.5 md:py-2.5 md:text-sm"
              />
            </div>

            <div className="mb-3 sm:mb-3.5 md:mb-4">
              <label htmlFor="password" className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-[#273c2e] sm:text-xs md:text-sm">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-4 sm:w-4">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
                className="w-full rounded border-2 border-[#e0e0e0] bg-white px-2.5 py-2 text-xs text-[#273c2e] transition focus:border-[#2e79e3] focus:bg-[#f0f7ff] focus:outline-none focus:ring-2 focus:ring-[#2e79e3]/20 disabled:cursor-not-allowed disabled:bg-slate-100 sm:rounded-lg sm:px-3 sm:py-2 sm:text-xs md:px-3.5 md:py-2.5 md:text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 flex w-full items-center justify-center gap-1.5 rounded bg-gradient-to-r from-[#2e79e3] to-[#1c5ac2] px-3 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-[0_8px_20px_rgba(46,121,227,0.3)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(46,121,227,0.4)] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none sm:rounded-lg sm:px-3.5 sm:py-2.5 sm:text-xs md:px-4 md:py-2.5 md:text-sm"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  <span className="text-xs sm:text-xs md:text-sm">Authenticating...</span>
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4">
                    <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M10 17L15 12L10 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M15 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-xs sm:text-xs md:text-sm">Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="border-t border-[#e0e0e0] pt-3.5 sm:pt-4 md:pt-5 text-center">
            <p className="mb-2.5 flex items-center justify-center gap-1.5 text-xs text-[#666] sm:mb-3">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Secure Admin Access Only
            </p>
            <button 
              type="button" 
              className="rounded border-2 border-[#e0e0e0] bg-transparent px-3.5 py-2 text-xs font-semibold text-[#2e79e3] transition hover:bg-[#2e79e3] hover:text-white sm:rounded-lg sm:px-4 sm:py-2.5 md:px-4 md:py-2.5 md:text-sm"
              onClick={() => navigate('/')}
            >
              ← Back to Store
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
