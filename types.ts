export enum WorkflowStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  VALIDATED = 'Validated',
  FAILED = 'Failed',
}

export enum OverallStatus {
  PROCESSING = 'Processing',
  COMPLETED = 'Completed',
  FAILED = 'Failed',
}

export enum WorkflowStepName {
  MAKER = 'Maker Agent',
  CHECKER = 'Checker Agent',
  SYSTEM_INPUT = 'System Input',
}

export interface ExtractedData {
  organizations: string[];
  individuals: string[];
  vessels: string[];
  locations: string[];
}

export interface WorkflowStep {
  name: WorkflowStepName;
  status: WorkflowStatus;
}

export interface Invoice {
  id: string;
  fileName: string;
  fileDataUrl: string;
  status: OverallStatus;
  uploadDate: string;
  workflowSteps: WorkflowStep[];
  extractedData: ExtractedData | null;
  systemReferenceId: string | null;
}