export interface Agent {
  name: string;
  identifier: 'analyst' | 'creativist' | 'critic';
  provider: string;
  description: string;
  requiredScopes: string[];
  isConnected: boolean;
  requiresStepUp: boolean;
  isCibaFlow: boolean;
}

export interface ConnectedAccount {
  connection: string;
  provider: string;
  created_at: string;
}

export interface AgentExecutionResult {
  agent: string;
  status: 'success' | 'error';
  action?: string;
  data?: unknown;
  message?: string;
}

export interface CibaStatus {
  auth_req_id: string;
  status: 'pending' | 'approved' | 'denied';
  message?: string;
}
