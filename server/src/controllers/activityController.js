import ActivityLog from '../models/ActivityLog.js';
import catchAsync from '../utils/catchAsync.js';

export const getRecentActivity = catchAsync(async (req, res, next) => {
  const activities = await ActivityLog.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .limit(8);

  res.status(200).json({ activities });
});

export const getActivityHistory = catchAsync(async (req, res, next) => {
  const { action, startDate, endDate, page = 1, limit = 20 } = req.query;

  const query = { userId: req.user.id };

  if (action) {
    query.action = action;
  }

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      query.createdAt.$gte = new Date(startDate);
    }
    if (endDate) {
      // Set to end of day if only date is provided
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 20;
  const skip = (pageNum - 1) * limitNum;

  const [activities, totalCount] = await Promise.all([
    ActivityLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
    ActivityLog.countDocuments(query)
  ]);

  res.status(200).json({
    activities,
    totalCount,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(totalCount / limitNum)
  });
});
