import React, { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Link } from "react-router-dom";

// Status Badge Component (Enhanced)
const StatusBadge = ({ status }) => {
  const statusConfig = {
    delivered: {
      color: "#10b981",
      bgColor: "#ecfdf5",
      borderColor: "#10b98120",
      icon: "✓",
    },
    packing: {
      color: "#f59e0b",
      bgColor: "#fffbeb",
      borderColor: "#f59e0b20",
      icon: "📦",
    },
    "order placed": {
      color: "#3b82f6",
      bgColor: "#eff6ff",
      borderColor: "#3b82f620",
      icon: "🛒",
    },
    pending: {
      color: "#f97316",
      bgColor: "#fff7ed",
      borderColor: "#f9731620",
      icon: "⏳",
    },
    shipped: {
      color: "#8b5cf6",
      bgColor: "#faf5ff",
      borderColor: "#8b5cf620",
      icon: "🚚",
    },
    cancelled: {
      color: "#ef4444",
      bgColor: "#fef2f2",
      borderColor: "#ef444420",
      icon: "❌",
    },
    default: {
      color: "#64748b",
      bgColor: "#f8fafc",
      borderColor: "#64748b20",
      icon: "ℹ️",
    },
  };

  const config = statusConfig[status?.toLowerCase()] || statusConfig.default;

  return (
    <div
      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border"
      style={{
        color: config.color,
        backgroundColor: config.bgColor,
        borderColor: config.borderColor,
      }}
    >
      <span className="mr-2 text-sm">{config.icon}</span>
      <span className="capitalize text-sm">{status}</span>
    </div>
  );
};

// Skeleton Loader
const OrderSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 animate-pulse">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
      <div className="flex-1">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 md:mt-0 md:ml-6">
        <div className="h-8 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  </div>
);

