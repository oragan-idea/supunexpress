import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import googlelogo from "../assets/google.webp";
import {
  registerWithEmailAndPassword,
  signInWithGoogle,
} from "../firebase";

const SignUp = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);

    if (!name) {
      alert("Enter your name");
      return;
    }

    setLoading(true);
    try {
      await registerWithEmailAndPassword(name, email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#CEE2FF] via-white to-[#E8F2FF] text-[#002E4D] relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#002E4D]/5 via-transparent to-[#81BBDF]/10 pointer-events-none" />
      <div className="absolute top-0 left-0 w-48 h-48 sm:w-72 sm:h-72 bg-[#002E4D]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 hidden sm:block" />
      <div className="absolute bottom-0 right-0 w-56 h-56 sm:w-96 sm:h-96 bg-[#81BBDF]/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 hidden sm:block" />
      
      {/* Animated Floating Elements */}
      <div className="absolute top-20 right-8 w-5 h-5 bg-[#002E4D]/20 rounded-full animate-float hidden md:block" />
      <div className="absolute top-36 left-36 w-4 h-4 bg-[#81BBDF]/30 rounded-full animate-float delay-1000 hidden lg:block" />
      <div className="absolute bottom-60 left-20 w-3 h-3 bg-[#004F74]/20 rounded-full animate-float delay-500 hidden lg:block" />

      <div className="relative z-10 flex flex-col justify-center items-center min-h-screen p-4 sm:p-6">
        {/* Premium Header */}
        <header className="text-center mb-8 w-full max-w-xl px-2">
          <div className="relative inline-block mb-4">
            <div className="absolute -inset-3 sm:-inset-4 bg-gradient-to-r from-[#002E4D] to-[#004F74] rounded-2xl blur-lg opacity-10"></div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-wider uppercase relative">
              <span className="bg-[#002E4D] text-white px-2 py-1 mr-1 rounded-sm inline-block">S</span>UPUN
              <span className="font-light ml-1">EXPRESS</span>
            </h1>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-40 sm:w-48 h-px bg-gradient-to-r from-transparent via-[#81BBDF] to-transparent"></div>
            </div>
            <p className="text-[#004F74] text-sm sm:text-base font-medium relative backdrop-blur-sm px-4 sm:px-6 inline-block">
              Find it. Love it. Get it — Globally.
            </p>
          </div>
        </header>

        {/* Premium SignUp Card */}
        <div className="relative w-full max-w-md">
          {/* Card Glow Effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-[#002E4D] to-[#81BBDF] rounded-3xl blur-xl opacity-10 hidden sm:block"></div>
          
          <div className="relative bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6 sm:p-8 shadow-2xl">
            {/* Card Header */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-[#002E4D] to-[#004F74] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-sm shadow-lg mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span className="font-semibold text-sm sm:text-base">Join Our Community</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-lg text-red-700 shadow-sm text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            {/* SignUp Form */}
            <form className="space-y-5" onSubmit={handleSignUp}>
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#002E4D] to-[#004F74] rounded-xl blur-sm opacity-6"></div>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="relative w-full bg-white/95 border-2 border-[#81BBDF]/30 rounded-xl p-3 sm:p-4 pl-10 focus:outline-none focus:border-[#002E4D] focus:ring-2 focus:ring-[#002E4D]/20 transition-all duration-200 text-[#002E4D] placeholder-[#004F74]/60"
                    required
                  />
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#004F74]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#002E4D] to-[#004F74] rounded-xl blur-sm opacity-6"></div>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="relative w-full bg-white/95 border-2 border-[#81BBDF]/30 rounded-xl p-3 sm:p-4 pl-10 focus:outline-none focus:border-[#002E4D] focus:ring-2 focus:ring-[#002E4D]/20 transition-all duration-200 text-[#002E4D] placeholder-[#004F74]/60"
                    required
                  />
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#004F74]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#002E4D] to-[#004F74] rounded-xl blur-sm opacity-6"></div>
                  <input
                    type="password"
                    placeholder="Create a secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="relative w-full bg-white/95 border-2 border-[#81BBDF]/30 rounded-xl p-3 sm:p-4 pl-10 focus:outline-none focus:border-[#002E4D] focus:ring-2 focus:ring-[#002E4D]/20 transition-all duration-200 text-[#002E4D] placeholder-[#004F74]/60"
                    required
                  />
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#004F74]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>

              {/* Create Account Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#002E4D] to-[#004F74] hover:from-[#001223] hover:to-[#002E4D] text-white font-semibold py-3 sm:py-4 rounded-xl transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">Creating Your Account...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <span>Create Your Account</span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 border-t border-[#81BBDF]/50"></div>
              <span className="px-3 text-[#004F74] text-sm font-medium bg-white/80 py-1 rounded-full">or continue with</span>
              <div className="flex-1 border-t border-[#81BBDF]/50"></div>
            </div>

            {/* Google Sign-Up */}
            <button
              onClick={handleGoogleSignUp}
              disabled={loading}
              className="w-full border-2 border-[#81BBDF]/50 text-[#002E4D] font-semibold py-3 sm:py-4 rounded-xl hover:bg-[#002E4D] hover:text-white hover:border-[#002E4D] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 shadow-sm bg-white/50"
            >
              <img src={googlelogo} alt="Google" className="w-5 h-5" />
              <span className="text-sm">{loading ? "Creating Account..." : "Sign up with Google"}</span>
            </button>

            {/* Sign In Link */}
            <div className="text-center mt-6 pt-4 border-t border-[#81BBDF]/30">
              <p className="text-[#004F74] text-sm">
                Already have an account?{" "}
                <span
                  className="text-[#002E4D] cursor-pointer font-semibold hover:underline"
                  onClick={() => navigate("/login")}
                >
                  Sign in here
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-6 text-center max-w-md px-4">
          <p className="text-xs text-[#004F74]/70 flex items-center justify-center gap-2">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Your information is protected with enterprise-grade security
          </p>
        </div>
      </div>

      {/* Add custom animations to tailwind config */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-16px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default SignUp;