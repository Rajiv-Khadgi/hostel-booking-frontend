import React from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-indigo-600 text-white shadow-md fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          HomeSpace
        </Link>
        <div className="space-x-6 hidden md:flex">
          <Link to="/" className="hover:text-gray-200">Home</Link>
          <Link to="/hostels" className="hover:text-gray-200">Hostels</Link>
          <Link to="/about" className="hover:text-gray-200">About Us</Link>
          <Link to="/login" className="bg-white text-indigo-600 font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition">
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
}
