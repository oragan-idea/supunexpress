import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth, logOut } from "../firebase";

export default function Sidebar() {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const linkClasses = (path) =>
    `flex items-center p-3 rounded-lg transition-all duration-300 ${
      location.pathname === path
        ? "bg-black text-white font-medium shadow-md"
        : "text-neutral-700 hover:bg-neutral-50 hover:shadow-sm"
    }`;

  return (
    <div className="w-64 h-screen bg-white text-black p-6 fixed left-0 top-0 border-r border-neutral-200 flex flex-col justify-between overflow-hidden bg-gradient-to-b from-white to-neutral-50">
      {/* Subtle texture overlay for luxury feel */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSJub25lIiBzdHJva2U9IiMwMDAiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNIDAgMCBMIDYwIDYwIE0gNjAgMCBMIDAgNjAiLz48L2c+PC9zdmc+')]"></div>
      
      {/* Top Section */}
      <div className="relative z-10">
        {/* Logo/Brand */}
        <div className="mb-12 pt-2">
          <h2 className="text-2xl font-bold tracking-wider uppercase border-b border-neutral-200 pb-3">
            <span className="bg-black text-white px-2 py-1 mr-1">S</span>UPUN 
            <span className="font-light ml-1">EXPRESS</span>
          </h2>
          <p className="text-neutral-500 text-xs mt-3 tracking-widest uppercase font-light">Order Products</p>
        </div>

        {/* Navigation Links */}
        <ul className="space-y-3">
          <li>
            <Link to="/" className={linkClasses("/")}>
              <svg
                className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:scale-110"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              Home
            </Link>
          </li>

          <li>
            <Link to="/orders" className={linkClasses("/orders")}>
              <svg
                className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:scale-110"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                  clipRule="evenodd"
                />
              </svg>
              Orders
            </Link>
          </li>
          <li>
            <Link to="/invoice" className={linkClasses("/invoice")}> 
              <svg
                className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:scale-110"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-2m-4 0V5a2 2 0 00-2-2H7a2 2 0 00-2 2v4m10 4h.01" />
              </svg>
              Invoice
            </Link>
          </li>
          <li>
            <Link to="/cart" className={linkClasses("/cart")}> 
              <svg
                className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:scale-110"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M16 11V7a4 4 0 00-8 0v4M5 11h10l1 9H4l1-9zm2 0V7a2 2 0 114 0v4" />
              </svg>
              Cart Management
            </Link>
          </li>
        </ul>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-neutral-200 pt-6 relative z-10">
        {user ? (
          <>
            {/* User Info */}
            <Link to='/profile' className="flex items-center gap-3 p-3 text-black rounded-lg mb-4 bg-neutral-50">
              <div className="bg-black text-white w-10 h-10 flex items-center justify-center rounded-full font-bold shadow-sm">
                {user.displayName
                  ? user.displayName[0].toUpperCase()
                  : user.email[0].toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <div className="font-medium truncate text-sm">
                  {user.displayName || "No Name"}
                </div>
                <div className="text-xs text-neutral-500 truncate">{user.email}</div>
              </div>
            </Link>

            {/* Sign Out Button */}
            <button
              onClick={logOut}
              className="w-full border border-black bg-white hover:bg-black hover:text-white text-black py-2.5 rounded-lg text-sm transition-all duration-300 tracking-wide font-light shadow-sm hover:shadow-md"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link
              to="/signup"
              className="w-full border border-black bg-black text-white hover:bg-white hover:text-black py-2.5 rounded-lg text-sm text-center transition-all duration-300 tracking-wide shadow-sm hover:shadow-md block mb-3"
            >
              Create Account
            </Link>
            <Link
              to="/login"
              className="w-full border border-black bg-white text-black hover:bg-black hover:text-white py-2.5 rounded-lg text-sm text-center transition-all duration-300 tracking-wide shadow-sm hover:shadow-md block"
            >
              Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}