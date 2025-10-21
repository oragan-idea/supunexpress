import React, { useState } from "react";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";

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
    const EMAIL_SCRIPT_URL =
      "https://script.google.com/macros/s/AKfycbxNPKlVyI1_o7-6ArAjIdKMBGU40Zy-bWuzQ4w-Ivu24QT3BEg2it6FeHrPgk0qWe5A/exec";
    try {
      await fetch(EMAIL_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        mode: "no-cors",
      });
      return { status: "success" };
    } catch (err) {
      console.error("Email send error:", err);
      throw new Error("Failed to send email");
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
      const db = getFirestore();
      await addDoc(collection(db, "submissions"), payload);
      await sendEmail(payload);
      setSuccess("Links submitted successfully!");
      setLinksList([]);
    } catch (err) {
      console.error(err);
      setError("❌ Failed to submit links or send email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => e.key === "Enter" && handleAddLink();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#CEE2FF] via-white to-[#E8F2FF] text-[#002E4D] relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#002E4D]/5 via-transparent to-[#81BBDF]/10"></div>
      <div className="absolute top-0 left-0 w-48 sm:w-72 h-48 sm:h-72 bg-[#002E4D]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-[#81BBDF]/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8 flex flex-col min-h-screen">
        <div className="max-w-4xl mx-auto w-full flex-grow mt-20">
          {/* Header */}
          <header className="text-center mt-15 sm:mb-16">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-wider uppercase pb-3">
              <span className="bg-[#002E4D] text-white px-2 py-1 mr-1">S</span>
              UPUN<span className="font-light ml-1">EXPRESS</span>
            </h1>
            <p className="text-[#004F74] max-w-md sm:max-w-xl mx-auto text-base sm:text-lg font-medium">
              Love It, Shop It - Globally
            </p>
          </header>

          {/* Main Card */}
          <div className="relative mt-10">
            <div className="absolute -inset-3 sm:-inset-4 bg-gradient-to-r from-[#002E4D] to-[#81BBDF] rounded-3xl blur-xl opacity-10"></div>

            <div className="relative bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl p-4 sm:p-8 shadow-xl sm:shadow-2xl">
              {/* Title */}
              <div className="text-center mb-6 sm:mb-8">
                <div className="inline-flex items-center gap-2 sm:gap-3 border border-[#002E4D] text-[#002E4D] px-4 sm:px-6 py-2 sm:py-3 rounded-sm shadow-md sm:shadow-lg text-sm sm:text-base">
                  🔗 <span className="font-semibold">Product Link Submission</span>
                </div>
              </div>

              {/* Input + Add Button */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
                <input
                  type="text"
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Paste Your Product Link.."
                  className="flex-1 bg-white/95 border-2 border-[#81BBDF]/30 rounded-xl p-3 sm:p-4 pl-5 focus:outline-none focus:border-[#002E4D] focus:ring-2 focus:ring-[#002E4D]/20 text-[#002E4D] placeholder-[#004F74]/60 text-sm sm:text-base shadow-inner"
                />
                <button
                  onClick={handleAddLink}
                  className="bg-gradient-to-r from-[#002E4D] to-[#004F74] hover:from-[#001223] hover:to-[#002E4D] text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span>Add Link</span>
                </button>
              </div>

              {/* Alerts */}
              {error && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50/80 border border-red-200 rounded-xl text-red-700 text-sm sm:text-base">
                  {error}
                </div>
              )}
              {success && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50/80 border border-green-200 rounded-xl text-green-700 text-sm sm:text-base">
                  {success}
                </div>
              )}

              {/* Links List */}
              {linksList.length > 0 && (
                <div className="mt-6 sm:mt-8">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6">
                    <h3 className="text-base sm:text-lg font-semibold text-[#002E4D]">
                      Added Products ({linksList.length})
                    </h3>
                    <button
                      onClick={handleClearAll}
                      className="text-sm text-[#004F74] hover:text-red-600 transition-colors font-medium px-3 py-2 rounded-lg hover:bg-red-50 self-start sm:self-center"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="space-y-3 max-h-72 overflow-y-auto">
                    {linksList.map((link, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-r from-[#CEE2FF] to-[#E8F2FF] p-3 sm:p-4 rounded-xl border border-[#81BBDF]/30 hover:border-[#002E4D]/30 transition-all duration-300 shadow-sm hover:shadow-md"
                      >
                        <div className="flex justify-between items-start sm:items-center gap-3">
                          <span className="text-[#002E4D] font-medium break-all text-sm sm:text-base">
                            {link}
                          </span>
                          <button
                            onClick={() => handleRemoveLink(index)}
                            className="text-red-500 hover:text-red-700 text-xs sm:text-sm flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded-lg"
                          >
                            ✕ Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmitLinks}
                disabled={loading || linksList.length === 0}
                className="mt-6 sm:mt-8 w-full bg-gradient-to-r from-[#004F74] to-[#002E4D] hover:from-[#002E4D] hover:to-[#001223] text-white font-semibold py-3 sm:py-4 px-8 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3 text-sm sm:text-base"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    🚀 <span>Submit Product Links</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center py-6 sm:py-8 text-[#004F74] text-xs sm:text-sm mt-10 sm:mt-16">
          <p className="mb-1 font-medium">
            SUPUN EXPRESS &copy; {new Date().getFullYear()}
          </p>
          <p className="text-[#81BBDF] text-[10px] sm:text-xs">
            Elevating Global Commerce Through Premium Service
          </p>
        </footer>
      </div>

      {/* Float Animation */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default App;