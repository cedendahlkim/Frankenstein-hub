'use client';

import { ShieldAlert, X } from 'lucide-react';

interface StepUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  actionName: string;
}

export default function StepUpModal({
  isOpen,
  onClose,
  onConfirm,
  actionName,
}: StepUpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-frank-card border border-frank-border rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-yellow-900/30 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="w-8 h-8 text-yellow-400" />
          </div>

          <h2 className="text-xl font-bold mb-2">Step-Up Authentication Required</h2>
          <p className="text-gray-400 text-sm mb-6">
            The action <span className="text-white font-medium">&ldquo;{actionName}&rdquo;</span>{' '}
            requires elevated privileges. You will be redirected to complete Multi-Factor
            Authentication before proceeding.
          </p>

          <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4 mb-6 w-full">
            <p className="text-yellow-300 text-xs">
              This action triggers the <code className="bg-yellow-900/50 px-1 rounded">publish:article</code> scope
              which is protected by an Auth0 Post-Login Action enforcing MFA.
            </p>
          </div>

          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-frank-border text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-white font-medium transition-colors"
            >
              Authenticate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
