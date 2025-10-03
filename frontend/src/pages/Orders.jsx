import React, { useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

const Orders = () => {
  const [user, setUser] = useState(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Example data (replace with backend later)
  const orders = [
    { id: 1, product: "Wireless Earbuds", status: "Delivered", date: "2025-09-01" },
    { id: 2, product: "Smart Watch", status: "Pending", date: "2025-09-01" },
    { id: 3, product: "Phone Case", status: "Delivered", date: "2025-08-30" },
    { id: 4, product: "Laptop Stand", status: "Pending", date: "2025-08-29" },
  ];

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === "Pending").length;
  const deliveredOrders = orders.filter(o => o.status === "Delivered").length;

  return (
    <div className="min-h-screen bg-white text-black p-4 sm:p-6 md:p-8 flex flex-col font-sans">
      <div className="max-w-6xl mx-auto w-full">
        {/* Title */}
        <header className="text-center py-6 md:py-10 mb-8 md:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight uppercase relative inline-block">
            Order Dashboard
            <span className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 md:w-20 h-0.5 bg-black"></span>
          </h1>
          <p className="text-neutral-500 mt-3 md:mt-5 text-xs sm:text-sm tracking-wider">
            Minimal. Modern. Luxurious.
          </p>

          {/* 👇 Greeting the user */}
          {user && (
            <p className="mt-4 md:mt-6 text-base md:text-lg font-medium text-black">
              Welcome {" "}
              <span className="font-bold">
                {user.displayName || user.email}
              </span>
            </p>
          )}
        </header>

        {/* Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 mb-10 md:mb-16">
          {/* Total Orders Tile */}
          <div className="bg-white border border-neutral-300 rounded-lg md:rounded-xl p-4 md:p-6 text-center shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
            <div className="w-10 h-10 md:w-14 md:h-14 bg-black rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="text-xs md:text-sm uppercase text-neutral-500 tracking-wider mb-1 md:mb-2">Total Orders</h2>
            <p className="text-2xl md:text-3xl lg:text-4xl font-bold">{totalOrders}</p>
          </div>
          
          {/* Pending Orders Tile */}
          <div className="bg-white border border-neutral-300 rounded-lg md:rounded-xl p-4 md:p-6 text-center shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
            <div className="w-10 h-10 md:w-14 md:h-14 bg-white border-2 border-black rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xs md:text-sm uppercase text-neutral-500 tracking-wider mb-1 md:mb-2">Pending</h2>
            <p className="text-2xl md:text-3xl lg:text-4xl font-bold">{pendingOrders}</p>
          </div>
          
          {/* Delivered Orders Tile */}
          <div className="bg-white border border-neutral-300 rounded-lg md:rounded-xl p-4 md:p-6 text-center shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group">
            <div className="w-10 h-10 md:w-14 md:h-14 bg-black rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xs md:text-sm uppercase text-neutral-500 tracking-wider mb-1 md:mb-2">Delivered</h2>
            <p className="text-2xl md:text-3xl lg:text-4xl font-bold">{deliveredOrders}</p>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white border border-neutral-300 rounded-lg md:rounded-xl p-4 md:p-6 lg:p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 md:mb-8 pb-3 md:pb-4 border-b border-neutral-200">
            <h2 className="text-xl md:text-2xl font-semibold flex items-center mb-2 sm:mb-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Recent Orders
            </h2>
            <button className="text-xs md:text-sm font-medium border border-black px-3 py-1.5 md:px-4 md:py-2 rounded-lg hover:bg-black hover:text-white transition-all duration-300 self-start sm:self-auto">
              View All
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-neutral-500 text-xs uppercase tracking-wide border-b border-neutral-200">
                  <th className="py-2 md:py-3 px-2 md:px-4 font-medium">Order ID</th>
                  <th className="py-2 md:py-3 px-2 md:px-4 font-medium">Product</th>
                  <th className="py-2 md:py-3 px-2 md:px-4 font-medium hidden sm:table-cell">Date</th>
                  <th className="py-2 md:py-3 px-2 md:px-4 font-medium text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr
                    key={order.id}
                    className="border-b border-neutral-200 hover:bg-neutral-50 transition-all duration-200 group"
                  >
                    <td className="py-3 md:py-4 px-2 md:px-4 font-medium group-hover:pl-3 md:group-hover:pl-6 transition-all">#{order.id}</td>
                    <td className="py-3 md:py-4 px-2 md:px-4 text-sm md:text-base">{order.product}</td>
                    <td className="py-3 md:py-4 px-2 md:px-4 text-neutral-500 hidden sm:table-cell">{order.date}</td>
                    <td className="py-3 md:py-4 px-2 md:px-4 text-center">
                      {order.status === "Delivered" ? (
                        <span className="px-2 py-1 md:px-3 md:py-1.5 text-xs rounded-full bg-black text-white font-medium inline-flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Delivered
                        </span>
                      ) : (
                        <span className="px-2 py-1 md:px-3 md:py-1.5 text-xs rounded-full border border-black text-black font-medium inline-flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="flex flex-col sm:flex-row justify-between items-center pt-6 md:pt-8 mt-6 md:mt-8 border-t border-neutral-200">
            <div className="text-xs md:text-sm text-neutral-500 mb-3 sm:mb-0">
              Showing {orders.length} of {orders.length} orders
            </div>
            <div className="flex space-x-2">
              <button className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center border border-neutral-300 rounded-lg hover:bg-black hover:text-white transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-black text-white rounded-lg text-sm md:text-base">1</button>
              <button className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center border border-neutral-300 rounded-lg hover:bg-black hover:text-white transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;