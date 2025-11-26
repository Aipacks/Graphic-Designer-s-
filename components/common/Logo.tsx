
import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = 'h-10' }) => (
  <div className={`flex items-center ${className}`}>
     <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-auto">
        <path d="M20 0L40 40H0L20 0Z" fill="url(#gradient-1)" />
        <path d="M25 5L40 35H10L25 5Z" fill="url(#gradient-2)" opacity="0.6" />
        <defs>
        <linearGradient id="gradient-1" x1="20" y1="0" x2="20" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4338CA" />
            <stop offset="1" stopColor="#6366F1" />
        </linearGradient>
        <linearGradient id="gradient-2" x1="25" y1="5" x2="25" y2="35" gradientUnits="userSpaceOnUse">
            <stop stopColor="#10B981" />
            <stop offset="1" stopColor="#34D399" />
        </linearGradient>
        </defs>
    </svg>
    <span className="text-xl font-bold text-text ml-3 hidden sm:inline">Designer's Toolkit</span>
  </div>
);
