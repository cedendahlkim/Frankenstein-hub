'use client';

import { useState } from 'react';
import { Loader2, CheckCircle2, XCircle, Shield, Smartphone, Fingerprint, Play, Terminal } from 'lucide-react';

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

const AGENT_STYLES = {
  analyst: {
    gradient: 'from-blue-500 to-cyan-400',
    glow: 'group-hover:shadow-blue-500/10',
    btn: 'bg-blue-600 hover:bg-blue-500',
    btnShadow: 'hover:shadow-blue-500/25',
    text: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    icon: '🔬',
  },
  creativist: {
    gradient: 'from-purple-500 to-pink-400',
    glow: 'group-hover:shadow-purple-500/10',
    btn: 'bg-purple-600 hover:bg-purple-500',
    btnShadow: 'hover:shadow-purple-500/25',
    text: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    icon: '🎨',
  },
  critic: {
    gradient: 'from-red-500 to-orange-400',
    glow: 'group-hover:shadow-red-500/10',
    btn: 'bg-red-600 hover:bg-red-500',
    btnShadow: 'hover:shadow-red-500/25',
    text: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    icon: '🔍',
  },
} as const;

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

  const style = AGENT_STYLES[identifier as keyof typeof AGENT_STYLES] ?? AGENT_STYLES.analyst;

  return (
    <div className={`card relative overflow-hidden group ${style.glow} transition-shadow duration-500`}>
      {/* Gradient accent line */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${style.gradient}`} />

      {/* Subtle corner glow */}
      <div className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${style.gradient} opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500`} />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{style.icon}</span>
            <div>
              <h2 className="text-lg font-semibold">{name}</h2>
              <p className="text-gray-500 text-xs uppercase tracking-wider font-mono">{identifier}</p>
            </div>
          </div>
          <div className="flex gap-1.5">
            {requiresStepUp && (
              <div className="w-7 h-7 bg-yellow-900/30 rounded-md flex items-center justify-center border border-yellow-700/30" title="Requires Step-Up MFA">
                <Fingerprint className="w-3.5 h-3.5 text-yellow-400" />
              </div>
            )}
            {isCibaFlow && (
              <div className="w-7 h-7 bg-orange-900/30 rounded-md flex items-center justify-center border border-orange-700/30" title="CIBA Background Consent">
                <Smartphone className="w-3.5 h-3.5 text-orange-400" />
              </div>
            )}
          </div>
        </div>

        <p className="text-gray-400 text-sm mb-4 leading-relaxed">{description}</p>

        <div className={`flex items-center gap-2 mb-4 px-3 py-2 rounded-lg ${style.bg} border ${style.border}`}>
          <Shield className={`w-3.5 h-3.5 ${style.text}`} />
          <span className="text-gray-300 text-xs">
            Provider: <span className={`${style.text} font-medium`}>{provider}</span>
          </span>
        </div>

        <div className="mb-5">
          {isConnected ? (
            <span className="status-authorized inline-flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3" />
              Authorized
            </span>
          ) : (
            <button onClick={onConnect} className="btn-connect">
              Connect {provider}
            </button>
          )}
        </div>

        <button
          onClick={handleInvoke}
          disabled={!isConnected || isExecuting}
          className={`w-full py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
            isConnected && !isExecuting
              ? `${style.btn} text-white shadow-lg ${style.btnShadow}`
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
              Failed — Retry
            </>
          ) : isCibaFlow ? (
            <>
              <Terminal className="w-4 h-4" />
              Initiate Background Task
            </>
          ) : requiresStepUp ? (
            <>
              <Fingerprint className="w-4 h-4" />
              Execute (Requires MFA)
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Execute Task
            </>
          )}
        </button>
      </div>
    </div>
  );
}
