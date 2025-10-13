import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { Link } from "react-router-dom";

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwP8n4qp477Tk5vM3PeFpgfEzNMVC1b7nmrR4SI0J2XT4vTK1EDPzZpED89rz49w8tk/exec"; // Same as admin

function Invoice() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    const fetchCards = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `${APPS_SCRIPT_URL}?type=productCards&email=${encodeURIComponent(user.email)}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.status === "success") {
          setCards(data.productCards);
        } else {
          setError(data.message || "Unknown error");
        }
      } catch (err) {
        setError("Failed to fetch product cards.");
      }
      setLoading(false);
    };
    fetchCards();
  }, [auth.currentUser]);

  const linkClasses = (path) => {
    return window.location.pathname === path
      ? "text-blue-600 font-semibold"
      : "text-gray-700";
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Invoices</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && cards.length === 0 && <p>No products pushed by admin yet.</p>}
      <div className="space-y-6">
        {cards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow p-6 border border-gray-100">
            <div className="flex items-center gap-4">
              {card.imageUrl && <img src={card.imageUrl} alt={card.productName} className="w-24 h-24 object-cover rounded" />}
              <div>
                <h2 className="font-bold text-lg">{card.productName}</h2>
                <p className="text-gray-600">{card.details}</p>
                <div className="mt-2 text-sm">
                  <span className="font-semibold">Price:</span> {card.price} <br />
                  <span className="font-semibold">Shipping:</span> {card.shipping}
                </div>
                <a href={card.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline mt-2 inline-block">View Product</a>
                <button
                  onClick={() => {
                    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
                    // Prevent duplicate by checking unique productName + price + userEmail
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
                    localStorage.setItem("cart", JSON.stringify(cart));
                    alert("Added to cart!");
                  }}
                  className="ml-4 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-xs mt-2"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <ul className="mt-8">
        <li>
          <Link to="/invoice" className={linkClasses("/invoice")}>
            <span className="mr-2">🧾</span> Invoice
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default Invoice;