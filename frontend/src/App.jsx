import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Sidebar from "./components/Sidebar";
import Orders from "./pages/Orders";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Profile from "./pages/ProfilePage";
import Invoice from "./pages/Invoice";
import AddToCart from "./pages/AddToCart";
import { useState } from "react";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-[#CEE2FF] via-white to-[#E8F2FF] text-[#002E4D] relative overflow-hidden flex">
        {/* Sidebar (hidden on mobile, visible on desktop) */}
        <Sidebar  />

        {/* Main Content */}
        <div className="flex-1 transition-all duration-300">

          {/* Main Route Pages */}
          <div className="p-6">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/invoice" element={<Invoice />} />
              <Route path="/cart" element={<AddToCart />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
