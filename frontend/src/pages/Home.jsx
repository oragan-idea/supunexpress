import React, { useState } from "react";
import { getAuth } from "firebase/auth";

function App() {
  const [linkInput, setLinkInput] = useState("");
  const [linksList, setLinksList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbzClWA2P4jt0pSNUe3uZKWFm7dj8YBsSt3-ljAQmwZiwnHvHr66puQGOE1rcydBdm2O/exec";

  const auth = getAuth();

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

  const handleRemoveLink = (index) =>
    setLinksList(linksList.filter((_, i) => i !== index));

  const handleClearAll = () => {
    setLinksList([]);
    setError(null);
    setSuccess(null);
  };

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
      await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

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
    <div className="min-h-screen bg-gradient-to-b from-[#CEE2FF] to-white text-[#002E4D] p-6 flex flex-col">
      <div className="max-w-3xl mx-auto flex-grow w-full">
        {/* Header */}
        <header className="text-center py-12">
          <h1 className="text-5xl font-bold tracking-wider uppercase pb-3">
            <span className="bg-[#002E4D] text-white px-2 py-1 mr-1">S</span>UPUN
            <span className="font-light ml-1">EXPRESS</span>
          </h1>
          <p className="text-[#004F74] max-w-xl mx-auto text-lg font-medium">
            Worldwide products to your home
          </p>
        </header>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-sm border border-[#81BBDF] rounded-2xl p-6 md:p-8 mb-8 shadow-xl">
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Paste AliExpress product link..."
              className="pl-4 w-full bg-white border-2 border-[#81BBDF] rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#002E4D] focus:border-transparent transition-all"
            />
            <button
              onClick={handleAddLink}
              className="bg-[#002E4D] hover:bg-[#001223] text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Add Link
            </button>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
              {success}
            </div>
          )}

          {/* Links List */}
          {linksList.length > 0 && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-[#002E4D]">
                  Added Products ({linksList.length})
                </h3>
                <button
                  onClick={handleClearAll}
                  className="text-sm text-[#004F74] hover:text-red-600 transition-colors font-medium"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {linksList.map((link, index) => (
                  <div
                    key={index}
                    className="bg-[#CEE2FF] p-3 rounded-lg flex justify-between items-center border border-[#81BBDF]"
                  >
                    <span className="truncate text-[#002E4D]">{link}</span>
                    <button
                      onClick={() => handleRemoveLink(index)}
                      className="text-red-600 hover:text-red-800 font-medium transition-colors"
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
            className="mt-6 bg-[#004F74] hover:bg-[#002E4D] text-white font-medium py-3 px-8 rounded-lg w-full disabled:opacity-50 transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            {loading ? "Submitting..." : "Submit Links"}
          </button>
        </div>
      </div>

      {/* Features Section 
      <div className="grid md:grid-cols-3 gap-8 py-16 max-w-6xl mx-auto w-full">
        <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-[#81BBDF]">
          <div className="w-12 h-12 bg-[#002E4D] rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl">🌍</span>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-[#002E4D]">Global Sourcing</h3>
          <p className="text-[#004F74]">Access products from AliExpress, Amazon, and more worldwide markets</p>
        </div>
        
        <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-[#81BBDF]">
          <div className="w-12 h-12 bg-[#002E4D] rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl">🚚</span>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-[#002E4D]">Fast Delivery</h3>
          <p className="text-[#004F74]">Optimized shipping routes for quicker delivery to your location</p>
        </div>
        
        <div className="text-center p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-[#81BBDF]">
          <div className="w-12 h-12 bg-[#002E4D] rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-white text-2xl">🛡️</span>
          </div>
          <h3 className="text-xl font-semibold mb-2 text-[#002E4D]">Quality Assurance</h3>
          <p className="text-[#004F74]">We verify products and ensure quality before delivery</p>
        </div>
      </div> */}

      {/* Footer */}
      <footer className="text-center py-6 text-[#004F74] text-sm mt-auto border-t border-[#81BBDF]">
        <p>SUPUN EXPRESS &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App;