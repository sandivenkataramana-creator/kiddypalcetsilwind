import React, { useState } from 'react';

const LoginForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login data:', formData);
    // Here you would typically handle the login logic
    alert('Login functionality would be implemented here!');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-[linear-gradient(135deg,rgba(255,247,235,0.95),rgba(220,202,170,0.95))] p-4 backdrop-blur-[10px]"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-[550px] overflow-y-auto rounded-[30px] border border-[#ede6d9] bg-white shadow-[0_30px_80px_rgba(39,60,46,0.25)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative flex items-center justify-between overflow-hidden rounded-t-[30px] bg-gradient-to-r from-[#bca67a] to-[#a48c65] px-6 py-8 text-[#fff7eb] sm:px-8 sm:py-10">
          <div className="absolute right-[-50%] top-[-50%] h-full w-full rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.2)_0%,transparent_70%)] opacity-80" />
          <h2 className="relative z-10 text-2xl font-black tracking-[1px] text-[#fff7eb] drop-shadow-[0_3px_10px_rgba(0,0,0,0.2)] sm:text-[2rem]">
            Login
          </h2>
          <button
            className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-0 bg-transparent text-[1.8rem] text-[#fff7eb] transition hover:rotate-90 hover:bg-white/30 hover:scale-110 sm:h-9 sm:w-9 sm:text-2xl"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-gradient-to-br from-white to-[#fff7eb] px-6 py-8 sm:px-10 sm:py-12">
          <div className="mb-6 flex flex-col gap-3">
            <label htmlFor="email" className="text-sm font-bold text-[#4f6354]">
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full rounded-xl border-2 border-[#ede6d9] bg-[#fff8ea] px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:-translate-y-0.5 focus:border-[#b69e6a] focus:bg-white focus:shadow-[0_5px_20px_rgba(182,158,106,0.2)]"
            />
          </div>
          
          <div className="mb-8 flex flex-col gap-3">
            <label htmlFor="password" className="text-sm font-bold text-[#4f6354]">
              Password:
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full rounded-xl border-2 border-[#ede6d9] bg-[#fff8ea] px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:-translate-y-0.5 focus:border-[#b69e6a] focus:bg-white focus:shadow-[0_5px_20px_rgba(182,158,106,0.2)]"
            />
          </div>
          
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#bca67a] to-[#a48c65] px-4 py-3 text-sm font-semibold uppercase tracking-[1px] text-[#fff7eb] shadow-[0_5px_20px_rgba(182,158,106,0.45)] transition hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_8px_30px_rgba(182,158,106,0.55)] sm:flex-1"
            >
              Login
            </button>
            <button
              type="button"
              className="rounded-xl border-2 border-[#ede6d9] bg-[#fff7eb] px-4 py-3 text-sm font-semibold uppercase tracking-[1px] text-[#273c2e] transition hover:-translate-y-0.5 hover:bg-[#fff1de] hover:shadow-[0_5px_15px_rgba(39,60,46,0.15)] sm:flex-1"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
