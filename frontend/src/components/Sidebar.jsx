import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth, logOut } from "../firebase";

export default function Sidebar() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const linkClasses = (path) =>
    `flex items-center p-3 rounded-lg transition-all duration-300 ${
      location.pathname === path
        ? "bg-[#002E4D] text-white font-medium shadow-md"
        : "text-[#004F74] hover:bg-[#CEE2FF] hover:shadow-sm"
    }`;

  return (
    <>
      {/* Mobile Menu Button - show only when menu is closed */}
      {!isMobileMenuOpen && (
        <button
          aria-label="Open menu"
          onClick={() => setIsMobileMenuOpen(true)}
          className="lg:hidden fixed top-5 left-6 z-50 w-11 h-11 rounded-lg flex items-center justify-center bg-white border border-[#DFEAF2] shadow-md text-[#002E4D] focus:outline-none focus:ring-2 focus:ring-[#002E4D]/10"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 h-screen bg-white text-[#002E4D] p-4 sm:p-6 
        border-r border-[#81BBDF] flex flex-col justify-between 
        overflow-hidden bg-gradient-to-b from-white to-[#CEE2FF]/20
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Close (cut) button shown inside sidebar on mobile */}
        {isMobileMenuOpen && (
          <button
            aria-label="Close menu"
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden absolute top-3 right-3 z-50 w-9 h-9 rounded-md flex items-center justify-center bg-white border border-[#DFEAF2] shadow-sm text-[#002E4D] focus:outline-none"
          >
            {/* simple X (replace with scissors SVG if you prefer) */}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Subtle texture overlay for luxury feel */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSJub25lIiBzdHJva2U9IiMwMDJFNEMiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNIDAgMCBMIDYwIDYwIE0gNjAgMCBMIDAgNjAiLz48L2c+PC9zdmc+')]"></div>
        
        {/* Top Section */}
        <div className="relative z-10">
          {/* Logo/Brand */}
          <div className="mb-8 sm:mb-12 pt-2">
            <h2 className="text-xl sm:text-2xl font-bold tracking-wider uppercase border-b border-[#81BBDF] pb-3">
              <span className="bg-[#002E4D] text-white px-2 py-1 mr-1">S</span>UPUN 
              <span className="font-light ml-1">EXPRESS</span>
            </h2>
            <p className="text-[#004F74] text-xs mt-3 tracking-widest uppercase font-light">
              {user ? `Welcome, ${user.displayName || 'User'}` : 'Order Products'}
            </p>
          </div>

          {/* Navigation Links */}
          <ul className="space-y-2 sm:space-y-3">
            <li>
              <Link 
                to="/" 
                className={linkClasses("/")}
                onClick={() => setIsMobileMenuOpen(false)}
              >
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
              <Link 
                to="/orders" 
                className={linkClasses("/orders")}
                onClick={() => setIsMobileMenuOpen(false)}
              >
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
              <Link 
                to="/invoice" 
                className={linkClasses("/invoice")}
                onClick={() => setIsMobileMenuOpen(false)}
              > 
                <svg
                  className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:scale-110"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 2a2 2 0 00-2 2v14l3.5-2 3.5 2 3.5-2 3.5 2V4a2 2 0 00-2-2H5zm2.5 3a1.5 1.5 0 100 3 1.5 1.5 0 000-3zm6.207.293a1 1 0 00-1.414 0l-6 6a1 1 0 101.414 1.414l6-6a1 1 0 000-1.414zM12.5 10a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"
                    clipRule="evenodd"
                  />
                </svg>
                Invoices
              </Link>
            </li>

            <li>
              <Link 
                to="/cart" 
                className={linkClasses("/cart")}
                onClick={() => setIsMobileMenuOpen(false)}
              > 
                <svg
                  className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:scale-110"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
                Cart
              </Link>
            </li>

            {/* Admin Link - Only show if user is admin */}
            {user && user.email === "admin@example.com" && (
              <li>
                <Link 
                  to="/dashboard" 
                  className={linkClasses("/dashboard")}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg
                    className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:scale-110"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Admin Dashboard
                </Link>
              </li>
            )}
          </ul>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-[#81BBDF] pt-4 sm:pt-6 relative z-10">
          {user ? (
            <>
              {/* User Info */}
              <Link 
                to='/profile' 
                className="flex items-center gap-3 p-3 text-[#002E4D] rounded-lg mb-3 sm:mb-4 bg-[#CEE2FF]/50 border border-[#81BBDF] hover:bg-[#CEE2FF]/70 transition-all duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="bg-[#002E4D] text-white w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full font-bold shadow-sm text-sm sm:text-base">
                  {user.displayName
                    ? user.displayName[0].toUpperCase()
                    : user.email[0].toUpperCase()}
                </div>
                <div className="overflow-hidden flex-1">
                  <div className="font-medium truncate text-sm">
                    {user.displayName || "No Name"}
                  </div>
                  <div className="text-xs text-[#004F74] truncate">{user.email}</div>
                  {user.email === "admin@example.com" && (
                    <div className="text-xs bg-[#002E4D] text-white px-1.5 py-0.5 rounded mt-1 inline-block">
                      Admin
                    </div>
                  )}
                </div>
                <svg className="w-4 h-4 text-[#004F74] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>

              {/* Sign Out Button */}
              <button
                onClick={() => {
                  logOut();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full border border-[#002E4D] bg-white hover:bg-[#002E4D] hover:text-white text-[#002E4D] py-2 sm:py-2.5 rounded-lg text-sm transition-all duration-300 tracking-wide font-medium shadow-sm hover:shadow-md flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/signup"
                className="w-full border border-[#002E4D] bg-[#002E4D] text-white hover:bg-white hover:text-[#002E4D] py-2 sm:py-2.5 rounded-lg text-sm text-center transition-all duration-300 tracking-wide shadow-sm hover:shadow-md block mb-3 font-medium flex items-center justify-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Create Account
              </Link>
              <Link
                to="/login"
                className="w-full border border-[#002E4D] bg-white text-[#002E4D] hover:bg-[#002E4D] hover:text-white py-2 sm:py-2.5 rounded-lg text-sm text-center transition-all duration-300 tracking-wide shadow-sm hover:shadow-md block font-medium flex items-center justify-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Login
              </Link>
            </>
          )}

          {/* Footer */}
          <div className="mt-3 sm:mt-4 text-center">
            <p className="text-xs text-[#004F74]">Supun Express &copy; {new Date().getFullYear()}</p>
            <p className="text-[10px] text-[#81BBDF] mt-1">v1.0.0</p>
          </div>
        </div>
      </div>
    </>
  );
}