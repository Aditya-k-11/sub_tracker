import apiClient from './apiClient';

export const getCurrentUser = async () => {
  const response = await apiClient.get('/users/me');
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await apiClient.patch('/users/me', data);
  return response.data;
};

export const changePassword = async (currentPassword, newPassword) => {
  const response = await apiClient.post('/users/me/change-password', { currentPassword, newPassword });
  return response.data;
};

export const updateNotificationPreferences = async (prefs) => {
  const response = await apiClient.patch('/users/me/notification-preferences', { notificationPreferences: prefs });
  return response.data;
};

export const deleteAccount = async (password) => {
  const response = await apiClient.delete('/users/me', { data: { password } });
  return response.data;
};

export const completeOnboarding = async () => {
  const response = await apiClient.patch('/users/me/complete-onboarding');
  return response.data;
};
