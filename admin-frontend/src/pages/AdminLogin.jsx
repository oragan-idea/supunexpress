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
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (trimmedEmail === "admin@example.com" && trimmedPassword === "admin123") {
      localStorage.setItem("adminLoggedIn", "true");
      navigate("/dashboard");
    } else {
      setError("Invalid admin credentials");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#CEE2FF] via-white to-[#E8F2FF] text-[#002E4D] relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#002E4D]/5 via-transparent to-[#81BBDF]/10 pointer-events-none" />
      <div className="absolute top-0 left-0 w-56 h-56 sm:w-72 sm:h-72 bg-[#002E4D]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 hidden sm:block" />
      <div className="absolute bottom-0 right-0 w-72 h-72 sm:w-96 sm:h-96 bg-[#81BBDF]/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 hidden sm:block" />

      {/* Animated Floating Elements (hidden on small screens) */}
      <div className="absolute top-20 right-20 w-5 h-5 bg-[#002E4D]/20 rounded-full animate-float hidden md:block" />
      <div className="absolute top-40 left-40 w-4 h-4 bg-[#81BBDF]/30 rounded-full animate-float delay-1000 hidden lg:block" />
      <div className="absolute bottom-60 left-20 w-3 h-3 bg-[#004F74]/20 rounded-full animate-float delay-500 hidden lg:block" />

      <div className="relative z-10 flex flex-col justify-center items-center min-h-screen p-4 sm:p-6">
        {/* Premium Header */}
        <header className="text-center mb-6 sm:mb-8">
          <div className="relative inline-block mb-4">
            <div className="absolute -inset-3 sm:-inset-4 bg-gradient-to-r from-[#002E4D] to-[#004F74] rounded-2xl blur-lg opacity-10"></div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-wider uppercase relative leading-tight">
              <span className="bg-[#002E4D] text-white px-2 py-1 mr-1 inline-block">S</span>UPUN
              <span className="font-light ml-1">EXPRESS</span>
            </h1>
          </div>
        </header>

        {/* Premium Admin Login Card */}
        <div className="relative w-full max-w-md">
          {/* Card Glow Effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-[#002E4D] to-[#81BBDF] rounded-3xl blur-xl opacity-10 hidden sm:block"></div>

          <div className="relative bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl">
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-xl text-red-700 shadow-sm text-sm">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#002E4D] to-[#004F74] rounded-xl blur-sm opacity-6 pointer-events-none z-0"></div>
                  <input
                    type="email"
                    placeholder="Enter admin email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="relative z-10 w-full bg-white border-2 border-[#81BBDF]/30 rounded-xl p-3 sm:p-4 pl-12 md:pl-14 lg:pl-16 focus:outline-none focus:border-[#002E4D] focus:ring-2 focus:ring-[#002E4D]/20 transition-all duration-300 text-[#002E4D] placeholder-[#004F74]/60"
                  />
                  <svg aria-hidden="true" className="absolute left-4 md:left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 md:w-5 md:h-5 text-[#004F74] z-30 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#002E4D] to-[#004F74] rounded-xl blur-sm opacity-6 pointer-events-none z-0"></div>
                  <input
                    type="password"
                    placeholder="Enter admin password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="relative z-10 w-full bg-white border-2 border-[#81BBDF]/30 rounded-xl p-3 sm:p-4 pl-12 md:pl-14 lg:pl-16 focus:outline-none focus:border-[#002E4D] focus:ring-2 focus:ring-[#002E4D]/20 transition-all duration-300 text-[#002E4D] placeholder-[#004F74]/60"
                  />
                  <svg aria-hidden="true" className="absolute left-4 md:left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 md:w-5 md:h-5 text-[#004F74] z-30 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#002E4D] to-[#004F74] hover:from-[#001223] hover:to-[#002E4D] text-white font-semibold py-3 sm:py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="text-sm">Access Admin Dashboard</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Security Footer */}
        <div className="mt-6 text-center max-w-md">
          <p className="text-xs text-[#004F74]/70 flex items-center justify-center gap-2">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            All access is logged and monitored for security purposes
          </p>
        </div>
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

export default AdminLogin;