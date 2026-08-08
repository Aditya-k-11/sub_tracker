import apiClient from './apiClient';

export const getGmailStatus = async () => {
  const response = await apiClient.get('/auth/google/status');
  return response.data;
};

export const initiateGmailConnect = async () => {
  const response = await apiClient.get('/auth/google/connect');
  return response.data;
};

export const disconnectGmail = async () => {
  const response = await apiClient.post('/auth/google/disconnect');
  return response.data;
};
