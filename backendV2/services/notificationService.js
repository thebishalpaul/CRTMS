const Notification = require("../models/Notification");

class NotificationService {
    async createNotification({ user, message, read }, session) {
        try {
            const notification = await Notification.create(
                [
                    {
                        user,
                        message,
                        read,
                    },
                ],
                { session }
            );
            return notification;
        } catch (error) {
            console.error("Error creating notification:", error.message);
            throw new Error("Failed to create notification entry");
        }
    }
}

module.exports = new NotificationService();