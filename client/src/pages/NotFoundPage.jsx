import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary-600 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Page Not Found</h2>
        <Link to="/" className="bg-primary-600 text-white px-6 py-2 rounded hover:bg-primary-700 transition">
          Return Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
