import React, { useState } from 'react';
import type { ExtractedData, WorkflowState } from '../types';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { UploadIcon } from './icons/UploadIcon';
import { PlusIcon } from './icons/PlusIcon';
import { MinusIcon } from './icons/MinusIcon';
import { WorkflowStatus } from './WorkflowStatus';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface InvoiceDetailProps {
  fileInfo: { name: string; dataUrl: string };
  status: 'processing' | 'completed' | 'failed';
  extractedData: ExtractedData | null;
  workflowState: WorkflowState | null;
  onProcessAnother: () => void;
  networkError: React.ReactNode | null;
  reference: string | null;
}

const DataSection: React.FC<{ title: string; items: string[] }> = ({ title, items }) => (
    <div>
        <h4 className="font-semibold text-gray-700 mb-2 text-base sticky top-0 bg-white pt-2">{title}</h4>
        {items && items.length > 0 ? (
          <ul className="space-y-2 pl-2">
            {items.map((item, index) => (
              <li key={index} className="text-sm text-gray-700 bg-gray-100 p-2 rounded-md">
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 italic pl-2">
            Not found
          </p>
        )}
    </div>
);


export const InvoiceDetail: React.FC<InvoiceDetailProps> = ({ fileInfo, status, extractedData, workflowState, onProcessAnother, networkError, reference }) => {
  const { name: fileName, dataUrl: fileDataUrl } = fileInfo;
  const [zoomLevel, setZoomLevel] = useState(0.8);

  const ZOOM_STEP = 0.2;
  const MIN_ZOOM = 0.2;
  const MAX_ZOOM = 3;

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + ZOOM_STEP, MAX_ZOOM));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - ZOOM_STEP, MIN_ZOOM));
  const handleZoomReset = () => setZoomLevel(1);

  const getStatusColor = () => {
    switch (status) {
        case 'completed': return 'text-green-600';
        case 'failed': return 'text-red-600';
        case 'processing':
        default: return 'text-blue-600';
    }
  }

  return (
    <div className="flex flex-col h-full animate-fade-in">
      {networkError}
      <div className="flex-shrink-0 mb-8">
        <div className="flex justify-between items-center gap-4">
          <div>
              <h2 className="text-2xl font-bold text-gray-900 truncate max-w-xl">{fileName}</h2>
              <p className={`mt-1 font-medium capitalize ${getStatusColor()}`}>
                Status: {status}
              </p>
          </div>
          <div className="flex items-center gap-4">
            {reference && (
                <div className="flex items-center gap-2 bg-green-100 text-green-900 font-semibold px-4 py-2 rounded-lg animate-fade-in border border-green-200">
                    <CheckCircleIcon className="w-5 h-5" />
                    <span>Reference: {reference}</span>
                </div>
            )}
            <button
              onClick={onProcessAnother}
              className="bg-[#009c6d] hover:bg-[#008a60] text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center gap-2 flex-shrink-0 shadow-sm hover:shadow-md"
            >
              <UploadIcon className="w-5 h-5" />
              <span>Process Another</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex-grow flex flex-col lg:flex-row lg:items-start gap-8">
        {/* Column 1: Workflow Status & Extracted Data */}
        <div className="w-full lg:w-1/3 flex flex-col">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 flex flex-col">
                <h3 className="font-semibold text-[#009c6d] mb-3 border-b border-gray-200 pb-2 flex-shrink-0">Workflow Status</h3>
                <div className="space-y-4 overflow-y-auto custom-scrollbar pr-3 max-h-[calc(100vh-20rem)]">
                    {workflowState ? (
                        <WorkflowStatus workflowState={workflowState} />
                    ) : (
                        <div className="flex flex-col items-center justify-center min-h-[200px]">
                            <SpinnerIcon className="w-12 h-12 text-[#009c6d] mb-4"/>
                            <p className="text-gray-700 font-medium">Initializing workflow...</p>
                        </div>
                    )}
                </div>
            </div>
            
            {extractedData && (
                 <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 flex flex-col mt-8">
                    <h3 className="font-semibold text-[#009c6d] mb-3 border-b border-gray-200 pb-2 flex-shrink-0">Extracted Information</h3>
                    <div className="space-y-4 overflow-y-auto custom-scrollbar pr-3 max-h-[calc(100vh-35rem)]">
                        <DataSection title="Name" items={extractedData.name} />
                        <DataSection title="Location" items={extractedData.location} />
                        <DataSection title="Organisation" items={extractedData.organisation} />
                        <DataSection title="Vessel" items={extractedData.vessel} />
                    </div>
                  </div>
            )}
        </div>

        {/* Column 2: Document Preview */}
        <div className="w-full lg:w-2/3 bg-white rounded-lg p-4 flex flex-col shadow-md border border-gray-200/80">
            <div className="flex justify-between items-center mb-3 border-b border-gray-200 pb-2 flex-shrink-0">
                <h3 className="font-semibold text-[#009c6d]">Document Preview</h3>
                <div className="flex items-center gap-2 text-gray-600">
                    <button
                        onClick={handleZoomOut}
                        disabled={zoomLevel <= MIN_ZOOM}
                        className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Zoom out"
                    >
                        <MinusIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleZoomReset}
                        className="text-sm font-semibold w-16 text-center tabular-nums bg-gray-50 hover:bg-gray-100 py-1 px-2 rounded-md transition-colors"
                        aria-label="Reset zoom"
                    >
                        {`${Math.round(zoomLevel * 100)}%`}
                    </button>
                    <button
                        onClick={handleZoomIn}
                        disabled={zoomLevel >= MAX_ZOOM}
                        className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Zoom in"
                    >
                        <PlusIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
            <div className="h-[75vh] bg-gray-100 rounded-md flex justify-center items-center p-4">
                <div className="overflow-auto custom-scrollbar max-w-full max-h-full">
                    <iframe
                        src={fileDataUrl}
                        className="w-[800px] max-w-none h-[1131px] bg-white shadow-lg border-0 transition-transform duration-200 ease-out"
                        title={fileName}
                        style={{
                            transform: `scale(${zoomLevel})`,
                            transformOrigin: 'center',
                        }}
                    />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};