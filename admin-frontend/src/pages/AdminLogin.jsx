import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (trimmedEmail === "admin@example.com" && trimmedPassword === "admin123") {
      localStorage.setItem("adminLoggedIn", "true");
      navigate("/dashboard");
    } else {
      setError("Invalid admin credentials");
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#CEE2FF] to-white p-6">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-sm border border-[#81BBDF] rounded-2xl p-8 shadow-lg flex flex-col items-center">
        {/* Supun Express Header */}
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold tracking-wider uppercase pb-3">
            <span className="bg-[#002E4D] text-white px-2 py-1 mr-1">S</span>UPUN
            <span className="font-light ml-1">EXPRESS</span>
          </h1>
          <p className="text-[#004F74] max-w-xl mx-auto text-lg font-medium">
            Admin Portal
          </p>
        </header>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div>
            <input
              type="email"
              placeholder="Admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-[#81BBDF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002E4D] focus:border-transparent transition-all"
            />
          </div>
          
          <div>
            <input
              type="password"
              placeholder="Admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-[#81BBDF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002E4D] focus:border-transparent transition-all"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-[#002E4D] hover:bg-[#001223] text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Authenticating...
              </div>
            ) : (
              "Access Admin Panel"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;