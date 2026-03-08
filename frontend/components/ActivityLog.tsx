'use client';

import { useState, useEffect, useRef } from 'react';
import { Terminal, Shield, Key, Smartphone, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface LogEntry {
  id: number;
  timestamp: string;
  agent: string;
  action: string;
  status: 'success' | 'pending' | 'denied';
  detail: string;
}

const DEMO_LOGS: Omit<LogEntry, 'id' | 'timestamp'>[] = [
  { agent: 'analyst', action: 'TOKEN_EXCHANGE', status: 'success', detail: 'RFC 8693 → google-oauth2 access_token (expires: 3600s)' },
  { agent: 'analyst', action: 'API_CALL', status: 'success', detail: 'GET /drive/v3/files → 200 OK (12 items)' },
  { agent: 'creativist', action: 'TOKEN_EXCHANGE', status: 'success', detail: 'RFC 8693 → github access_token (expires: 28800s)' },
  { agent: 'creativist', action: 'STEP_UP_MFA', status: 'pending', detail: 'publish:article scope → MFA challenge initiated' },
  { agent: 'creativist', action: 'MFA_VERIFIED', status: 'success', detail: 'amr: ["mfa"] confirmed via Auth0 Guardian' },
  { agent: 'creativist', action: 'API_CALL', status: 'success', detail: 'POST /gists → 201 Created (article.md published)' },
  { agent: 'critic', action: 'CIBA_INIT', status: 'pending', detail: 'bc-authorize → auth_req_id: ciba_req_abc123' },
  { agent: 'critic', action: 'CIBA_POLL', status: 'pending', detail: 'Awaiting Guardian push notification approval...' },
  { agent: 'critic', action: 'CIBA_APPROVED', status: 'success', detail: 'User approved via push notification → access_token issued' },
  { agent: 'critic', action: 'EXECUTE', status: 'success', detail: 'Destructive review action completed with CIBA authorization' },
  { agent: 'system', action: 'AUDIT', status: 'success', detail: 'All agent tokens expired. No persistent credentials stored.' },
];

const AGENT_COLORS: Record<string, string> = {
  analyst: 'text-blue-400',
  creativist: 'text-purple-400',
  critic: 'text-red-400',
  system: 'text-gray-400',
};

const STATUS_ICONS = {
  success: <CheckCircle2 className="w-3 h-3 text-green-400" />,
  pending: <Clock className="w-3 h-3 text-yellow-400" />,
  denied: <XCircle className="w-3 h-3 text-red-400" />,
};

function getTime(): string {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function ActivityLog() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentIndex >= DEMO_LOGS.length) {
      const resetTimer = setTimeout(() => {
        setLogs([]);
        setCurrentIndex(0);
      }, 5000);
      return () => clearTimeout(resetTimer);
    }

    const delay = DEMO_LOGS[currentIndex].status === 'pending' ? 2000 : 1200;
    const timer = setTimeout(() => {
      const entry: LogEntry = {
        ...DEMO_LOGS[currentIndex],
        id: currentIndex,
        timestamp: getTime(),
      };
      setLogs((prev) => [...prev, entry]);
      setCurrentIndex((prev) => prev + 1);
    }, delay);

    return () => clearTimeout(timer);
  }, [currentIndex]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-900/80 border-b border-gray-800">
        <Terminal className="w-4 h-4 text-green-400" />
        <span className="text-xs font-mono text-gray-400">authorization-audit.log</span>
        <div className="ml-auto flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
        </div>
      </div>
      <div ref={scrollRef} className="p-4 h-64 overflow-y-auto font-mono text-xs space-y-1.5 scrollbar-thin">
        {logs.map((log) => (
          <div key={log.id} className="flex items-start gap-2 animate-fadeIn">
            <span className="text-gray-600 shrink-0">{log.timestamp}</span>
            {STATUS_ICONS[log.status]}
            <span className={`shrink-0 font-semibold ${AGENT_COLORS[log.agent] ?? 'text-gray-400'}`}>
              [{log.agent.toUpperCase()}]
            </span>
            <span className="text-gray-500">{log.action}</span>
            <span className="text-gray-400">{log.detail}</span>
          </div>
        ))}
        {currentIndex < DEMO_LOGS.length && (
          <div className="flex items-center gap-1 text-gray-600">
            <span className="animate-pulse">▌</span>
          </div>
        )}
      </div>
    </div>
  );
}
