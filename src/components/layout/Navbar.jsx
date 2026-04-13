import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';
import { FaUserCircle } from 'react-icons/fa';
import { FiMenu, FiX, FiHome, FiCompass, FiInfo, FiMail, FiUser, FiLogOut, FiLayout, FiBookmark } from 'react-icons/fi';
import { getImageUrl } from '../../utils/hostelUtils';
import NotificationBell from './NotificationBell';

export default function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const getAvatarUrl = () => {
    if (user?.profile_image) {
      return getImageUrl(user.profile_image, api.defaults.baseURL);
    }
    return `https://ui-avatars.com/api/?name=${user?.first_name}+${user?.last_name}&background=10b981&color=fff&size=50`;
  };

  // Close dropdown and mobile menu when clicking outside or on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [location.pathname]);

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

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: 'Home', path: '/', icon: FiHome },
    { name: 'Explore Hostels', path: '/explore', icon: FiCompass },
    { name: 'About Us', path: '/about', icon: FiInfo },
    { name: 'Contact', path: '/contact', icon: FiMail },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 relative">
            <div className="flex items-center gap-3">
              {/* Mobile hamburger - Always visible on mobile */}
              <button
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                onClick={onMenuToggle || (() => setMobileMenuOpen(true))}
                aria-label="Toggle menu"
              >
                <FiMenu className="w-5 h-5" />
              </button>

              <Link to="/" className="shrink-0 flex items-center gap-2 group">
                <div className="w-9 h-9 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-sm group-hover:bg-emerald-700 transition-colors">
                  H
                </div>
                <span className="font-bold text-xl text-gray-800 tracking-tight ml-1">HostelHub</span>
              </Link>

              {/* Desktop Links */}
              <div className="hidden lg:flex items-center space-x-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`font-medium text-[15px] transition-colors ${
                      location.pathname === link.path ? 'text-emerald-600' : 'text-gray-600 hover:text-emerald-600'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-4">
              {user ? (
                <div className="flex items-center gap-2 sm:gap-3">
                  <NotificationBell />
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
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <FiLayout className="w-4 h-4" /> Dashboard
                        </Link>
                        <Link
                          to="/dashboard/saved"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <FiBookmark className="w-4 h-4" /> Saved Hostels
                        </Link>
                        <Link
                          to="/dashboard/profile"
                          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <FiUser className="w-4 h-4" /> My Profile
                        </Link>
                        <button
                          onClick={() => {
                            setDropdownOpen(false);
                            handleLogout();
                          }}
                          className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium border-t border-gray-50 mt-1"
                        >
                          <FiLogOut className="w-4 h-4" /> Sign out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <Link
                    to="/register/owner"
                    className="hidden md:block text-emerald-700 hover:bg-emerald-50 font-medium text-sm transition-colors py-2 px-4 rounded-full border border-emerald-200"
                  >
                    List property
                  </Link>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-emerald-700 font-medium text-sm transition-colors py-2 px-3 rounded-lg"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register/student"
                    className="bg-emerald-600 text-white hover:bg-emerald-700 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-sm font-medium shadow-sm transition-all"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div 
        className={`fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[60] transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Sliding Drawer */}
      <div 
        className={`fixed top-0 left-0 bottom-0 w-[280px] bg-white z-[70] shadow-2xl transition-transform duration-300 transform ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center font-bold text-lg">H</div>
              <span className="font-bold text-lg text-gray-800">HostelHub</span>
            </div>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg text-gray-400 hover:bg-gray-50 transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-6 px-4">
            <p className="px-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Navigation</p>
            <div className="space-y-1 mb-8">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-colors ${
                      location.pathname === link.path 
                        ? 'bg-emerald-50 text-emerald-600' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {link.name}
                  </Link>
                );
              })}
            </div>

            {user && (
              <>
                <p className="px-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Account</p>
                <div className="space-y-1">
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-50"
                  >
                    <FiLayout className="w-5 h-5" /> Dashboard
                  </Link>
                  <Link
                    to="/dashboard/profile"
                    className="flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-50"
                  >
                    <FiUser className="w-5 h-5" /> My Profile
                  </Link>
                </div>
              </>
            )}

            {!user && (
              <div className="mt-8 space-y-3 px-2">
                <Link
                  to="/register/owner"
                  className="block w-full text-center bg-emerald-50 text-emerald-700 py-3 rounded-xl font-semibold border border-emerald-100"
                >
                  List Your Property
                </Link>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-100">
            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full bg-red-50 text-red-600 py-3 rounded-xl font-semibold hover:bg-red-100 transition-colors"
              >
                <FiLogOut className="w-5 h-5" /> Sign Out
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  className="flex items-center justify-center bg-gray-50 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register/student"
                  className="flex items-center justify-center bg-emerald-600 text-white py-3 rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
            <p className="mt-4 text-center text-[10px] text-gray-400">
              © {new Date().getFullYear()} HostelHub. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
