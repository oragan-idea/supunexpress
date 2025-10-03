import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import googlelogo from '../assets/google.webp';
import { auth, logInWithEmailAndPassword, signInWithGoogle } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user] = useAuthState(auth); 
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await logInWithEmailAndPassword(email, password); 
      navigate('/');
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle(); 
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  //Redirect if already logged in
  if (user) {
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-md bg-white border border-neutral-200 rounded-2xl p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-6">Login</h1>
        {error && <p className="text-red-600 mb-4">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-black text-white font-medium rounded-lg hover:bg-neutral-800 transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full mt-4 py-3 border text-black font-medium rounded-lg hover:bg-black hover:text-white transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <img src={googlelogo} alt="Google" className="w-5 h-5"/>
          Login with Google
        </button>

        <p className="text-sm text-neutral-500 text-center mt-4">
          Don’t have an account?{" "}
          <span
            className="text-blue-600 cursor-pointer"
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
