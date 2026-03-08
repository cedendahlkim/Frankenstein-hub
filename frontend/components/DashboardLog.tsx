'use client';

import { useRef, useEffect } from 'react';
import { Terminal, CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';

export interface LogEntry {
  id: string;
  timestamp: Date;
  agent: string;
  action: string;
  status: 'success' | 'pending' | 'error' | 'info';
  detail: string;
}

interface DashboardLogProps {
  entries: LogEntry[];
}

const AGENT_COLORS: Record<string, string> = {
  analyst: 'text-blue-400',
  creativist: 'text-purple-400',
  critic: 'text-red-400',
  system: 'text-gray-400',
};

const STATUS_ICONS = {
  success: <CheckCircle2 className="w-3 h-3 text-green-400 shrink-0" />,
  pending: <Clock className="w-3 h-3 text-yellow-400 shrink-0 animate-pulse" />,
  error: <XCircle className="w-3 h-3 text-red-400 shrink-0" />,
  info: <AlertTriangle className="w-3 h-3 text-gray-500 shrink-0" />,
};

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export default function DashboardLog({ entries }: DashboardLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  return (
    <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-900/80 border-b border-gray-800">
        <Terminal className="w-4 h-4 text-green-400" />
        <span className="text-xs font-mono text-gray-400">agent-activity.log</span>
        <span className="ml-auto text-[10px] text-gray-600 font-mono">{entries.length} events</span>
      </div>
      <div ref={scrollRef} className="p-4 h-48 overflow-y-auto font-mono text-xs space-y-1.5">
        {entries.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-600">No agent activity yet. Execute a task to begin.</p>
          </div>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="flex items-start gap-2 animate-fadeIn">
              <span className="text-gray-600 shrink-0">{formatTime(entry.timestamp)}</span>
              {STATUS_ICONS[entry.status]}
              <span className={`shrink-0 font-semibold ${AGENT_COLORS[entry.agent] ?? 'text-gray-400'}`}>
                [{entry.agent.toUpperCase()}]
              </span>
              <span className="text-gray-500 shrink-0">{entry.action}</span>
              <span className="text-gray-400 truncate">{entry.detail}</span>
            </div>
          ))
        )}
        {entries.length > 0 && (
          <div className="flex items-center gap-1 text-gray-600">
            <span className="animate-pulse">▌</span>
          </div>
        )}
      </div>
    </div>
  );
}
