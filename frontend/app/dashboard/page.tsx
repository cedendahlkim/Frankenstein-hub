'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { useCallback, useEffect, useState } from 'react';
import AgentCard from '@/components/AgentCard';
import ConsentManager from '@/components/ConsentManager';
import StepUpModal from '@/components/StepUpModal';
import DashboardLog, { type LogEntry } from '@/components/DashboardLog';
import { invokeAgent, fetchConnectedAccounts } from '@/lib/apiClient';
import type { ConnectedAccount } from '@/types/agent';

let logIdCounter = 0;

export default function Dashboard() {
  const { user, isLoading } = useUser();
  const [connections, setConnections] = useState<ConnectedAccount[]>([]);
  const [showStepUp, setShowStepUp] = useState(false);
  const [stepUpAction, setStepUpAction] = useState('');
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);

  const addLog = useCallback((agent: string, action: string, status: LogEntry['status'], detail: string) => {
    setLogEntries((prev) => [
      ...prev,
      { id: String(++logIdCounter), timestamp: new Date(), agent, action, status, detail },
    ]);
  }, []);

  const loadConnections = async () => {
    const data = await fetchConnectedAccounts();
    if (Array.isArray(data)) {
      setConnections(data);
    }
  };

  useEffect(() => {
    if (user) {
      loadConnections();
      addLog('system', 'SESSION', 'info', `User authenticated: ${user.email ?? user.sub}`);
    }
  }, [user, addLog]);

  const hasGoogle = connections.some(
    (c) => c.connection === 'google-oauth2'
  );
  const hasGithub = connections.some((c) => c.connection === 'github');

  const handleInvokeAgent = async (endpoint: string, agentName: string) => {
    addLog(agentName, 'INVOKE', 'pending', `POST ${endpoint}`);

    const result = await invokeAgent(endpoint);

    if (result.status === 403 && result.error === 'step_up_required') {
      addLog(agentName, 'STEP_UP_REQUIRED', 'pending', 'MFA challenge needed for elevated scope');
      setStepUpAction(endpoint);
      setShowStepUp(true);
      return;
    }
    if (result.error) {
      addLog(agentName, 'ERROR', 'error', result.error);
      throw new Error(result.error);
    }

    addLog(agentName, 'COMPLETE', 'success', `Task executed successfully (HTTP ${result.status})`);
  };

  const handleStepUpConfirm = () => {
    setShowStepUp(false);
    addLog('system', 'REDIRECT', 'info', 'Redirecting to MFA challenge...');
    window.location.href =
      '/api/auth/login?acr_values=http://schemas.openid.net/pape/policies/2007/06/multi-factor';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-frank-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading Identity Protocol...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Authentication required</p>
          <a href="/api/auth/login" className="btn-primary">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Multi-Agent Authorization Hub
          </h1>
          <p className="text-gray-500">
            Zero Trust security boundary for Frankenstein AI sub-agents. Each
            agent operates with independently scoped credentials.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Agent Cards */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <AgentCard
                name="Analyst Agent"
                identifier="analyst"
                provider="Google Workspace"
                description="Executes data analysis operations via Google Drive and Sheets using ephemeral Token Vault credentials."
                isConnected={hasGoogle}
                onConnect={() =>
                  (window.location.href =
                    '/api/auth/login?connection=google-oauth2')
                }
                onInvoke={() =>
                  handleInvokeAgent('/agents/analyst/execute', 'analyst')
                }
              />
              <AgentCard
                name="Creativist Agent"
                identifier="creativist"
                provider="GitHub"
                description="Generates and publishes content via GitHub. High-value publish actions require Step-Up MFA."
                isConnected={hasGithub}
                onConnect={() =>
                  (window.location.href =
                    '/api/auth/login?connection=github')
                }
                onInvoke={() =>
                  handleInvokeAgent('/agents/creativist/draft', 'creativist')
                }
                requiresStepUp={true}
              />
              <AgentCard
                name="Critic Agent"
                identifier="critic"
                provider="System"
                description="Reviews and executes destructive background operations. Requires asynchronous CIBA consent via push notification."
                isConnected={true}
                onInvoke={() =>
                  handleInvokeAgent('/agents/critic/review', 'critic')
                }
                isCibaFlow={true}
              />
            </div>
          </div>

          {/* Consent Manager Sidebar */}
          <div className="lg:col-span-1">
            <ConsentManager
              connections={connections}
              onRefresh={loadConnections}
            />
          </div>
        </div>

        {/* Activity Log */}
        <div className="mt-8">
          <DashboardLog entries={logEntries} />
        </div>

        {/* Architecture Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-frank-card/50 border border-frank-border/50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-400 mb-2">
              Token Vault (RFC 8693)
            </h4>
            <p className="text-xs text-gray-500">
              Each agent exchanges the user&apos;s Auth0 session for an
              ephemeral downstream provider token at runtime. Tokens are
              never persisted locally.
            </p>
          </div>
          <div className="bg-frank-card/50 border border-frank-border/50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-yellow-400 mb-2">
              Step-Up Authentication
            </h4>
            <p className="text-xs text-gray-500">
              High-value scopes like{' '}
              <code className="bg-gray-800 px-1 rounded">publish:article</code>{' '}
              trigger an Auth0 Post-Login Action enforcing immediate MFA
              before execution.
            </p>
          </div>
          <div className="bg-frank-card/50 border border-frank-border/50 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-orange-400 mb-2">
              CIBA Background Consent
            </h4>
            <p className="text-xs text-gray-500">
              Autonomous agents enter a polling loop and halt execution
              until the user explicitly approves via Auth0 Guardian push
              notification.
            </p>
          </div>
        </div>
      </div>

      <StepUpModal
        isOpen={showStepUp}
        onClose={() => setShowStepUp(false)}
        onConfirm={handleStepUpConfirm}
        actionName={stepUpAction}
      />
    </div>
  );
}
