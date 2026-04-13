import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { socket, connectSocket, disconnectSocket } from '../utils/socket';
import { getNotifications, markAsRead, markAllAsRead } from '../api/notification';
import toast from 'react-hot-toast';

export const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    // Fetch notifications when user is logged in
    useEffect(() => {
        if (user) {
            fetchNotifications();
            connectSocket();

            const socketUserId = Number(user?.id ?? user?.user_id);

            if (!Number.isInteger(socketUserId)) {
                return () => {
                    socket.off('new_notification');
                };
            }

            const identifyUser = () => {
                socket.emit('identify', socketUserId);
            };

            if (socket.connected) {
                identifyUser();
            } else {
                socket.once('connect', identifyUser);
            }
            
            // Listen for real-time notifications
            socket.on('new_notification', (notification) => {
                setNotifications(prev => [notification, ...prev]);
                setUnreadCount(prev => prev + 1);
                
                // Show a toast
                toast.success(notification.title, {
                    description: notification.message,
                    icon: '🔔',
                    duration: 5000
                });
            });

            return () => {
                socket.off('connect', identifyUser);
                socket.off('new_notification');
            };
        } else {
            setNotifications([]);
            setUnreadCount(0);
            disconnectSocket();
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const { data } = await getNotifications();
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await markAsRead(notificationId);
            setNotifications(prev => prev.map(n => 
                n.notification_id === notificationId ? { ...n, is_read: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    };

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            loading,
            fetchNotifications,
            markAsRead: handleMarkAsRead,
            markAllAsRead: handleMarkAllAsRead
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
