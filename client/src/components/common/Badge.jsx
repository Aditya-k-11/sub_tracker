import React from 'react';

const variantStyles = {
  active: 'bg-green-500/20 text-green-400 border border-green-500/30',
  paused: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  cancelled: 'bg-white/10 text-white/70 border border-white/20',
  trial: 'bg-primary/20 text-primary border border-primary/30',
  connected: 'bg-green-500/20 text-green-400 border border-green-500/30',
  high: 'bg-green-500/20 text-green-400 border border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  low: 'bg-white/10 text-white/70 border border-white/20',
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
