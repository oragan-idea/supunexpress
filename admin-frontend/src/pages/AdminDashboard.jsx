import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxmfLp1SL0I-AgAkUhU0yfItYQOGzNyd8FoqzbCWzZDADq9OUB02TVV7DOnOM15CBzN/exec"; // Replace with your Apps Script web app URL

const AdminDashboard = () => {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (localStorage.getItem("adminLoggedIn") !== "true") {
      window.location.href = "/";
      return;
    }
    const fetchLinks = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(APPS_SCRIPT_URL);
        const data = await response.json();
        if (data.status === "success") {
          setLinks(data.links);
        } else {
          setLinks([]);
          setError(data.message || "Unknown error");
        }
      } catch (err) {
        setError("Failed to fetch links: " + err.message);
      }
      setLoading(false);
    };
    fetchLinks();
  }, []);

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
            {links
              .filter((row) => row && (row.name || row.links))
              .map((row, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow p-6 border border-gray-100">
                  <div className="font-bold text-lg text-blue-800 mb-1 flex items-center">
                    <span>{row.name || "No Name"}</span>
                    {row.email && (
                      <span className="ml-2 text-sm text-gray-500 font-normal">({row.email})</span>
                    )}
                  </div>
                  <div className="mt-2 space-y-2">
                    {row.links && Array.isArray(row.links) && row.links.length > 0 ? (
                      row.links.map((link, i) => {
                        const isUrl = /^(https?:\/\/|www\.)/i.test(link.trim());
                        // Truncate long URLs for display, show full URL on hover
                        const displayText = link.length > 60 ? link.slice(0, 55) + '...' : link;
                        return (
                          <div
                            key={i}
                            className="flex items-center gap-2 group bg-blue-50/50 hover:bg-blue-100 rounded px-2 py-1 transition border-l-4 border-blue-300 shadow-sm"
                          >
                            <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 010 5.656l-1.414 1.414a4 4 0 01-5.656-5.656l2.121-2.121a4 4 0 015.656 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10.172 13.828a4 4 0 010-5.656l1.414-1.414a4 4 0 015.656 5.656l-2.121 2.121a4 4 0 01-5.656 0z" />
                            </svg>
                            {isUrl ? (
                              <a
                                href={link.startsWith('http') ? link : `https://${link}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-700 underline hover:text-blue-900 transition font-mono truncate max-w-[400px]"
                                title={link}
                              >
                                {displayText}
                              </a>
                            ) : (
                              <span className="font-mono text-gray-700 truncate max-w-[400px]" title={link}>{displayText}</span>
                            )}
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
      </div>
    </div>
  );
};

export default AdminDashboard;
