import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { PAYHERE_MERCHANT_ID, PAYHERE_SANDBOX } from "../payhereConfig";


function getCartKey(user) {
  return user && user.email ? `cart_${user.email}` : "cart_guest";
}

function AddToCart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const auth = getAuth();
  const [user, setUser] = useState(auth.currentUser);

  // Listen for user changes (login/logout)
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, [auth]);

  // Load cart for current user
  useEffect(() => {
    const key = getCartKey(user);
    const stored = localStorage.getItem(key);
    if (stored) setCart(JSON.parse(stored));
    else setCart([]);

    // Load PayHere script safely
    if (!window.payhere && !document.getElementById("payhere-script")) {
      const script = document.createElement("script");
      script.id = "payhere-script";
      script.async = true;
      script.src = "https://www.payhere.lk/lib/payhere.js";
      script.onload = () => console.log("✅ PayHere script loaded successfully");
      script.onerror = (err) => {
        console.error("❌ PayHere script failed to load:", err);
        setError("Payment gateway failed to load. Please refresh and try again.");
      };
      document.body.appendChild(script);
    }
  }, [user]);

  const removeFromCart = (idx) => {
    const updated = cart.filter((_, i) => i !== idx);
    setCart(updated);
    const key = getCartKey(user);
    localStorage.setItem(key, JSON.stringify(updated));
  };

  const getTotal = () => {
    return cart
      .reduce((sum, item) => {
        const price = parseFloat(item.price) || 0;
        const shipping = parseFloat(item.shipping) || 0;
        return sum + price + shipping;
      }, 0)
      .toFixed(2);
  };

  const handleCheckout = () => {
    setLoading(true);
    setSuccess(null);
    setError(null);


    if (!user) {
      setError("You must be logged in to checkout.");
      setLoading(false);
      return;
    }

    if (!window.payhere) {
      setError("Payment gateway not loaded. Please refresh the page and try again.");
      setLoading(false);
      return;
    }

    // Build order
    const order_id = "ORDER_" + Date.now();
    const items = cart.map((item) => item.productName).join(", ");
    const amount = getTotal();

    const payment = {
      sandbox: PAYHERE_SANDBOX, // true for sandbox testing
      merchant_id: PAYHERE_MERCHANT_ID,
      return_url: window.location.origin + "/cart",
      cancel_url: window.location.origin + "/cart",
      notify_url: window.location.origin + "/cart",
      order_id,
      items,
      amount,
      currency: "LKR",
      first_name: user.displayName || user.email.split("@")[0],
      last_name: "",
      email: user.email,
      phone: "",
      address: "",
      city: "",
      country: "Sri Lanka",
    };

    // PayHere event listeners

    window.payhere.onCompleted = function (orderId) {
      setSuccess("Payment successful! Order ID: " + orderId);
      setCart([]);
      const key = getCartKey(user);
      localStorage.removeItem(key);
      setLoading(false);
    };

    window.payhere.onDismissed = function () {
      setError("Payment dismissed.");
      setLoading(false);
    };

    window.payhere.onError = function (error) {
      setError("Payment error: " + error);
      setLoading(false);
    };

    // Start payment
    try {
      window.payhere.startPayment(payment);
    } catch (err) {
      console.error("Payment start error:", err);
      setError("Unable to start payment. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Cart Management</h1>

      {cart.length === 0 && <p>Your cart is empty.</p>}

      <div className="space-y-6">
        {cart.map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow p-6 border border-gray-100 flex items-center gap-4"
          >
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.productName}
                className="w-24 h-24 object-cover rounded"
              />
            )}
            <div className="flex-1">
              <h2 className="font-bold text-lg">{item.productName}</h2>
              <p className="text-gray-600">{item.details}</p>
              <div className="mt-2 text-sm">
                <span className="font-semibold">Price:</span> {item.price} <br />
                <span className="font-semibold">Shipping:</span> {item.shipping}
              </div>
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline mt-2 inline-block"
              >
                View Product
              </a>
            </div>
            <button
              onClick={() => removeFromCart(idx)}
              className="ml-4 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <div className="mt-8">
          <div className="mb-4 text-lg font-semibold">Total: LKR {getTotal()}</div>
          <button
            onClick={handleCheckout}
            className="bg-green-600 text-white px-6 py-3 rounded text-lg font-semibold hover:bg-green-700"
            disabled={loading}
          >
            {loading ? "Processing..." : "Checkout & Buy"}
          </button>
        </div>
      )}

      {success && <div className="text-green-600 mt-4">{success}</div>}
      {error && <div className="text-red-600 mt-4">{error}</div>}
    </div>
  );
}

export default AddToCart;
