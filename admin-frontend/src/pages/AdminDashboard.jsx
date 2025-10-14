import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

const PROXY_URL = "http://localhost:3001/api/script";

const AdminDashboard = () => {
  const [links, setLinks] = useState([]);
  const [sentInvoices, setSentInvoices] = useState([]);
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
  const [activeTab, setActiveTab] = useState("pending"); // "pending" or "sent"

  // Fetch links and sent invoices on load
  useEffect(() => {
    if (localStorage.getItem("adminLoggedIn") !== "true") {
      window.location.href = "/";
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(PROXY_URL);
        const data = await response.json();
        if (data.status === "success" && Array.isArray(data.links)) {
          setLinks([...data.links].reverse());
          // Load sent invoices from localStorage
          const savedInvoices = localStorage.getItem('sentInvoices');
          if (savedInvoices) {
            setSentInvoices(JSON.parse(savedInvoices));
          }
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

    fetchData();
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

  // Submit product card and move to sent invoices
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
        ...productForm,
        createdAt: new Date().toISOString(),
        invoiceId: `INV-${Date.now()}`
      };
      
      const response = await fetch(PROXY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (data.status === "success") {
        // Create invoice object
        const invoice = {
          id: payload.invoiceId,
          userName: modalUser.name,
          userEmail: modalUser.email,
          productName: productForm.productName,
          price: productForm.price,
          shipping: productForm.shipping,
          total: (parseFloat(productForm.price) + parseFloat(productForm.shipping || 0)).toFixed(2),
          link: modalLink,
          createdAt: payload.createdAt,
          status: "sent"
        };

        // Add to sent invoices
        const updatedInvoices = [...sentInvoices, invoice];
        setSentInvoices(updatedInvoices);
        localStorage.setItem('sentInvoices', JSON.stringify(updatedInvoices));

        // Remove the link from pending links
        setLinks(prevLinks => 
          prevLinks.map(user => ({
            ...user,
            links: user.links?.filter(link => link !== modalLink) || []
          })).filter(user => user.links?.length > 0)
        );

        setProductSuccess("Product card created and invoice sent to user!");
        setTimeout(() => setShowModal(false), 2000);
      } else {
        setProductError(data.message || "Failed to create product card.");
      }
    } catch (err) {
      setProductError("Failed to create product card: " + err.message);
    } finally {
      setProductLoading(false);
    }
  };

  // Clear all sent invoices
  const clearSentInvoices = () => {
    setSentInvoices([]);
    localStorage.removeItem('sentInvoices');
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="ml-64 flex-1 p-8 min-h-screen bg-gradient-to-b from-[#CEE2FF]/10 to-white">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-[#002E4D]">Admin Dashboard</h1>
            <p className="text-[#004F74]">Manage user submissions and create product cards</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-[#81BBDF] mb-6">
            <button
              className={`px-6 py-3 font-medium text-sm transition-all duration-300 border-b-2 ${
                activeTab === "pending"
                  ? "border-[#002E4D] text-[#002E4D]"
                  : "border-transparent text-[#004F74] hover:text-[#002E4D]"
              }`}
              onClick={() => setActiveTab("pending")}
            >
              Pending Links
              {links.reduce((total, row) => total + (row.links ? row.links.length : 0), 0) > 0 && (
                <span className="ml-2 bg-[#002E4D] text-white text-xs px-2 py-1 rounded-full">
                  {links.reduce((total, row) => total + (row.links ? row.links.length : 0), 0)}
                </span>
              )}
            </button>
            <button
              className={`px-6 py-3 font-medium text-sm transition-all duration-300 border-b-2 ${
                activeTab === "sent"
                  ? "border-[#002E4D] text-[#002E4D]"
                  : "border-transparent text-[#004F74] hover:text-[#002E4D]"
              }`}
              onClick={() => setActiveTab("sent")}
            >
              Sent Invoices
              {sentInvoices.length > 0 && (
                <span className="ml-2 bg-[#002E4D] text-white text-xs px-2 py-1 rounded-full">
                  {sentInvoices.length}
                </span>
              )}
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm border border-[#81BBDF] rounded-xl p-6 text-center shadow-sm">
              <div className="w-12 h-12 bg-[#002E4D] rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-sm uppercase text-[#004F74] tracking-wider mb-1">Pending Users</h3>
              <p className="text-2xl font-bold text-[#002E4D]">
                {links.length}
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm border border-[#81BBDF] rounded-xl p-6 text-center shadow-sm">
              <div className="w-12 h-12 bg-[#002E4D] rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 010 5.656l-5.656 5.656m5.656-5.656a4 4 0 010 5.656M6.343 6.343a4 4 0 000 5.656" />
                </svg>
              </div>
              <h3 className="text-sm uppercase text-[#004F74] tracking-wider mb-1">Pending Links</h3>
              <p className="text-2xl font-bold text-[#002E4D]">
                {links.reduce((total, row) => total + (row.links ? row.links.length : 0), 0)}
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm border border-[#81BBDF] rounded-xl p-6 text-center shadow-sm">
              <div className="w-12 h-12 bg-[#002E4D] rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-sm uppercase text-[#004F74] tracking-wider mb-1">Sent Invoices</h3>
              <p className="text-2xl font-bold text-[#002E4D]">{sentInvoices.length}</p>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-pulse text-[#004F74]">Loading submissions...</div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            </div>
          )}

          {/* Pending Links Tab */}
          {!loading && !error && activeTab === "pending" && (
            <div className="space-y-6">
              {links.length === 0 ? (
                <div className="bg-white/80 backdrop-blur-sm border border-[#81BBDF] rounded-xl p-8 text-center">
                  <svg className="w-12 h-12 text-[#81BBDF] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-[#002E4D] mb-2">No Pending Submissions</h3>
                  <p className="text-[#004F74]">All links have been processed and invoices sent.</p>
                </div>
              ) : (
                links.map((row, idx) => (
                  <div key={idx} className="bg-white/80 backdrop-blur-sm border border-[#81BBDF] rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                    {/* User Header */}
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#81BBDF]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#002E4D] text-white rounded-full flex items-center justify-center font-bold text-sm">
                          {row.name ? row.name[0].toUpperCase() : 'U'}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-[#002E4D]">
                            {row.name || "No Name"}
                          </h3>
                          {row.email && (
                            <p className="text-sm text-[#004F74]">{row.email}</p>
                          )}
                        </div>
                      </div>
                      {row.submittedAt && (
                        <span className="text-xs text-[#004F74] bg-[#CEE2FF]/50 px-2 py-1 rounded">
                          {new Date(row.submittedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {/* Links */}
                    <div className="space-y-2">
                      {row.links && Array.isArray(row.links) && row.links.length > 0 ? (
                        row.links.map((link, i) => {
                          const isUrl = /^(https?:\/\/|www\.)/i.test(link.trim());
                          const displayText = link.length > 60 ? link.slice(0, 55) + '...' : link;
                          return (
                            <div
                              key={i}
                              className="flex items-center gap-3 group bg-[#CEE2FF]/30 hover:bg-[#CEE2FF]/50 rounded-lg px-3 py-2 transition-all border-l-4 border-[#002E4D]"
                            >
                              <svg className="w-4 h-4 text-[#002E4D] flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 010 5.656l-1.414 1.414a4 4 0 01-5.656-5.656l2.121-2.121a4 4 0 015.656 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.172 13.828a4 4 0 010-5.656l1.414-1.414a4 4 0 015.656 5.656l-2.121 2.121a4 4 0 01-5.656 0z" />
                              </svg>
                              <div className="flex-1 min-w-0">
                                {isUrl ? (
                                  <a
                                    href={link.startsWith('http') ? link : `https://${link}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#002E4D] hover:text-[#001223] underline transition font-mono truncate block"
                                    title={link}
                                  >
                                    {displayText}
                                  </a>
                                ) : (
                                  <span className="font-mono text-[#002E4D] truncate block" title={link}>
                                    {displayText}
                                  </span>
                                )}
                              </div>
                              <button 
                                className="ml-2 px-3 py-1.5 bg-[#002E4D] text-white rounded-lg hover:bg-[#001223] text-xs font-medium transition-all duration-300 shadow-sm hover:shadow-md flex items-center gap-1 whitespace-nowrap"
                                onClick={() => openProductModal(link, { email: row.email, name: row.name })}
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Create Invoice
                              </button>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-[#004F74] text-sm bg-[#CEE2FF]/30 rounded-lg px-3 py-2">
                          No links submitted
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Sent Invoices Tab */}
          {!loading && !error && activeTab === "sent" && (
            <div className="space-y-6">
              {sentInvoices.length === 0 ? (
                <div className="bg-white/80 backdrop-blur-sm border border-[#81BBDF] rounded-xl p-8 text-center">
                  <svg className="w-12 h-12 text-[#81BBDF] mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-[#002E4D] mb-2">No Sent Invoices</h3>
                  <p className="text-[#004F74]">Invoices will appear here once you create product cards for users.</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-[#002E4D]">
                      Sent Invoices ({sentInvoices.length})
                    </h3>
                    <button
                      onClick={clearSentInvoices}
                      className="px-4 py-2 text-sm text-[#004F74] hover:text-red-600 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Clear All
                    </button>
                  </div>
                  {sentInvoices.map((invoice, idx) => (
                    <div key={invoice.id} className="bg-white/80 backdrop-blur-sm border border-[#81BBDF] rounded-xl p-6 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-[#002E4D]">{invoice.productName}</h3>
                            <p className="text-sm text-[#004F74]">To: {invoice.userName} ({invoice.userEmail})</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-[#002E4D]">{invoice.total} LKR</div>
                          <div className="text-xs text-[#004F74]">{new Date(invoice.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-[#004F74]">Product Price:</span>
                          <span className="ml-2 font-medium text-[#002E4D]">{invoice.price} LKR</span>
                        </div>
                        <div>
                          <span className="text-[#004F74]">Shipping:</span>
                          <span className="ml-2 font-medium text-[#002E4D]">{invoice.shipping} LKR</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-[#81BBDF]">
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Invoice Sent</span>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {/* Product Creation Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="bg-white/90 backdrop-blur-sm border border-[#81BBDF] rounded-xl shadow-xl p-6 w-full max-w-md relative">
                <button 
                  className="absolute top-4 right-4 text-[#004F74] hover:text-[#002E4D] transition-colors"
                  onClick={() => setShowModal(false)}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                <h2 className="text-xl font-bold mb-2 text-[#002E4D]">Create Product Invoice</h2>
                <p className="text-[#004F74] text-sm mb-4">For: {modalUser.name} ({modalUser.email})</p>
                
                <form onSubmit={handleProductSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#002E4D] mb-1">Product Name</label>
                    <input 
                      className="w-full border border-[#81BBDF] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#002E4D] focus:border-transparent transition-all"
                      value={productForm.productName} 
                      onChange={e => setProductForm(f => ({ ...f, productName: e.target.value }))} 
                      required 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#002E4D] mb-1">Price (LKR)</label>
                      <input 
                        type="number"
                        step="0.01"
                        className="w-full border border-[#81BBDF] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#002E4D] focus:border-transparent transition-all"
                        value={productForm.price} 
                        onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))} 
                        required 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#002E4D] mb-1">Shipping (LKR)</label>
                      <input 
                        type="number"
                        step="0.01"
                        className="w-full border border-[#81BBDF] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#002E4D] focus:border-transparent transition-all"
                        value={productForm.shipping} 
                        onChange={e => setProductForm(f => ({ ...f, shipping: e.target.value }))} 
                        required 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#002E4D] mb-1">Product Details</label>
                    <textarea 
                      className="w-full border border-[#81BBDF] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#002E4D] focus:border-transparent transition-all"
                      rows="3"
                      value={productForm.details} 
                      onChange={e => setProductForm(f => ({ ...f, details: e.target.value }))} 
                      required 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#002E4D] mb-1">Image URL</label>
                    <input 
                      className="w-full border border-[#81BBDF] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#002E4D] focus:border-transparent transition-all"
                      value={productForm.imageUrl} 
                      onChange={e => setProductForm(f => ({ ...f, imageUrl: e.target.value }))} 
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    className="w-full bg-[#002E4D] text-white py-3 rounded-lg hover:bg-[#001223] transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 font-medium"
                    disabled={productLoading}
                  >
                    {productLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating Invoice...
                      </div>
                    ) : (
                      "Send Invoice to User"
                    )}
                  </button>
                  
                  {productError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                      {productError}
                    </div>
                  )}
                  {productSuccess && (
                    <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
                      {productSuccess}
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;