import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';
import {
    FaHome,
    FaBuilding,
    FaBed,
    FaCalendarAlt,
    FaCalendarCheck,
    FaComments,
    FaSignOutAlt,
    FaUser,
    FaHeart,
    FaStar,
    FaChartLine,
    FaCreditCard
} from 'react-icons/fa';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export default function Sidebar({ isCollapsed, onToggleCollapse, isMobileOpen, onMobileClose }) {
    const { user, logout } = useAuth();
    const location = useLocation();

    const getAvatarUrl = () => {
        if (user?.profile_image) {
            return api.defaults.baseURL.replace('/api', '') + '/' + user.profile_image;
        }
        return `https://ui-avatars.com/api/?name=${user?.first_name}+${user?.last_name}&background=10b981&color=fff&size=50`;
    };

    const studentLinks = [
        { name: 'Overview',          path: '/dashboard',          icon: FaHome,         exact: true },
        { name: 'My Profile',        path: '/dashboard/profile',  icon: FaUser },
        { name: 'My Bookings',       path: '/dashboard/bookings', icon: FaCalendarAlt },
        { name: 'Saved Hostels',     path: '/dashboard/saved',    icon: FaHeart },
        { name: 'Scheduled Visits',  path: '/dashboard/visits',   icon: FaCalendarCheck },
        { name: 'Payments',          path: '/dashboard/payments', icon: FaCreditCard },
        { name: 'Chats',             path: '/dashboard/chat',     icon: FaComments },
    ];

    const ownerLinks = [
        { name: 'Dashboard',         path: '/dashboard/owner',          icon: FaChartLine },
        { name: 'My Hostels',        path: '/dashboard/hostels',        icon: FaBuilding },
        { name: 'Property Reviews',  path: '/dashboard/hostel-reviews', icon: FaStar },
        { name: 'Rooms',             path: '/dashboard/rooms',          icon: FaBed },
        { name: 'Bookings',          path: '/dashboard/bookings',       icon: FaCalendarAlt },
        { name: 'Scheduled Visits',  path: '/dashboard/visits',         icon: FaCalendarCheck },
        { name: 'Payments',          path: '/dashboard/payments',       icon: FaCreditCard },
        { name: 'Chats',             path: '/dashboard/chat',           icon: FaComments },
    ];

    const adminLinks = [
        { name: 'Dashboard',      path: '/dashboard',               icon: FaChartLine },
        { name: 'Manage Users',   path: '/dashboard/admin/users',   icon: FaUser },
        { name: 'Manage Hostels', path: '/dashboard/admin/hostels', icon: FaBuilding },
        { name: 'Manage Reviews', path: '/dashboard/admin/reviews', icon: FaStar },
        { name: 'All Payments',   path: '/dashboard/payments',      icon: FaCreditCard },
        { name: 'All Bookings',   path: '/dashboard/bookings',      icon: FaCalendarAlt },
        { name: 'Chats',          path: '/dashboard/chat',          icon: FaComments },
    ];

    const getMenu = () => {
        if (user?.role === 'admin') return { title: 'Admin Menu',   links: adminLinks };
        if (user?.role === 'owner') return { title: 'Owner Menu',   links: ownerLinks };
        return                             { title: 'Student Menu', links: studentLinks };
    };

    const menu = getMenu();

    return (
        <div className={`
            fixed top-16 left-0 z-40
            bg-white border-r border-gray-200
            flex flex-col overflow-hidden
            h-[calc(100vh-4rem)]
            transition-all duration-300 ease-in-out
            ${isCollapsed ? 'w-16' : 'w-64'}
            ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
            {/* Top header: menu title + collapse toggle */}
            <div className={`flex items-center shrink-0 border-b border-gray-100 ${isCollapsed ? 'justify-center py-3 px-2' : 'justify-between px-4 py-3'}`}>
                {!isCollapsed && (
                    <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                        {menu.title}
                    </h2>
                )}
                <button
                    onClick={onToggleCollapse}
                    className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-gray-100 transition-colors shrink-0"
                    aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {isCollapsed ? <FiChevronRight className="w-4 h-4" /> : <FiChevronLeft className="w-4 h-4" />}
                </button>
            </div>

            {/* Nav links */}
            <div className={`flex-1 overflow-y-auto ${isCollapsed ? 'px-2 py-4' : 'p-4'}`}>
                <nav className="space-y-0.5">
                    {menu.links.map((link) => {
                        const Icon = link.icon;
                        return (
                            <NavLink
                                key={link.name}
                                to={link.path}
                                end={link.exact}
                                onClick={isMobileOpen ? onMobileClose : undefined}
                                title={isCollapsed ? link.name : undefined}
                                className={({ isActive }) =>
                                    `flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                                    ${isCollapsed ? 'justify-center' : 'gap-3'}
                                    ${isActive
                                        ? 'bg-emerald-50 text-emerald-700 shadow-sm border border-emerald-100/50'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'opacity-100' : 'opacity-60'}`} />
                                        {!isCollapsed && <span className="truncate">{link.name}</span>}
                                    </>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            {/* User section */}
            <div className="border-t border-gray-100 shrink-0">
                <NavLink
                    to="/dashboard/profile"
                    onClick={isMobileOpen ? onMobileClose : undefined}
                    title={isCollapsed ? `${user?.first_name} ${user?.last_name}` : undefined}
                    className={({ isActive }) =>
                        `flex items-center hover:bg-gray-50 transition-colors border-b border-gray-100
                        ${isCollapsed ? 'justify-center px-2 py-3' : 'gap-3 px-4 py-3'}
                        ${isActive ? 'bg-emerald-50' : ''}`
                    }
                >
                    <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 shrink-0">
                        <img
                            src={getAvatarUrl()}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    {!isCollapsed && (
                        <div className="overflow-hidden">
                            <p className="text-sm font-semibold text-gray-900 truncate">{user?.first_name} {user?.last_name}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                    )}
                </NavLink>
                <div className={isCollapsed ? 'px-2 py-2' : 'px-3 py-2'}>
                    <button
                        onClick={logout}
                        title={isCollapsed ? 'Logout' : undefined}
                        className={`flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-500 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors
                            ${isCollapsed ? 'justify-center' : 'gap-3'}`}
                    >
                        <FaSignOutAlt className="w-4 h-4 shrink-0" />
                        {!isCollapsed && <span>Logout</span>}
                    </button>
                </div>
            </div>
        </div>
    );
}
