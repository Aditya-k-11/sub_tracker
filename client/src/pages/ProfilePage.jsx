import React, { useState, useEffect } from 'react';
import { getCurrentUser, updateProfile } from '../services/userService';
import ChangePasswordForm from '../components/profile/ChangePasswordForm';
import DeleteAccountSection from '../components/profile/DeleteAccountSection';
import NotificationPreferences from '../components/profile/NotificationPreferences';
import Button from '../components/common/Button';
import Toast from '../components/common/Toast';
import { User, Shield, Bell, AlertTriangle } from 'lucide-react';
import PageTransition from '../components/common/PageTransition';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { updateUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [formData, setFormData] = useState({ name: '', currency: 'USD' });
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => setToast({ message, type });
  const dismissToast = () => setToast(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getCurrentUser();
        setUser(data.user);
        setFormData({ name: data.user.name, currency: data.user.currency });
      } catch (error) {
        showToast('Failed to load profile', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const data = await updateProfile(formData);
      setUser(data.user);
      updateUser(data.user);
      showToast('Profile updated successfully', 'success');
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePrefsChange = (newPrefs) => {
    setUser((prev) => ({
      ...prev,
      notificationPreferences: newPrefs
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <PageTransition>
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onDismiss={dismissToast} 
        />
      )}
      <div className="max-w-3xl mx-auto space-y-8 pb-12">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Account Settings</h1>
          <p className="text-white/60">Manage your profile, preferences, and security.</p>
        </div>

        {/* Profile Information */}
        <section className="bg-brand-bg/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary-500/20 rounded-lg">
              <User className="w-5 h-5 text-primary-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Profile Information</h2>
          </div>
          
          <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Email Address</label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full bg-white/5 border border-transparent rounded-xl px-4 py-2.5 text-white/50 cursor-not-allowed"
                title="Email cannot be changed"
              />
              <p className="text-xs text-white/40 mt-1">To change your email, please contact support.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Preferred Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full bg-brand-bg border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="INR">INR (?)</option>
                <option value="AUD">AUD ($)</option>
                <option value="CAD">CAD ($)</option>
              </select>
            </div>
            <div className="pt-2">
              <Button type="submit" variant="primary" disabled={savingProfile}>
                {savingProfile ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </form>
        </section>

        {/* Notification Preferences */}
        <section className="bg-brand-bg/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary-500/20 rounded-lg">
              <Bell className="w-5 h-5 text-primary-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Notification Preferences</h2>
          </div>
          <div className="max-w-md">
            <NotificationPreferences 
              preferences={user.notificationPreferences} 
              onChange={handlePrefsChange} 
              showToast={showToast}
            />
          </div>
        </section>

        {/* Security / Change Password */}
        <section className="bg-brand-bg/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary-500/20 rounded-lg">
              <Shield className="w-5 h-5 text-primary-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Security</h2>
          </div>
          <div className="max-w-md">
            <ChangePasswordForm showToast={showToast} />
          </div>
        </section>

        {/* Danger Zone */}
        <section className="pt-6">
          <DeleteAccountSection showToast={showToast} />
        </section>
      </div>
    </PageTransition>
  );
};

export default ProfilePage;
