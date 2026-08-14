import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import AnimatedBackground from '../components/common/AnimatedBackground';
import Button from '../components/common/Button';
import PageTransition from '../components/common/PageTransition';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currency, setCurrency] = useState('INR');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await registerUser({ name, email, password, currency });
      login(data.user, data.token);
      navigate('/');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        if (err.response.data.details) {
          const messages = err.response.data.details.map(d => d.message).join(', ');
          setError(messages);
        } else {
          setError(err.response.data.error);
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent relative flex items-center justify-center p-4">
      <AnimatedBackground />
      <PageTransition className="w-full max-w-md z-10">
        <div className="bg-gradient-to-br from-brand-bg/90 via-primary/20 to-brand-bg/90 bg-[length:200%_200%] animate-gradient-shift backdrop-blur-xl backdrop-blur-xl border border-white/40 shadow-xl shadow-primary-900/5 p-8 rounded-2xl w-full">
        <h1 className="text-3xl font-bold text-center text-primary-600 mb-6">Create Account</h1>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white/80 font-medium mb-1">Name</label>
            <input 
              type="text" 
              required
              className="w-full bg-black/20 text-white border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-white/80 font-medium mb-1">Email</label>
            <input 
              type="email" 
              required
              className="w-full bg-black/20 text-white border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-white/80 font-medium mb-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full bg-black/20 text-white border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-white/80 font-medium mb-1">Currency</label>
            <select 
              className="w-full bg-black/20 text-white border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
          <Button 
            type="submit" 
            className="w-full"
            loading={loading}
          >
            Create Account
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-white/60">
          Already have an account? <Link to="/login" className="text-primary-600 hover:underline">Log in</Link>
        </p>
      </div>
      </PageTransition>
    </div>
  );
};

export default RegisterPage;
