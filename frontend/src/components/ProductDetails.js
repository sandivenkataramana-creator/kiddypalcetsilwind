import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams,  } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Header from './Header';
import Footer from './Footer';   
import ProductEditModal from './ProductEditModal';
import { API_BASE_URL } from "./config";


const ProductDetails = () => {

//   const isAdmin = !!localStorage.getItem("adminToken");
// const isAdmin = !!localStorage.getItem("adminToken");
// const [images, setImages] = useState([]);
const [uploadImages, setUploadImages] = useState([]);
const [settingMainImage, setSettingMainImage] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const [product, setProduct] = useState(() => (location.state && location.state.product) ? location.state.product : null);
  const [loading, setLoading] = useState(!((location.state && location.state.product)));
  const [error, setError] = useState("");
  const { addToCart, cartItems, updateQuantity, removeFromCart } = useCart();
  const [showEditModal, setShowEditModal] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isInCartMode, setIsInCartMode] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(1);

  const [activeImage, setActiveImage] = useState(null);

  // ============ ALL HOOKS MUST BE HERE BEFORE ANY EARLY RETURNS ============

  // Admin check
  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    const adminUser = localStorage.getItem("adminUser");

    // Must have BOTH
    if (!adminToken || !adminUser) {
      setIsAdminLoggedIn(false);
      return;
    }

    try {
      const parsedAdmin = JSON.parse(adminUser);

      // 🔒 STRICT ROLE CHECK (THIS WAS MISSING)
      if (parsedAdmin?.role === "admin" || parsedAdmin?.role === "super_admin") {
        setIsAdminLoggedIn(true);
      } else {
        setIsAdminLoggedIn(false);
      }
    } catch (error) {
      setIsAdminLoggedIn(false);
    }
  }, []);

  // Get productId
  const productId = useMemo(() => {
    if (location.state && location.state.product?.id) return location.state.product.id;
    if (params && params.id) return params.id;
    return null;
  }, [location.state, params]);

  // Keep product in sync with location state
  useEffect(() => {
    if (location.state && location.state.product) {
      setProduct(location.state.product);
    }
  }, [location.state]);

  // Fetch product by ID - ALWAYS fetch to get complete data including images
  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        // Only show loading if we don't have product data yet
        if (!product) {
          setLoading(true);
        }
        const res = await fetch(`${API_BASE_URL}/api/products/${productId}`);
        const data = await res.json();

        if (!res.ok || !data.success) {
          throw new Error(data.message || "Failed to fetch product");
        }

        setProduct(data.product);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Sync quantity with cart whenever cartItems changes
  useEffect(() => {
    if (product && product.id && cartItems && Array.isArray(cartItems)) {
      const existingItem = cartItems.find(item => String(item.id) === String(product.id));
      if (existingItem) {
        setCartQuantity(existingItem.quantity);
        setIsInCartMode(true);
      } else {
        // Product removed from cart
        setIsInCartMode(false);
        setCartQuantity(1);
      }
    }
  }, [cartItems, product?.id]);

  // Build imageSources from product
  const imageSources = useMemo(() => {
    if (!product) return [];
    
    // If product_images exists and is an array, use it
    if (Array.isArray(product.product_images) && product.product_images.length > 0) {
      return product.product_images.map((img, idx) => ({
        id: img.id ?? `img-${idx}`,
        url: `${API_BASE_URL}${img.image_url}`,
      }));
    }
    
    // Fallback: if only image_url exists, use that
    if (product.image_url) {
      return [{
        id: 'primary-image',
        url: `${API_BASE_URL}${product.image_url}`,
      }];
    }
    
    return [];
  }, [product]);

  // Set active image when imageSources changes
  useEffect(() => {
    if (imageSources.length > 0) {
      setActiveImage((prev) =>
        prev && imageSources.some((i) => i.id === prev.id)
          ? prev
          : imageSources[0]
      );
    } else {
      setActiveImage(null);
    }
  }, [imageSources]);

  // ============ HELPER FUNCTIONS ============



  // ============ CONDITIONAL RENDERS ============


  // Re-check admin status when navigating back to this component
  // useEffect(() => {
  //   const checkAdminLogin = () => {
  //     const adminToken = localStorage.getItem('adminToken');
  //     const adminUser = localStorage.getItem('adminUser');
  //     const user = localStorage.getItem('user');
      
  //     console.log('🔍 Re-checking admin on pathname change... token:', adminToken, 'adminUser:', adminUser, 'user:', user); // Debug log
      
  //     let isAdmin = false;
      
  //     // Check method 1: adminToken + adminUser
  //     if (adminToken && adminUser && adminUser !== 'undefined') {
  //       try {
  //         const parsedAdmin = JSON.parse(adminUser);
  //         isAdmin = !!parsedAdmin && (!!parsedAdmin.id || !!parsedAdmin.user_id);
  //         console.log('✅ Admin on pathname change (via token):', isAdmin); // Debug log
  //       } catch (e) {
  //         console.error('❌ Error on pathname change:', e); // Debug log
  //       }
  //     }
      
  //     // Check method 2: user with super_admin role
  //     if (!isAdmin && user && user !== 'undefined') {
  //       try {
  //         const parsedUser = JSON.parse(user);
  //         isAdmin = !!parsedUser && parsedUser.role === 'super_admin';
  //         console.log('✅ Admin on pathname change (via role):', isAdmin); // Debug log
  //       } catch (e) {
  //         console.error('❌ Error parsing user on pathname:', e); // Debug log
  //       }
  //     }
      
  //     setIsAdminLoggedIn(isAdmin);
  //   };
  //   checkAdminLogin();
  // }, [location.pathname]);

  // useEffect(() => {
  //   if (!productId) return;

  //   const needsRefresh =
  //     !product ||
  //     String(product.id) !== String(productId) ||
  //     !Array.isArray(product.imageGallery);

  //   if (!needsRefresh) return;

  //   const controller = new AbortController();
  //   const fetchProduct = async () => {
  //     try {
  //       if (!product) {
  //         setLoading(true);
  //       }
  //       const res = await fetch(`${API_BASE_URL}/api/products/${productId}`, { signal: controller.signal });
  //       const data = await res.json();
  //       if (!res.ok || !data.success) {
  //         throw new Error(data.message || 'Failed to fetch product');
  //       }
  //       setProduct(data.product);
  //     } catch (e) {
  //       if (e.name !== 'AbortError') {
  //         setError(e.message || 'Failed to load product');
  //       }
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchProduct();
  //   return () => controller.abort();
  // }, [productId, product]);

  if (loading) {
    return (
      <div className="no-product">
        <p>Loading product...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="no-product">
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="no-product">
        <p>Product not found.</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  // const images = product.images || [product.image]; // handle multiple images

  const handleImageUpload = async () => {
  if (!uploadImages || uploadImages.length === 0) {
    return;
  }

  const formData = new FormData();
  for (let img of uploadImages) {
    formData.append("images", img);
  }
const token = localStorage.getItem("adminToken");
if (!token) {
  alert("Admin session expired. Please login again.");
  return;
}

  try {
    const res = await fetch(`${API_BASE_URL}/api/products/${product.id}/images`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${localStorage.getItem("adminToken")}`
  },
  body: formData
});


    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Upload failed");

    // 🔄 Fetch updated product (NO PAGE RELOAD)
    const refreshed = await fetch(
      `${API_BASE_URL}/api/products/${product.id}`
    ).then((r) => r.json());

    setProduct(refreshed.product);
    setUploadImages([]); // reset selection
  } catch (err) {
    alert(err.message);
  }
};

// useEffect(() => {
//   if (uploadImages.length > 0) {
//     handleImageUpload();
//   }
// }, [uploadImages]);

console.log("IMAGE GALLERY:", product?.product_images);



const handleDeleteImage = async (imageId) => {
  if (!window.confirm("Delete this image?")) return;

  try {
    const res = await fetch(
      `${API_BASE_URL}/api/products/${product.id}/images/${imageId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Delete failed");

    // refresh product
    const refreshed = await fetch(
      `${API_BASE_URL}/api/products/${product.id}`
    ).then((r) => r.json());

    setProduct(refreshed.product);
    setActiveImage(null);
  } catch (err) {
    alert(err.message);
  }
};

// Set image as main/display image for product list
const handleSetMainImage = async (imageId) => {
  if (!product?.id) {
    alert("❌ Product ID not found");
    return;
  }

  setSettingMainImage(true);
  try {
    const url = `${API_BASE_URL}/api/products/${product.id}/set-main-image`;
    console.log("Setting main image with URL:", url);
    console.log("Image ID:", imageId);
    
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageId }),
    });

    const data = await res.json();
    console.log("Response:", data);
    
    if (!res.ok) throw new Error(data.message || "Failed to set main image");

    // refresh product
    const refreshed = await fetch(
      `${API_BASE_URL}/api/products/${product.id}`
    ).then((r) => r.json());

    setProduct(refreshed.product);
    alert("✅ Image set as display image!");
  } catch (err) {
    console.error("Error setting main image:", err);
    alert("❌ " + err.message);
  } finally {
    setSettingMainImage(false);
  }
};

