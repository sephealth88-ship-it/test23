import React from 'react';
import { MenuIcon } from './icons/MenuIcon';

interface HeaderProps {
  onToggleDashboard: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleDashboard }) => {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/80 h-16 flex items-center px-4 lg:px-6 sticky top-0 z-10 flex-shrink-0">
      <button 
        onClick={onToggleDashboard} 
        className="p-2 rounded-full hover:bg-gray-200/80 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#009c6d] mr-2"
        aria-label="Toggle dashboard"
      >
        <MenuIcon className="w-6 h-6 text-gray-600" />
      </button>
      <div className="flex items-center gap-3">
        <svg
          className="w-8 h-8 text-[#009c6d]"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
          AI Invoice Processor
        </h1>
      </div>
    </header>
  );
};