import api from './axios';

export const getNotifications = () => api.get('/notifications');

export const markAsRead = (notificationId) => api.patch(`/notifications/${notificationId}/read`);

export const markAllAsRead = () => api.patch('/notifications/read-all');

export default {
    getNotifications,
    markAsRead,
    markAllAsRead
};
