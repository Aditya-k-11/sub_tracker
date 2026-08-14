import apiClient from './apiClient';

export const getSubscriptions = async (params) => {
  const response = await apiClient.get('/subscriptions', { params });
  return response.data;
};

export const getSubscriptionById = async (id) => {
  const response = await apiClient.get(`/subscriptions/${id}`);
  return response.data;
};

export const createSubscription = async (data) => {
  const response = await apiClient.post('/subscriptions', data);
  return response.data;
};

export const updateSubscription = async (id, data) => {
  const response = await apiClient.patch(`/subscriptions/${id}`, data);
  return response.data;
};

export const cancelSubscription = async (id) => {
  const response = await apiClient.delete(`/subscriptions/${id}`);
  return response.data;
};

export const logUsage = async (id, note) => {
  const response = await apiClient.post(`/subscriptions/${id}/usage`, { note });
  return response.data;
};

export const getUsageLogs = async (id) => {
  const response = await apiClient.get(`/subscriptions/${id}/usage`);
  return response.data;
};

export const getUsageSummary = async (id) => {
  const response = await apiClient.get(`/subscriptions/${id}/usage/summary`);
  return response.data;
};

export const getSubscriptionDetail = async (id) => {
  const response = await apiClient.get(`/subscriptions/${id}/detail`);
  return response.data;
};

export const updateSubscriptionNotes = async (id, notes) => {
  const response = await apiClient.patch(`/subscriptions/${id}/notes`, { notes });
  return response.data;
};

export const deleteUsageLog = async (id, usageId) => {
  const response = await apiClient.delete(`/subscriptions/${id}/usage/${usageId}`);
  return response.data;
};
