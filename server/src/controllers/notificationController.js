import Notification from '../models/Notification.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

export const getNotifications = catchAsync(async (req, res, next) => {
  const query = { userId: req.user.id };
  
  if (req.query.unreadOnly === 'true') {
    query.isRead = false;
  }

  const notifications = await Notification.find(query).sort({ sentAt: -1 }).lean();

  notifications.sort((a, b) => {
    if (a.priority === 'high' && b.priority !== 'high') return -1;
    if (a.priority !== 'high' && b.priority === 'high') return 1;
    return new Date(b.sentAt) - new Date(a.sentAt);
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  res.status(200).json({
    notifications,
    unreadCount
  });
});

export const markNotificationRead = catchAsync(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);
  
  if (!notification) {
    throw new AppError("Notification not found", 404);
  }

  if (notification.userId.toString() !== req.user.id) {
    throw new AppError("Not authorized to access this notification", 403);
  }

  notification.isRead = true;
  await notification.save();

  res.status(200).json({ notification });
});

export const markAllNotificationsRead = catchAsync(async (req, res, next) => {
  const result = await Notification.updateMany(
    { userId: req.user.id, isRead: false },
    { isRead: true }
  );

  res.status(200).json({
    updatedCount: result.modifiedCount
  });
});
