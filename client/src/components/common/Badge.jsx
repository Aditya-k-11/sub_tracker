import React from 'react';

const variantStyles = {
  active: 'bg-green-100 text-green-800',
  paused: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-gray-100 text-gray-800',
  trial: 'bg-purple-100 text-purple-800',
};

const Badge = ({ text, variant = 'active' }) => {
  const style = variantStyles[variant] || variantStyles.active;
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {text}
    </span>
  );
};

export default Badge;
