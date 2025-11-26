
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-surface p-6 rounded-lg shadow-sm border border-border transition-shadow hover:shadow-lg ${className}`}>
      {children}
    </div>
  );
};
