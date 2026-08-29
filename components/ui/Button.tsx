'use client';

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-lg';

  const variantStyles = {
    default: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm focus:ring-indigo-500',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 focus:ring-slate-700',
    outline: 'border border-slate-700 hover:bg-slate-800 text-slate-200 focus:ring-slate-700',
    ghost: 'hover:bg-slate-800/60 text-slate-300 hover:text-white',
    destructive: 'bg-rose-600 hover:bg-rose-500 text-white focus:ring-rose-500'
  };

  const sizeStyles = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3.5 py-1.5 text-xs',
    lg: 'px-4 py-2 text-sm'
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
