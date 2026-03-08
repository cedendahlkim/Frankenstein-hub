'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import { Brain, LogOut, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';

export default function Navigation() {
  const { user, isLoading } = useUser();

  return (
    <nav className="border-b border-frank-border bg-frank-bg/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-frank-accent/20 rounded-lg flex items-center justify-center group-hover:bg-frank-accent/30 transition-colors">
            <Brain className="w-5 h-5 text-frank-accent" />
          </div>
          <span className="text-lg font-bold text-white">Frankenstein AI</span>
        </Link>

        <div className="flex items-center gap-4">
          {!isLoading && user ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <div className="flex items-center gap-3">
                <img
                  src={user.picture || ''}
                  alt={user.name || 'User'}
                  className="w-8 h-8 rounded-full border border-frank-border"
                />
                <span className="text-sm text-gray-300 hidden md:block">
                  {user.name}
                </span>
              </div>
              <a
                href="/api/auth/logout"
                className="flex items-center gap-1 text-gray-500 hover:text-red-400 transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
              </a>
            </>
          ) : !isLoading ? (
            <a
              href="/api/auth/login?returnTo=/dashboard"
              className="btn-primary text-sm py-2 px-4"
            >
              Sign In
            </a>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
