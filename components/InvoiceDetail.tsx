import React, { useState, useRef, useCallback } from 'react';
import type { ExtractedData, WorkflowState } from '../types';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { UploadIcon } from './icons/UploadIcon';
import { PlusIcon } from './icons/PlusIcon';
import { MinusIcon } from './icons/MinusIcon';
import { WorkflowStatus } from './WorkflowStatus';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { AgentStatus } from '../types';
import { EditableDataSection } from './EditableDataSection';
import { ChevronUpIcon } from './icons/ChevronUpIcon';

interface InvoiceDetailProps {
  fileInfo: { name: string; dataUrl: string };
  status: 'processing' | 'completed' | 'failed';
  extractedData: ExtractedData | null;
  setExtractedData: (data: ExtractedData | null) => void;
  workflowState: WorkflowState | null;
  onProcessAnother: () => void;
  networkError: React.ReactNode | null;
  reference: string | null;
  onConfirmSystemInput: () => void;
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


export const InvoiceDetail: React.FC<InvoiceDetailProps> = ({ fileInfo, status, extractedData, setExtractedData, workflowState, onProcessAnother, networkError, reference, onConfirmSystemInput }) => {
  const { name: fileName, dataUrl: fileDataUrl } = fileInfo;
  const [isWorkflowCollapsed, setIsWorkflowCollapsed] = useState(false);

  // Interactive Canvas State
  const [transform, setTransform] = useState({ scale: 0.8, x: 0, y: 0 });
  const viewerRef = useRef<HTMLDivElement>(null);
  const isPanning = useRef(false);
  const lastPointerPosition = useRef({ x: 0, y: 0 });
  
  const ZOOM_STEP = 0.2;
  const MIN_ZOOM = 0.2;
  const MAX_ZOOM = 3;

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    isPanning.current = true;
    lastPointerPosition.current = { x: e.clientX, y: e.clientY };
    if (viewerRef.current) {
      viewerRef.current.style.cursor = 'grabbing';
      viewerRef.current.setPointerCapture(e.pointerId);
    }
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isPanning.current) return;
    const deltaX = e.clientX - lastPointerPosition.current.x;
    const deltaY = e.clientY - lastPointerPosition.current.y;
    lastPointerPosition.current = { x: e.clientX, y: e.clientY };
    setTransform(prev => ({ ...prev, x: prev.x + deltaX, y: prev.y + deltaY }));
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    isPanning.current = false;
    if (viewerRef.current) {
      viewerRef.current.style.cursor = 'grab';
      viewerRef.current.releasePointerCapture(e.pointerId);
    }
  }, []);
  
  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    if (!viewerRef.current) return;
    
    const rect = viewerRef.current.getBoundingClientRect();
    const mousePos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    
    const delta = e.deltaY * -0.005;
    const newScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, transform.scale + delta));
    
    const worldPos = {
      x: (mousePos.x - transform.x) / transform.scale,
      y: (mousePos.y - transform.y) / transform.scale,
    };
    
    const newX = -worldPos.x * newScale + mousePos.x;
    const newY = -worldPos.y * newScale + mousePos.y;
    
    setTransform({ scale: newScale, x: newX, y: newY });
  }, [transform]);

  const handleZoom = useCallback((direction: 'in' | 'out') => {
    if (!viewerRef.current) return;
    const rect = viewerRef.current.getBoundingClientRect();
    const center = { x: rect.width / 2, y: rect.height / 2 };
    const zoomFactor = direction === 'in' ? ZOOM_STEP : -ZOOM_STEP;
    const newScale = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, transform.scale + zoomFactor));
    const worldPos = {
        x: (center.x - transform.x) / transform.scale,
        y: (center.y - transform.y) / transform.scale,
    };
    const newX = -worldPos.x * newScale + center.x;
    const newY = -worldPos.y * newScale + center.y;
    setTransform({ scale: newScale, x: newX, y: newY });
  }, [transform]);
  
  const handleZoomIn = () => handleZoom('in');
  const handleZoomOut = () => handleZoom('out');
  const handleZoomReset = () => setTransform({ scale: 1, x: 0, y: 0 });

  const getStatusColor = () => {
    switch (status) {
        case 'completed': return 'text-green-600';
        case 'failed': return 'text-red-600';
        case 'processing':
        default: return 'text-blue-600';
    }
  }

  const isReviewMode = workflowState?.systemInput.status === AgentStatus.AWAITING_REVIEW;

  const handleDataChange = (category: keyof ExtractedData, newItems: string[]) => {
    if (!extractedData) return;
    setExtractedData({
        ...extractedData,
        [category]: newItems,
    });
  };

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
                <div className="flex justify-between items-center mb-3 border-b border-gray-200 pb-2 flex-shrink-0">
                    <h3 className="font-semibold text-[#009c6d]">Workflow Status</h3>
                    <button
                        onClick={() => setIsWorkflowCollapsed(!isWorkflowCollapsed)}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                        aria-expanded={!isWorkflowCollapsed}
                        aria-controls="workflow-status-content"
                        aria-label={isWorkflowCollapsed ? "Expand workflow status" : "Collapse workflow status"}
                    >
                        <ChevronUpIcon className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${isWorkflowCollapsed ? 'rotate-180' : ''}`} />
                    </button>
                </div>
                
                <div 
                    id="workflow-status-content"
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${isWorkflowCollapsed ? 'max-h-0' : 'max-h-[calc(100vh-20rem)]'}`}
                >
                    <div className="space-y-4 overflow-y-auto custom-scrollbar pr-3">
                        {workflowState ? (
                            <WorkflowStatus workflowState={workflowState} onConfirmSystemInput={onConfirmSystemInput}/>
                        ) : (
                            <div className="flex flex-col items-center justify-center min-h-[200px]">
                                <SpinnerIcon className="w-12 h-12 text-[#009c6d] mb-4"/>
                                <p className="text-gray-700 font-medium">Initializing workflow...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {extractedData && (
                 <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 flex flex-col mt-8">
                    <h3 className="font-semibold text-[#009c6d] mb-3 border-b border-gray-200 pb-2 flex-shrink-0">Extracted Information</h3>
                    <div className="space-y-4 overflow-y-auto custom-scrollbar pr-3 max-h-[calc(100vh-35rem)]">
                        {isReviewMode ? (
                          <>
                            <EditableDataSection title="Name" items={extractedData.name} onItemsChange={(items) => handleDataChange('name', items)} />
                            <EditableDataSection title="Location" items={extractedData.location} onItemsChange={(items) => handleDataChange('location', items)} />
                            <EditableDataSection title="Organisation" items={extractedData.organisation} onItemsChange={(items) => handleDataChange('organisation', items)} />
                            <EditableDataSection title="Vessel" items={extractedData.vessel} onItemsChange={(items) => handleDataChange('vessel', items)} />
                          </>
                        ) : (
                          <>
                            <DataSection title="Name" items={extractedData.name} />
                            <DataSection title="Location" items={extractedData.location} />
                            <DataSection title="Organisation" items={extractedData.organisation} />
                            <DataSection title="Vessel" items={extractedData.vessel} />
                          </>
                        )}
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
                        disabled={transform.scale <= MIN_ZOOM}
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
                        {`${Math.round(transform.scale * 100)}%`}
                    </button>
                    <button
                        onClick={handleZoomIn}
                        disabled={transform.scale >= MAX_ZOOM}
                        className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        aria-label="Zoom in"
                    >
                        <PlusIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
            <div 
                ref={viewerRef}
                className="h-[75vh] bg-gray-100 rounded-md flex justify-center items-center overflow-hidden cursor-grab touch-none"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerLeave={onPointerUp}
                onWheel={onWheel}
            >
                <iframe
                    src={fileDataUrl}
                    className="w-[800px] max-w-none h-[1131px] bg-white shadow-lg border-0 pointer-events-none select-none"
                    title={fileName}
                    style={{
                        transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
                        transformOrigin: '0 0',
                        transition: isPanning.current ? 'none' : 'transform 0.1s ease-out',
                    }}
                />
            </div>
        </div>
      </div>
    </div>
  );
};