// Orders.js
import React, { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const statusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "delivered":
      return "#22c55e";
    case "packing":
      return "#eab308";
    case "order placed":
      return "#3b82f6";
    case "pending":
      return "#f97316";
    default:
      return "#64748b";
  }
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        <span className="ml-4 text-blue-700 font-medium">Loading orders...</span>
      </div>
    );
  }

  const uniqueOrders = [];
  const seenOrderIds = new Set();
  for (const order of orders) {
    if (!seenOrderIds.has(order.orderId)) {
      uniqueOrders.push(order);
      seenOrderIds.add(order.orderId);
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold mb-6 text-[#002E4D]">Your Orders</h2>
      {uniqueOrders.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          <svg className="mx-auto mb-4 w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <div className="text-lg font-semibold mb-2">No orders found.</div>
          <div className="text-sm">You haven't placed any orders yet.</div>
        </div>
      ) : (
        <div className="space-y-6">
          {uniqueOrders.map(order => (
            <div key={order.id} className="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-semibold text-[#002E4D] text-lg">{order.userName || order.userEmail}</div>
                <div className="text-sm text-gray-500 mb-2">{order.orderId}</div>
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Status: </span>
                  <span style={{ color: statusColor(order.status), fontWeight: 600 }}>
                    {order.status}
                  </span>
                </div>
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Payment: </span>
                  {order.paymentMethod?.toUpperCase() || "N/A"}
                </div>
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Date: </span>
                  {order.timestamp?.toDate
                    ? order.timestamp.toDate().toLocaleString()
                    : new Date(order.timestamp).toLocaleString()}
                </div>
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Items: </span>
                  {order.items?.length || 1}
                </div>
              </div>
              <div className="mt-4 md:mt-0 md:text-right">
                <div className="text-xl font-bold text-[#004F74]">LKR {order.total}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;