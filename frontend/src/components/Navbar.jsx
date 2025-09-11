import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const linkClasses = (path) =>
    `px-4 py-2 rounded-lg transition font-medium ${
      location.pathname === path
        ? "bg-black text-white"
        : "text-black hover:bg-neutral-100"
    }`;

  return (
    <nav className="">
      <div className="max-w-6xl mx-auto flex items-center h-16">
        <div className="flex space-x-4">
          <Link to="/" className={linkClasses("/")}>
            Home
          </Link>
          <Link to="/orders" className={linkClasses("/orders")}>
            Orders
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
