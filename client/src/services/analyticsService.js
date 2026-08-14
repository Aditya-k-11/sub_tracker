import apiClient from './apiClient';

export const getSpendSummary = async () => {
  const response = await apiClient.get('/analytics/summary');
  return response.data;
};

export const getCategoryBreakdown = async () => {
  const response = await apiClient.get('/analytics/categories');
  return response.data;
};

export const getSpendTrend = async () => {
  const response = await apiClient.get('/analytics/trend');
  return response.data;
};

export const getWastedSpend = async () => {
  const response = await apiClient.get('/analytics/wasted');
  return response.data;
};

export const getNotifications = async (unreadOnly = false) => {
  const response = await apiClient.get('/notifications', { params: { unreadOnly } });
  return response.data;
};

export const markNotificationRead = async (id) => {
  const response = await apiClient.patch(`/notifications/${id}/read`);
  return response.data;
};

export const markAllNotificationsRead = async () => {
  const response = await apiClient.patch('/notifications/read-all');
  return response.data;
};

export const getUpcomingTimeline = async () => {
  const response = await apiClient.get('/analytics/upcoming-timeline');
  return response.data;
};

export const getSpendingVelocity = async () => {
  const response = await apiClient.get('/analytics/velocity');
  return response.data;
};

export const getInsights = async () => {
  const response = await apiClient.get('/analytics/insights');
  return response.data;
};

export const getCategoryDetail = async (category) => {
  const response = await apiClient.get(`/analytics/category/${encodeURIComponent(category)}`);
  return response.data;
};