const handleClearMainImage = async () => {
  if (!product?.id) {
    alert("❌ Product ID not found");
    return;
  }

  setSettingMainImage(true);
  try {
    const url = `${API_BASE_URL}/api/products/${product.id}/clear-main-image`;
    console.log("Clearing main image with URL:", url);
    
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        "Content-Type": "application/json",
      },
    });

    const data = await res.json();
    console.log("Response:", data);
    
    if (!res.ok) throw new Error(data.message || "Failed to clear main image");

    // refresh product
    const refreshed = await fetch(
      `${API_BASE_URL}/api/products/${product.id}`
    ).then((r) => r.json());

    setProduct(refreshed.product);
    alert("✅ Display image cleared!");
  } catch (err) {
    console.error("Error clearing main image:", err);
    alert("❌ " + err.message);
  } finally {
    setSettingMainImage(false);
  }
};
// useEffect(() => {
//   if (imageSources.length > 0) {
//     setActiveImage((prev) =>
//       prev && imageSources.some((i) => i.id === prev.id)
//         ? prev
//         : imageSources[0]
//     );
//   } else {
//     setActiveImage(null);
//   }
// }, [imageSources]);




  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-white via-emerald-50/40 to-slate-50 text-slate-900">
      <Header />

      <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 rounded-[28px] border border-emerald-100 bg-white/90 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur sm:p-6 lg:p-8">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
            <section className="flex flex-col gap-4 lg:flex-row">
              <div className="flex flex-row gap-3 overflow-x-auto pb-2 lg:max-h-[520px] lg:flex-col lg:overflow-y-auto lg:overflow-x-hidden lg:pb-0">
                {imageSources.map((img) => (
                  <div key={img.id} className="relative shrink-0">
                    <img
                      src={img.url}
                      alt="thumbnail"
                      className={`h-20 w-16 cursor-pointer rounded-xl border object-cover transition hover:border-slate-900 lg:h-[82px] lg:w-[66px] ${
                        activeImage?.id === img.id ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-slate-200'
                      }`}
                      onClick={() => setActiveImage(img)}
                      onError={(e) => {
                        console.error('Failed to load thumbnail:', img.url);
                        e.currentTarget.src = '/images/ironman.jpg';
                      }}
                    />

                    {isAdminLoggedIn && (
                      <button
                        className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-amber-400 text-[11px] text-white shadow-sm transition hover:scale-110 disabled:opacity-60"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetMainImage(img.id);
                        }}
                        disabled={settingMainImage}
                        title="Set as display image for product list"
                      >
                        ⭐
                      </button>
                    )}

                    {isAdminLoggedIn && (
                      <button
                        className="absolute bottom-1 right-1 grid h-6 w-6 place-items-center rounded-full bg-rose-500 text-[11px] text-white shadow-sm transition hover:scale-110"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteImage(img.id);
                        }}
                        title="Delete image"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                ))}

                {isAdminLoggedIn && (
                  <>
                    <label className="flex h-20 w-16 shrink-0 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-2xl font-bold text-slate-500 transition hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 lg:h-[82px] lg:w-[66px]">
                      +
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        hidden
                        onChange={(e) => setUploadImages(Array.from(e.target.files || []))}
                      />
                    </label>

                    {uploadImages.length > 0 && (
                      <button
                        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                        onClick={handleImageUpload}
                      >
                        Upload Images
                      </button>
                    )}

                    {product?.image_url && (
                      <button
                        className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:border-rose-400 hover:bg-rose-100"
                        onClick={handleClearMainImage}
                        disabled={settingMainImage}
                        title="Remove the manually selected display image"
                      >
                        Clear Selection
                      </button>
                    )}
                  </>
                )}
              </div>

              <div className="flex min-w-0 flex-1 items-center justify-center rounded-3xl border border-slate-200 bg-slate-50 p-4 h-[520px]">
                {activeImage ? (
                  <img
                    src={activeImage.url}
                    alt={product?.name || 'Product image'}
                    className="max-h-[520px] w-full object-contain"
                    onError={(e) => {
                      console.error('Failed to load image:', activeImage.url);
                      e.currentTarget.src = '/images/ironman.jpg';
                    }}
                  />
                ) : (
                  <div className="flex h-[420px] w-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-lg font-medium text-slate-500">
                    📦 No Image
                  </div>
                )}
              </div>
            </section>

            <section className="flex flex-col items-start rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 overflow-y-auto h-full">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                {product.brand_name || product.brand || 'Brand Name'}
              </p>
              <h1 className="mt-2 text-2xl font-black leading-tight text-slate-900 sm:text-3xl">
                {product.name}
              </h1>
              <p className="mt-4 line-clamp-2 text-sm leading-7 text-slate-600">
                {product.description}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {(() => {
                  const mrp = Number(product.mrp);
                  const price = Number(product.price);
                  if (mrp && price && mrp > price) {
                    const discountPercent = Math.round(((mrp - price) / mrp) * 100);
                    const saved = mrp - price;
                    return (
                      <>
                        <span className="text-3xl font-black text-slate-900">₹{price.toFixed(2)}</span>
                        <span className="text-lg text-slate-400 line-through">MRP ₹{mrp.toFixed(2)}</span>
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">
                          {discountPercent}% off
                        </span>
                        <span className="text-sm font-bold text-emerald-700">
                          You Saved (₹{saved.toFixed(0)})
                        </span>
                      </>
                    );
                  }

                  return <span className="text-3xl font-black text-slate-900">₹{mrp || price}</span>;
                })()}
              </div>

              <p className={`mt-4 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${product.stock_quantity > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
              </p>

              <div className="mt-6 flex w-full flex-wrap items-center gap-3">
                {product.stock_quantity > 0 ? (
                  <>
                    <div className="flex h-11 w-[110px] items-center gap-2">
                      {!isInCartMode ? (
                        <button
                          className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 h-full flex items-center justify-center w-full"
                          onClick={() => {
                            addToCart({ ...product, original_price: product.mrp }, 1);
                          }}
                        >
                          Add to Cart
                        </button>
                      ) : (
                        <div className="flex items-center justify-between gap-2 rounded-lg border-2 border-slate-900 px-2 py-2 h-full w-full hover:bg-slate-100 transition">
                          <button
                            className="text-xl font-bold text-slate-900 transition leading-none"
                            onClick={() => {
                              if (cartQuantity <= 1) {
                                removeFromCart(product.id);
                                setIsInCartMode(false);
                                setCartQuantity(1);
                              } else {
                                updateQuantity(product.id, cartQuantity - 1);
                              }
                            }}
                          >
                            –
                          </button>
                          <span className="text-center text-base font-bold text-slate-900 min-w-[30px]">
                            {cartQuantity}
                          </span>
                          <button
                            className="text-xl font-bold text-slate-900 transition disabled:text-slate-300 disabled:cursor-not-allowed leading-none"
                            onClick={() => {
                              updateQuantity(product.id, cartQuantity + 1);
                            }}
                            disabled={cartQuantity >= product.stock_quantity}
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex h-11 items-center gap-2">
                      <button
                        className="rounded-xl border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-black whitespace-nowrap h-full flex items-center justify-center"
                        onClick={() => navigate('/checkout', { state: { product, quantity: isInCartMode ? cartQuantity : 1 } })}
                      >
                        Buy Now
                      </button>
                    </div>
                  </>
                ) : null}
                {isAdminLoggedIn && (
                  <button
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-400 hover:bg-emerald-100"
                    onClick={() => setShowEditModal(true)}
                  >
                    Edit Product
                  </button>
                )}
              </div>

              <div className="mt-8 w-full rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4">
                <h2 className="text-lg font-semibold text-slate-900">Product Info</h2>
                <p className="mt-2 text-sm leading-7 text-slate-600">{product.name}</p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />

      {showEditModal && (
        <ProductEditModal
          product={product}
          onClose={() => setShowEditModal(false)}
          onSave={(updatedProduct) => {
            setProduct(updatedProduct);
            setShowEditModal(false);
          }}
        />
      )}
    </div>
  );
};

export default ProductDetails;
