import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { Link } from "react-router-dom";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

function getCartKey(user) {
  return user && user.email ? `cart_${user.email}` : "cart_guest";
}

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbw2DZDfsx9QxsNdgb9OeZd5uPbh9-WS9QEQufagoRYO7AnAkM1eECOQhtAoethEwtNF/exec";

function Invoice() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const auth = getAuth();
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, [auth]);

  useEffect(() => {
    if (!user) return;
    const fetchCards = async () => {
      setLoading(true);
      setError(null);
      try {
        const db = getFirestore();
        const invoicesRef = collection(db, "invoices");
        const q = query(invoicesRef, where("userEmail", "==", user.email));
        const snapshot = await getDocs(q);
        const invoices = snapshot.docs.map((doc) => doc.data());
        setCards(invoices);
      } catch (err) {
        setError("Failed to fetch product cards.");
      }
      setLoading(false);
    };
    fetchCards();
  }, [user]);

  // Remove last ordered items (COD) from invoice

  // Helper: get persistent removed orders
  function getRemovedOrders(email) {
    try {
      return JSON.parse(localStorage.getItem(`removedOrders_${email}`) || "[]");
    } catch {
      return [];
    }
  }

  function setRemovedOrders(email, arr) {
    localStorage.setItem(`removedOrders_${email}`, JSON.stringify(arr));
  }

  // After fetch, filter out removed orders and update removed list if needed
  useEffect(() => {
    if (!user || !Array.isArray(cards) || cards.length === 0) return;
    // Check for new COD removals
    const lastOrderedRaw = localStorage.getItem(`lastOrdered_${user.email}`);
    let removedOrders = getRemovedOrders(user.email);
    let changed = false;
    if (lastOrderedRaw) {
      try {
        const lastOrdered = JSON.parse(lastOrderedRaw);
        if (Array.isArray(lastOrdered) && lastOrdered.length > 0) {
          lastOrdered.forEach((lo) => {
            const key = `${lo.productName}|${lo.price}|${lo.userEmail}`;
            if (!removedOrders.includes(key)) {
              removedOrders.push(key);
              changed = true;
            }
          });
          localStorage.removeItem(`lastOrdered_${user.email}`);
        }
      } catch {}
    }
    if (changed) setRemovedOrders(user.email, removedOrders);
    // Only update cards if filtering actually changes the array
    if (removedOrders.length > 0) {
      const filtered = cards.filter((card) => {
        const key = `${card.productName}|${card.price}|${card.userEmail}`;
        return !removedOrders.includes(key);
      });
      if (filtered.length !== cards.length) {
        setCards(filtered);
      }
    }
  }, [user, cards]);

  const addToCart = (card) => {
    const key = getCartKey(user);
    const cart = JSON.parse(localStorage.getItem(key) || "[]");
    const exists = cart.some(
      (item) =>
        item.productName === card.productName &&
        item.price === card.price &&
        item.userEmail === card.userEmail
    );
    if (exists) {
      alert("This product is already in your cart.");
      return;
    }
    cart.push(card);
    localStorage.setItem(key, JSON.stringify(cart));
    alert("Added to cart!");
  };

  const removeInvoice = (card) => {
    if (!user) return;
    if (!window.confirm("Are you sure you want to remove this invoice?"))
      return;

    const key = `${card.productName}|${card.price}|${card.userEmail}`;
    const removedOrders = getRemovedOrders(user.email);

    // Skip if already removed
    if (!removedOrders.includes(key)) {
      removedOrders.push(key);
      setRemovedOrders(user.email, removedOrders);
    }

    // Update UI immediately
    const updatedCards = cards.filter(
      (c) => `${c.productName}|${c.price}|${c.userEmail}` !== key
    );
    setCards(updatedCards);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#CEE2FF] via-white to-[#E8F2FF] text-[#002E4D] relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#002E4D]/5 via-transparent to-[#81BBDF]/10"></div>
      <div className="absolute top-0 left-0 w-48 h-48 sm:w-72 sm:h-72 bg-[#002E4D]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-[#81BBDF]/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

      {/* Animated Floating Elements */}
      <div className="absolute top-20 right-12 w-5 h-5 bg-[#002E4D]/20 rounded-full animate-float hidden sm:block"></div>
      <div className="absolute top-36 left-36 w-4 h-4 bg-[#81BBDF]/30 rounded-full animate-float delay-1000 hidden md:block"></div>
      <div className="absolute bottom-60 left-20 w-3 h-3 bg-[#004F74]/20 rounded-full animate-float delay-500 hidden md:block"></div>

      <div className="relative z-10 p-4 sm:p-6 md:p-8 flex flex-col min-h-screen">
        <div className="max-w-5xl mx-auto w-full">
          {/* Premium Header */}
          <header className="text-center mb-6 sm:mb-8 py-8 sm:py-12">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-wider uppercase pb-2">
              <span className="bg-[#002E4D] text-white px-2 py-1 mr-1">S</span>
              UPUN
              <span className="font-light ml-1">EXPRESS</span>
            </h1>
            <p className="text-[#004F74] max-w-xl mx-auto text-sm sm:text-base font-medium">
              Love It, Shop It - Globally
            </p>
          </header>

          {/* Main Content */}
          <div className="relative">
            {/* Card Glow Effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-[#002E4D] to-[#81BBDF] rounded-3xl blur-xl opacity-10"></div>

            <div className="relative bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl">
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="font-semibold text-lg sm:text-2xl">
                    PRODUCT INVOICES
                  </span>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex justify-center items-center py-8">
                  <div className="flex items-center gap-3 text-[#004F74]">
                    <div className="w-5 h-5 border-2 border-[#002E4D] border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm sm:text-base">Loading your invoices...</span>
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl text-red-700 shadow-lg">
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 flex-shrink-0"
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
                    <span className="text-sm">{error}</span>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!loading && !error && cards.length === 0 && (
                <div className="text-center py-8 sm:py-12">
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <h3 className="text-lg sm:text-xl font-semibold text-[#002E4D] mb-2">
                    No Invoices Yet
                  </h3>
                  <p className="text-[#004F74] mb-6 text-sm sm:text-base">
                    Your product invoices will appear here once the admin
                    processes your requests.
                  </p>
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-[#002E4D] to-[#004F74] text-white px-4 py-2 sm:px-6 sm:py-3 rounded-lg hover:shadow-lg transition-all duration-300 text-sm sm:text-base font-medium"
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
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                      />
                    </svg>
                    Back to Home
                  </Link>
                </div>
              )}

              {/* Product Cards Grid */}
              {!loading && !error && cards.length > 0 && (
                <div className="grid grid-cols-1 gap-6">
                  {cards.map((card, idx) => (
                    <div
                      key={idx}
                      className="group bg-gradient-to-r from-[#CEE2FF] to-[#E8F2FF] rounded-xl border border-[#81BBDF]/30 hover:border-[#002E4D]/30 transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden"
                    >
                      <div className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                          {/* Product Image */}
                          {card.imageUrl && (
                            <div className="flex-shrink-0 w-full sm:w-32">
                              <img
                                src={card.imageUrl}
                                alt={card.productName}
                                className="w-full h-40 sm:h-32 object-cover rounded-md shadow-md"
                              />
                            </div>
                          )}

                          {/* Product Details */}
                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                              <div className="flex-1">
                                <h3 className="text-lg sm:text-xl font-bold text-[#002E4D] mb-1">
                                  {card.productName}
                                </h3>
                                <p className="text-[#004F74] mb-3 text-sm sm:text-base leading-relaxed">
                                  {card.details}
                                </p>

                                {/* Pricing Information */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                                  <div className="flex items-center gap-2 text-sm">
                                    <div className="w-2 h-2 bg-[#002E4D] rounded-full"></div>
                                    <span className="font-medium text-[#002E4D]">
                                      Product Price:
                                    </span>
                                    <span className="text-base font-bold text-[#004F74]">
                                      {card.price} LKR
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm">
                                    <div className="w-2 h-2 bg-[#002E4D] rounded-full"></div>
                                    <span className="font-medium text-[#002E4D]">
                                      Shipping Cost:
                                    </span>
                                    <span className="text-base font-bold text-[#004F74]">
                                      {card.shipping} LKR
                                    </span>
                                  </div>
                                </div>

                                {/* Total Price */}
                                <div className="flex items-center gap-2 mb-3 p-3 bg-white/50 rounded-lg border border-[#81BBDF]/20">
                                  <div className="w-2 h-2 bg-[#002E4D] rounded-full"></div>
                                  <span className="text-sm font-medium text-[#002E4D]">
                                    Total Amount:
                                  </span>
                                  <span className="text-lg sm:text-xl font-bold text-[#002E4D]">
                                    {(
                                      parseFloat(card.price) +
                                      parseFloat(card.shipping || 0)
                                    ).toFixed(2)}{" "}
                                    LKR
                                  </span>
                                </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex flex-col sm:flex-col gap-3 w-full sm:w-auto">
                                <a
                                  href={card.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex justify-center items-center gap-2 px-4 py-2 bg-[#002E4D] text-white rounded-md hover:bg-[#001223] transition-all duration-300 shadow-sm hover:shadow-md text-sm font-medium w-full sm:w-auto"
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
                                  View Product
                                </a>
                                <button
                                  onClick={() => addToCart(card)}
                                  className="inline-flex justify-center items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#004F74] to-[#002E4D] text-white rounded-md hover:from-[#002E4D] hover:to-[#001223] transition-all duration-300 shadow-sm hover:shadow-md text-sm font-medium w-full sm:w-auto"
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
                                      d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                                    />
                                  </svg>
                                  Add to Cart
                                </button>

                                <button
                                  onClick={() => removeInvoice(card)}
                                  className="inline-flex justify-center items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-all duration-300 shadow-sm hover:shadow-md text-sm font-medium w-full sm:w-auto"
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
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                  Remove Invoice
                                </button>
                              </div>
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

        {/* Premium Footer */}
        <footer className="text-center py-6 sm:py-8 text-[#004F74] text-sm mt-8 sm:mt-12 relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 md:w-48 h-px bg-gradient-to-r from-transparent via-[#81BBDF] to-transparent"></div>
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
            transform: translateY(-16px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default Invoice;