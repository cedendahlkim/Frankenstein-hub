'use client';

import { useEffect, useState } from 'react';
import { Link2, Unlink, RefreshCw } from 'lucide-react';
import type { ConnectedAccount } from '@/types/agent';

interface ConsentManagerProps {
  connections: ConnectedAccount[];
  onRefresh: () => void;
}

export default function ConsentManager({ connections, onRefresh }: ConsentManagerProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const providerIcon = (connection: string) => {
    switch (connection) {
      case 'google-oauth2':
        return '🔵';
      case 'github':
        return '⚫';
      default:
        return '🔗';
    }
  };

  const providerName = (connection: string) => {
    switch (connection) {
      case 'google-oauth2':
        return 'Google Workspace';
      case 'github':
        return 'GitHub';
      default:
        return connection;
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-frank-accent" />
          <h3 className="text-lg font-semibold">Connected Accounts</h3>
        </div>
        <button
          onClick={handleRefresh}
          className="text-gray-500 hover:text-white transition-colors p-2"
          title="Refresh connections"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <p className="text-gray-500 text-sm mb-4">
        Delegated credentials managed by Auth0 Token Vault. Refresh tokens are never stored locally.
      </p>

      {connections.length === 0 ? (
        <div className="text-center py-6">
          <Unlink className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No connected accounts</p>
          <p className="text-gray-600 text-xs mt-1">
            Connect a provider via an agent card to get started
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {connections.map((conn, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-frank-bg/50 rounded-lg px-4 py-3 border border-frank-border/50"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{providerIcon(conn.connection)}</span>
                <div>
                  <p className="text-sm font-medium">{providerName(conn.connection)}</p>
                  <p className="text-xs text-gray-500">
                    Connected {new Date(conn.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span className="status-authorized text-[10px]">Active</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
