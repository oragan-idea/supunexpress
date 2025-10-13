import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Sidebar from "./components/Sidebar";
import Orders from "./pages/Orders";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Profile from "./pages/ProfilePage";
import Invoice from "./pages/Invoice";
import AddToCart from "./pages/AddToCart";

function App() {
  return (
    <Router>
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content (shifted right by sidebar width) */}
        <div className="ml-64 w-full">
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
    </Router>
  );
}

export default App;