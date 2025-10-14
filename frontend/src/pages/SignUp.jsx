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
      <div className="absolute inset-0 bg-gradient-to-br from-[#002E4D]/5 via-transparent to-[#81BBDF]/10"></div>
      <div className="absolute top-0 left-0 w-72 h-72 bg-[#002E4D]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#81BBDF]/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
      
      {/* Animated Floating Elements */}
      <div className="absolute top-20 right-20 w-6 h-6 bg-[#002E4D]/20 rounded-full animate-float"></div>
      <div className="absolute top-40 left-40 w-4 h-4 bg-[#81BBDF]/30 rounded-full animate-float delay-1000"></div>
      <div className="absolute bottom-60 left-20 w-3 h-3 bg-[#004F74]/20 rounded-full animate-float delay-500"></div>

      <div className="relative z-10 flex flex-col justify-center items-center min-h-screen p-6">
        {/* Premium Header */}
        <header className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <div className="absolute -inset-4 bg-gradient-to-r from-[#002E4D] to-[#004F74] rounded-2xl blur-lg opacity-10"></div>
            <h1 className="text-5xl font-bold tracking-wider uppercase relative">
              <span className="bg-[#002E4D] text-white px-2 py-1 mr-1 rounded-lg">S</span>UPUN
              <span className="font-light ml-1">EXPRESS</span>
            </h1>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-px bg-gradient-to-r from-transparent via-[#81BBDF] to-transparent"></div>
            </div>
            <p className="text-[#004F74] text-lg font-medium relative backdrop-blur-sm px-6 inline-block">
              Find it. Love it. Get it — Globally.
            </p>
          </div>
        </header>

        {/* Premium SignUp Card */}
        <div className="relative w-full max-w-md">
          {/* Card Glow Effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-[#002E4D] to-[#81BBDF] rounded-3xl blur-xl opacity-10"></div>
          
          <div className="relative bg-white/90 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
            {/* Card Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-[#002E4D] to-[#004F74] text-white px-6 py-3 rounded-sm shadow-lg mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span className="font-semibold">Join Our Community</span>
              </div>
            </div>

            {/* Error Message */}
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

            {/* SignUp Form */}
            <form className="space-y-6" onSubmit={handleSignUp}>
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#002E4D] to-[#004F74] rounded-xl blur-sm opacity-10"></div>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="relative w-full bg-white/95 border-2 border-[#81BBDF]/30 rounded-xl p-4 pl-12 focus:outline-none focus:border-[#002E4D] focus:ring-2 focus:ring-[#002E4D]/20 transition-all duration-300 text-[#002E4D] placeholder-[#004F74]/60 shadow-inner"
                    required
                  />
                  <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#004F74]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#002E4D] to-[#004F74] rounded-xl blur-sm opacity-10"></div>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="relative w-full bg-white/95 border-2 border-[#81BBDF]/30 rounded-xl p-4 pl-12 focus:outline-none focus:border-[#002E4D] focus:ring-2 focus:ring-[#002E4D]/20 transition-all duration-300 text-[#002E4D] placeholder-[#004F74]/60 shadow-inner"
                    required
                  />
                  <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#004F74]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#002E4D] to-[#004F74] rounded-xl blur-sm opacity-10"></div>
                  <input
                    type="password"
                    placeholder="Create a secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="relative w-full bg-white/95 border-2 border-[#81BBDF]/30 rounded-xl p-4 pl-12 focus:outline-none focus:border-[#002E4D] focus:ring-2 focus:ring-[#002E4D]/20 transition-all duration-300 text-[#002E4D] placeholder-[#004F74]/60 shadow-inner"
                    required
                  />
                  <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#004F74]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>

              {/* Create Account Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#002E4D] to-[#004F74] hover:from-[#001223] hover:to-[#002E4D] text-white font-semibold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating Your Account...</span>
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
            <div className="flex items-center my-8">
              <div className="flex-1 border-t border-[#81BBDF]/50"></div>
              <span className="px-4 text-[#004F74] text-sm font-medium bg-white/80 backdrop-blur-sm py-1 rounded-full">or continue with</span>
              <div className="flex-1 border-t border-[#81BBDF]/50"></div>
            </div>

            {/* Google Sign-Up */}
            <button
              onClick={handleGoogleSignUp}
              disabled={loading}
              className="w-full border-2 border-[#81BBDF]/50 text-[#002E4D] font-semibold py-4 rounded-xl hover:bg-[#002E4D] hover:text-white hover:border-[#002E4D] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 shadow-sm hover:shadow-md bg-white/50 backdrop-blur-sm"
            >
              <img src={googlelogo} alt="Google" className="w-5 h-5" />
              {loading ? 'Creating Account...' : 'Sign up with Google'}
            </button>

            {/* Sign In Link */}
            <div className="text-center mt-8 pt-6 border-t border-[#81BBDF]/30">
              <p className="text-[#004F74]">
                Already have an account?{" "}
                <span
                  className="text-[#002E4D] cursor-pointer font-semibold hover:underline transition-all duration-300 hover:text-[#001223]"
                  onClick={() => navigate("/login")}
                >
                  Sign in here
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-8 text-center max-w-md">
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
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default SignUp;