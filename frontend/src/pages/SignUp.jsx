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
    <div className="min-h-screen bg-gradient-to-b from-[#CEE2FF] to-white flex flex-col justify-center items-center p-6">
      {/* Supun Express Header */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold tracking-wider uppercase pb-3">
          <span className="bg-[#002E4D] text-white px-2 py-1 mr-1 rounded-lg">S</span>UPUN
          <span className="font-light ml-1">EXPRESS</span>
        </h1>
        <p className="text-[#004F74] max-w-xl mx-auto text-lg font-medium">
          Find it. Love it. Get it — Globally.
        </p>
      </div>

      <div className="w-full max-w-md bg-white/80 backdrop-blur-sm border border-[#81BBDF] rounded-2xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-6 text-[#002E4D]">Create Account</h1>
        <p className="text-[#004F74] text-center mb-6">Join Supun Express today</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSignUp}>
          <div>
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-[#81BBDF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002E4D] focus:border-transparent transition-all"
              required
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-[#81BBDF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002E4D] focus:border-transparent transition-all"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-[#81BBDF] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#002E4D] focus:border-transparent transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#002E4D] text-white font-medium rounded-lg hover:bg-[#001223] transition-all duration-300 disabled:opacity-50 shadow-md hover:shadow-lg"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-1 border-t border-[#81BBDF]"></div>
          <span className="px-3 text-[#004F74] text-sm">or continue with</span>
          <div className="flex-1 border-t border-[#81BBDF]"></div>
        </div>

        {/* Google Sign-Up */}
        <button
          onClick={handleGoogleSignUp}
          disabled={loading}
          className="w-full py-3 border border-[#81BBDF] text-[#002E4D] font-medium rounded-lg hover:bg-[#002E4D] hover:text-white transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm hover:shadow-md"
        >
          <img src={googlelogo} alt="Google" className="w-5 h-5" />
          {loading ? "Signing up..." : "Sign up with Google"}
        </button>

        <p className="text-sm text-[#004F74] text-center mt-6">
          Already have an account?{" "}
          <span
            className="text-[#002E4D] cursor-pointer font-semibold hover:underline"
            onClick={() => navigate("/login")}
          >
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignUp;