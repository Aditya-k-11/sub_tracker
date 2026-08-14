import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import { deleteAccount } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import Modal from '../common/Modal';

const DeleteAccountSection = ({ showToast }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!password) return;
    
    setLoading(true);
    try {
      await deleteAccount(password);
      showToast('Account deleted successfully', 'success');
      setIsModalOpen(false);
      
      // Brief delay before redirecting to let the user see the toast
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 1500);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to delete account', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 sm:p-8">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-red-400">Danger Zone</h3>
        <p className="text-sm text-red-400/70 mt-1">
          Once you delete your account, there is no going back. Please be certain.
        </p>
      </div>
      <Button
        variant="danger"
        onClick={() => setIsModalOpen(true)}
      >
        Delete Account
      </Button>

      <Modal
        isOpen={isModalOpen}
        onClose={() => !loading && setIsModalOpen(false)}
        title="Delete Account"
      >
        <div className="space-y-4">
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
            <p className="font-semibold mb-1">Warning: Irreversible Action</p>
            <p>
              This will permanently delete your account and remove all your data from our servers. 
              This includes all subscriptions, history, and settings.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">
              Please enter your password to confirm
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50 transition-colors"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={!password || loading}
            >
              {loading ? 'Deleting...' : 'Yes, delete my account'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DeleteAccountSection;
