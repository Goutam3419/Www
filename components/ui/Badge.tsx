'use client';

import React from 'react';

export interface BadgeProps {
  variant?: 'default' | 'info' | 'success' | 'warning' | 'destructive' | 'outline';
  className?: string;
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  className = '',
  children
}) => {
  const base = 'inline-flex items-center font-mono text-[11px] font-medium px-2 py-0.5 rounded';

  const styles = {
    default: 'bg-slate-800 text-slate-300 border border-slate-700',
    info: 'bg-blue-950/80 text-blue-300 border border-blue-800/80',
    success: 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/80',
    warning: 'bg-amber-950/80 text-amber-300 border border-amber-800/80',
    destructive: 'bg-rose-950/80 text-rose-300 border border-rose-800/80',
    outline: 'border border-slate-700 text-slate-400'
  };

  return (
    <span className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </span>
  );
};
