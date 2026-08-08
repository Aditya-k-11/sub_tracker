import React from 'react';
import { motion } from 'framer-motion';
import Spinner from './Spinner';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const baseClasses = 'inline-flex justify-center items-center font-medium rounded-lg focus:outline-none transition-colors duration-200 relative';
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  };

  const variantClasses = {
    primary: 'text-white bg-gradient-to-r from-primary-600 to-primary-500 hover:shadow-glow-primary border border-transparent',
    secondary: 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50',
    danger: 'text-white bg-gradient-to-r from-danger-600 to-danger-500 hover:shadow-glow-danger border border-transparent',
    ghost: 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-transparent'
  };

  const spinnerColorClass = {
    primary: 'border-t-white',
    secondary: 'border-t-primary-600',
    danger: 'border-t-white',
    ghost: 'border-t-gray-600'
  };

  const disabledClasses = disabled || loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer';

  return (
    <motion.button
      type={type}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabledClasses} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={disabled || loading ? {} : { scale: 1.03 }}
      whileTap={disabled || loading ? {} : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      {...props}
    >
      <span className={loading ? 'opacity-0' : 'opacity-100 flex items-center justify-center'}>
        {children}
      </span>
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner size="sm" colorClass={spinnerColorClass[variant]} />
        </span>
      )}
    </motion.button>
  );
};

export default Button;
