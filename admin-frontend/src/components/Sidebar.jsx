import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    navigate("/");
  };

  const linkClasses = (path) =>
    `flex items-center p-3 rounded-lg transition-all duration-300 ${
      location.pathname === path
        ? "bg-[#002E4D] text-white font-medium shadow-md"
        : "text-[#004F74] hover:bg-[#CEE2FF] hover:shadow-sm"
    }`;

  return (
    <div className="w-64 h-screen bg-white text-[#002E4D] p-6 fixed left-0 top-0 border-r border-[#81BBDF] flex flex-col justify-between overflow-hidden bg-gradient-to-b from-white to-[#CEE2FF]/20">
      {/* Subtle texture overlay for luxury feel */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSJub25lIiBzdHJva2U9IiMwMDJFNEMiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2Utb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNIDAgMCBMIDYwIDYwIE0gNjAgMCBMIDAgNjAiLz48L2c+PC9zdmc+')]"></div>
      
      {/* Top Section */}
      <div className="relative z-10">
        {/* Logo/Brand */}
        <div className="mb-12 pt-2">
          <h2 className="text-2xl font-bold tracking-wider uppercase border-b border-[#81BBDF] pb-3">
            <span className="bg-[#002E4D] text-white px-2 py-1 mr-1 ">S</span>UPUN 
            <span className="font-light ml-1">EXPRESS</span>
          </h2>
          <p className="text-[#004F74] text-xs mt-3 tracking-widest uppercase font-light">Admin Portal</p>
        </div>

        {/* Navigation Links */}
        <ul className="space-y-3">
          <li>
            <Link to="/dashboard" className={linkClasses("/dashboard")}>
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
              Dashboard
            </Link>
          </li>

          <li>
            <Link to="/users" className={linkClasses("/users")}>
              <svg
                className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:scale-110"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              Users
            </Link>
          </li>

          <li>
            <Link to="/products" className={linkClasses("/products")}>
              <svg
                className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:scale-110"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
                  clipRule="evenodd"
                />
              </svg>
              Products
            </Link>
          </li>

          <li>
            <Link to="/analytics" className={linkClasses("/analytics")}>
              <svg
                className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:scale-110"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
              </svg>
              Analytics
            </Link>
          </li>
        </ul>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-[#81BBDF] pt-6 relative z-10">
        {/* Admin Info */}
        <div className="flex items-center gap-3 p-3 text-[#002E4D] rounded-lg mb-4 bg-[#CEE2FF]/50 border border-[#81BBDF]">
          <div className="bg-[#002E4D] text-white w-10 h-10 flex items-center justify-center rounded-full font-bold shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div className="overflow-hidden">
            <div className="font-medium truncate text-sm">Administrator</div>
            <div className="text-xs text-[#004F74] truncate">admin@example.com</div>
          </div>
        </div>

        {/* Sign Out Button */}
        <button
          onClick={handleLogout}
          className="w-full border border-[#002E4D] bg-white hover:bg-[#002E4D] hover:text-white text-[#002E4D] py-2.5 rounded-lg text-sm transition-all duration-300 tracking-wide font-light shadow-sm hover:shadow-md flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>

        {/* Version Info */}
        <div className="mt-4 text-center">
          <p className="text-xs text-[#004F74]">v1.0.0</p>
        </div>
      </div>
    </div>
  );
}