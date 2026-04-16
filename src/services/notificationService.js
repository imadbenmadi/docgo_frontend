import api from "./apiClient";

const notificationService = {
    // Get current user's notifications
    // Backend: GET /notifications?page&limit&status
    getNotifications: async ({ page = 1, limit = 50, status = "all" } = {}) => {
        try {
            const response = await api.get(`/notifications`, {
                params: { page, limit, status },
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    // Mark notification as read
    markAsRead: async (notificationId) => {
        try {
            const response = await api.patch(
                `/notifications/${notificationId}/read`,
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    // Mark all as read
    markAllAsRead: async () => {
        try {
            const response = await api.patch(`/notifications/read-all`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    // Get unread notifications count
    getUnreadCount: async () => {
        try {
            const response = await api.get(`/notifications/unread-count`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    // Delete notification
    deleteNotification: async (notificationId) => {
        try {
            const response = await api.delete(
                `/notifications/${notificationId}`,
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

export default notificationService;
