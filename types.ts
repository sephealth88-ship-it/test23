export interface ExtractedData {
  name: string[];
  location: string[];
  organisation: string[];
  vessel: string[];
}

// Fix: Add OverallStatus enum to define possible states for an invoice.
// The values are lowercase to be consistent with status strings used elsewhere in the application.
export enum OverallStatus {
  COMPLETED = 'completed',
  PROCESSING = 'processing',
  FAILED = 'failed',
}

// Fix: Add Invoice interface to describe the structure of an invoice object.
export interface Invoice {
  id: string;
  fileName: string;
  uploadDate: string;
  status: OverallStatus;
}

export enum AgentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface AgentStatusDetail {
  status: AgentStatus;
  message?: string;
}

export interface WorkflowState {
  maker: AgentStatusDetail;
  checker: AgentStatusDetail;
  systemInput: AgentStatusDetail;
}
