import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';
import { FaUserCircle } from 'react-icons/fa';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getAvatarUrl = () => {
    if (user?.profile_image) {
      return api.defaults.baseURL.replace('/api', '') + '/' + user.profile_image;
    }
    return `https://ui-avatars.com/api/?name=${user?.first_name}+${user?.last_name}&background=10b981&color=fff&size=50`;
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 z-50 relative">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 group">
              <div className="w-9 h-9 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-sm group-hover:bg-emerald-700 transition-colors">
                H
              </div>
              <span className="font-bold text-xl text-gray-800 tracking-tight ml-1">HostelHub</span>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              <Link
                to="/explore"
                className="text-gray-600 hover:text-emerald-600 px-3 py-2 rounded-md font-medium text-sm transition-colors"
              >
                Explore Hostels
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="relative">
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
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-emerald-700 font-medium text-sm transition-colors py-2 px-3 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-200"
                >
                  Log in
                </Link>
                <Link
                  to="/register/student"
                  className="bg-emerald-600 text-white hover:bg-emerald-700 px-5 py-2.5 rounded-lg text-sm font-medium shadow-sm shadow-emerald-200/50 transition-all hover:shadow hover:-translate-y-0.5"
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
