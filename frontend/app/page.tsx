'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { Shield, Zap, Lock, ArrowRight, Key, Smartphone, GitBranch } from 'lucide-react';
import AuthFlowDiagram from '@/components/AuthFlowDiagram';
import ActivityLog from '@/components/ActivityLog';

export default function Home() {
  const { user } = useUser();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-transparent" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute top-20 right-1/4 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-frank-accent/30 to-transparent" />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-12 text-center">
          <div className="inline-flex items-center gap-2 bg-frank-accent/10 border border-frank-accent/30 rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm">
            <Zap className="w-4 h-4 text-frank-accent" />
            <span className="text-sm text-purple-300">Auth0 for AI Agents Hackathon</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent leading-tight">
            Frankenstein AI
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-3 max-w-3xl mx-auto font-light">
            Multi-Agent Authorization Hub
          </p>
          <p className="text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
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

        {/* Animated Auth Flow */}
        <div className="relative max-w-4xl mx-auto px-6 pb-8">
          <AuthFlowDiagram />
        </div>
      </section>

      {/* Live Activity Log */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Live Authorization Audit</h2>
          <p className="text-gray-500 text-sm">Watch the multi-agent authorization flow in real-time</p>
        </div>
        <ActivityLog />
      </section>

      {/* Feature Cards */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl font-bold mb-2">Three Pillars of Agent Authorization</h2>
          <p className="text-gray-500 text-sm">Every Auth0 security primitive, working in concert</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card group">
            <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600/30 transition-colors">
              <Key className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Token Vault (RFC 8693)</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Ephemeral, per-agent OAuth token exchange. No long-lived credentials stored
              in application databases.
            </p>
            <div className="text-xs text-blue-400/60 font-mono bg-blue-900/10 rounded px-3 py-2 border border-blue-800/20">
              grant_type: urn:auth0:params:oauth:grant-type:token-exchange
            </div>
          </div>

          <div className="card group">
            <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-600/30 transition-colors">
              <Shield className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Step-Up Authentication</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              High-value actions trigger immediate MFA challenges via Auth0 Actions,
              preventing unauthorized privilege escalation.
            </p>
            <div className="text-xs text-purple-400/60 font-mono bg-purple-900/10 rounded px-3 py-2 border border-purple-800/20">
              acr: http://schemas.openid.net/pape/policies/2007/06/multi-factor
            </div>
          </div>

          <div className="card group">
            <div className="w-12 h-12 bg-orange-600/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-600/30 transition-colors">
              <Smartphone className="w-6 h-6 text-orange-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">CIBA Background Consent</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Autonomous agents request human approval via push notifications before
              executing destructive background operations.
            </p>
            <div className="text-xs text-orange-400/60 font-mono bg-orange-900/10 rounded px-3 py-2 border border-orange-800/20">
              grant_type: urn:openid:params:grant-type:ciba
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-frank-card border border-frank-border rounded-xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <GitBranch className="w-5 h-5 text-frank-accent" />
            <h2 className="text-xl font-bold">Architecture</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="text-gray-300 font-semibold mb-3">Sub-Agents</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3 bg-gray-900/50 rounded-lg px-4 py-2.5">
                  <span>🔬</span>
                  <div>
                    <p className="text-blue-400 font-medium">Analyst</p>
                    <p className="text-gray-500 text-xs">Google Workspace via Token Vault</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-gray-900/50 rounded-lg px-4 py-2.5">
                  <span>🎨</span>
                  <div>
                    <p className="text-purple-400 font-medium">Creativist</p>
                    <p className="text-gray-500 text-xs">GitHub + Step-Up MFA for publish</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-gray-900/50 rounded-lg px-4 py-2.5">
                  <span>🔍</span>
                  <div>
                    <p className="text-red-400 font-medium">Critic</p>
                    <p className="text-gray-500 text-xs">CIBA consent via Guardian push</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-gray-300 font-semibold mb-3">Tech Stack</h4>
              <div className="space-y-2 text-gray-400">
                <div className="flex justify-between bg-gray-900/50 rounded-lg px-4 py-2.5">
                  <span>Backend</span>
                  <span className="text-gray-300 font-mono text-xs">Rust / Axum</span>
                </div>
                <div className="flex justify-between bg-gray-900/50 rounded-lg px-4 py-2.5">
                  <span>Frontend</span>
                  <span className="text-gray-300 font-mono text-xs">Next.js 14 / Tailwind</span>
                </div>
                <div className="flex justify-between bg-gray-900/50 rounded-lg px-4 py-2.5">
                  <span>Auth</span>
                  <span className="text-gray-300 font-mono text-xs">Auth0 Universal Login</span>
                </div>
                <div className="flex justify-between bg-gray-900/50 rounded-lg px-4 py-2.5">
                  <span>Database</span>
                  <span className="text-gray-300 font-mono text-xs">PostgreSQL / SQLx</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-frank-border py-8 mt-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-500">
            Built for the <span className="text-frank-accent font-medium">Auth0 for AI Agents</span> Hackathon
          </div>
          <div className="flex items-center gap-6 text-xs text-gray-600">
            <span>Token Vault</span>
            <span className="text-gray-700">•</span>
            <span>Step-Up MFA</span>
            <span className="text-gray-700">•</span>
            <span>CIBA</span>
            <span className="text-gray-700">•</span>
            <span>Zero Trust</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
