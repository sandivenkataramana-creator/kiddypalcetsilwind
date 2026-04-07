import React from 'react';
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#f01c71] text-white">
      <div className="mx-auto w-full max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <section>
            <h3 className="mb-2 inline-block border-b-2 border-white pb-1 text-sm font-semibold">Info</h3>
            <ul className="space-y-0.5 text-xs">
              <li>
                <button type="button" onClick={() => navigate('/about')} className="text-left transition hover:translate-x-1 hover:text-white">
                  About Us
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/careers')} className="text-left transition hover:translate-x-1 hover:text-white">
                  Careers
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/stores')} className="text-left transition hover:translate-x-1 hover:text-white">
                  Stores
                </button>
              </li>
            </ul>
          </section>

          <section>
            <h3 className="mb-2 inline-block border-b-2 border-white pb-1 text-sm font-semibold">Quick Links</h3>
            <ul className="space-y-1 text-xs">
              <li><a href="/#faqs" className="transition hover:translate-x-1 hover:text-white">FAQs</a></li>
              <li>
                <button type="button" onClick={() => navigate('/products?new=true')} className="text-left transition hover:translate-x-1 hover:text-white">
                  New Arrivals
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigate('/products?discount=high')} className="text-left transition hover:translate-x-1 hover:text-white">
                  Trending Products
                </button>
              </li>
              <li><a href="/#corporate" className="transition hover:translate-x-1 hover:text-white">Corporate &amp; Bulk Purchasing</a></li>
            </ul>
          </section>

          <section>
            <h3 className="mb-2 inline-block border-b-2 border-white pb-1 text-sm font-semibold">Policies</h3>
            <ul className="space-y-1 text-xs">
              <li><a href="/#disclaimer" className="transition hover:translate-x-1 hover:text-white">Disclaimer</a></li>
              <li><a href="/#privacy" className="transition hover:translate-x-1 hover:text-white">Privacy Policy</a></li>
              <li><a href="/#shipping" className="transition hover:translate-x-1 hover:text-white">Shipping Policy</a></li>
              <li><a href="/#terms" className="transition hover:translate-x-1 hover:text-white">Terms &amp; Conditions</a></li>
              <li><a href="/#refund" className="transition hover:translate-x-1 hover:text-white">Refund &amp; Cancellation Policy</a></li>
            </ul>
          </section>

          <section>
            <h3 className="mb-2 inline-block border-b-2 border-white pb-1 text-sm font-semibold">Contact Us</h3>
            <ul className="space-y-1 text-xs">
              <li className="flex items-start gap-3">
                <FaPhoneAlt className="mt-1 shrink-0" />
                <a href="tel:+91 7075 004 435" className="transition hover:translate-x-1 hover:text-white">
                  +91 7075 004 435
                </a>
              </li>
              <li className="flex items-start gap-3">
                <FaEnvelope className="mt-1 shrink-0" />
                <a href="mailto:kiddypalace@ecommerce.com" className="transition hover:translate-x-1 hover:text-white">
                  kiddypalace.ind@gmail.com
                </a>
              </li>
              <li className="space-y-2">
                <a href="https://www.google.com/maps/place/Kiddy+Palace/@17.3978487,78.3547602,16.5z/data=!4m6!3m5!1s0x3bcb95c3dbdd0f51:0x42383722cfa45db3!8m2!3d17.3952293!4d78.3536138!16s%2Fg%2F11yn2l60y2" target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 transition hover:translate-x-1 hover:text-white">
                  <FaMapMarkerAlt className="mt-1 shrink-0" />
                  <span>Narsingi - 70750 04435</span>
                </a>
                <a href="https://maps.app.goo.gl/GhHuPQJrWw1n2XF98" target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 transition hover:translate-x-1 hover:text-white">
                  <FaMapMarkerAlt className="mt-1 shrink-0" />
                  <span>Nanakramguda - 92912 55974</span>
                </a>
                <a href="https://maps.app.goo.gl/F2n5Bmf44XNTkgTG9" target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 transition hover:translate-x-1 hover:text-white">
                  <FaMapMarkerAlt className="mt-1 shrink-0" />
                  <span>Nallagandla - 70758 84435</span>
                </a>
              </li>
            </ul>
          </section>
        </div>

        <div className="mt-3 border-t border-white/15 pt-2 text-xs text-[#ffeaf5]">
          <p>© {currentYear} kiddypalace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
