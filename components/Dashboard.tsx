import React from 'react';
import type { Invoice } from '../types';
import { OverallStatus } from '../types';
import { FileIcon } from './icons/FileIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface DashboardProps {
  invoices: Invoice[];
  selectedInvoiceId: string | null;
  onSelectInvoice: (id: string) => void;
  isOpen: boolean;
}

interface StatusIndicatorProps {
  status: OverallStatus;
  isSelected: boolean;
}


const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, isSelected }) => {
  switch (status) {
    case OverallStatus.COMPLETED:
      return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    case OverallStatus.PROCESSING:
      return <SpinnerIcon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-blue-500'}`} />;
    case OverallStatus.FAILED:
      return <div className="w-5 h-5 text-red-500">X</div>; // Replace with an X icon if needed
    default:
      return null;
  }
};

export const Dashboard: React.FC<DashboardProps> = ({
  invoices,
  selectedInvoiceId,
  onSelectInvoice,
  isOpen,
}) => {
  return (
    <aside
      className={`flex-shrink-0 bg-white border-r border-gray-200/80 transition-all duration-300 ease-in-out ${
        isOpen ? 'w-1/3 max-w-sm' : 'w-0 border-r-0'
      }`}
    >
      <div
        className={`h-full w-full overflow-y-auto p-4 transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-4 px-2 whitespace-nowrap">
          Processed Documents
        </h2>
        <div className="space-y-2">
          {invoices.length === 0 ? (
            <p className="text-center text-gray-500 mt-8 px-2">
              Upload a document to get started.
            </p>
          ) : (
            invoices.map(invoice => (
              <button
                key={invoice.id}
                onClick={() => onSelectInvoice(invoice.id)}
                className={`w-full text-left p-3 rounded-lg transition-colors duration-200 flex items-center gap-4 ${
                  selectedInvoiceId === invoice.id
                    ? 'bg-[#009c6d] text-white'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <FileIcon className={`w-6 h-6 flex-shrink-0 ${selectedInvoiceId === invoice.id ? 'text-white/80' : 'text-gray-400'}`} />
                <div className="flex-1 overflow-hidden">
                  <p className={`font-medium truncate text-sm ${selectedInvoiceId === invoice.id ? 'text-white' : 'text-gray-800'}`}>
                    {invoice.fileName}
                  </p>
                  <p className={`text-xs ${selectedInvoiceId === invoice.id ? 'text-white/70' : 'text-gray-500'}`}>{invoice.uploadDate}</p>
                </div>
                <StatusIndicator status={invoice.status} isSelected={selectedInvoiceId === invoice.id} />
              </button>
            ))
          )}
        </div>
      </div>
    </aside>
  );
};