'use client';

import { useState } from 'react';
import { Loader2, CheckCircle2, XCircle, Shield, Smartphone, Fingerprint } from 'lucide-react';

interface AgentCardProps {
  name: string;
  identifier: string;
  provider: string;
  description: string;
  isConnected: boolean;
  onConnect?: () => void;
  onInvoke: () => Promise<void>;
  requiresStepUp?: boolean;
  isCibaFlow?: boolean;
}

export default function AgentCard({
  name,
  identifier,
  provider,
  description,
  isConnected,
  onConnect,
  onInvoke,
  requiresStepUp,
  isCibaFlow,
}: AgentCardProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastResult, setLastResult] = useState<'success' | 'error' | null>(null);

  const handleInvoke = async () => {
    setIsExecuting(true);
    setLastResult(null);
    try {
      await onInvoke();
      setLastResult('success');
    } catch {
      setLastResult('error');
    } finally {
      setIsExecuting(false);
    }
  };

  const getAgentColor = () => {
    switch (identifier) {
      case 'analyst':
        return 'blue';
      case 'creativist':
        return 'purple';
      case 'critic':
        return 'red';
      default:
        return 'gray';
    }
  };

  const color = getAgentColor();

  return (
    <div className={`card relative overflow-hidden group`}>
      {/* Gradient accent line */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
          color === 'blue'
            ? 'from-blue-500 to-cyan-400'
            : color === 'purple'
            ? 'from-purple-500 to-pink-400'
            : 'from-red-500 to-orange-400'
        }`}
      />

      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold mb-1">{name}</h2>
          <p className="text-gray-500 text-xs uppercase tracking-wider">{identifier}</p>
        </div>
        <div className="flex gap-1">
          {requiresStepUp && (
            <div className="w-8 h-8 bg-yellow-900/30 rounded-lg flex items-center justify-center" title="Requires Step-Up MFA">
              <Fingerprint className="w-4 h-4 text-yellow-400" />
            </div>
          )}
          {isCibaFlow && (
            <div className="w-8 h-8 bg-orange-900/30 rounded-lg flex items-center justify-center" title="CIBA Background Consent">
              <Smartphone className="w-4 h-4 text-orange-400" />
            </div>
          )}
        </div>
      </div>

      <p className="text-gray-400 text-sm mb-4">{description}</p>

      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-4 h-4 text-gray-500" />
        <span className="text-gray-400 text-sm">
          Requires: <span className={`text-${color}-400`}>{provider}</span>
        </span>
      </div>

      <div className="mb-6">
        {isConnected ? (
          <span className="status-authorized inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3" />
            Authorized
          </span>
        ) : (
          <button
            onClick={onConnect}
            className="btn-connect"
          >
            Connect {provider}
          </button>
        )}
      </div>

      <button
        onClick={handleInvoke}
        disabled={!isConnected || isExecuting}
        className={`w-full py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
          isConnected && !isExecuting
            ? `bg-${color}-600 hover:bg-${color}-500 text-white shadow-lg hover:shadow-${color}-500/25`
            : 'btn-disabled'
        }`}
      >
        {isExecuting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {isCibaFlow ? 'Awaiting Approval...' : 'Executing...'}
          </>
        ) : lastResult === 'success' ? (
          <>
            <CheckCircle2 className="w-4 h-4 text-green-300" />
            Task Complete
          </>
        ) : lastResult === 'error' ? (
          <>
            <XCircle className="w-4 h-4 text-red-300" />
            Failed - Retry
          </>
        ) : isCibaFlow ? (
          'Initiate Background Task'
        ) : requiresStepUp ? (
          'Execute (Requires MFA)'
        ) : (
          'Execute Task'
        )}
      </button>
    </div>
  );
}
