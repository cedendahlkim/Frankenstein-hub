'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { Shield, Zap, Lock, ArrowRight } from 'lucide-react';

export default function Home() {
  const { user } = useUser();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 to-transparent" />
        <div className="relative max-w-6xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-frank-accent/10 border border-frank-accent/30 rounded-full px-4 py-1.5 mb-8">
            <Zap className="w-4 h-4 text-frank-accent" />
            <span className="text-sm text-purple-300">Auth0 for AI Agents Hackathon</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
            Frankenstein AI
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 mb-4 max-w-3xl mx-auto">
            Multi-Agent Authorization Hub
          </p>
          <p className="text-gray-500 mb-12 max-w-2xl mx-auto">
            Zero Trust authorization layer for autonomous AI sub-agents. Each agent is
            independently authenticated, scoped, and authorized via Auth0 Token Vault,
            Step-Up MFA, and CIBA.
          </p>

          {user ? (
            <a href="/dashboard" className="btn-primary inline-flex items-center gap-2 text-lg">
              Go to Dashboard <ArrowRight className="w-5 h-5" />
            </a>
          ) : (
            <a href="/api/auth/login" className="btn-primary inline-flex items-center gap-2 text-lg">
              Sign In with Auth0 <Lock className="w-5 h-5" />
            </a>
          )}
        </div>
      </section>

      {/* Feature Cards */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card">
            <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Token Vault (RFC 8693)</h3>
            <p className="text-gray-400 text-sm">
              Ephemeral, per-agent OAuth token exchange. No long-lived credentials stored
              in application databases.
            </p>
          </div>

          <div className="card">
            <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Step-Up Authentication</h3>
            <p className="text-gray-400 text-sm">
              High-value actions trigger immediate MFA challenges via Auth0 Actions,
              preventing unauthorized privilege escalation.
            </p>
          </div>

          <div className="card">
            <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">CIBA Background Consent</h3>
            <p className="text-gray-400 text-sm">
              Autonomous agents request human approval via push notifications before
              executing destructive background operations.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
