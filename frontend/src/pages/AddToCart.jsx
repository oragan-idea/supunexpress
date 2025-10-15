// AddToCart.js
import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, collection, addDoc } from "firebase/firestore";
import { PAYHERE_MERCHANT_ID, PAYHERE_SANDBOX } from "../payhereConfig";

function getCartKey(user) {
  return user && user.email ? `cart_${user.email}` : "cart_guest";
}

// Helper to send placed order to Google Sheet
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx_xG3fwQKy5YxOtjpDpj4-A_XyL490tJqhCfNg_q_Vl4mMD2VYAqx3qWFJVdwHR615/exec";

const sendPlacedOrder = async (orderDetails) => {
  try {
    const payload = {
      Timestamp: new Date().toLocaleString("en-US", { timeZone: "Asia/Colombo" }),
      "User Name": orderDetails.userName,
      Address: orderDetails.address,
      Phone: orderDetails.phone,
      Email: orderDetails.email,
      "Order Description": orderDetails.orderDescription,
      "Payment Method": orderDetails.paymentMethod,
      "Order Total": orderDetails.orderTotal,
    };
    
    let response;
    try {
      response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      const params = new URLSearchParams(payload).toString();
      response = await fetch(APPS_SCRIPT_URL + "?" + params, { method: "GET" });
    }
    
    if (!response.ok) {
      const text = await response.text();
      console.error("Google Sheet API error:", text);
    }
  } catch (e) {
    console.error("Failed to send order to Google Sheet", e);
  }
};

