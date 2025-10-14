import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

const PROXY_URL = "http://localhost:3001/api/script"; // Node proxy to Apps Script

const AdminDashboard = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalLink, setModalLink] = useState("");
  const [modalUser, setModalUser] = useState({});
  const [productForm, setProductForm] = useState({
    productName: "",
    price: "",
    shipping: "",
    details: "",
    imageUrl: ""
  });
  const [productLoading, setProductLoading] = useState(false);
  const [productError, setProductError] = useState(null);
  const [productSuccess, setProductSuccess] = useState(null);

  // Fetch links on load
  useEffect(() => {
    if (localStorage.getItem("adminLoggedIn") !== "true") {
      window.location.href = "/";
      return;
    }

    const fetchLinks = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(PROXY_URL);
        const data = await response.json();
        if (data.status === "success" && Array.isArray(data.links)) {
          setLinks(data.links);
        } else {
          setLinks([]);
          setError(data.message || "Unknown error or invalid data");
        }
      } catch (err) {
        setError("Failed to fetch links: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
  }, []);

  // Open modal for product card creation
  const openProductModal = (link, user) => {
    setModalLink(link);
    setModalUser(user);
    setProductForm({ productName: "", price: "", shipping: "", details: "", imageUrl: "" });
    setProductError(null);
    setProductSuccess(null);
    setShowModal(true);
  };

  // Submit product card
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setProductLoading(true);
    setProductError(null);
    setProductSuccess(null);
    try {
      const payload = {
        type: "productCard",
        userEmail: modalUser.email,
        userName: modalUser.name,
        link: modalLink,
        ...productForm
      };
      const response = await fetch(PROXY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (data.status === "success") {
        setProductSuccess("Product card created and pushed to user!");
        setShowModal(false);
      } else {
        setProductError(data.message || "Failed to create product card.");
      }
    } catch (err) {
      setProductError("Failed to create product card: " + err.message);
    } finally {
      setProductLoading(false);
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div className="p-8 ml-64 w-full">
        <h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
        <p className="mb-6 text-gray-600">All submitted links from Google Sheets:</p>

        {loading && <p className="text-lg text-gray-500">Loading...</p>}
        {error && <p className="text-red-600 font-semibold">{error}</p>}

        {!loading && !error && (
          <div className="space-y-6">
            {links.length === 0 && <div className="text-gray-500">No links found.</div>}
            {links.map((row, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow p-6 border border-gray-100">
                <div className="font-bold text-lg text-blue-800 mb-1 flex items-center">
                  <span>{row.name || "No Name"}</span>
                  {row.email && <span className="ml-2 text-sm text-gray-500 font-normal">({row.email})</span>}
                </div>
                <div className="mt-2 space-y-2">
                  {row.links && Array.isArray(row.links) && row.links.length > 0 ? (
                    row.links.map((link, i) => {
                      const isUrl = /^(https?:\/\/|www\.)/i.test(link.trim());
                      const displayText = link.length > 60 ? link.slice(0, 55) + "..." : link;
                      return (
                        <div key={i} className="flex items-center gap-2 group bg-blue-50/50 hover:bg-blue-100 rounded px-2 py-1 transition border-l-4 border-blue-300 shadow-sm">
                          <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 010 5.656l-1.414 1.414a4 4 0 01-5.656-5.656l2.121-2.121a4 4 0 015.656 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.172 13.828a4 4 0 010-5.656l1.414-1.414a4 4 0 015.656 5.656l-2.121 2.121a4 4 0 01-5.656 0z" />
                          </svg>
                          {isUrl ? (
                            <a href={link.startsWith("http") ? link : `https://${link}`} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline hover:text-blue-900 transition font-mono truncate max-w-[400px]" title={link}>
                              {displayText}
                            </a>
                          ) : (
                            <span className="font-mono text-gray-700 truncate max-w-[400px]" title={link}>{displayText}</span>
                          )}
                          <button className="ml-2 px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs" onClick={() => openProductModal(link, { email: row.email, name: row.name })}>
                            Create Product Card
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-gray-400 text-sm">No links submitted.</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg relative">
              <button className="absolute top-2 right-2 text-gray-400 hover:text-black" onClick={() => setShowModal(false)}>✕</button>
              <h2 className="text-xl font-bold mb-4">Create Product Card</h2>
              <form onSubmit={handleProductSubmit} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium">Product Name</label>
                  <input className="w-full border rounded p-2" value={productForm.productName} onChange={e => setProductForm(f => ({ ...f, productName: e.target.value }))} required />
                </div>
                <div>
                  <label className="block text-sm font-medium">Price</label>
                  <input className="w-full border rounded p-2" value={productForm.price} onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))} required />
                </div>
                <div>
                  <label className="block text-sm font-medium">Shipping Cost</label>
                  <input className="w-full border rounded p-2" value={productForm.shipping} onChange={e => setProductForm(f => ({ ...f, shipping: e.target.value }))} required />
                </div>
                <div>
                  <label className="block text-sm font-medium">Product Details</label>
                  <textarea className="w-full border rounded p-2" value={productForm.details} onChange={e => setProductForm(f => ({ ...f, details: e.target.value }))} required />
                </div>
                <div>
                  <label className="block text-sm font-medium">Image URL</label>
                  <input className="w-full border rounded p-2" value={productForm.imageUrl} onChange={e => setProductForm(f => ({ ...f, imageUrl: e.target.value }))} />
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700" disabled={productLoading}>
                  {productLoading ? "Saving..." : "Save & Push to User"}
                </button>
                {productError && <div className="text-red-600">{productError}</div>}
                {productSuccess && <div className="text-green-600">{productSuccess}</div>}
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
