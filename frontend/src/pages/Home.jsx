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
    // Fire both requests without waiting for a response
    fetch(SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    fetch("https://script.google.com/macros/s/AKfycbwuDoDnhStp86-yOS58q9XsiJ41KeoH3CqMfZSPhO2m-XK19unPMXC9w_8DZbImfaFz/exec", {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // Artificial short delay to let requests fire
    setTimeout(() => {
      setSuccess("Links submitted successfully!");
      setLinksList([]);
      setLoading(false);
    }, 1500);
  } catch (err) {
    console.error(err);
    setError("❌ Failed to submit links. Please try again.");
    setLoading(false);
  }
};


  const handleKeyPress = (e) => e.key === "Enter" && handleAddLink();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#CEE2FF] via-white to-[#E8F2FF] text-[#002E4D] relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#002E4D]/5 via-transparent to-[#81BBDF]/10"></div>
      <div className="absolute top-0 left-0 w-72 h-72 bg-[#002E4D]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#81BBDF]/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
      
      {/* Animated Floating Elements */}
      <div className="absolute top-20 right-20 w-6 h-6 bg-[#002E4D]/20 rounded-full animate-float"></div>
      <div className="absolute top-40 left-40 w-4 h-4 bg-[#81BBDF]/30 rounded-full animate-float delay-1000"></div>
      <div className="absolute bottom-60 left-20 w-3 h-3 bg-[#004F74]/20 rounded-full animate-float delay-500"></div>

      <div className="relative z-10 p-6 flex flex-col min-h-screen">
        <div className="max-w-4xl mx-auto flex-grow w-full">
          {/* Premium Header */}
          <header className="text-center mb-8 py-16">
          <h1 className="text-5xl font-bold tracking-wider uppercase pb-3">
            <span className="bg-[#002E4D] text-white px-2 py-1 mr-1">S</span>UPUN
            <span className="font-light ml-1">EXPRESS</span>
          </h1>
          <p className="text-[#004F74] max-w-xl mx-auto text-lg font-medium">
            Love It, Shop It - Globally 
          </p>
        </header>

          {/* Premium Main Card */}
          <div className="relative">
            {/* Card Glow Effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-[#002E4D] to-[#81BBDF] rounded-3xl blur-xl opacity-10"></div>
            
            <div className="relative bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
              {/* Card Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-3 border border-[#002E4D] text-[#002E4D] px-6 py-3 rounded-sm shadow-lg">
                  🔗 <span className="font-semibold">Product Link Submission</span>
                </div>
              </div>

              {/* Input Section */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#002E4D] to-[#004F74] rounded-xl blur-sm opacity-20"></div>
                  <input
                    type="text"
                    value={linkInput}
                    onChange={(e) => setLinkInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Paste Your Product Link.."
                    className="relative w-full bg-white/95 border-2 border-[#81BBDF]/30 rounded-xl p-4 pl-12 focus:outline-none focus:border-[#002E4D] focus:ring-2 focus:ring-[#002E4D]/20 transition-all duration-300 text-[#002E4D] placeholder-[#004F74]/60 shadow-inner"
                  />
                </div>
                <button
                  onClick={handleAddLink}
                  className="bg-gradient-to-r from-[#002E4D] to-[#004F74] hover:from-[#001223] hover:to-[#002E4D] text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Link
                </button>
              </div>

              {/* Alerts */}
              {error && (
                <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl text-red-700 shadow-lg">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                  </div>
                </div>
              )}
              {success && (
                <div className="mb-6 p-4 bg-green-50/80 backdrop-blur-sm border border-green-200 rounded-xl text-green-700 shadow-lg">
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {success}
                  </div>
                </div>
              )}

              {/* Links List */}
              {linksList.length > 0 && (
                <div className="mt-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-[#002E4D] flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Added Products ({linksList.length})
                    </h3>
                    <button
                      onClick={handleClearAll}
                      className="text-sm text-[#004F74] hover:text-red-600 transition-colors font-medium flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Clear All
                    </button>
                  </div>

                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {linksList.map((link, index) => (
                      <div
                        key={index}
                        className="group bg-gradient-to-r from-[#CEE2FF] to-[#E8F2FF] p-4 rounded-xl border border-[#81BBDF]/30 hover:border-[#002E4D]/30 transition-all duration-300 shadow-sm hover:shadow-md"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-2 h-2 bg-[#002E4D] rounded-full flex-shrink-0"></div>
                            <span className="text-[#002E4D] font-medium truncate">{link}</span>
                          </div>
                          <button
                            onClick={() => handleRemoveLink(index)}
                            className="text-red-500 hover:text-red-700 transition-colors flex items-center gap-1 px-3 py-1 rounded-lg hover:bg-red-50 flex-shrink-0 ml-3"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span className="text-sm font-medium">Remove</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmitLinks}
                disabled={loading || linksList.length === 0}
                className="mt-8 w-full bg-gradient-to-r from-[#004F74] to-[#002E4D] hover:from-[#002E4D] hover:to-[#001223] text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing Your Request...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    <span>Submit Product Links</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Premium Footer */}
        <footer className="text-center py-8 text-[#004F74] text-sm mt-16 relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-[#81BBDF] to-transparent"></div>
          <div className="max-w-4xl mx-auto">
            <p className="mb-2 font-medium">SUPUN EXPRESS &copy; {new Date().getFullYear()}</p>
            <p className="text-xs text-[#81BBDF]">Elevating Global Commerce Through Premium Service</p>
          </div>
        </footer>
      </div>

      {/* Add custom animations to tailwind config */}
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
}

export default App;