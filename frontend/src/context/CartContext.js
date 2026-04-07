import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback, 
  useRef // ✅ <-- add this import
} from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [cartToast, setCartToast] = useState({ show: false, message: '' });
  const toastTimeoutRef = useRef(null);
  const prevUserIdRef = useRef(null);

  const getUserIdFromLocalStorage = () => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // Prefer stable id field; fallback to email
      return parsed?.id ?? parsed?.userId ?? parsed?.email ?? null;
    } catch {
      return null;
    }
  };

  const getCartStorageKey = (userId) => {
    return userId ? `cart:${String(userId)}` : 'cart:guest';
  };

  // Determine current user at startup
  useEffect(() => {
    const userId = getUserIdFromLocalStorage();
    setCurrentUserId(userId);
  }, []);

  // Respond to user changes (custom event + storage event)
  useEffect(() => {
    const onUserChanged = () => {
      const userId = getUserIdFromLocalStorage();
      setCurrentUserId(userId);
    };
    window.addEventListener('user-changed', onUserChanged);
    window.addEventListener('storage', (e) => {
      if (e.key === 'user') onUserChanged();
    });
    return () => {
      window.removeEventListener('user-changed', onUserChanged);
    };
  }, []);

  // Load cart when user changes
  useEffect(() => {
    if (prevUserIdRef.current === currentUserId) return;
    prevUserIdRef.current = currentUserId;
    try {
      const key = getCartStorageKey(currentUserId);
      const savedCart = localStorage.getItem(key);
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        const cartArray = Array.isArray(parsedCart) ? parsedCart : [];
        // Ensure all items have required fields
        const normalizedCart = cartArray.map(item => ({
          id: item.id,
          name: item.name || '',
          price: Number(item.price) || 0,
          original_price: Number(item.original_price) || Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
          image: item.image || '',
          description: item.description || '',
          age_range: item.age_range || '',
          stock_quantity: item.stock_quantity || 999,
        }));
        setCartItems(normalizedCart);
      } else {
        setCartItems([]);
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      setCartItems([]);
    }
  }, [currentUserId]);

  // Save cart to localStorage whenever it changes for the current user key
  useEffect(() => {
  try {
    const key = getCartStorageKey(currentUserId);

    const safeItems = cartItems.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      description: item.description || '',
      age_range: item.age_range || '',
      stock_quantity: item.stock_quantity || 999,
    }));

    localStorage.setItem(key, JSON.stringify(safeItems));
  } catch (err) {
    console.error("Error saving cart to localStorage:", err);
  }
}, [cartItems, currentUserId]);


  // ✅ Normalize product structure for consistent cart data
  const normalizeProduct = (p) => {
    const id = p.id ?? p.sno ?? p.product_id ?? `${Date.now()}-${Math.random()}`;
    const price = Number(p.price ?? p.mrp ?? 0) || 0;
    const originalPrice = Number(p.original_price ?? p.mrp ?? 0) || 0;
    // If original_price is not set but we have a higher price value, use that
    const finalOriginalPrice = originalPrice > price ? originalPrice : price;
    return {
      id,
      name: p.name ?? p.product_name ?? '',
      price,
      original_price: finalOriginalPrice,
      image: p.image ?? (Array.isArray(p.images) ? p.images[0] : '') ?? '',
      stock_quantity: p.stock_quantity ?? p.stock_qty ?? p.stock ?? 999,
      description: p.description ?? '',
      age_range: p.age_range ?? '',
    };
  };

  
  const showCartToast = (message, duration = 1200) => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }

    setCartToast({ show: true, message });
    toastTimeoutRef.current = window.setTimeout(() => {
      setCartToast({ show: false, message: '' });
      toastTimeoutRef.current = null;
    }, duration);
  };

  // ✅ Add to Cart
  const addToCart = (product, quantity = 1) => {
    const normalizedProduct = normalizeProduct(product);
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === normalizedProduct.id);
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === normalizedProduct.id
            ? { ...item, quantity: item.quantity + Number(quantity) }
            : item
        );
      } else {
        return [...prevItems, { ...normalizedProduct, quantity: Number(quantity) }];
      }
    });
    showCartToast(`${normalizedProduct.name} added to cart!`);
  };

  // ✅ Remove item
  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  // ✅ Update item quantity
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  // ✅ Clear cart (memoized)
  const clearCart = useCallback(() => {
    setCartItems([]);
    localStorage.removeItem(getCartStorageKey(currentUserId));
  }, []);

  // ✅ Cart total and count helpers
  const getCartTotal = () => {
    return cartItems.reduce(
      (total, item) => total + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0
    );
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + (Number(item.quantity) || 0), 0);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    showCartToast,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      {cartToast.show && (
        <div className="fixed left-1/2 top-1/2 z-[2000] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-[#0f6a73] px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(15,106,115,0.25)]">
          {cartToast.message}
        </div>
      )}
    </CartContext.Provider>
  );
};
