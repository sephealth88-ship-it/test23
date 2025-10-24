import React from 'react';
import { AgentStatus, WorkflowState } from '../types';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { ClockIcon } from './icons/ClockIcon';

interface AgentStatusRowProps {
  name: string;
  status: AgentStatus;
  message?: string;
}

const statusConfig = {
  [AgentStatus.PENDING]: { Icon: ClockIcon, color: 'text-gray-500', label: 'Pending' },
  [AgentStatus.PROCESSING]: { Icon: SpinnerIcon, color: 'text-blue-500', label: 'Processing...' },
  [AgentStatus.COMPLETED]: { Icon: CheckCircleIcon, color: 'text-green-500', label: 'Completed' },
  [AgentStatus.FAILED]: { Icon: XCircleIcon, color: 'text-red-500', label: 'Failed' },
};

const AgentStatusRow: React.FC<AgentStatusRowProps> = ({ name, status, message }) => {
  const { Icon, color, label } = statusConfig[status];
  
  return (
    <div className="flex items-start gap-4 p-2 rounded-lg transition-all duration-300">
      <div className="w-6 h-6 flex-shrink-0 mt-1">
        <Icon className={`w-full h-full ${color}`} />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-gray-800">{name}</p>
        <p className={`text-sm ${color} transition-all duration-300`}>{message || label}</p>
      </div>
    </div>
  );
};

export const WorkflowStatus: React.FC<{ workflowState: WorkflowState }> = ({ workflowState }) => {
  return (
    <div className="space-y-2 -m-2">
      <AgentStatusRow 
        name="1. Maker AI Agent" 
        status={workflowState.maker.status} 
        message={workflowState.maker.message} 
      />
      <AgentStatusRow 
        name="2. Checker AI Agent" 
        status={workflowState.checker.status} 
        message={workflowState.checker.message} 
      />
      <AgentStatusRow 
        name="3. System Input AI Agent" 
        status={workflowState.systemInput.status} 
        message={workflowState.systemInput.message} 
      />
    </div>
  );
};
