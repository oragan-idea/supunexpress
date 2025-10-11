import React, { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";

const AdminDashboard = () => {
  const [userLinks, setUserLinks] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const adminEmail = "admin@admin.com";

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (!user || user.email !== adminEmail) {
        navigate("/", { replace: true });
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchLinks = async () => {
      setLoading(true);
      setError(null);
      try {
        const db = getFirestore();
        const querySnapshot = await getDocs(collection(db, "links"));
        // Group links by user (email)
        const grouped = {};
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const email = data.email || "Unknown";
          if (!grouped[email]) grouped[email] = [];
          grouped[email].push({ ...data, id: doc.id });
        });
        setUserLinks(grouped);
      } catch (err) {
        setError("Failed to fetch links: " + err.message);
      }
      setLoading(false);
    };
    fetchLinks();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-4">Admin Dashboard</h1>
      <p className="mb-6">All submitted links grouped by user:</p>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && (
        <div className="space-y-8">
          {Object.keys(userLinks).length === 0 && <p>No links submitted yet.</p>}
          {Object.entries(userLinks).map(([email, links]) => (
            <div key={email} className="border rounded-lg p-4 bg-neutral-50">
              <h2 className="text-xl font-semibold mb-2">{email}</h2>
              <ul className="list-disc ml-6">
                {links.map((link, idx) => (
                  <li key={link.id || idx} className="mb-1">
                    <span className="font-mono text-blue-700">{Array.isArray(link.links) ? link.links.join(", ") : link.links}</span>
                    <span className="ml-2 text-xs text-neutral-500">({link.submittedAt ? new Date(link.submittedAt).toLocaleString() : "No date"})</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
