import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { InvoiceDetail } from './components/InvoiceDetail';
import { FileUpload } from './components/FileUpload';
import type { Invoice, ExtractedData } from './types';
import { OverallStatus, WorkflowStatus, WorkflowStepName } from './types';

const App: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleFileUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const fileDataUrl = event.target?.result as string;
      if (!fileDataUrl) return;

      const newInvoiceId = `inv_${Date.now()}`;
      const newInvoice: Invoice = {
        id: newInvoiceId,
        fileName: file.name,
        fileDataUrl: fileDataUrl,
        status: OverallStatus.PROCESSING,
        uploadDate: new Date().toLocaleString(),
        workflowSteps: [
          { name: WorkflowStepName.MAKER, status: WorkflowStatus.PENDING },
          { name: WorkflowStepName.CHECKER, status: WorkflowStatus.PENDING },
          { name: WorkflowStepName.SYSTEM_INPUT, status: WorkflowStatus.PENDING },
        ],
        extractedData: null,
        systemReferenceId: null,
      };

      setInvoices(prev => [newInvoice, ...prev]);
      setSelectedInvoiceId(newInvoiceId);
      if (!isSidebarOpen) {
        setIsSidebarOpen(true);
      }

      // Trigger the real n8n workflow
      runN8nWorkflow(newInvoiceId, fileDataUrl);
    };
    reader.readAsDataURL(file);
  }, [isSidebarOpen]);

  const handleUploadAnother = useCallback(() => {
    setSelectedInvoiceId(null);
  }, []);
  
  const handleToggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const updateInvoiceState = (invoiceId: string, updates: Partial<Invoice>) => {
    setInvoices(prev =>
      prev.map(inv => (inv.id === invoiceId ? { ...inv, ...updates } : inv))
    );
  };

  const updateWorkflowStep = (invoiceId: string, stepName: WorkflowStepName, status: WorkflowStatus) => {
    setInvoices(prev =>
      prev.map(inv => {
        if (inv.id === invoiceId) {
          return {
            ...inv,
            workflowSteps: inv.workflowSteps.map(step =>
              step.name === stepName ? { ...step, status } : step
            ),
          };
        }
        return inv;
      })
    );
  };
  
  const runN8nWorkflow = async (invoiceId: string, fileDataUrl: string) => {
    // IMPORTANT: Replace these placeholder URLs with your actual n8n webhook URLs
    const MAKER_AGENT_WEBHOOK_URL = 'https://your-n8n-instance.com/webhook/maker-agent';
    const CHECKER_AGENT_WEBHOOK_URL = 'https://your-n8n-instance.com/webhook/checker-agent';
    const SYSTEM_INPUT_WEBHOOK_URL = 'https://your-n8n-instance.com/webhook/system-input';

    try {
      // 1. Trigger Maker Agent
      updateWorkflowStep(invoiceId, WorkflowStepName.MAKER, WorkflowStatus.IN_PROGRESS);
      const makerResponse = await fetch(MAKER_AGENT_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: invoices.find(inv => inv.id === invoiceId)?.fileName,
          fileData: fileDataUrl,
        }),
      });

      if (!makerResponse.ok) throw new Error(`Maker Agent failed: ${await makerResponse.text()}`);
      
      const extractedData: ExtractedData = await makerResponse.json();
      updateWorkflowStep(invoiceId, WorkflowStepName.MAKER, WorkflowStatus.COMPLETED);
      updateInvoiceState(invoiceId, { extractedData });

      // 2. Trigger Checker Agent
      updateWorkflowStep(invoiceId, WorkflowStepName.CHECKER, WorkflowStatus.IN_PROGRESS);
      const checkerResponse = await fetch(CHECKER_AGENT_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extractedData }),
      });

      if (!checkerResponse.ok) throw new Error(`Checker Agent failed: ${await checkerResponse.text()}`);
      
      const validationResult = await checkerResponse.json();
      if (!validationResult.validated) throw new Error('Checker Agent validation failed');
      updateWorkflowStep(invoiceId, WorkflowStepName.CHECKER, WorkflowStatus.VALIDATED);

      // 3. Trigger System Input Agent
      updateWorkflowStep(invoiceId, WorkflowStepName.SYSTEM_INPUT, WorkflowStatus.IN_PROGRESS);
      const systemInputResponse = await fetch(SYSTEM_INPUT_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ validatedData: extractedData }),
      });
      
      if (!systemInputResponse.ok) throw new Error(`System Input Agent failed: ${await systemInputResponse.text()}`);
      
      const systemResult = await systemInputResponse.json();
      updateWorkflowStep(invoiceId, WorkflowStepName.SYSTEM_INPUT, WorkflowStatus.COMPLETED);
      updateInvoiceState(invoiceId, { 
        status: OverallStatus.COMPLETED,
        systemReferenceId: systemResult.systemReferenceId,
      });

    } catch (error) {
      console.error('Workflow failed:', error);
      // Update UI to show a failed state
      setInvoices(prev =>
        prev.map(inv => {
          if (inv.id === invoiceId) {
            return {
              ...inv,
              status: OverallStatus.FAILED,
              workflowSteps: inv.workflowSteps.map(step => 
                step.status === WorkflowStatus.IN_PROGRESS ? { ...step, status: WorkflowStatus.FAILED } : step
              ),
            };
          }
          return inv;
        })
      );
    }
  };

  const selectedInvoice = invoices.find(inv => inv.id === selectedInvoiceId);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header onToggleSidebar={handleToggleSidebar} isSidebarOpen={isSidebarOpen} />
      <main className="flex h-[calc(100vh-4rem)]">
        <Dashboard
          isOpen={isSidebarOpen}
          invoices={invoices}
          selectedInvoiceId={selectedInvoiceId}
          onSelectInvoice={setSelectedInvoiceId}
        />
        <div className="flex-1 p-6 lg:p-8 overflow-y-auto bg-gray-100/50">
          {selectedInvoice ? (
            <InvoiceDetail invoice={selectedInvoice} onUploadAnother={handleUploadAnother} />
          ) : (
            <FileUpload onFileUpload={handleFileUpload} />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;