import apiClient from './apiClient';

export const getRecentActivity = async () => {
  const response = await apiClient.get('/activity/recent');
  return response.data;
};

export const getActivityHistory = async (params) => {
  const response = await apiClient.get('/activity/history', { params });
  return response.data;
};
