import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  addDoc,
} from "firebase/firestore";
import { PAYHERE_MERCHANT_ID, PAYHERE_SANDBOX } from "../payhereConfig";

function getCartKey(user) {
  return user && user.email ? `cart_${user.email}` : "cart_guest";
}

// Helper to send placed order to Google Sheet
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbx_xG3fwQKy5YxOtjpDpj4-A_XyL490tJqhCfNg_q_Vl4mMD2VYAqx3qWFJVdwHR615/exec";

const sendPlacedOrder = async (orderDetails) => {
  try {
    const payload = {
      Timestamp: new Date().toLocaleString("en-US", {
        timeZone: "Asia/Colombo",
      }),
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
  const [postalCode, setPostalCode] = useState("");

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
        let pcode = "";

        if (u.providerData && u.providerData.length > 0) {
          const pd = u.providerData[0];
          addr = pd.address || "";
          city = pd.city || "";
          ph = pd.phoneNumber || pd.phone || "";
          pcode = pd.postalCode || "";
        }
        if (!addr && u.address) addr = u.address;
        if (!city && u.city) city = u.city;
        if (!ph && u.phoneNumber) ph = u.phoneNumber;
        if (!pcode && u.postalCode) pcode = u.postalCode;

        try {
          const token = await u.getIdTokenResult();
          if (token && token.claims) {
            if (!addr && token.claims.address) addr = token.claims.address;
            if (!city && token.claims.city) city = token.claims.city;
            if (!ph && token.claims.phone) ph = token.claims.phone;
            if (!pcode && token.claims.postalCode) pcode = token.claims.postalCode;
          }
        } catch {}

        if ((!addr || !ph || !pcode) && u.email) {
          try {
            const db = getFirestore();
            const userDoc = await getDoc(doc(db, "users", u.uid));
            if (userDoc.exists()) {
              const data = userDoc.data();
              if (!addr && data.address) addr = data.address;
              if (!city && data.city) city = data.city;
              if (!ph && data.phone) ph = data.phone;
              if (!pcode && data.postalCode) pcode = data.postalCode;
            }
          } catch {}
        }

        let deliveryAddress = addr;
        if (city && !addr.includes(city))
          deliveryAddress = addr ? `${addr}, ${city}` : city;
        setAddress(deliveryAddress || "");
        setPhone(ph || "");
        setPostalCode(pcode || ""); // <-- FIX: Set postal code from profile
        setAddressChecked(true);
      } else {
        setAddress("");
        setPhone("");
        setPostalCode(""); // <-- FIX: Reset postal code if not logged in
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
      script.onload = () =>
        console.log("✅ PayHere script loaded successfully");
      script.onerror = (err) => {
        console.error("❌ PayHere script failed to load:", err);
        setError(
          "Payment gateway failed to load. Please refresh and try again."
        );
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
    return cart
      .reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0)
      .toFixed(2);
  };

  const getShippingTotal = () => {
    return cart
      .reduce((sum, item) => sum + (parseFloat(item.shipping) || 0), 0)
      .toFixed(2);
  };

  const getTotal = () => {
    return (parseFloat(getSubtotal()) + parseFloat(getShippingTotal())).toFixed(
      2
    );
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
        postalCode: postalCode || "", // Always save, empty if not present
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
        postalCode,
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
      alert(
        "Please update your account to include your delivery address and phone number before placing an order."
      );
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
      setError(
        "Payment gateway not loaded. Please refresh the page and try again."
      );
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
        setError(
          "Payment successful but failed to save order. Please contact support."
        );
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
    <div className="min-h-screen bg-gradient-to-br from-[#CEE2FF] via-white to-[#E8F2FF] text-[#002E4D] relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#002E4D]/5 via-transparent to-[#81BBDF]/10" />
      <div className="absolute top-0 left-0 w-48 h-48 sm:w-72 sm:h-72 bg-[#002E4D]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 hidden sm:block" />
      <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-[#81BBDF]/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 hidden sm:block" />

      {/* Animated Floating Elements */}
      <div className="absolute top-20 right-6 w-4 h-4 bg-[#002E4D]/20 rounded-full animate-float hidden md:block" />
      <div className="absolute top-36 left-24 w-3 h-3 bg-[#81BBDF]/30 rounded-full animate-float delay-1000 hidden lg:block" />
      <div className="absolute bottom-60 left-12 w-2 h-2 bg-[#004F74]/20 rounded-full animate-float delay-500 hidden lg:block" />

      <div className="relative z-10 p-4 sm:p-6 md:p-8 flex flex-col min-h-screen">
        <div className="max-w-5xl mx-auto flex-grow w-full">
          {/* Premium Header */}
          <header className="text-center mb-6 sm:mb-8 py-8 sm:py-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-wider uppercase pb-3">
              <span className="bg-[#002E4D] text-white px-2 py-1 mr-1 inline-block">S</span>
              UPUN
              <span className="font-light ml-1">EXPRESS</span>
            </h1>
            <p className="text-[#004F74] max-w-xl mx-auto text-sm sm:text-base font-medium mt-2">
              Love It, Shop It - Globally
            </p>
          </header>

          {/* Main Content */}
          <div className="relative">
            {/* Card Glow Effect */}
            <div className="absolute -inset-3 bg-gradient-to-r from-[#002E4D] to-[#81BBDF] rounded-3xl blur-xl opacity-10" />

            <div className="relative bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl">
              {/* Card Header */}
              <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center gap-3 text-[#002E4D] px-4 py-2 sm:px-6 sm:py-3 rounded-sm shadow-lg">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span className="font-semibold text-base sm:text-lg">SHOPPING CART</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  {/* Cart Items */}
                  {cart.length === 0 ? (
                    <div className="text-center py-8">
                      <svg
                        className="w-12 h-12 sm:w-16 sm:h-16 text-[#81BBDF] mx-auto mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <h3 className="text-xl sm:text-2xl font-bold text-[#002E4D] mb-3">
                        Your Cart is Empty
                      </h3>
                      <p className="text-[#004F74] mb-6 max-w-md mx-auto text-sm sm:text-base">
                        Looks like you haven't added any items to your cart yet.
                        Browse our products and add some items to get started!
                      </p>
                      <div className="flex gap-3 justify-center flex-wrap">
                        <a
                          href="/invoice"
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-[#002E4D] to-[#004F74] text-white px-4 py-2 sm:px-5 sm:py-3 rounded-lg hover:shadow-lg transition-all duration-300 font-medium text-sm"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          View Invoices
                        </a>
                        <a
                          href="/"
                          className="inline-flex items-center gap-2 border border-[#002E4D] text-[#002E4D] px-4 py-2 sm:px-5 sm:py-3 rounded-lg hover:bg-[#002E4D] hover:text-white transition-all duration-300 font-medium text-sm"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                            />
                          </svg>
                          Go Home
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Header */} 
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-xl sm:text-2xl font-bold text-[#002E4D]">
                            Cart Items
                          </h2>
                          <p className="text-[#004F74] text-sm mt-1">
                            {cart.length} item{cart.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                        {cart.length > 0 && (
                          <button
                            onClick={() => {
                              setCart([]);
                              const key = getCartKey(user);
                              localStorage.removeItem(key);
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Clear All
                          </button>
                        )}
                      </div>

                      {/* Cart Items */}
                      <div className="space-y-4">
                        {cart.map((item, idx) => (
                          <div
                            key={idx}
                            className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow"
                          >
                            <div className="flex gap-4 sm:gap-6 flex-col sm:flex-row">
                              {/* Product Image */}
                              {item.imageUrl && (
                                <div className="flex-shrink-0 w-full sm:w-24">
                                  <img
                                    src={item.imageUrl}
                                    alt={item.productName}
                                    className="w-full h-40 sm:h-24 object-cover rounded-lg"
                                  />
                                </div>
                              )}

                              {/* Product Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                  {/* Product Info */}
                                  <div className="flex-1 space-y-3">
                                    <div>
                                      <h3 className="text-lg font-semibold text-[#002E4D] mb-1">
                                        {item.productName}
                                      </h3>
                                      <p className="text-[#004F74] text-sm leading-relaxed">
                                        {item.details}
                                      </p>
                                    </div>

                                    {/* Pricing */}
                                    <div className="flex flex-col sm:flex-row sm:gap-12 text-sm mt-2">
                                      <div>
                                        <div className="text-[#002E4D] font-medium">
                                          Product Price
                                        </div>
                                        <div className="text-[#004F74] font-semibold">
                                          LKR{" "}
                                          {parseFloat(
                                            item.price
                                          ).toLocaleString()}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-[#002E4D] font-medium">
                                          Shipping
                                        </div>
                                        <div className="text-[#004F74] font-semibold">
                                          LKR{" "}
                                          {parseFloat(
                                            item.shipping || 0
                                          ).toLocaleString()}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-[#002E4D] font-medium">
                                          Total
                                        </div>
                                        <div className="text-[#002E4D] font-bold">
                                          LKR{" "}
                                          {(
                                            parseFloat(item.price) +
                                            parseFloat(item.shipping || 0)
                                          ).toLocaleString()}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex gap-2 mt-3 sm:mt-0">
                                    <a
                                      href={item.link}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-2 px-3 py-2 bg-[#002E4D] text-white rounded-lg hover:bg-[#001223] transition-colors text-sm"
                                    >
                                      <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                        />
                                      </svg>
                                      View
                                    </a>
                                    <button
                                      onClick={() => removeFromCart(idx)}
                                      className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                                    >
                                      <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        />
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
                    </div>
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="lg:col-span-1">
                    <div className="sticky top-4">
                      <div className="relative bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl p-4 sm:p-6 shadow-2xl">
                        <h3 className="text-lg sm:text-xl font-bold text-[#002E4D] mb-4 flex items-center gap-2">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                          Order Summary
                        </h3>

                        <div className="space-y-4 mb-4">
                          <div className="flex justify-between items-center pb-3 border-b border-[#81BBDF]/20">
                            <span className="text-[#004F74]">
                              Subtotal ({cart.length} items)
                            </span>
                            <span className="font-semibold text-[#002E4D]">
                              LKR {parseFloat(getSubtotal()).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center pb-3 border-b border-[#81BBDF]/20">
                            <span className="text-[#004F74]">Shipping</span>
                            <span className="font-semibold text-[#002E4D]">
                              LKR{" "}
                              {parseFloat(getShippingTotal()).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center pt-3 border-t-2 border-[#81BBDF]/30">
                            <span className="text-lg font-bold text-[#002E4D]">
                              Total Amount
                            </span>
                            <span className="text-xl font-bold text-[#002E4D]">
                              LKR {parseFloat(getTotal()).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <div className="font-semibold text-[#002E4D] mb-3">
                            Payment Method
                          </div>
                          <div className="space-y-3">
                            <label
                              className={`flex items-center p-3 sm:p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                                paymentMethod === "payhere"
                                  ? "border-[#002E4D] bg-[#002E4D]/5"
                                  : "border-gray-300 hover:border-[#81BBDF]"
                              }`}
                            >
                              <input
                                type="radio"
                                name="paymentMethod"
                                value="payhere"
                                checked={paymentMethod === "payhere"}
                                onChange={() => setPaymentMethod("payhere")}
                                className="mr-3 text-[#002E4D]"
                              />
                              <img
                                src="https://blog.payhere.lk/wp-content/uploads/2021/02/PayHere-Logo.png"
                                alt="PayHere"
                                className="w-28 sm:w-32"
                              />
                            </label>
                            <label
                              className={`flex items-center p-3 sm:p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                                paymentMethod === "cod"
                                  ? "border-[#002E4D] bg-[#002E4D]/5"
                                  : "border-gray-300 hover:border-[#81BBDF]"
                              }`}
                            >
                              <input
                                type="radio"
                                name="paymentMethod"
                                value="cod"
                                checked={paymentMethod === "cod"}
                                onChange={() => setPaymentMethod("cod")}
                                className="mr-3 text-[#002E4D]"
                              />
                              <div className="flex items-center gap-2">
                                <span className="text-xl">💵</span>
                                <div>
                                  <div className="font-semibold text-[#002E4D]">
                                    Cash on Delivery
                                  </div>
                                </div>
                              </div>
                            </label>
                          </div>
                        </div>

                        <button
                          onClick={handleCheckout}
                          disabled={loading}
                          className="w-full bg-gradient-to-r from-[#002E4D] to-[#004F74] text-white font-semibold py-3 sm:py-4 rounded-xl hover:from-[#004F74] hover:to-[#002E4D] transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                          {loading ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-sm">Processing...</span>
                            </>
                          ) : (
                            <>
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                                />
                              </svg>
                              <span className="text-sm">Place Order</span>
                            </>
                          )}
                        </button>

                        <div className="mt-3 text-center">
                          <div className="inline-flex items-center gap-2 text-xs text-[#004F74] bg-[#F0F8FF] px-3 py-2 rounded-lg">
                            <svg
                              className="w-3 h-3 text-green-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                              />
                            </svg>
                            Secure payment powered by PayHere
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Success/Error Messages */}
              {(success || error) && (
                <div className="mt-6">
                  {success && (
                    <div className="p-3 bg-green-50/80 backdrop-blur-sm border border-green-200 rounded-xl text-green-700 shadow-sm">
                      <div className="flex items-center gap-3 text-sm">
                        <svg
                          className="w-4 h-4 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {success}
                      </div>
                    </div>
                  )}
                  {error && (
                    <div className="p-3 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl text-red-700 shadow-sm">
                      <div className="flex items-center gap-3 text-sm">
                        <svg
                          className="w-4 h-4 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {error}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Premium Footer */}
        <footer className="text-center py-6 sm:py-8 text-[#004F74] text-sm mt-8 sm:mt-12 relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 md:w-48 h-px bg-gradient-to-r from-transparent via-[#81BBDF] to-transparent" />
          <div className="max-w-5xl mx-auto">
            <p className="mb-2 font-medium">SUPUN EXPRESS &copy; {new Date().getFullYear()}</p>
            <p className="text-xs sm:text-sm text-[#81BBDF]">Elevating Global Commerce Through Premium Service</p>
          </div>
        </footer>
      </div>

      {/* Add custom animations to tailwind config */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default AddToCart;