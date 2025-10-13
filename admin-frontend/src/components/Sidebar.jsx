import { Link, useLocation, useNavigate } from "react-router-dom";


export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    navigate("/");
  };

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
            <Link to="/dashboard" className={location.pathname === "/dashboard" ? "bg-black text-white font-medium shadow-md flex items-center p-3 rounded-lg transition-all duration-300" : "text-neutral-700 hover:bg-neutral-50 hover:shadow-sm flex items-center p-3 rounded-lg transition-all duration-300"}>
              <svg className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:scale-110" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 12H9v-2h2v2zm0-4H9V6h2v4z" />
              </svg>
              Admin Dashboard
            </Link>
          </li>
        </ul>
      </div>
      {/* Bottom Section */}
      <div className="border-t border-neutral-200 pt-6 relative z-10">
        <button
          onClick={handleLogout}
          className="w-full border border-black bg-white hover:bg-black hover:text-white text-black py-2.5 rounded-lg text-sm transition-all duration-300 tracking-wide font-light shadow-sm hover:shadow-md"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}