// Order Card Component
const OrderCard = ({ order, onClick }) => {
  return (
    <div
      className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        {/* Left Section - Order Info */}
        <div className="flex-1 space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-[#002E4D] mb-1">
                {order.items?.[0]?.productName || "Unnamed Product"}
                {order.items?.length > 1 && ` + ${order.items.length - 1} more`}
              </h3>
              <div className="text-xs sm:text-sm text-[#004F74] font-mono">
                {order.orderId}
              </div>
            </div>
            <div className="mt-2 sm:mt-0">
              <StatusBadge status={order.status} />
            </div>
          </div>

          {/* Order Items Preview */}
          {order.items && order.items.length > 0 && (
            <div className="space-y-3">
              {order.items.slice(0, 2).map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[#002E4D]">
                      {item.productName}
                    </div>
                  </div>
                  <div className="text-sm text-[#002E4D] font-semibold">
                    LKR {Number(item.price || 0).toLocaleString()}
                  </div>
                </div>
              ))}
              {order.items.length > 2 && (
                <div className="text-sm text-[#004F74] text-center">
                  + {order.items.length - 2} more items
                </div>
              )}
            </div>
          )}

          {/* Order Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-medium text-[#002E4D] text-xs uppercase tracking-wide mb-1">
                Payment
              </div>
              <div className="text-[#004F74] font-medium capitalize">
                {order.paymentMethod?.toUpperCase() || "N/A"}
              </div>
            </div>

            <div>
              <div className="font-medium text-[#002E4D] text-xs uppercase tracking-wide mb-1">
                Date
              </div>
              <div className="text-[#004F74]">
                {order.timestamp?.toDate
                  ? order.timestamp.toDate().toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : new Date(order.timestamp).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
              </div>
            </div>

            <div>
              <div className="font-medium text-[#002E4D] text-xs uppercase tracking-wide mb-1">
                Items
              </div>
              <div className="text-[#004F74] font-medium">
                {order.items?.length || 1} item
                {order.items?.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
          <div className="font-bold text-sm">Order Details</div>
        </div>

        {/* Right Section - Total */}
        <div className="md:text-right flex-shrink-0">
          <div className="text-sm text-[#004F74] mt-1">Total Amount</div>
          <div className="text-xl sm:text-2xl font-bold text-[#002E4D]">
            LKR {Number(order.total || 0).toLocaleString()}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="mt-4 w-full md:inline-block md:w-auto bg-[#004F74] text-white font-medium px-4 py-2 rounded-lg hover:bg-[#006B9E] transition"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

// Order Details Modal
const OrderDetailsModal = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#002E4D]">
                Order Details
              </h2>
              <p className="text-[#004F74] text-sm mt-1">Order ID: {order.orderId}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl transition-colors duration-200 ml-4"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Order Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-[#002E4D] mb-3">Order Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[#004F74]">Status</span>
                  <StatusBadge status={order.status} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#004F74]">Date & Time</span>
                  <span className="text-[#002E4D]">
                    {order.timestamp?.toDate
                      ? order.timestamp.toDate().toLocaleString()
                      : new Date(order.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#004F74]">Payment Method</span>
                  <span className="text-[#002E4D] capitalize">
                    {order.paymentMethod?.toLowerCase() || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-[#002E4D] mb-3">Customer Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-[#004F74]">Name</span>
                  <span className="text-[#002E4D]">{order.userName || "N/A"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#004F74]">Email</span>
                  <span className="text-[#002E4D]">{order.userEmail}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          {order.items && order.items.length > 0 && (
            <div>
              <h3 className="font-semibold text-[#002E4D] mb-4 text-lg">
                Order Items ({order.items.length})
              </h3>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    {/* Product Image */}
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.productName || item.name}
                        className="w-full sm:w-20 h-40 sm:h-20 object-cover rounded-lg flex-shrink-0"
                        style={{ maxWidth: 160 }}
                      />
                    )}

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <div className="flex-1">
                          <div className="font-semibold text-[#002E4D] text-lg mb-1">
                            {item.productName || item.name || `Item ${index + 1}`}
                          </div>
                          {item.details && (
                            <div className="text-[#004F74] text-sm mb-2 leading-relaxed">
                              {item.details}
                            </div>
                          )}
                          <div className="flex flex-wrap gap-4 text-sm">
                            {item.quantity && (
                              <div className="text-[#002E4D]">
                                <span className="font-medium">Quantity:</span>{" "}
                                {item.quantity}
                              </div>
                            )}
                            {item.size && (
                              <div className="text-[#002E4D]">
                                <span className="font-medium">Size:</span> {item.size}
                              </div>
                            )}
                            {item.color && (
                              <div className="text-[#002E4D]">
                                <span className="font-medium">Color:</span> {item.color}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Pricing */}
                        <div className="text-right space-y-1 mt-3 sm:mt-0">
                          <div className="font-bold text-[#002E4D] text-lg">
                            LKR {Number(item.price || 0).toLocaleString()}
                          </div>
                          {item.shipping && (
                            <div className="text-[#004F74] text-sm">
                              + LKR {Number(item.shipping || 0).toLocaleString()} shipping
                            </div>
                          )}
                          <div className="text-[#002E4D] text-sm font-medium">
                            Total: LKR{" "}
                            {(
                              parseFloat(item.price || 0) + parseFloat(item.shipping || 0)
                            ).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Product Link */}
                      {item.link && (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mt-2"
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
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total */}
          <div className="border-t border-gray-200 pt-4">
            <div className="space-y-2 mb-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#004F74]">Subtotal</span>
                <span className="text-[#002E4D] font-medium">
                  LKR {Number(order.subtotal || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#004F74]">Shipping</span>
                <span className="text-[#002E4D] font-medium">
                  LKR {Number(order.shipping || 0).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-lg font-bold pt-2 border-t border-gray-200">
              <span className="text-[#002E4D]">Total Amount</span>
              <span className="text-2xl text-[#004F74] mt-3 sm:mt-0">
                LKR {Number(order.total || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-[#002E4D] text-white rounded-lg hover:bg-[#004F74] transition-colors duration-200 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    let unsubscribeOrders = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const q = query(
          collection(db, "orders"),
          where("userEmail", "==", currentUser.email),
          orderBy("timestamp", "desc")
        );

        unsubscribeOrders = onSnapshot(
          q,
          (snapshot) => {
            const ordersData = [];
            snapshot.forEach((doc) => {
              ordersData.push({ id: doc.id, ...doc.data() });
            });
            setOrders(ordersData);
            setLoading(false);
          },
          (error) => {
            console.error("Error fetching orders:", error);
            setOrders([]);
            setLoading(false);
          }
        );
      } else {
        setOrders([]);
        setLoading(false);
      }
    });

    return () => {
      if (unsubscribeOrders) unsubscribeOrders();
      unsubscribeAuth();
    };
  }, []);

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Remove duplicate orders
  const uniqueOrders = [];
  const seenOrderIds = new Set();
  for (const order of orders) {
    if (!seenOrderIds.has(order.orderId)) {
      uniqueOrders.push(order);
      seenOrderIds.add(order.orderId);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#CEE2FF] via-white to-[#E8F2FF] text-[#002E4D] relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#002E4D]/5 via-transparent to-[#81BBDF]/10"></div>
      <div className="absolute top-0 left-0 w-56 h-56 md:w-72 md:h-72 bg-[#002E4D]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-72 h-72 md:w-96 md:h-96 bg-[#81BBDF]/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

      {/* Animated Floating Elements */}
      <div className="absolute top-16 right-12 w-5 h-5 bg-[#002E4D]/20 rounded-full animate-float hidden sm:block"></div>
      <div className="absolute top-36 left-36 w-4 h-4 bg-[#81BBDF]/30 rounded-full animate-float delay-1000 hidden md:block"></div>
      <div className="absolute bottom-60 left-20 w-3 h-3 bg-[#004F74]/20 rounded-full animate-float delay-500 hidden md:block"></div>

      <div className="relative z-10 p-4 md:p-6 flex flex-col min-h-screen">
        <div className="max-w-6xl mx-auto flex-grow w-full">
          {/* Premium Header */}
          <header className="text-center mb-6 md:mb-8 py-8 md:py-12">
            <h1 className="text-3xl md:text-5xl font-bold tracking-wider uppercase pb-2">
              <span className="bg-[#002E4D] text-white px-2 py-1 mr-1">S</span>
              UPUN
              <span className="font-light ml-1">EXPRESS</span>
            </h1>
            <p className="text-[#004F74] max-w-xl mx-auto text-base md:text-lg font-medium">
              Love It, Shop It - Globally
            </p>
          </header>

          {/* Main Content */}
          <div className="relative">
            {/* Card Glow Effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-[#002E4D] to-[#81BBDF] rounded-3xl blur-xl opacity-10"></div>

            <div className="relative bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl p-4 md:p-8 shadow-2xl">
              {/* Card Header */}
              <div className="text-center mb-6 md:mb-8">
                <div className="inline-flex items-center gap-3 text-[#002E4D] px-4 py-2 rounded-sm shadow-lg">
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
                      d="M21 8l-9-4-9 4m18 0l-9 4m9-4v8l-9 4m0-12l-9 4m0 0v8l9 4m0-12v8"
                    />
                  </svg>

                  <span className="font-semibold text-lg md:text-2xl">MY ORDERS</span>
                </div>
              </div>

              {/* Stats */}
              {uniqueOrders.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 md:mb-8">
                  <div className="bg-gradient-to-r from-[#CEE2FF] to-[#E8F2FF] rounded-xl border border-[#81BBDF]/30 p-4 text-center">
                    <div className="text-2xl md:text-3xl font-bold text-[#002E4D]">
                      {uniqueOrders.length}
                    </div>
                    <div className="text-[#004F74] text-sm font-medium">Total Orders</div>
                  </div>
                  <div className="bg-gradient-to-r from-[#CEE2FF] to-[#E8F2FF] rounded-xl border border-[#81BBDF]/30 p-4 text-center">
                    <div className="text-2xl md:text-3xl font-bold text-green-600">
                      {
                        uniqueOrders.filter(
                          (o) => o.status?.toLowerCase() === "delivered"
                        ).length
                      }
                    </div>
                    <div className="text-[#004F74] text-sm font-medium">Delivered</div>
                  </div>
                  <div className="bg-gradient-to-r from-[#CEE2FF] to-[#E8F2FF] rounded-xl border border-[#81BBDF]/30 p-4 text-center">
                    <div className="text-2xl md:text-3xl font-bold text-blue-600">
                      {
                        uniqueOrders.filter((o) =>
                          ["packing", "order placed", "shipped"].includes(
                            o.status?.toLowerCase()
                          )
                        ).length
                      }
                    </div>
                    <div className="text-[#004F74] text-sm font-medium">In Progress</div>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <OrderSkeleton key={i} />
                  ))}
                </div>
              )}

              {/* Empty State */}
              {!loading && uniqueOrders.length === 0 && (
                <div className="text-center py-8 md:py-12">
                  <svg
                    className="w-12 h-12 md:w-16 md:h-16 text-[#81BBDF] mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  <h3 className="text-xl md:text-2xl font-bold text-[#002E4D] mb-3">No Orders Yet</h3>
                  <p className="text-[#004F74] mb-6 max-w-md mx-auto text-sm md:text-base">
                    Ready to start your shopping journey? Your first order is just a click away!
                  </p>
                  <Link
                    to="/"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-[#002E4D] to-[#004F74] text-white px-4 py-2 md:px-6 md:py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
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
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                    Explore Products
                  </Link>
                </div>
              )}

              {/* Orders List */}
              {!loading && uniqueOrders.length > 0 && (
                <div className="space-y-4 md:space-y-6">
                  {uniqueOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      onClick={() => handleOrderClick(order)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Premium Footer */}
        <footer className="text-center py-6 md:py-8 text-[#004F74] text-sm mt-10 md:mt-16 relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 md:w-48 h-px bg-gradient-to-r from-transparent via-[#81BBDF] to-transparent"></div>
          <div className="max-w-6xl mx-auto">
            <p className="mb-2 font-medium">SUPUN EXPRESS &copy; {new Date().getFullYear()}</p>
            <p className="text-xs md:text-sm text-[#81BBDF]">Elevating Global Commerce Through Premium Service</p>
          </div>
        </footer>
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={closeModal}
      />

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
};

export default Orders;