import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { API_BASE_URL } from "./config";
import { useCart } from '../context/CartContext';

const GiftCardDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [card, setCard] = useState(null);
  const [otherCards, setOtherCards] = useState([]);
  const [selectedValue, setSelectedValue] = useState(null);
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();
  const [gallery, setGallery] = useState([]);
  const priceOptions = React.useMemo(() => {
    try {
      if (!card || !card.price_options) return [];
      const parsed = JSON.parse(card.price_options);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_) {
      return [];
    }
  }, [card]);

  useEffect(() => {
    const fetchCard = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/giftcards/${id}`);
        const data = await res.json();

        if (!res.ok) {
          setError((data && data.message) || 'Failed to load gift card');
          return;
        }

        // Accept both raw row object and wrapped shapes
        if (data && data.id) {
          setCard(data);
          // initialize selection from price_options or base_price
          try {
            const parsed = data.price_options ? JSON.parse(data.price_options) : [];
            if (Array.isArray(parsed) && parsed.length > 0) setSelectedValue(parsed[0]);
            else setSelectedValue(Number(data.base_price) || null);
          } catch (_) {
            setSelectedValue(Number(data.base_price) || null);
          }
          return;
        }
        if (data && data.success && data.giftcard) {
          setCard(data.giftcard);
          try {
            const parsed = data.giftcard.price_options ? JSON.parse(data.giftcard.price_options) : [];
            if (Array.isArray(parsed) && parsed.length > 0) setSelectedValue(parsed[0]);
            else setSelectedValue(Number(data.giftcard.base_price) || null);
          } catch (_) {
            setSelectedValue(Number(data.giftcard.base_price) || null);
          }
          return;
        }

        // Fallback: unexpected shape
        setError('Invalid response format');
      } catch (err) {
        setError('Unable to connect to server');
      } finally {
        setLoading(false);
      }
    };
    fetchCard();
    // Load other gift cards list
    const fetchOthers = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/giftcards`);
        const data = await res.json();
        let list = [];
        if (Array.isArray(data)) list = data; else if (data && data.success && Array.isArray(data.giftcards)) list = data.giftcards;
        setOtherCards(list.filter(gc => String(gc.id) !== String(id)));
      } catch (_) {
        setOtherCards([]);
      }
    };
    fetchOthers();
    // Load gallery images
    const fetchGallery = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/giftcards/${id}/images`);
        const data = await res.json();
        if (data && data.success && Array.isArray(data.images)) {
          const urls = data.images.map((u) => (typeof u === 'string' && u.startsWith('http') ? u : `${API_BASE_URL}${u}`));
          setGallery(urls);
        } else {
          setGallery(card?.image_url ? [`${API_BASE_URL}${card.image_url}`] : []);
        }
      } catch (_) {
        setGallery([]);
      }
    };
    fetchGallery();
  }, [id]);

  const handleAddToBag = () => {
    if (!card) return;
    const price = Number(selectedValue || card.base_price || 0);
    const quantity = parseInt(qty || 1, 10);
    if (!price || quantity <= 0) return;
    const product = {
      id: `giftcard-${card.id}-${price}`,
      name: `${card.title} (Gift Card)`,
      price,
      image: card.image_url ? `${API_BASE_URL}${card.image_url}` : undefined,
    };
    addToCart(product, quantity);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#273c2e]">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {loading && <p className="rounded-xl bg-[#fff7eb] px-4 py-3 text-sm font-semibold text-[#273c2e] ring-1 ring-[#ede6d9]">Loading...</p>}
        {error && <p className="rounded-xl bg-[#ffeeee] px-4 py-3 text-sm font-semibold text-red-600 ring-1 ring-[#fcc]">{error}</p>}
        {card && (
          <>
          <div className="grid gap-6 md:grid-cols-2 md:items-start">
            <div className="h-[280px] overflow-hidden rounded-xl bg-[#f6f6f6] sm:h-[340px] md:h-[380px]">
              {gallery && gallery.length > 0 ? (
                <img src={gallery[0]} alt={card.title} className="h-full w-full object-contain" />
              ) : card.image_url ? (
                <img src={`${API_BASE_URL}${card.image_url}`} alt={card.title} className="h-full w-full object-contain" />
              ) : (
                <div className="grid h-full w-full place-items-center text-lg font-semibold text-[#aaa]">No Image</div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-[#273c2e] sm:text-3xl">{card.title}</h1>
              <p className="mt-2 text-sm font-bold text-[#444]"><span className="font-bold text-[#666]">Brand:</span> {card.brand}</p>
              <p className="mt-1 text-sm font-bold text-[#444]"><span className="font-bold text-[#666]">SKU:</span> {card.sku}</p>
              <p className="mt-1 text-sm font-bold text-[#444]"><span className="font-bold text-[#666]">Price:</span> ₹{Number(selectedValue || card.base_price || 0)}</p>

              {/* Render price options as selectable chips if JSON array */}
              {priceOptions.length > 0 ? (
                <div className="mt-4">
                  <div className="mb-2 text-sm font-semibold">Available Values</div>
                  <div className="flex flex-wrap gap-2">
                    {priceOptions.map((v, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`rounded-full border px-3 py-1.5 text-sm transition ${Number(selectedValue) === Number(v) ? 'border-[#b69e6a] bg-[#fdf7ea]' : 'border-[#ddd] bg-white hover:border-[#cbb27c]'}`}
                        onClick={() => setSelectedValue(v)}
                      >
                        ₹{v}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                card.price_options ? (
                  <p className="mt-3 text-sm"><strong>Available Values:</strong> {card.price_options}</p>
                ) : null
              )}

              {/* Quantity + Add to Bag */}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <label className="text-sm font-semibold">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) => setQty(parseInt(e.target.value || '1', 10))}
                  className="w-20 rounded-md border border-[#ddd] px-2 py-1.5 text-sm"
                />
                <button className="rounded-full bg-[#b69e6a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#a88f5f]" onClick={handleAddToBag}>
                  Add to Bag
                </button>
              </div>

              <div className="mt-4 whitespace-pre-wrap text-sm font-semibold text-[#444]">{card.description}</div>
            </div>
          </div>

          {(gallery && gallery.length > 1) ? (
            <div className="mt-3 flex gap-2">
              {gallery.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="h-14 w-16 overflow-hidden rounded-md border border-[#eee] bg-white"
                  onClick={() => {
                    setGallery((g) => {
                      const copy = [...g];
                      const [sel] = copy.splice(idx, 1);
                      return [sel, ...copy];
                    });
                  }}
                >
                  <img src={url} alt={`thumb-${idx}`} className="h-full w-full object-contain bg-[#f6f6f6]" />
                </button>
              ))}
            </div>
          ) : null}
          </>
        )}

        {otherCards.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-3 text-2xl font-bold text-[#273c2e]">More Gift Cards</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {otherCards.map(gc => (
                <div key={gc.id} className="overflow-hidden rounded-lg border border-[#eee] bg-white transition hover:-translate-y-0.5 hover:shadow-[0_6px_18px_rgba(0,0,0,0.08)]">
                  <div className="flex h-[110px] items-center justify-center bg-[#f6f6f6] sm:h-[120px]">
                    {gc.image_url ? (
                      <img src={`${API_BASE_URL}${gc.image_url}`} alt={gc.title} className="h-full w-full cursor-pointer object-contain" onClick={() => navigate(`/giftcards/${gc.id}`)} />
                    ) : (
                      <span className="text-sm font-semibold text-[#777]">No Image</span>
                    )}
                  </div>
                  <div className="p-2.5">
                    <div className="line-clamp-2 text-sm font-semibold text-[#273c2e]">{gc.title}</div>
                    <div className="mt-1 text-xs text-[#666]">{gc.brand}</div>
                    <div className="mt-1 text-sm font-bold text-[#273c2e]">₹{(() => {
                      try {
                        const opts = gc.price_options ? JSON.parse(gc.price_options) : [];
                        if (Array.isArray(opts) && opts.length > 0) return Number(opts[0]);
                      } catch (_) {}
                      return Number(gc.base_price || 0);
                    })()}</div>
                    <button
                      className="mt-2 rounded-full bg-[#b69e6a] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#a88f5f]"
                      onClick={() => {
                        let p = 0;
                        try {
                          const opts = gc.price_options ? JSON.parse(gc.price_options) : [];
                          if (Array.isArray(opts) && opts.length > 0) p = Number(opts[0]);
                        } catch (_) {}
                        if (!p) p = Number(gc.base_price || 0);
                        const product = {
                          id: `giftcard-${gc.id}-${p}`,
                          name: `${gc.title} (Gift Card)`,
                          price: p,
                          image: gc.image_url ? `${API_BASE_URL}${gc.image_url}` : undefined,
                        };
                        addToCart(product, 1);
                      }}
                    >
                      Add to Bag
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default GiftCardDetails;
