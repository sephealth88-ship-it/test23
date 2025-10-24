import React from 'react';
import type { Invoice } from '../types';
import { OverallStatus } from '../types';
import { FileIcon } from './icons/FileIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { XCircleIcon } from './icons/XCircleIcon';

interface DashboardProps {
  invoices: Invoice[];
  isOpen: boolean;
}

interface StatusIndicatorProps {
  status: OverallStatus;
}


const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  switch (status) {
    case OverallStatus.COMPLETED:
      return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    case OverallStatus.PROCESSING:
      return <SpinnerIcon className="w-5 h-5 text-blue-500" />;
    case OverallStatus.FAILED:
      return <XCircleIcon className="w-5 h-5 text-red-500" />;
    default:
      return null;
  }
};

export const Dashboard: React.FC<DashboardProps> = ({
  invoices,
  isOpen,
}) => {
  return (
    <aside
      className={`flex-shrink-0 bg-white border-r border-gray-200/80 transition-all duration-300 ease-in-out ${
        isOpen ? 'w-full max-w-sm md:w-1/3' : 'w-0 border-r-0'
      }`}
    >
      <div
        className={`h-full flex flex-col transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="p-4 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-800 px-2 whitespace-nowrap">
            Processed Documents
          </h2>
        </div>
        <div className="flex-grow overflow-y-auto custom-scrollbar p-4 pt-0 space-y-2">
          {invoices.length === 0 ? (
            <p className="text-center text-gray-500 mt-8 px-2">
              No documents processed yet.
            </p>
          ) : (
            invoices.map(invoice => (
              <div
                key={invoice.id}
                className="w-full text-left p-3 rounded-lg flex items-center gap-4 bg-gray-50 border border-gray-200/80"
              >
                <FileIcon className="w-6 h-6 flex-shrink-0 text-gray-400" />
                <div className="flex-1 overflow-hidden">
                  <p className="font-medium truncate text-sm text-gray-800">
                    {invoice.fileName}
                  </p>
                  <p className="text-xs text-gray-500">{invoice.uploadDate}</p>
                </div>
                <StatusIndicator status={invoice.status} />
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
};