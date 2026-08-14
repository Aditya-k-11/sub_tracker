import React, { useState } from 'react';
import Button from '../common/Button';
import { changePassword } from '../../services/userService';

const ChangePasswordForm = ({ showToast }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmNewPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (formData.newPassword.length < 6) {
      showToast('New password must be at least 6 characters long', 'error');
      return;
    }

    setLoading(true);
    try {
      await changePassword(formData.currentPassword, formData.newPassword);
      showToast('Password updated successfully', 'success');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      });
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white/70 mb-1">Current Password</label>
        <input
          type="password"
          name="currentPassword"
          value={formData.currentPassword}
          onChange={handleChange}
          required
          className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-white/70 mb-1">New Password</label>
        <input
          type="password"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
          required
          minLength="6"
          className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-white/70 mb-1">Confirm New Password</label>
        <input
          type="password"
          name="confirmNewPassword"
          value={formData.confirmNewPassword}
          onChange={handleChange}
          required
          minLength="6"
          className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
        />
      </div>
      <div className="pt-2">
        <Button
          type="submit"
          variant="primary"
          disabled={loading || !formData.currentPassword || !formData.newPassword || !formData.confirmNewPassword}
        >
          {loading ? 'Updating...' : 'Update Password'}
        </Button>
      </div>
    </form>
  );
};

export default ChangePasswordForm;
