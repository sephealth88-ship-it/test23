import React from 'react';
import { PlayIcon } from './icons/PlayIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface WorkflowStarterProps {
  onStart: () => void;
  isLoading: boolean;
}

export const WorkflowStarter: React.FC<WorkflowStarterProps> = ({ onStart, isLoading }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-800">Ready to Process Your Document?</h2>
        <p className="mt-2 text-lg text-gray-600">Click the button below to start the workflow.</p>
        <button
          onClick={onStart}
          disabled={isLoading}
          className="mt-8 inline-flex items-center gap-3 bg-[#009c6d] hover:bg-[#008a60] text-white font-bold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
        >
          {isLoading ? (
            <>
              <SpinnerIcon className="w-6 h-6" />
              <span>Starting...</span>
            </>
          ) : (
            <>
              <PlayIcon className="w-6 h-6" />
              <span>Start Workflow</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
