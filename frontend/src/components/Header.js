import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Search, ShoppingCart, User, Home, MapPin, ChevronDown, ChevronRight, Menu, X } from 'lucide-react';
import logo from '../components/assets/kp-logo.png';
import { API_BASE_URL } from './config';

const Header = () => {
  const navigate = useNavigate();
  const { getCartItemCount } = useCart();
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showStoresDropdown, setShowStoresDropdown] = useState(false);
  const [showAuthDropdown, setShowAuthDropdown] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [announcements, setAnnouncements] = useState([]);
  const [announcementSettings, setAnnouncementSettings] = useState({ displayDuration: 5000, gapDuration: 1000 });
  const [currentAnnouncementIndex, setCurrentAnnouncementIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const headerRef = useRef(null);
  const typingTimer = useRef(null);
  const dropdownCloseTimer = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current?.contains(event.target)) return;
      setActiveDropdown(null);
      setShowStoresDropdown(false);
      setShowAuthDropdown(false);
      setSearchOpen(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && storedUser !== 'undefined') {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse user data:', error);
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    const fetchCategories = () => {
      fetch(`${API_BASE_URL}/api/categories`)
        .then((response) => response.json())
        .then((data) => setCategories(Array.isArray(data) ? data : []))
        .catch((error) => console.error('Error fetching categories:', error));
    };

    fetchCategories();
    const handler = () => fetchCategories();
    window.addEventListener('categories-updated', handler);
    return () => window.removeEventListener('categories-updated', handler);
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/brands`)
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setBrands(data);
        }
      })
      .catch((error) => console.error('Error fetching brands:', error));
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchAnnouncements = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/settings/announcements`);
        const data = await response.json();
        if (!mounted) return;
        setAnnouncements(Array.isArray(data.announcements) ? data.announcements : []);
        if (data.settings) setAnnouncementSettings(data.settings);
        setCurrentAnnouncementIndex(0);
      } catch (error) {
        console.error('Failed to load announcements', error);
        try {
          const fallbackResponse = await fetch(`${API_BASE_URL}/api/settings/top-announcement`);
          const fallbackData = await fallbackResponse.json();
          if (fallbackData && fallbackData.announcement) {
            setAnnouncements([{ id: Date.now(), text: fallbackData.announcement }]);
          }
        } catch (fallbackError) {
          console.error('Failed to load fallback announcement', fallbackError);
        }
      }
    };

    fetchAnnouncements();
    const handler = () => fetchAnnouncements();
    window.addEventListener('announcements-updated', handler);

    return () => {
      mounted = false;
      window.removeEventListener('announcements-updated', handler);
    };
  }, []);

  useEffect(() => {
    if (!announcements.length) return undefined;

    const displayDuration = announcementSettings?.displayDuration || 5000;
    const gapDuration = announcementSettings?.gapDuration || 1000;

    const timer = window.setTimeout(() => {
      setCurrentAnnouncementIndex((previous) => (previous + 1) % announcements.length);
    }, displayDuration + gapDuration);

    return () => window.clearTimeout(timer);
  }, [announcements, announcementSettings, currentAnnouncementIndex]);

  useEffect(() => {
    try {
      const savedQuery = sessionStorage.getItem('header.searchQuery');
      const savedOpen = sessionStorage.getItem('header.searchOpen');
      if (savedQuery) setSearchQuery(savedQuery);
      if (savedOpen === 'true') setSearchOpen(true);
    } catch {
      // ignore session storage issues
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem('header.searchQuery', searchQuery || '');
      sessionStorage.setItem('header.searchOpen', searchOpen ? 'true' : 'false');
    } catch {
      // ignore session storage issues
    }
  }, [searchQuery, searchOpen]);

  useEffect(() => () => {
    if (typingTimer.current) {
      clearTimeout(typingTimer.current);
    }
    if (dropdownCloseTimer.current) {
      window.clearTimeout(dropdownCloseTimer.current);
    }
  }, []);

  const cancelDropdownClose = () => {
    if (dropdownCloseTimer.current) {
      window.clearTimeout(dropdownCloseTimer.current);
      dropdownCloseTimer.current = null;
    }
  };

  const scheduleDropdownClose = (name) => {
    cancelDropdownClose();
    dropdownCloseTimer.current = window.setTimeout(() => {
      setActiveDropdown((previous) => (previous === name ? null : previous));
      dropdownCloseTimer.current = null;
    }, 120);
  };

  const toggleDropdown = (name) => {
    cancelDropdownClose();
    setActiveDropdown((previous) => (previous === name ? null : name));
  };

  const handleLoginClick = () => navigate('/login');
  const handleSignupClick = () => navigate('/signup');

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');

    setUser(null);
    setShowAuthDropdown(false);

    try {
      window.dispatchEvent(new Event('user-changed'));
    } catch {
      // ignore
    }

    setToast({ show: true, message: 'Logged out successfully!' });
    setTimeout(() => setToast({ show: false, message: '' }), 1200);
  };

  const handleMouseEnter = async (categoryId) => {
    setHoveredCategory(categoryId);
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories/${categoryId}/subcategories`);
      const data = await response.json();
      setSubcategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
    }
  };

  const handleNavigateCategory = (subcategory) => {
    navigate(`/products/by-subcategory/${encodeURIComponent(subcategory)}`);
    setHoveredCategory(null);
    setSubcategories([]);
    setActiveDropdown(null);
  };

  const capitalizeFirstLetter = (text = '') => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  const navItemClass = 'relative cursor-pointer text-sm font-medium text-[#070707]';
  const navButtonClass = 'inline-flex items-center gap-1 border-0 bg-transparent text-sm font-medium text-[#070707] transition hover:-translate-y-px hover:text-black';
  const navDropdownItemClass = 'cursor-pointer px-4 py-2 text-sm font-medium transition hover:bg-[#fff7eb]';

  return (
    <header ref={headerRef} className="sticky top-0 z-[1200] w-full">
      <div className="relative z-[1001] bg-[#2e79e3] px-3 py-2 text-[#fff7eb] sm:px-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-shrink-0 text-sm font-semibold sm:text-base">📞 +91 70750 04435</div>

          <div className="hidden overflow-hidden md:block md:flex-1 md:mx-2">
            <div
              className="top-announcement-text inline-block whitespace-nowrap pl-[100%] text-sm font-medium animate-[kpMarquee_8s_linear_infinite] sm:text-base"
              style={{ willChange: 'transform', transform: 'translate3d(0,0,0)' }}
              aria-live="polite"
              aria-atomic="true"
            >
              {announcements.length > 0 ? announcements[currentAnnouncementIndex].text : ''}
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <a href="https://kiddypalace.in/" target="_blank" rel="noopener noreferrer" className="inline-flex h-7 w-7 items-center justify-center rounded-full text-white transition hover:bg-white/15 sm:h-8 sm:w-8">
              <i className="fab fa-instagram" />
            </a>
            <a href="https://kiddypalace.in/" target="_blank" rel="noopener noreferrer" className="inline-flex h-7 w-7 items-center justify-center rounded-full text-white transition hover:bg-white/15 sm:h-8 sm:w-8">
              <i className="fab fa-facebook-f" />
            </a>

            <div className="relative" onMouseEnter={() => setShowStoresDropdown(true)} onMouseLeave={() => setShowStoresDropdown(false)}>
              <button className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-white/15 sm:px-3 sm:py-2 sm:text-sm">
                <Home size={14} className="mr-1 sm:h-4 sm:w-4" />
                Our Stores
              </button>

              {showStoresDropdown && (
                <div className="absolute right-0 top-full z-50 w-72 rounded-2xl bg-white p-3 shadow-soft ring-1 ring-black/5">
                <a href="https://www.google.com/maps/search/?api=1&query=Kiddy+Palace+Narsingi" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2 text-[#273c2e] transition hover:bg-[#fff7eb]">
                  <span className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[#f4f7f5] text-[#2e79e3]"><MapPin size={20} /></span>
                  <span className="text-sm font-medium leading-5">Narsingi - 70750 04435</span>
                </a>
                <a href="https://maps.app.goo.gl/GhHuPQJrWw1n2XF98" target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2 text-[#273c2e] transition hover:bg-[#fff7eb]">
                  <span className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[#f4f7f5] text-[#2e79e3]"><MapPin size={20} /></span>
                  <span className="text-sm font-medium leading-5">Nanakramguda - 92912 55974</span>
                </a>
                <a href="https://maps.app.goo.gl/F2n5Bmf44XNTkgTG9" target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2 text-[#273c2e] transition hover:bg-[#fff7eb]">
                  <span className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-full bg-[#f4f7f5] text-[#2e79e3]"><MapPin size={20} /></span>
                  <span className="text-sm font-medium leading-5">Nallagandla - 70758 84435</span>
                </a>
              </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-1.5 w-full overflow-hidden md:hidden">
          <div
            className="top-announcement-text inline-block whitespace-nowrap pl-[100%] text-sm font-medium animate-[kpMarquee_8s_linear_infinite] sm:text-base"
            style={{ willChange: 'transform', transform: 'translate3d(0,0,0)' }}
            aria-live="polite"
            aria-atomic="true"
          >
            {announcements.length > 0 ? announcements[currentAnnouncementIndex].text : ''}
          </div>
        </div>
      </div>

      <div className="relative z-[1000] flex items-center justify-between bg-white px-2 py-1.5 shadow-[0_4px_10px_rgba(39,60,46,0.1)] sm:px-3 lg:px-4">
        <div className="flex items-center">
          <a href="/"><img src={logo} alt="KP Logo" className="h-12 w-auto cursor-pointer transition hover:scale-105 sm:h-16" /></a>
        </div>

        <div className="hidden flex-1 justify-center xl:flex">
          <ul className="m-0 flex list-none items-center gap-6 p-0">
            <li className={navItemClass} onClick={() => navigate('/about')}>About</li>
            <li className={navItemClass} onClick={() => navigate('/products')}>All Products</li>

            <li className={navItemClass} onMouseEnter={() => { cancelDropdownClose(); setActiveDropdown('age'); }} onMouseLeave={() => scheduleDropdownClose('age')}>
              <button type="button" className={navButtonClass} onClick={() => toggleDropdown('age')}>
                Age <ChevronDown size={12} strokeWidth={2.2} className={`transition-transform duration-200 ${activeDropdown === 'age' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'age' && (
                <ul className="absolute left-0 top-full z-50 mt-3 flex min-w-40 flex-col rounded-2xl bg-white py-2 shadow-soft ring-1 ring-black/5" onMouseEnter={() => cancelDropdownClose()} onMouseLeave={() => scheduleDropdownClose('age')}>
                  {['0-18 Months', '18-36 Months', '3-5 Years', '5-7 Years', '7-9 Years', '9-12 Years', '12+ Years'].map((age) => (
                    <li key={age} className={navDropdownItemClass} onClick={() => { navigate(`/products?age=${encodeURIComponent(age)}`); setActiveDropdown(null); }}>
                      {age}
                    </li>
                  ))}
                </ul>
              )}
            </li>

            <li className={navItemClass} onClick={() => navigate('/products?new=true')}>New Arrivals</li>

            <li className={navItemClass} onMouseEnter={() => { cancelDropdownClose(); setActiveDropdown('categories'); }} onMouseLeave={() => scheduleDropdownClose('categories')}>
              <button type="button" className={navButtonClass} onClick={() => toggleDropdown('categories')}>
                Categories <ChevronDown size={12} strokeWidth={2.2} className={`transition-transform duration-200 ${activeDropdown === 'categories' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'categories' && (
                <div className="absolute left-0 top-full z-50 mt-3 flex w-[min(760px,calc(100vw-1rem))] overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-black/5" onClick={(event) => event.stopPropagation()} onMouseEnter={() => cancelDropdownClose()} onMouseLeave={() => scheduleDropdownClose('categories')}>
                  <div className="w-2/5 max-h-[360px] overflow-y-auto border-r border-[#ede6d9] bg-[#fffdf8] p-4">
                    <ul className="m-0 flex list-none flex-col gap-1 p-0">
                      {categories.map((category) => (
                        <li
                          key={category.sno}
                          className={`flex cursor-pointer items-center justify-between rounded-xl px-3 py-3 text-sm font-medium transition hover:bg-[#fff7eb] ${hoveredCategory === category.sno ? 'bg-[#fff7eb] text-[#2e79e3]' : ''}`}
                          onMouseEnter={() => handleMouseEnter(category.sno)}
                          onClick={(event) => {
                            event.stopPropagation();
                            handleMouseEnter(category.sno);
                            setHoveredCategory(category.sno);
                          }}
                        >
                          {category.category_name} <ChevronRight size={12} className="text-[#2e79e3]" />
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="w-3/5 max-h-[360px] overflow-y-auto p-4">
                    <ul className="m-0 list-none p-0">
                      {subcategories.length > 0 ? subcategories.map((subcategory) => (
                        <li
                          key={subcategory.sno}
                          className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-3 text-sm font-medium transition hover:bg-[#fff7eb]"
                          onClick={() => handleNavigateCategory(subcategory.subcategory_name)}
                        >
                          {subcategory.subcategory_name} <ChevronRight size={11} className="text-[#2e79e3]" />
                        </li>
                      )) : <li className="px-3 py-6 text-center text-sm text-[#888]">Hover a category to view subcategories</li>}
                    </ul>
                  </div>
                </div>
              )}
            </li>

            <li className={navItemClass} onMouseEnter={() => { cancelDropdownClose(); setActiveDropdown('brand'); }} onMouseLeave={() => scheduleDropdownClose('brand')}>
              <button type="button" className={navButtonClass} onClick={() => toggleDropdown('brand')}>
                Brand <ChevronDown size={12} strokeWidth={2.2} className={`transition-transform duration-200 ${activeDropdown === 'brand' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'brand' && (
                <ul className="absolute right-0 top-full z-50 mt-3 flex w-64 max-w-[90vw] max-h-[340px] flex-col overflow-y-auto rounded-2xl bg-white py-2 shadow-soft ring-1 ring-black/5" onMouseEnter={() => cancelDropdownClose()} onMouseLeave={() => scheduleDropdownClose('brand')}>
                  {brands.length > 0 ? brands.map((brand, index) => (
                    <li key={index} className={navDropdownItemClass} onClick={() => { navigate(`/products?brand=${encodeURIComponent(brand.name)}`); setActiveDropdown(null); }}>
                      {capitalizeFirstLetter(brand.name)}
                    </li>
                  )) : <li className="px-3 py-6 text-center text-sm text-[#888]">Loading brands...</li>}
                </ul>
              )}
            </li>

            <li className={navItemClass} onClick={() => navigate('/products?hasTag=true')}>Characters & Themes</li>
            <li className={navItemClass} onClick={() => navigate('/products?customized=true')}>Customized Products</li>
            <li className={navItemClass} onClick={() => navigate('/products?discount=high')}>Special Offers</li>
            {user?.role === 'super_admin' && <li className={navItemClass} onClick={() => navigate('/admin')}>Admin Dashboard</li>}
          </ul>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <button type="button" className="flex cursor-pointer items-center justify-center rounded-xl p-1.5 text-[#273c2e] transition hover:bg-[#fff7eb] xl:hidden" onClick={() => setMobileMenuOpen((previous) => !previous)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="icon search-icon relative inline-flex cursor-pointer items-center justify-center rounded-xl p-1.5 text-[#273c2e] transition hover:bg-[#fff7eb]" onClick={() => setSearchOpen((previous) => !previous)}>
            <Search size={21} />
            {searchOpen && (
              <div className="mini-search absolute right-4 top-[calc(100%+0.5rem)] z-50 rounded-2xl bg-white p-2 shadow-soft ring-1 ring-black/5">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(event) => {
                    const value = event.target.value;
                    setSearchQuery(value);

                    if (typingTimer.current) clearTimeout(typingTimer.current);
                    typingTimer.current = setTimeout(() => {
                      if (value.trim().length >= 2) {
                        navigate(`/products?search=${encodeURIComponent(value.trim())}`);
                      } else if (value.trim().length === 0) {
                        navigate('/products');
                      }
                    }, 300);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && event.target.value.trim()) {
                      if (typingTimer.current) clearTimeout(typingTimer.current);
                      navigate(`/products?search=${encodeURIComponent(event.target.value.trim())}`);
                    }
                  }}
                  autoFocus
                  className="w-56 rounded-xl border border-[#ede6d9] bg-[#fffdf8] px-4 py-2 text-sm outline-none placeholder:text-[#8e8e8e] focus:border-[#2e79e3]"
                />
              </div>
            )}
          </div>

          <div className="auth-container relative">
            <button type="button" className="icon flex cursor-pointer items-center justify-center rounded-xl p-1.5 text-[#273c2e] transition hover:bg-[#fff7eb]" onClick={() => setShowAuthDropdown((previous) => !previous)}>
              <User size={21} />
            </button>

            <div className={`auth-dropdown absolute right-0 top-full z-50 mt-2 flex min-w-44 flex-col rounded-2xl bg-white p-3 shadow-soft ring-1 ring-black/5 transition duration-200 ease-out ${showAuthDropdown ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none translate-y-1'}`}>
              {user ? (
                <>
                  <span className="user-greeting mb-2 block rounded-xl bg-[#f4f7f5] px-3 py-2 text-sm font-semibold text-[#273c2e]">
                    Hi, {user.firstName || user.fullName} {user.role === 'super_admin' && '(Admin)'}
                  </span>
                  <button type="button" className="orders-btn mb-2 rounded-xl bg-[#fff7eb] px-4 py-2 text-sm font-semibold text-[#273c2e] transition hover:bg-[#dccaaa]/40" onClick={() => { navigate('/orders'); setShowAuthDropdown(false); }}>
                    My Orders
                  </button>
                  <button type="button" className="logout-btn mb-2 rounded-xl bg-[#fef2f2] px-4 py-2 text-sm font-semibold text-[#b91c1c] transition hover:bg-[#fee2e2]" onClick={handleLogout}>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <button type="button" className="login-btn mb-2 rounded-xl bg-[#2e79e3] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#1a5a8d]" onClick={handleLoginClick}>
                    Login
                  </button>
                  <button type="button" className="signup-btn mb-2 rounded-xl bg-[#f01c71] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#ff4b92]" onClick={handleSignupClick}>
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>

          <button type="button" className="cart-icon-wrapper relative cursor-pointer" onClick={() => navigate('/cart')}>
            <span className="cart-icon inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#fff7eb] text-[#273c2e] shadow-sm transition hover:bg-[#f3e1bf] sm:h-11 sm:w-11">
              <ShoppingCart size={21} color="BLACK" />
            </span>
            {getCartItemCount() > 0 && <span className="cart-badge absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f01c71] px-1 text-[11px] font-bold text-white">{getCartItemCount()}</span>}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="mobile-menu fixed inset-0 z-[1500] bg-black/30 backdrop-blur-[2px] xl:hidden">
          <div className="mobile-menu-content absolute right-0 top-0 h-full w-[88vw] max-w-sm overflow-y-auto bg-white p-5 shadow-soft">
            <ul className="mobile-nav-list m-0 flex list-none flex-col gap-1 p-0">
              {[
                ['About', '/about'],
                ['All Products', '/products'],
                ['Age', '/products?age=0-18 Months'],
                ['New Arrivals', '/products?sort=new'],
                ['Categories', '/products'],
                ['Brand', '/products?brand='],
                ['Characters & Themes', '/products?hasTag=true'],
                ['Customized Products', '/products?customized=true'],
                ['Special Offers', '/products?discount=high'],
                ['Gift Cards', '/giftCards'],
              ].map(([label, path]) => (
                <li
                  key={label}
                  className="mobile-nav-item cursor-pointer rounded-xl px-4 py-3 text-sm font-semibold text-[#273c2e] transition hover:bg-[#fff7eb]"
                  onClick={() => {
                    navigate(path);
                    setMobileMenuOpen(false);
                  }}
                >
                  {label}
                </li>
              ))}

              {user?.role === 'super_admin' && (
                <li
                  className="mobile-nav-item cursor-pointer rounded-xl px-4 py-3 text-sm font-semibold text-[#273c2e] transition hover:bg-[#fff7eb]"
                  onClick={() => {
                    navigate('/admin/adminpage');
                    setMobileMenuOpen(false);
                  }}
                >
                  Admin Dashboard
                </li>
              )}
            </ul>

            <div className="mobile-menu-divider my-4 h-px bg-[#ede6d9]" />

            {user ? (
              <div className="mobile-auth-section flex flex-col gap-2">
                <div className="mobile-user-greeting rounded-xl bg-[#f4f7f5] px-4 py-3 text-sm font-semibold text-[#273c2e]">
                  Hi, {user.firstName || user.fullName}
                </div>
                <button type="button" className="mobile-auth-btn orders-btn w-full rounded-xl bg-[#fff7eb] px-4 py-2 text-sm font-semibold text-[#273c2e] transition hover:bg-[#dccaaa]/40" onClick={() => { navigate('/orders'); setMobileMenuOpen(false); }}>
                  My Orders
                </button>
                <button type="button" className="mobile-auth-btn orders-btn w-full rounded-xl bg-[#fff7eb] px-4 py-2 text-sm font-semibold text-[#273c2e] transition hover:bg-[#dccaaa]/40" onClick={() => { navigate('/manage-addresses'); setMobileMenuOpen(false); }}>
                  Manage Addresses
                </button>
                <button type="button" className="mobile-auth-btn logout-btn w-full rounded-xl bg-[#fef2f2] px-4 py-2 text-sm font-semibold text-[#b91c1c] transition hover:bg-[#fee2e2]" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {toast.show && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
          <div className="relative w-[min(92vw,440px)] rounded-[18px] border border-[rgba(182,158,106,0.35)] bg-[#fff7eb] px-7 py-6 text-center font-bold text-[#273c2e] shadow-[0_18px_40px_rgba(39,60,46,0.18)] animate-[kpScaleIn_240ms_ease-out]">
            <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full border-2 border-white/55 bg-gradient-to-br from-[#6fbf8c] to-[#4f8f70] text-[#fff7eb] shadow-[0_8px_20px_rgba(111,191,140,0.35)]">✓</div>
            <div className="mb-1 text-lg tracking-[0.2px]">{toast.message}</div>
            <div className="text-sm font-medium text-[#4f6354]">See you soon!</div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
