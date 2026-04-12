import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';
import { FaUserCircle } from 'react-icons/fa';
import { FiMenu } from 'react-icons/fi';
import { getImageUrl } from '../../utils/hostelUtils';

export default function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getAvatarUrl = () => {
    if (user?.profile_image) {
      return getImageUrl(user.profile_image, api.defaults.baseURL);
    }
    return `https://ui-avatars.com/api/?name=${user?.first_name}+${user?.last_name}&background=10b981&color=fff&size=50`;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm border-b border-gray-100 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 relative">
          <div className="flex items-center gap-3 z-10">
            {/* Mobile hamburger — only rendered when a toggle handler is provided (DashboardLayout) */}
            {onMenuToggle && (
              <button
                className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                onClick={onMenuToggle}
                aria-label="Toggle menu"
              >
                <FiMenu className="w-5 h-5" />
              </button>
            )}

            <Link to="/" className="shrink-0 flex items-center gap-2 group">
              <div className="w-9 h-9 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-sm group-hover:bg-emerald-700 transition-colors">
                H
              </div>
              <span className="font-bold text-xl text-gray-800 tracking-tight ml-1">HostelHub</span>
            </Link>

            <div className="hidden md:flex items-center space-x-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <Link to="/" className="text-gray-600 hover:text-emerald-600 font-medium text-[15px] transition-colors">
                Home
              </Link>
              <Link to="/explore" className="text-gray-600 hover:text-emerald-600 font-medium text-[15px] transition-colors">
                Explore Hostels
              </Link>
              <Link to="/about" className="text-gray-600 hover:text-emerald-600 font-medium text-[15px] transition-colors">
                About Us
              </Link>
              <Link to="/contact" className="text-gray-600 hover:text-emerald-600 font-medium text-[15px] transition-colors">
                Contact
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 text-gray-700 hover:text-emerald-600 transition-colors focus:outline-none"
                >
                  <span className="hidden sm:block font-medium">{user.first_name}</span>
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200">
                    <img
                      src={getAvatarUrl()}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-1 border border-gray-100 ring-1 ring-black ring-opacity-5">
                    <div className="px-4 py-2 border-b border-gray-50">
                      <p className="text-sm text-gray-500">Signed in as</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/dashboard/saved"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Saved Hostels
                    </Link>
                    <Link
                      to="/dashboard/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                      onClick={() => setDropdownOpen(false)}
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/register/owner"
                  className="hidden lg:block text-emerald-700 hover:bg-emerald-50 font-medium text-sm transition-colors py-2 px-4 rounded-full border border-emerald-200"
                >
                  List your property
                </Link>
                <div className="hidden lg:block w-px h-6 bg-gray-200 mx-1"></div>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-emerald-700 font-medium text-sm transition-colors py-2 px-3 rounded-lg hover:bg-gray-50 border border-transparent"
                >
                  Log in
                </Link>
                <Link
                  to="/register/student"
                  className="bg-emerald-600 text-white hover:bg-emerald-700 px-5 py-2.5 rounded-lg text-sm font-medium shadow-sm transition-all hover:shadow hover:-translate-y-0.5"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
