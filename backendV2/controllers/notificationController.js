const Notification = require('../models/Notification')

exports.getAllNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, notifications });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch notifications' });
    }
}

exports.markReadNotifications = async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user._id, read: false },
            { $set: { read: true } }
        );
        res.status(200).json({ success: true, message: 'Notifications marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to update notifications' });
    }
};