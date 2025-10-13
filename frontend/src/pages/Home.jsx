import React, { useState } from "react";
import { getAuth } from "firebase/auth"; // ✅ Import Firebase Auth

function App() {
  const [linkInput, setLinkInput] = useState("");
  const [linksList, setLinksList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbzClWA2P4jt0pSNUe3uZKWFm7dj8YBsSt3-ljAQmwZiwnHvHr66puQGOE1rcydBdm2O/exec";

  const auth = getAuth(); // ✅ Initialize auth

  const sendEmail = async (data) => {
    const EMAIL_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwuDoDnhStp86-yOS58q9XsiJ41KeoH3CqMfZSPhO2m-XK19unPMXC9w_8DZbImfaFz/exec";

    try {
      await fetch(EMAIL_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        mode: 'no-cors', 
      });

      
      return { status: 'success' };
    } catch (err) {
      console.error('Email send error:', err);
      throw new Error('Failed to send email');
    }
  };

  // Add link
  const handleAddLink = () => {
    const trimmed = linkInput.trim();
    if (!trimmed) return setError("Please enter a valid link");
    if (linksList.includes(trimmed))
      return setError("This link has already been added");
    setLinksList([...linksList, trimmed]);
    setLinkInput("");
    setError(null);
    setSuccess(null);
  };

  // Remove link
  const handleRemoveLink = (index) =>
    setLinksList(linksList.filter((_, i) => i !== index));

  // Clear all
  const handleClearAll = () => {
    setLinksList([]);
    setError(null);
    setSuccess(null);
  };

  // Submit links to Google Sheets and send email
  const handleSubmitLinks = async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("⚠️ Please login before submitting links");
      return;
    }

    if (!linksList.length) return setError("Please add at least one link");
    setLoading(true);
    setError(null);
    setSuccess(null);

    const payload = {
      uid: user.uid,
      name: user.displayName || "No Name",
      email: user.email,
      links: linksList,
      submittedAt: new Date().toISOString(),
    };

    try {
      // Submit to Google Sheets ONLY
      await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Send email
      await sendEmail(payload);

      setSuccess("Links submitted and email sent successfully! ✅");
      setLinksList([]);
    } catch (err) {
      console.error(err);
      setError("❌ Failed to submit links or send email. Please try again.");
    }

    setLoading(false);
  };

  const handleKeyPress = (e) => e.key === "Enter" && handleAddLink();

  return (
    <div className="min-h-screen bg-white text-black p-6 flex flex-col">
      <div className="max-w-3xl mx-auto flex-grow w-full">
        {/* Header */}
        <header className="text-center py-12">
          <h1 className="text-5xl font-bold tracking-wider uppercase  pb-3">
            <span className="bg-black text-white px-2 py-1 mr-1">S</span>UPUN
            <span className="font-light ml-1">EXPRESS</span>
          </h1>
          <p className="text-neutral-600 max-w-xl mx-auto">
            worldwide products to ur home
          </p>
        </header>

        {/* Card */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 md:p-8 mb-8 shadow-lg">
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Paste AliExpress product link..."
              className="pl-4 w-full bg-neutral-100 border border-neutral-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black"
            />
            <button
              onClick={handleAddLink}
              className="bg-black hover:bg-neutral-800 text-white font-medium py-3 px-6 rounded-lg transition"
            >
              Add Link
            </button>
          </div>

          {/* Alerts */}
          {error && <p className="text-red-600 mt-2">{error}</p>}
          {success && <p className="text-green-600 mt-2">{success}</p>}

          {/* Links List */}
          {linksList.length > 0 && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  Added Products ({linksList.length})
                </h3>
                <button
                  onClick={handleClearAll}
                  className="text-sm text-neutral-500 hover:text-red-600 transition-colors"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {linksList.map((link, index) => (
                  <div
                    key={index}
                    className="bg-neutral-100 p-3 rounded-lg flex justify-between items-center"
                  >
                    <span className="truncate">{link}</span>
                    <button
                      onClick={() => handleRemoveLink(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmitLinks}
            disabled={loading || linksList.length === 0}
            className="mt-6 bg-black hover:bg-neutral-800 text-white font-medium py-3 px-8 rounded-lg w-full disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Links"}
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 py-16">
              <div className="text-center p-6 bg-white rounded-xl shadow-lg">
                <div className="w-12 h-12 bg-black rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl">🌍</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Global Sourcing</h3>
                <p className="text-gray-600">Access products from AliExpress, Amazon, and more worldwide markets</p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-xl shadow-lg">
                <div className="w-12 h-12 bg-black rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl">🚚</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
                <p className="text-gray-600">Optimized shipping routes for quicker delivery to your location</p>
              </div>
              
              <div className="text-center p-6 bg-white rounded-xl shadow-lg">
                <div className="w-12 h-12 bg-black rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-white text-2xl">🛡️</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Quality Assurance</h3>
                <p className="text-gray-600">We verify products and ensure quality before delivery</p>
              </div>
            </div>

            

      {/* Footer */}
      <footer className="text-center py-6 text-neutral-500 text-sm mt-auto border-t border-neutral-200">
        <p>SUPUN EXPRESS &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App;