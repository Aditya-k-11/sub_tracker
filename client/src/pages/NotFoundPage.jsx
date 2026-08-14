import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      <div className="text-center bg-gradient-to-br from-brand-bg/90 via-primary/20 to-brand-bg/90 bg-[length:200%_200%] animate-gradient-shift backdrop-blur-md border border-white/10 shadow-xl shadow-primary/5 rounded-2xl p-12">
        <h1 className="text-6xl font-bold text-primary-500 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-6">Page Not Found</h2>
        <Link to="/" className="bg-primary-500 hover:bg-primary-400 text-white px-6 py-3 rounded-lg font-medium transition-colors">
          Return Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
