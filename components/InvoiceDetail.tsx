import React, { useState, useEffect } from 'react';
import type { Invoice, ExtractedData, WorkflowStep } from '../types';
import { WorkflowStatus, OverallStatus, WorkflowStepName } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { ProcessingIcon } from './icons/ProcessingIcon';
import { UploadIcon } from './icons/UploadIcon';
import { XIcon } from './icons/XIcon';

interface InvoiceDetailProps {
  invoice: Invoice;
  onUploadAnother: () => void;
}

const WorkflowStepView: React.FC<{ step: WorkflowStep }> = ({ step }) => {
  const getStatusStyles = () => {
    switch (step.status) {
      case WorkflowStatus.COMPLETED:
      case WorkflowStatus.VALIDATED:
        return {
          icon: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
          text: 'text-gray-700',
          connector: 'bg-green-500',
        };
      case WorkflowStatus.IN_PROGRESS:
        return {
          icon: <SpinnerIcon className="w-6 h-6 text-blue-500" />,
          text: 'text-blue-600',
          connector: 'bg-gray-300',
        };
      case WorkflowStatus.PENDING:
      default:
        return {
          icon: <ProcessingIcon className="w-6 h-6 text-gray-400" />,
          text: 'text-gray-500',
          connector: 'bg-gray-300',
        };
    }
  };

  const { icon, text, connector } = getStatusStyles();

  return (
    <div className="flex items-center">
      <div className="flex flex-col items-center mr-4">
        <div>{icon}</div>
        <div className={`w-0.5 h-12 mt-2 ${connector}`}></div>
      </div>
      <div>
        <h4 className={`font-semibold ${text}`}>{step.name}</h4>
        <p className={`text-sm ${text}`}>{step.status}</p>
      </div>
    </div>
  );
};

const DataSection: React.FC<{ title: string; items: string[] }> = ({ title, items }) => (
    <div>
        <h4 className="font-semibold text-gray-700 mb-2 text-base sticky top-0 bg-white pt-2">{title}</h4>
        <ul className="space-y-2 pl-2">
          {items.map((item, index) => (
            <li key={index} className="text-sm text-gray-700 bg-gray-100 p-2 rounded-md">
              {item}
            </li>
          ))}
        </ul>
    </div>
);


export const InvoiceDetail: React.FC<InvoiceDetailProps> = ({ invoice, onUploadAnother }) => {
  const { fileName, status, workflowSteps, extractedData, fileDataUrl } = invoice;
  const [isSuccessMessageVisible, setIsSuccessMessageVisible] = useState(false);

  useEffect(() => {
    if (status === OverallStatus.COMPLETED && invoice.systemReferenceId) {
      setIsSuccessMessageVisible(true);
    }
  }, [status, invoice.systemReferenceId]);

  const checkerStatus = workflowSteps.find(s => s.name === WorkflowStepName.CHECKER)?.status;

  const getDynamicTitle = () => {
    if (checkerStatus === WorkflowStatus.IN_PROGRESS) {
      return 'Checker Agent: Validating Information';
    }
    if (status === OverallStatus.COMPLETED) {
        return 'Validated Information';
    }
    return 'Extracted Information';
  };

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="flex-shrink-0 mb-8">
        <div className="flex justify-between items-center gap-4">
          <div>
              <h2 className="text-2xl font-bold text-gray-900 truncate max-w-xl">{fileName}</h2>
              <p className={`mt-1 font-medium ${status === OverallStatus.COMPLETED ? 'text-green-600' : 'text-blue-600'}`}>
                Status: {status}
              </p>
          </div>
          <div className="flex items-center gap-4">
            {status === OverallStatus.COMPLETED && invoice.systemReferenceId && isSuccessMessageVisible && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-lg flex items-center gap-3 relative shadow-sm animate-fade-in">
                <CheckCircleIcon className="w-5 h-5 flex-shrink-0 text-green-600"/>
                <div>
                  <p className="font-semibold text-sm">Records updated successfully.</p>
                  <p className="text-xs mt-1">
                    <span className="font-medium text-green-900/80">Reference:</span>{' '}
                    <code className="font-mono bg-green-100 text-green-900 px-1.5 py-0.5 rounded">
                      {invoice.systemReferenceId}
                    </code>
                  </p>
                </div>
                <button
                    onClick={() => setIsSuccessMessageVisible(false)}
                    className="absolute -top-1.5 -right-1.5 p-0.5 rounded-full bg-white hover:bg-green-100/50 focus:outline-none focus:ring-2 focus:ring-green-300"
                    aria-label="Close success message"
                >
                    <XIcon className="w-4 h-4 text-green-700 hover:text-green-900"/>
                </button>
              </div>
            )}
            <button
              onClick={onUploadAnother}
              className="bg-[#009c6d] hover:bg-[#008a60] text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2 flex-shrink-0 shadow-sm hover:shadow-md"
            >
              <UploadIcon className="w-5 h-5" />
              <span>Process Another</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-8 min-h-0">
        <div className="lg:col-span-1 bg-white rounded-lg p-6 shadow-md border border-gray-200/80">
          <h3 className="font-semibold text-gray-800 mb-4">Processing Workflow</h3>
          <div className="relative">
             {workflowSteps.map((step, index) => (
                <div key={step.name} className={index === workflowSteps.length -1 ? 'last-step' : ''}>
                    <style>{`.last-step .w-0\\.5 { display: none; }`}</style>
                    <WorkflowStepView step={step} />
                </div>
            ))}
          </div>
        </div>
        
        <div className="lg:col-span-2 flex flex-col min-h-0">
            {extractedData ? (
                 <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-full">
                    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 flex flex-col">
                      <h3 className="font-semibold text-[#009c6d] mb-3 border-b border-gray-200 pb-2 flex-shrink-0">{getDynamicTitle()}</h3>
                      <div className="space-y-4 overflow-y-auto custom-scrollbar pr-3">
                        <DataSection title="Organizations" items={extractedData.organizations} />
                        <DataSection title="Individuals" items={extractedData.individuals} />
                        <DataSection title="Vessels" items={extractedData.vessels} />
                        <DataSection title="Locations" items={extractedData.locations} />
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 flex flex-col shadow-md border border-gray-200/80">
                        <h3 className="font-semibold text-[#009c6d] mb-3 border-b border-gray-200 pb-2 flex-shrink-0">Document Preview</h3>
                        <div className="flex-grow min-h-0 bg-gray-200 rounded-md overflow-hidden">
                            <iframe src={fileDataUrl} className="w-full h-full border-0" title={fileName} />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full bg-white rounded-lg p-8 shadow-md border border-gray-200/80">
                    <SpinnerIcon className="w-12 h-12 text-[#009c6d] mb-4"/>
                    <p className="text-gray-700 font-medium">Maker Agent is retrieving data...</p>
                    <p className="text-gray-500 text-sm mt-1">This may take a few moments.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};