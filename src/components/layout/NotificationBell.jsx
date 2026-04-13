import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { HiBell, HiCheckCircle, HiMail, HiClock, HiTrash, HiCreditCard, HiCalendar } from 'react-icons/hi';
import { useNotifications } from '../../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

const getNotificationIcon = (type) => {
    switch (type) {
        case 'booking_request':
            return <HiCalendar className="w-5 h-5 text-blue-500" />;
        case 'booking_approved':
            return <HiCheckCircle className="w-5 h-5 text-emerald-500" />;
        case 'booking_rejected':
            return <HiTrash className="w-5 h-5 text-red-500" />;
        case 'payment_success':
            return <HiCreditCard className="w-5 h-5 text-emerald-500" />;
        case 'message_received':
            return <HiMail className="w-5 h-5 text-amber-500" />;
        case 'visit_scheduled':
        case 'visit_request':
            return <HiClock className="w-5 h-5 text-blue-500" />;
        default:
            return <HiBell className="w-5 h-5 text-gray-500" />;
    }
};

const getNotificationLink = (notification) => {
    switch (notification.type) {
        case 'booking_request':
        case 'booking_approved':
        case 'booking_rejected':
            return '/dashboard/bookings';
        case 'message_received':
            return '/dashboard/chat';
        case 'payment_success':
            return '/dashboard/payments';
        case 'visit_scheduled':
        case 'visit_request':
            return '/dashboard/visits';
        default:
            return '/dashboard';
    }
};

export default function NotificationBell() {
    const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();

    return (
        <Menu as="div" className="relative inline-block text-left">
            <div>
                <Menu.Button className="relative p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all duration-200 outline-none">
                    <HiBell className="w-6 h-6" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Menu.Button>
            </div>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="absolute right-0 mt-3 w-80 md:w-96 origin-top-right divide-y divide-gray-100 rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 focus:outline-none z-50 overflow-hidden">
                    <div className="px-4 py-3 flex items-center justify-between bg-white border-b border-gray-50">
                        <h3 className="text-base font-bold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                        {notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <Menu.Item key={notification.notification_id}>
                                    {({ active }) => (
                                        <div
                                            className={`${
                                                active ? 'bg-emerald-50/50' : 'bg-white'
                                            } ${!notification.is_read ? 'bg-emerald-50/20' : ''} transition-colors group relative`}
                                        >
                                            <Link
                                                to={getNotificationLink(notification)}
                                                onClick={() => !notification.is_read && markAsRead(notification.notification_id)}
                                                className="flex gap-4 p-4"
                                            >
                                                <div className="shrink-0 mt-1">
                                                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 group-hover:scale-110 transition-transform duration-200">
                                                        {getNotificationIcon(notification.type)}
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className={`text-sm font-bold truncate ${!notification.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                                                            {notification.title}
                                                        </p>
                                                        {!notification.is_read && (
                                                            <span className="flex-shrink-0 w-2 h-2 rounded-full bg-emerald-500"></span>
                                                        )}
                                                    </div>
                                                    <p className={`text-xs mt-0.5 line-clamp-2 ${!notification.is_read ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1 font-medium italic">
                                                        <HiClock className="w-3 h-3" />
                                                        {formatDistanceToNow(new Date(notification.created_at || notification.createdAt), { addSuffix: true })}
                                                    </p>
                                                </div>
                                            </Link>
                                        </div>
                                    )}
                                </Menu.Item>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <HiBell className="w-8 h-8 text-gray-300" />
                                </div>
                                <p className="text-sm font-bold text-gray-900">No notifications yet</p>
                                <p className="text-xs text-gray-500 mt-1 max-w-[15rem]">
                                    We'll notify you when something important happens!
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="p-3 bg-gray-50 border-t border-gray-100 text-center">
                        <Link to="/dashboard" className="text-xs font-bold text-gray-500 hover:text-emerald-600 transition-colors uppercase tracking-wider">
                            View All In Dashboard
                        </Link>
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    );
}
