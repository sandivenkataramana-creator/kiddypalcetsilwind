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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[linear-gradient(120deg,#fff7eb_0%,#ede6d9_40%,#dccaaa_70%,#bca67a_100%)] px-5 font-sans">
      <div className="absolute inset-0 opacity-100">
        <div className="absolute left-[10%] top-[10%] h-[300px] w-[300px] animate-[float_20s_ease-in-out_infinite] rounded-full bg-slate-900/10 backdrop-blur-[6px]" />
        <div className="absolute left-[70%] top-[60%] h-[200px] w-[200px] animate-[float_20s_ease-in-out_infinite_2s] rounded-full bg-slate-900/10 backdrop-blur-[6px]" />
        <div className="absolute left-[20%] top-[80%] h-[150px] w-[150px] animate-[float_20s_ease-in-out_infinite_4s] rounded-full bg-slate-900/10 backdrop-blur-[6px]" />
        <div className="absolute left-[80%] top-[20%] h-[250px] w-[250px] animate-[float_20s_ease-in-out_infinite_6s] rounded-full bg-slate-900/10 backdrop-blur-[6px]" />
      </div>

      <div className="relative z-10 w-full max-w-[450px] p-5">
        <div className="animate-[slideUp_0.6s_ease-out] rounded-[24px] border border-amber-700/20 bg-[#fff7eb]/95 px-5 py-10 shadow-[0_24px_70px_rgba(39,60,46,0.25)] backdrop-blur-[12px] sm:px-10">
          <div className="mb-10 text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[20px] bg-gradient-to-br from-[#bca67a] to-[#a48c65] shadow-[0_12px_32px_rgba(182,158,106,0.45)] animate-[iconPulse_2s_ease-in-out_infinite]">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="mb-2 text-3xl font-bold tracking-[0.5px] text-[#273c2e]">Admin Access</h1>
            <p className="text-base text-[#4f6354]">Kids Toy Store - Admin Dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="mb-7">
            {error && (
              <div className="mb-6 flex items-center gap-3 rounded-xl bg-gradient-to-r from-[#d86161] to-[#b74949] px-5 py-4 text-sm font-medium text-[#fff7eb] shadow-[0_6px_18px_rgba(182,74,74,0.35)] animate-[shake_0.5s_ease-in-out]">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                  <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="12" cy="16" r="1" fill="currentColor" />
                </svg>
                {error}
              </div>
            )}

            <div className="mb-6">
              <label htmlFor="username" className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#273c2e]">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                className="w-full rounded-xl border-2 border-[#ede6d9] bg-white px-4 py-3 text-base text-[#273c2e] transition focus:border-[#b69e6a] focus:bg-[#fff7eb] focus:outline-none focus:shadow-[0_0_0_4px_rgba(182,158,106,0.18)] disabled:cursor-not-allowed disabled:bg-slate-200"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#273c2e]">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                className="w-full rounded-xl border-2 border-[#ede6d9] bg-white px-4 py-3 text-base text-[#273c2e] transition focus:border-[#b69e6a] focus:bg-[#fff7eb] focus:outline-none focus:shadow-[0_0_0_4px_rgba(182,158,106,0.18)] disabled:cursor-not-allowed disabled:bg-slate-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#bca67a] to-[#a48c65] px-4 py-4 text-[1rem] font-bold uppercase tracking-[1px] text-[#fff7eb] shadow-[0_10px_24px_rgba(182,158,106,0.45)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(182,158,106,0.55)] disabled:cursor-not-allowed disabled:bg-gradient-to-r disabled:from-[#cfc6b3] disabled:to-[#b3a285] disabled:shadow-none"
            >
              {loading ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Authenticating...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M10 17L15 12L10 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M15 12H3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="border-t border-[#ede6d9] pt-6 text-center">
            <p className="mb-4 flex items-center justify-center gap-2 text-sm text-[#4f6354]">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Secure Admin Access Only
            </p>
            <button 
              type="button" 
              className="rounded-lg border-2 border-[#b69e6a] bg-transparent px-6 py-2.5 text-sm font-semibold text-[#b69e6a] transition hover:-translate-x-1 hover:bg-[#b69e6a] hover:text-[#fff7eb]"
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
