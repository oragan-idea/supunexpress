// Orders.js
import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";

const Orders = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async (userId) => {
    try {
      setLoading(true);
      const ordersRef = collection(db, "orders");
      const q = query(
        ordersRef,
        where("userId", "==", userId),
        orderBy("timestamp", "desc")
      );
      
      const querySnapshot = await getDocs(q);
      const ordersData = [];
      
      querySnapshot.forEach((doc) => {
        ordersData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setOrders(ordersData);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchOrders(currentUser.uid);
      } else {
        setOrders([]);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => 
    o.status === "pending" || o.status === "processing" || o.status === "confirmed"
  ).length;
  const deliveredOrders = orders.filter(o => o.status === "delivered").length;
  const totalSpent = orders.reduce((sum, order) => sum + parseFloat(order.total || 0), 0).toFixed(2);

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered': 
      case 'paid': 
        return 'bg-green-100 text-green-800 border-green-200';
      case 'shipped': 
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing':
      case 'confirmed': 
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending': 
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default: 
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid': return 'Paid';
      case 'confirmed': return 'Confirmed';
      case 'processing': return 'Processing';
      case 'shipped': return 'Shipped';
      case 'delivered': return 'Delivered';
      case 'pending': return 'Pending';
      default: return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
      case 'paid':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'shipped':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case 'processing':
      case 'confirmed':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#CEE2FF] via-white to-[#E8F2FF] text-[#002E4D] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#002E4D] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#004F74]">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#CEE2FF] via-white to-[#E8F2FF] text-[#002E4D] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#002E4D]/5 via-transparent to-[#81BBDF]/10"></div>
      <div className="absolute top-0 left-0 w-72 h-72 bg-[#002E4D]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#81BBDF]/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
      
      <div className="absolute top-20 right-20 w-6 h-6 bg-[#002E4D]/20 rounded-full animate-float"></div>
      <div className="absolute top-40 left-40 w-4 h-4 bg-[#81BBDF]/30 rounded-full animate-float delay-1000"></div>
      <div className="absolute bottom-60 left-20 w-3 h-3 bg-[#004F74]/20 rounded-full animate-float delay-500"></div>

      <div className="relative z-10 p-6 flex flex-col min-h-screen">
        <div className="max-w-7xl mx-auto flex-grow w-full">
          <header className="text-center mb-8 py-12">
            <div className="relative inline-block mb-4">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#002E4D] to-[#004F74] rounded-2xl blur-lg opacity-10"></div>
              <h1 className="text-5xl font-bold tracking-wider uppercase relative">
                <span className="bg-[#002E4D] text-white px-2 py-1 mr-1">S</span>UPUN
                <span className="font-light ml-1">EXPRESS</span>
              </h1>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-px bg-gradient-to-r from-transparent via-[#81BBDF] to-transparent"></div>
              </div>
            </div>

            {user && (
              <p className="mt-6 text-base md:text-lg font-medium text-[#002E4D]">
                Hello,{" "}
                <span className="font-bold">
                  {user.displayName || user.email}
                </span>
              </p>
            )}
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#002E4D] to-[#81BBDF] rounded-2xl blur opacity-10"></div>
              <div className="relative bg-white/90 backdrop-blur-xl border border-white/20 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#004F74] uppercase tracking-wide">Total Orders</p>
                    <p className="text-3xl font-bold text-[#002E4D] mt-2">{totalOrders}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-[#002E4D] to-[#004F74] rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#002E4D] to-[#81BBDF] rounded-2xl blur opacity-10"></div>
              <div className="relative bg-white/90 backdrop-blur-xl border border-white/20 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#004F74] uppercase tracking-wide">In Progress</p>
                    <p className="text-3xl font-bold text-[#002E4D] mt-2">{pendingOrders}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#002E4D] to-[#81BBDF] rounded-2xl blur opacity-10"></div>
              <div className="relative bg-white/90 backdrop-blur-xl border border-white/20 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#004F74] uppercase tracking-wide">Delivered</p>
                    <p className="text-3xl font-bold text-[#002E4D] mt-2">{deliveredOrders}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#002E4D] to-[#81BBDF] rounded-2xl blur opacity-10"></div>
              <div className="relative bg-white/90 backdrop-blur-xl border border-white/20 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#004F74] uppercase tracking-wide">Total Spent</p>
                    <p className="text-3xl font-bold text-[#002E4D] mt-2">LKR {totalSpent}</p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-[#002E4D] to-[#81BBDF] rounded-3xl blur-xl opacity-10"></div>
            
            <div className="relative bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 pb-6 border-b border-[#81BBDF]/30">
                <div>
                  <h2 className="text-2xl font-bold text-[#002E4D] flex items-center gap-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Recent Orders
                  </h2>
                  <p className="text-[#004F74] mt-2">Track and manage your recent purchases</p>
                </div>
              </div>
              
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gradient-to-br from-[#CEE2FF] to-[#E8F2FF] rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-lg">
                    <svg className="w-12 h-12 text-[#81BBDF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-[#002E4D] mb-3">No Orders Yet</h3>
                  <p className="text-[#004F74] mb-8 max-w-md mx-auto">
                    You haven't placed any orders yet. Start shopping to see your orders here!
                  </p>
                  <a
                    href="/"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-[#002E4D] to-[#004F74] text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Start Shopping
                  </a>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#81BBDF]/30">
                          <th className="py-4 px-4 text-left text-sm font-semibold text-[#002E4D] uppercase tracking-wide">Order Details</th>
                          <th className="py-4 px-4 text-left text-sm font-semibold text-[#002E4D] uppercase tracking-wide hidden lg:table-cell">Date</th>
                          <th className="py-4 px-4 text-left text-sm font-semibold text-[#002E4D] uppercase tracking-wide">Amount</th>
                          <th className="py-4 px-4 text-left text-sm font-semibold text-[#002E4D] uppercase tracking-wide">Status</th>
                          <th className="py-4 px-4 text-left text-sm font-semibold text-[#002E4D] uppercase tracking-wide">Payment</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#81BBDF]/20">
                        {orders.map((order) => (
                          <tr key={order.id} className="group hover:bg-[#CEE2FF]/20 transition-all duration-200">
                            <td className="py-4 px-4">
                              <div>
                                <div className="font-semibold text-[#002E4D]">#{order.orderId}</div>
                                <div className="text-[#004F74] text-sm mt-1">
                                  {order.items?.length || 0} item(s)
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {order.items?.[0]?.productName}
                                  {order.items && order.items.length > 1 && ` +${order.items.length - 1} more`}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-[#004F74] hidden lg:table-cell">
                              {formatDate(order.timestamp)}
                            </td>
                            <td className="py-4 px-4">
                              <div className="font-semibold text-[#002E4D]">LKR {order.total}</div>
                            </td>
                            <td className="py-4 px-4">
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                                {getStatusIcon(order.status)}
                                {getStatusText(order.status)}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-sm text-[#004F74] capitalize">
                                {order.paymentMethod === "cod" ? "Cash on Delivery" : "PayHere"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <footer className="text-center py-8 text-[#004F74] text-sm mt-16 relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-[#81BBDF] to-transparent"></div>
          <div className="max-w-7xl mx-auto">
            <p className="mb-2 font-medium">SUPUN EXPRESS &copy; {new Date().getFullYear()}</p>
            <p className="text-xs text-[#81BBDF]">Tracking your global purchases with excellence</p>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Orders;