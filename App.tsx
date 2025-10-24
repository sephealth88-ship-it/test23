import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { InvoiceDetail } from './components/InvoiceDetail';
import { FileUpload } from './components/FileUpload';
import { WorkflowStarter } from './components/WorkflowStarter';
import type { ExtractedData, Invoice, WorkflowState } from './types';
import { CorsErrorAlert } from './components/CorsErrorAlert';
import { N8N_WEBHOOK_URL, N8N_CHECKER_URL, N8N_SYSTEM_INPUT_URL } from './config';
import { Dashboard } from './components/Dashboard';
import { OverallStatus, AgentStatus } from './types';

type Phase = 'idle' | 'started' | 'processing' | 'completed' | 'failed';

const App: React.FC = () => {
  const [phase, setPhase] = useState<Phase>('idle');
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [fileInfo, setFileInfo] = useState<{ name: string; dataUrl: string } | null>(null);
  const [networkError, setNetworkError] = useState<React.ReactNode | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isDashboardOpen, setIsDashboardOpen] = useState(true);
  const [workflowState, setWorkflowState] = useState<WorkflowState | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [waitForReview, setWaitForReview] = useState(false);
  const [currentInvoiceId, setCurrentInvoiceId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedInvoices = localStorage.getItem('invoices');
      if (storedInvoices) {
        setInvoices(JSON.parse(storedInvoices));
      }
    } catch (error) {
      console.error("Failed to load invoices from local storage:", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('invoices', JSON.stringify(invoices));
    } catch (error) {
      console.error("Failed to save invoices to local storage:", error);
    }
  }, [invoices]);

  const handleStartWorkflow = useCallback(async () => {
    setIsStarting(true);
    setNetworkError(null);
    try {
      const initialResponse = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: '',
      });

      if (!initialResponse.ok) throw new Error(`Initial webhook call failed. Status: ${initialResponse.status}`);
      const { resumeUrl } = await initialResponse.json();
      if (!resumeUrl) throw new Error('Resume URL not found in initial response.');

      setResumeUrl(resumeUrl);
      setPhase('started');
    } catch (error) {
      console.error('Workflow start failed:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setNetworkError(<CorsErrorAlert onDismiss={() => setNetworkError(null)} context="start" />);
      }
      setPhase('failed');
    } finally {
      setIsStarting(false);
    }
  }, []);

  const handleSystemInput = useCallback(async (invoiceIdParam?: string, dataParam?: ExtractedData) => {
    const invoiceId = invoiceIdParam || currentInvoiceId;
    const data = dataParam || extractedData;

    if (!invoiceId || !data) {
        console.error('System input cannot proceed: missing invoice ID or data.');
        return;
    }

    const updateInvoiceStatus = (status: OverallStatus) => {
        setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status } : inv));
    };
    
    try {
        setWorkflowState(prev => ({ ...prev!, systemInput: { status: AgentStatus.PROCESSING } }));

        const systemInputResponse = await fetch(N8N_SYSTEM_INPUT_URL, { method: 'POST', body: '', headers: { 'Content-Type': 'text/plain' } });
        if (!systemInputResponse.ok) throw new Error(`System Input agent activation failed. Status: ${systemInputResponse.status}`);
        const { resumeUrl: systemInputResumeUrl } = await systemInputResponse.json();
        if (!systemInputResumeUrl) throw new Error('System Input agent resume URL not found.');

        const systemInputFormData = new FormData();
        systemInputFormData.append('data', JSON.stringify([data]));

        const systemInputDataResponse = await fetch(systemInputResumeUrl, {
            method: 'POST',
            body: systemInputFormData
        });
        if (!systemInputDataResponse.ok) throw new Error(`System Input data submission failed. Status: ${systemInputDataResponse.status}`);
        const systemInputResult = await systemInputDataResponse.json();
        if (systemInputResult[0]?.status !== 'success') throw new Error(systemInputResult[0]?.message || 'System input failed');
        
        const referenceValue = systemInputResult[0]?.Reference || systemInputResult[0]?.Referece;
        if (referenceValue) {
            setReference(referenceValue);
        }

        setWorkflowState(prev => ({ ...prev!, systemInput: { status: AgentStatus.COMPLETED, message: systemInputResult[0]?.message || 'System input completed' } }));

        setPhase('completed');
        updateInvoiceStatus(OverallStatus.COMPLETED);

    } catch (error: any) {
        console.error('System input processing failed:', error);
        
        if (error instanceof TypeError && error.message.includes('fetch')) {
            setNetworkError(<CorsErrorAlert onDismiss={() => setNetworkError(null)} context='systemInput' />);
        }

        setPhase('failed');
        updateInvoiceStatus(OverallStatus.FAILED);
        setWorkflowState(prev => {
            if (!prev) return null;
            const newState = { ...prev };
            newState.systemInput = { status: AgentStatus.FAILED, message: error.message || 'An unknown error occurred.' };
            return newState;
        });
    }
  }, [currentInvoiceId, extractedData]);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!resumeUrl) {
      console.error('Cannot upload file: resumeUrl is missing.');
      return;
    }
    setNetworkError(null);
    setPhase('processing');
    
    const initialWorkflowState: WorkflowState = {
        maker: { status: AgentStatus.PENDING },
        checker: { status: AgentStatus.PENDING },
        systemInput: { status: AgentStatus.PENDING },
    };
    setWorkflowState(initialWorkflowState);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const fileDataUrl = event.target?.result as string;
      if (!fileDataUrl) {
          setPhase('failed');
          console.error('Could not read file data.');
          return;
      };

      const currentFileInfo = { name: file.name, dataUrl: fileDataUrl };
      setFileInfo(currentFileInfo);
      
      const newInvoiceId = new Date().toISOString() + Math.random();
      setCurrentInvoiceId(newInvoiceId);

      let currentExtractedData: ExtractedData | null = null;

      const processingInvoice: Invoice = {
        id: newInvoiceId,
        fileName: currentFileInfo.name,
        uploadDate: new Date().toLocaleString(),
        status: OverallStatus.PROCESSING,
      };
      setInvoices(prev => [processingInvoice, ...prev]);
      
      const updateInvoiceStatus = (status: OverallStatus) => {
        setInvoices(prev => prev.map(inv => inv.id === newInvoiceId ? { ...inv, status } : inv));
      };
      
      let processingStateBeforeError: WorkflowState | null = null;

      try {
        // Step 1: Maker AI Agent - Extract Data
        setWorkflowState(prev => {
            const next = { ...prev!, maker: { status: AgentStatus.PROCESSING } };
            processingStateBeforeError = next;
            return next;
        });
        const formData = new FormData();
        formData.append('file', file);

        const uploadResponse = await fetch(resumeUrl, {
          method: 'POST',
          body: formData,
        });
        if (!uploadResponse.ok) throw new Error(`File upload failed. Status: ${uploadResponse.status}`);
        const result = await uploadResponse.json();
        const rawData = result[0] || {};
        const extracted: ExtractedData = {
          name: Array.isArray(rawData?.name) ? rawData.name : [],
          location: Array.isArray(rawData?.location) ? rawData.location : [],
          organisation: Array.isArray(rawData?.organisation) ? rawData.organisation : [],
          vessel: Array.isArray(rawData?.vessel) ? rawData.vessel : [],
        };

        currentExtractedData = extracted;
        setExtractedData(extracted);
        setWorkflowState(prev => ({ ...prev!, maker: { status: AgentStatus.COMPLETED, message: 'Data extracted successfully' } }));

        // Step 2: Checker AI Agent - Validate Data
        setWorkflowState(prev => {
            const next = { ...prev!, checker: { status: AgentStatus.PROCESSING } };
            processingStateBeforeError = next;
            return next;
        });
        const checkerResponse = await fetch(N8N_CHECKER_URL, { method: 'POST', body: '', headers: { 'Content-Type': 'text/plain' } });
        if (!checkerResponse.ok) throw new Error(`Checker agent activation failed. Status: ${checkerResponse.status}`);
        const { resumeUrl: checkerResumeUrl } = await checkerResponse.json();
        if (!checkerResumeUrl) throw new Error('Checker agent resume URL not found.');
        
        const checkerFormData = new FormData();
        checkerFormData.append('data', JSON.stringify([currentExtractedData]));

        const validationResponse = await fetch(checkerResumeUrl, {
            method: 'POST',
            body: checkerFormData
        });
        if (!validationResponse.ok) throw new Error(`Checker data submission failed. Status: ${validationResponse.status}`);
        const validationResult = await validationResponse.json();
        if (validationResult[0]?.status !== 'success') throw new Error(validationResult[0]?.message || 'Validation failed');
        setWorkflowState(prev => ({ ...prev!, checker: { status: AgentStatus.COMPLETED, message: validationResult[0]?.message || 'Validated' } }));

        // Step 3: System Input AI Agent - Conditionally Pause or Proceed
        if (waitForReview) {
            setWorkflowState(prev => ({ ...prev!, systemInput: { status: AgentStatus.AWAITING_REVIEW, message: 'Ready for your review' } }));
        } else {
            await handleSystemInput(newInvoiceId, currentExtractedData);
        }

      } catch (error: any) {
        console.error('Workflow processing failed:', error);
        
        if (error instanceof TypeError && error.message.includes('fetch')) {
            let context: 'upload' | 'checker' | 'systemInput' = 'upload';
            if (processingStateBeforeError?.checker.status === AgentStatus.PROCESSING) {
                context = 'checker';
            } else if (processingStateBeforeError?.systemInput.status === AgentStatus.PROCESSING) {
                context = 'systemInput';
            }
            setNetworkError(<CorsErrorAlert onDismiss={() => setNetworkError(null)} context={context} />);
        }

        setPhase('failed');
        updateInvoiceStatus(OverallStatus.FAILED);
        setWorkflowState(prev => {
            if (!prev) return null;
            const newState = { ...prev };
            const errorMessage = error.message || 'An unknown error occurred.';
            if (newState.maker.status === AgentStatus.PROCESSING) newState.maker = { status: AgentStatus.FAILED, message: errorMessage };
            else if (newState.checker.status === AgentStatus.PROCESSING) newState.checker = { status: AgentStatus.FAILED, message: errorMessage };
            else if (newState.systemInput.status === AgentStatus.PROCESSING) newState.systemInput = { status: AgentStatus.FAILED, message: errorMessage };
            return newState;
        });
      }
    };
    reader.readAsDataURL(file);
  }, [resumeUrl, waitForReview, handleSystemInput]);

  const handleReset = useCallback(() => {
    setPhase('idle');
    setResumeUrl(null);
    setExtractedData(null);
    setFileInfo(null);
    setNetworkError(null);
    setIsStarting(false);
    setWorkflowState(null);
    setReference(null);
    setCurrentInvoiceId(null);
  }, []);
  
  const handleProcessAnother = useCallback(async () => {
    handleReset();
    await handleStartWorkflow();
  }, [handleReset, handleStartWorkflow]);

  const toggleDashboard = () => setIsDashboardOpen(prev => !prev);

  const renderContent = () => {
    switch (phase) {
      case 'idle':
      case 'failed': // Allow retrying from failed state
        return (
          <>
            {networkError && <div className="max-w-4xl mx-auto">{networkError}</div>}
            <WorkflowStarter onStart={handleStartWorkflow} isLoading={isStarting} />
          </>
        );
      case 'started':
        return <FileUpload 
                    onFileUpload={handleFileUpload} 
                    waitForReview={waitForReview}
                    setWaitForReview={setWaitForReview} 
                />;
      case 'processing':
      case 'completed':
        if (!fileInfo) return <p>Loading...</p>; // Should not happen
        return (
          <InvoiceDetail 
            fileInfo={fileInfo}
            status={phase}
            extractedData={extractedData}
            setExtractedData={setExtractedData}
            workflowState={workflowState}
            onProcessAnother={handleProcessAnother}
            networkError={networkError}
            reference={reference}
            onConfirmSystemInput={handleSystemInput}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <Dashboard invoices={invoices} isOpen={isDashboardOpen} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onToggleDashboard={toggleDashboard} />
        <main className="p-6 lg:p-8 flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;