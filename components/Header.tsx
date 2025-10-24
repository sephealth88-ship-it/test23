import React from 'react';
import { MenuIcon } from './icons/MenuIcon';
import { AgentOpsIcon } from './icons/AgentOpsIcon';

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
        <AgentOpsIcon className="w-10 h-10 text-[#009c6d]" />
        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
          AI AgentOps
        </h1>
      </div>
    </header>
  );
};
