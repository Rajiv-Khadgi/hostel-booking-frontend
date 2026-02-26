import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';
import {
    FaHome,
    FaBuilding,
    FaBed,
    FaCalendarAlt,
    FaComments,
    FaSignOutAlt,
    FaUser,
    FaHeart
} from 'react-icons/fa';

export default function Sidebar() {
    const { user, logout } = useAuth();

    const getAvatarUrl = () => {
        if (user?.profile_image) {
            return api.defaults.baseURL.replace('/api', '') + '/' + user.profile_image;
        }
        return `https://ui-avatars.com/api/?name=${user?.first_name}+${user?.last_name}&background=10b981&color=fff&size=50`;
    };

    const studentLinks = [
        { name: 'Overview', path: '/dashboard', icon: FaHome, exact: true },
        { name: 'My Profile', path: '/dashboard/profile', icon: FaUser },
        { name: 'My Bookings', path: '/dashboard/bookings', icon: FaCalendarAlt },
        { name: 'Saved Hostels', path: '/dashboard/saved', icon: FaHeart },
        { name: 'Chats', path: '/dashboard/chat', icon: FaComments },
    ];

    const ownerLinks = [
        { name: 'Overview', path: '/dashboard', icon: FaHome, exact: true },
        { name: 'My Hostels', path: '/dashboard/hostels', icon: FaBuilding },
        { name: 'Rooms', path: '/dashboard/rooms', icon: FaBed },
        { name: 'Bookings', path: '/dashboard/bookings', icon: FaCalendarAlt },
        { name: 'Chats', path: '/dashboard/chat', icon: FaComments },
    ];

    const links = user?.role === 'owner' ? ownerLinks : studentLinks;

    return (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-[calc(100vh-4rem)] sticky top-16">
            <div className="p-6">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                    {user?.role === 'owner' ? 'Owner Menu' : 'Student Menu'}
                </h2>
                <nav className="space-y-1">
                    {links.map((link) => {
                        const Icon = link.icon;
                        return (
                            <NavLink
                                key={link.name}
                                to={link.path}
                                end={link.exact}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                                        ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100/50'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                                    }`
                                }
                            >
                                <Icon className={`w-5 h-5 ${location.pathname === link.path ? 'opacity-100' : 'opacity-70'}`} />
                                {link.name}
                            </NavLink>
                        );
                    })}
                </nav>
            </div>
            <div className="mt-auto border-t border-gray-100">
                <NavLink
                    to="/dashboard/profile"
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50 ${isActive ? 'bg-emerald-50' : ''}`
                    }
                >
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 shrink-0">
                        <img
                            src={getAvatarUrl()}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold text-gray-900 truncate">{user?.first_name} {user?.last_name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                </NavLink>
                <div className="p-4">
                    <button
                        onClick={logout}
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                    >
                        <FaSignOutAlt className="w-5 h-5 opacity-70" />
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}
