import apiClient from './apiClient';

export const triggerEmailScan = async () => {
  const response = await apiClient.post('/suggestions/scan');
  return response.data;
};

export const getSuggestions = async () => {
  const response = await apiClient.get('/suggestions');
  return response.data;
};

export const confirmSuggestion = async (id, overrides = {}) => {
  const response = await apiClient.patch(`/suggestions/${id}/confirm`, overrides);
  return response.data;
};

export const dismissSuggestion = async (id) => {
  const response = await apiClient.patch(`/suggestions/${id}/dismiss`);
  return response.data;
};
