import React from 'react';
import { AgentStatus, WorkflowState } from '../types';
import { MakerAgentIcon } from './icons/MakerAgentIcon';
import { CheckerAgentIcon } from './icons/CheckerAgentIcon';
import { SystemInputAgentIcon } from './icons/SystemInputAgentIcon';
import { UserReviewIcon } from './icons/UserReviewIcon';
import { PlayIcon } from './icons/PlayIcon';

type AgentType = 'maker' | 'checker' | 'systemInput';

interface AgentStatusRowProps {
  name: string;
  status: AgentStatus;
  message?: string;
  agentType: AgentType;
}

const agentConfig = {
  maker: { Icon: MakerAgentIcon },
  checker: { Icon: CheckerAgentIcon },
  systemInput: { Icon: SystemInputAgentIcon },
};

const statusConfig = {
  [AgentStatus.PENDING]: { color: 'text-gray-400', messageColor: 'text-gray-500', label: 'Pending' },
  [AgentStatus.PROCESSING]: { color: 'text-blue-500', messageColor: 'text-blue-500', label: 'Processing...' },
  [AgentStatus.COMPLETED]: { color: 'text-green-500', messageColor: 'text-green-600', label: 'Completed' },
  [AgentStatus.FAILED]: { color: 'text-red-500', messageColor: 'text-red-600', label: 'Failed' },
  [AgentStatus.AWAITING_REVIEW]: { color: 'text-yellow-500', messageColor: 'text-yellow-600', label: 'Awaiting Review' },
};

const AgentStatusRow: React.FC<AgentStatusRowProps> = ({ name, status, message, agentType }) => {
  const AgentIcon = agentConfig[agentType].Icon;
  const { color, messageColor, label } = statusConfig[status];
  const isProcessing = status === AgentStatus.PROCESSING;
  const IconToShow = status === AgentStatus.AWAITING_REVIEW ? UserReviewIcon : AgentIcon;

  return (
    <div className="relative flex items-start">
      <div className="z-10 w-8 h-8 flex-shrink-0 flex items-center justify-center bg-white rounded-full border-4 border-white">
        <IconToShow className={`w-6 h-6 ${color} ${isProcessing ? 'animate-spin' : ''}`} />
      </div>
      <div className="ml-4 flex-1 pt-1">
        <p className="font-semibold text-gray-800">{name}</p>
        <p className={`text-sm ${messageColor} font-medium transition-all duration-300`}>
          {message || label}
        </p>
      </div>
    </div>
  );
};

interface WorkflowStatusProps {
    workflowState: WorkflowState;
    onConfirmSystemInput?: () => void;
}

export const WorkflowStatus: React.FC<WorkflowStatusProps> = ({ workflowState, onConfirmSystemInput }) => {
  return (
    <div className="relative p-2">
      <div className="absolute left-6 top-5 bottom-5 w-0.5 bg-gray-200/80" />
      <div className="space-y-6">
        <AgentStatusRow 
          name="Maker AI Agent" 
          agentType="maker"
          status={workflowState.maker.status} 
          message={workflowState.maker.message} 
        />
        <AgentStatusRow 
          name="Checker AI Agent" 
          agentType="checker"
          status={workflowState.checker.status} 
          message={workflowState.checker.message} 
        />
        <div>
            <AgentStatusRow 
            name="System Input AI Agent" 
            agentType="systemInput"
            status={workflowState.systemInput.status} 
            message={workflowState.systemInput.message} 
            />
            {workflowState.systemInput.status === AgentStatus.AWAITING_REVIEW && onConfirmSystemInput && (
                <div className="pl-12 pt-3 animate-fade-in">
                    <button 
                        onClick={() => onConfirmSystemInput()}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
                    >
                        <PlayIcon className="w-5 h-5" />
                        <span>Confirm and Proceed</span>
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};