function AddToCart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("payhere");
  const auth = getAuth();
  const [user, setUser] = useState(auth.currentUser);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [addressChecked, setAddressChecked] = useState(false);

  // Listen for user changes and fetch profile info
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      setAddressChecked(false);
      if (u) {
        await u.reload();
        let addr = "";
        let city = "";
        let ph = "";
        
        if (u.providerData && u.providerData.length > 0) {
          const pd = u.providerData[0];
          addr = pd.address || "";
          city = pd.city || "";
          ph = pd.phoneNumber || pd.phone || "";
        }
        if (!addr && u.address) addr = u.address;
        if (!city && u.city) city = u.city;
        if (!ph && u.phoneNumber) ph = u.phoneNumber;
        
        try {
          const token = await u.getIdTokenResult();
          if (token && token.claims) {
            if (!addr && token.claims.address) addr = token.claims.address;
            if (!city && token.claims.city) city = token.claims.city;
            if (!ph && token.claims.phone) ph = token.claims.phone;
          }
        } catch {}
        
        if ((!addr || !ph) && u.email) {
          try {
            const db = getFirestore();
            const userDoc = await getDoc(doc(db, "users", u.uid));
            if (userDoc.exists()) {
              const data = userDoc.data();
              if (!addr && data.address) addr = data.address;
              if (!city && data.city) city = data.city;
              if (!ph && data.phone) ph = data.phone;
            }
          } catch {}
        }
        
        let deliveryAddress = addr;
        if (city && !addr.includes(city)) deliveryAddress = addr ? `${addr}, ${city}` : city;
        setAddress(deliveryAddress || "");
        setPhone(ph || "");
        setAddressChecked(true);
      } else {
        setAddress("");
        setPhone("");
        setAddressChecked(true);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  // Load cart for current user
  useEffect(() => {
    const key = getCartKey(user);
    const stored = localStorage.getItem(key);
    if (stored) setCart(JSON.parse(stored));
    else setCart([]);

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

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0).toFixed(2);
  };

  const getShippingTotal = () => {
    return cart.reduce((sum, item) => sum + (parseFloat(item.shipping) || 0), 0).toFixed(2);
  };

  const getTotal = () => {
    return (parseFloat(getSubtotal()) + parseFloat(getShippingTotal())).toFixed(2);
  };

  // Save order to Firestore
  const saveOrderToFirestore = async (payhereOrderId = null) => {
    try {
      const db = getFirestore();
      const ordersRef = collection(db, "orders");
      
      const orderData = {
        userId: user.uid,
        userName: user.displayName || user.email.split("@")[0],
        userEmail: user.email,
        address: address,
        phone: phone,
        items: cart,
        subtotal: getSubtotal(),
        shipping: getShippingTotal(),
        total: getTotal(),
        paymentMethod: paymentMethod,
        status: paymentMethod === "cod" ? "confirmed" : "paid",
        orderId: "ORDER_" + Date.now(),
        timestamp: new Date(),
        payhereOrderId: payhereOrderId,
      };

      const docRef = await addDoc(ordersRef, orderData);
      console.log("Order saved with ID: ", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Error saving order to Firestore: ", error);
      throw error;
    }
  };

  // Send all products to Google Sheet
  const sendAllProducts = async () => {
    for (const item of cart) {
      const orderDetails = {
        userName: user.displayName || user.email.split("@")[0],
        address,
        phone,
        email: user.email,
        orderDescription: `${item.productName} (LKR ${item.price})`,
        paymentMethod,
        orderTotal: item.price,
      };
      await sendPlacedOrder(orderDetails);
    }
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

    if (addressChecked && (!address.trim() || !phone.trim())) {
      alert("Please update your account to include your delivery address and phone number before placing an order.");
      setError("Missing address or phone. Update your account profile.");
      setLoading(false);
      return;
    }

    const processOrder = async (payhereOrderId = null) => {
      try {
        await saveOrderToFirestore(payhereOrderId);
        await sendAllProducts();
        
        const key = getCartKey(user);
        localStorage.setItem(`lastOrdered_${user.email}`, JSON.stringify(cart));
        setCart([]);
        localStorage.removeItem(key);
        
        return true;
      } catch (error) {
        console.error("Order processing error:", error);
        return false;
      }
    };

    if (paymentMethod === "cod") {
      setTimeout(async () => {
        const success = await processOrder();
        if (success) {
          setSuccess("Order placed successfully! (Cash on Delivery)");
        } else {
          setError("Failed to place order. Please try again.");
        }
        setLoading(false);
      }, 1200);
      return;
    }

    if (!window.payhere) {
      setError("Payment gateway not loaded. Please refresh the page and try again.");
      setLoading(false);
      return;
    }

    const order_id = "ORDER_" + Date.now();
    const items = cart.map((item) => item.productName).join(", ");
    const amount = getTotal();

    const payment = {
      sandbox: PAYHERE_SANDBOX,
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
      phone,
      address,
      city: "",
      country: "Sri Lanka",
    };

    window.payhere.onCompleted = async function (orderId) {
      const success = await processOrder(orderId);
      if (success) {
        setSuccess("Payment successful! Order ID: " + orderId);
      } else {
        setError("Payment successful but failed to save order. Please contact support.");
      }
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

    try {
      window.payhere.startPayment(payment);
    } catch (err) {
      console.error("Payment start error:", err);
      setError("Unable to start payment. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8F4FF] via-[#F0F8FF] to-[#E3F2FD] text-[#002E4D] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#002E4D]/3 via-transparent to-[#81BBDF]/8"></div>
      
      <div className="absolute top-10 right-20 w-8 h-8 bg-[#002E4D]/10 rounded-full animate-bounce">
        <div className="w-4 h-4 bg-[#002E4D]/20 rounded-full absolute top-1 left-1"></div>
      </div>
      <div className="absolute top-40 left-10 w-6 h-10 bg-[#81BBDF]/20 rounded-full animate-pulse">
        <div className="w-3 h-3 bg-[#81BBDF]/30 rounded-full absolute top-1 left-1.5"></div>
      </div>
      <div className="absolute bottom-40 right-10 w-10 h-6 bg-[#004F74]/15 rounded-full animate-pulse delay-1000"></div>
      
      <div className="absolute bottom-10 left-10 opacity-5">
        <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 7h-3V6a4 4 0 00-8 0v1H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2zm-9-1a2 2 0 014 0v1h-4V6z"/>
        </svg>
      </div>

      <div className="relative z-10 p-6 flex flex-col min-h-screen">
        <div className="max-w-6xl mx-auto flex-grow w-full">
          <header className="text-center mb-8 py-12">
            <div className="relative inline-block">
              <h1 className="text-5xl font-bold tracking-wider uppercase pb-3">
                <span className="bg-[#002E4D] text-white px-2 py-1 mr-1">S</span>UPUN
                <span className="font-light ml-1">EXPRESS</span>
              </h1>
            </div>
            <p className="text-[#004F74] max-w-xl mx-auto text-lg font-medium mt-4">
              Love It, Shop It - Globally 
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-[#002E4D] to-[#81BBDF] rounded-3xl blur-xl opacity-5"></div>
                
                <div className="relative bg-white/95 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#81BBDF]/30">
                    <h2 className="text-2xl font-bold text-[#002E4D] flex items-center gap-3">
                      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Shopping Cart ({cart.length} items)
                    </h2>
                    {cart.length > 0 && (
                      <button
                        onClick={() => {
                          setCart([]);
                          const key = getCartKey(user);
                          localStorage.removeItem(key);
                        }}
                        className="text-sm text-[#004F74] hover:text-red-600 transition-colors font-medium flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Clear Cart
                      </button>
                    )}
                  </div>

                  {cart.length === 0 && (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 bg-gradient-to-br from-[#CEE2FF] to-[#E8F2FF] rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg">
                        <svg className="w-12 h-12 text-[#81BBDF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold text-[#002E4D] mb-3">Your Cart is Empty</h3>
                      <p className="text-[#004F74] mb-8 max-w-md mx-auto">
                        Looks like you haven't added any items to your cart yet. 
                        Browse our products and add some items to get started!
                      </p>
                      <div className="flex gap-4 justify-center">
                        <a
                          href="/invoice"
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#002E4D] to-[#004F74] text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          View Invoices
                        </a>
                        <a
                          href="/"
                          className="inline-flex items-center gap-2 border border-[#002E4D] text-[#002E4D] px-6 py-3 rounded-xl hover:bg-[#002E4D] hover:text-white transition-all duration-300"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          Go Home
                        </a>
                      </div>
                    </div>
                  )}

                  {cart.length > 0 && (
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                      {cart.map((item, idx) => (
                        <div
                          key={idx}
                          className="group bg-gradient-to-r from-white to-[#F8FBFF] rounded-xl border-2 border-[#E8F2FF] hover:border-[#81BBDF] transition-all duration-300 shadow-sm hover:shadow-lg p-4"
                        >
                          <div className="flex gap-4">
                            {item.imageUrl && (
                              <div className="flex-shrink-0 relative">
                                <img
                                  src={item.imageUrl}
                                  alt={item.productName}
                                  className="w-20 h-20 object-cover rounded-lg shadow-md"
                                />
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#002E4D] text-white rounded-full flex items-center justify-center text-xs font-bold">
                                  {idx + 1}
                                </div>
                              </div>
                            )}
                            
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-[#002E4D] text-lg mb-1 truncate">
                                {item.productName}
                              </h3>
                              <p className="text-[#004F74] text-sm mb-3 line-clamp-2">
                                {item.details}
                              </p>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="text-sm">
                                    <span className="text-[#002E4D] font-semibold">Price:</span>
                                    <span className="text-[#004F74] ml-1">LKR {item.price}</span>
                                  </div>
                                  <div className="text-sm">
                                    <span className="text-[#002E4D] font-semibold">Shipping:</span>
                                    <span className="text-[#004F74] ml-1">LKR {item.shipping}</span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  <a
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-[#002E4D] text-white rounded-lg hover:bg-[#001223] transition-all text-xs"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                    View
                                  </a>
                                  <button
                                    onClick={() => removeFromCart(idx)}
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all text-xs"
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {cart.length > 0 && (
              <div className="lg:col-span-1">
                <div className="sticky top-6">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-[#002E4D] to-[#81BBDF] rounded-3xl blur-xl opacity-5"></div>
                    
                    <div className="relative bg-white/95 backdrop-blur-xl border border-white/30 rounded-2xl p-6 shadow-2xl" style={{ minWidth: '340px', maxWidth: '420px', margin: '0 auto' }}>
                      <h3 className="text-xl font-bold text-[#002E4D] mb-6 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Order Summary
                      </h3>
                      
                      <div className="space-y-4 mb-6">
                        <div className="flex justify-between items-center pb-3 border-b border-[#81BBDF]/20">
                          <span className="text-[#004F74]">Subtotal ({cart.length} items)</span>
                          <span className="font-semibold text-[#002E4D]">LKR {getSubtotal()}</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-[#81BBDF]/20">
                          <span className="text-[#004F74]">Shipping</span>
                          <span className="font-semibold text-[#002E4D]">LKR {getShippingTotal()}</span>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-[#81BBDF]/30">
                          <span className="text-lg font-bold text-[#002E4D]">Total</span>
                          <span className="text-xl font-bold text-[#002E4D]">LKR {getTotal()}</span>
                        </div>
                      </div>

                      <div className="mb-6">
                        <div className="font-semibold mb-2">Payment Method</div>
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
                          <label className={`flex items-center border rounded-lg px-6 py-3 cursor-pointer flex-1 min-w-0 justify-center text-base font-semibold transition-all duration-200 ${paymentMethod === "payhere" ? "border-blue-600 bg-blue-50" : "border-gray-300"}`} style={{maxWidth:'100%'}}>
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="payhere"
                              checked={paymentMethod === "payhere"}
                              onChange={() => setPaymentMethod("payhere")}
                              className="mr-2 accent-blue-600 flex-shrink-0"
                            />
                            <img src="https://www.payhere.lk/downloads/images/payhere_square.svg" alt="PayHere" className="w-6 h-6 mr-2 flex-shrink-0" />
                          </label>
                          <label className={`flex items-center border rounded-lg px-6 py-3 cursor-pointer flex-1 min-w-0 justify-center text-base font-semibold transition-all duration-200 ${paymentMethod === "cod" ? "border-green-600 bg-green-50" : "border-gray-300"}`} style={{maxWidth:'100%'}}>
                            <input
                              type="radio"
                              name="paymentMethod"
                              value="cod"
                              checked={paymentMethod === "cod"}
                              onChange={() => setPaymentMethod("cod")}
                              className="mr-2 accent-green-600 flex-shrink-0"
                            />
                            <span className="mr-2 flex-shrink-0" role="img" aria-label="Cash">💵</span>
                            <span className="font-semibold">Cash on Delivery</span>
                          </label>
                        </div>
                      </div>
                      <button
                        onClick={handleCheckout}
                        disabled={loading}
                        className="w-full font-semibold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 bg-gradient-to-r from-[#004F74] to-[#002E4D] hover:from-[#002E4D] hover:to-[#001223] text-white"
                      >
                        {loading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Placing Order...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            <span>Place Order</span>
                          </>
                        )}
                      </button>

                      <div className="mt-4 text-center">
                        <div className="inline-flex items-center gap-2 text-xs text-[#004F74] bg-[#F0F8FF] px-3 py-2 rounded-lg">
                          <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          Secure payment powered by PayHere
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {(success || error) && (
            <div className="mt-8 max-w-2xl mx-auto">
              {success && (
                <div className="p-4 bg-green-50/90 backdrop-blur-sm border border-green-200 rounded-xl text-green-700 shadow-lg">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {success}
                  </div>
                </div>
              )}
              {error && (
                <div className="p-4 bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-xl text-red-700 shadow-lg">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <footer className="text-center py-8 text-[#004F74] text-sm mt-16 relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-[#81BBDF] to-transparent"></div>
          <div className="max-w-6xl mx-auto">
            <p className="mb-2 font-medium">SUPUN EXPRESS &copy; {new Date().getFullYear()}</p>
            <p className="text-xs text-[#81BBDF]">Your Trusted Shopping Partner</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default AddToCart;