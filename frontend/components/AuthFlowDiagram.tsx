'use client';

import { useState, useEffect } from 'react';
import { Shield, Key, Smartphone, ArrowRight, Lock, Unlock, CheckCircle2 } from 'lucide-react';

const FLOW_STEPS = [
  { label: 'Token Vault', sublabel: 'RFC 8693 Exchange', icon: Key, color: 'blue' },
  { label: 'Step-Up MFA', sublabel: 'Elevated Auth', icon: Shield, color: 'yellow' },
  { label: 'CIBA Consent', sublabel: 'Push Approval', icon: Smartphone, color: 'orange' },
  { label: 'Authorized', sublabel: 'Zero Trust', icon: CheckCircle2, color: 'green' },
];

export default function AuthFlowDiagram() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % FLOW_STEPS.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center justify-center gap-2 md:gap-4 py-8">
      {FLOW_STEPS.map((step, i) => {
        const Icon = step.icon;
        const isActive = i <= activeStep;
        const isCurrent = i === activeStep;

        return (
          <div key={step.label} className="flex items-center gap-2 md:gap-4">
            <div className="flex flex-col items-center gap-2">
              <div
                className={`relative w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center transition-all duration-500 ${
                  isCurrent
                    ? step.color === 'blue'
                      ? 'bg-blue-600/30 border-2 border-blue-400 shadow-lg shadow-blue-500/20'
                      : step.color === 'yellow'
                      ? 'bg-yellow-600/30 border-2 border-yellow-400 shadow-lg shadow-yellow-500/20'
                      : step.color === 'orange'
                      ? 'bg-orange-600/30 border-2 border-orange-400 shadow-lg shadow-orange-500/20'
                      : 'bg-green-600/30 border-2 border-green-400 shadow-lg shadow-green-500/20'
                    : isActive
                    ? 'bg-gray-700/50 border border-gray-600'
                    : 'bg-gray-800/50 border border-gray-700/50'
                }`}
              >
                {isCurrent && (
                  <div className="absolute inset-0 rounded-xl animate-ping opacity-20 bg-current" />
                )}
                <Icon
                  className={`w-6 h-6 md:w-7 md:h-7 transition-colors duration-500 ${
                    isCurrent
                      ? step.color === 'blue'
                        ? 'text-blue-400'
                        : step.color === 'yellow'
                        ? 'text-yellow-400'
                        : step.color === 'orange'
                        ? 'text-orange-400'
                        : 'text-green-400'
                      : isActive
                      ? 'text-gray-400'
                      : 'text-gray-600'
                  }`}
                />
              </div>
              <div className="text-center">
                <p
                  className={`text-xs font-semibold transition-colors duration-500 ${
                    isCurrent ? 'text-white' : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </p>
                <p
                  className={`text-[10px] transition-colors duration-500 ${
                    isCurrent ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {step.sublabel}
                </p>
              </div>
            </div>

            {i < FLOW_STEPS.length - 1 && (
              <div className="flex items-center pb-8">
                <div
                  className={`w-6 md:w-10 h-px transition-colors duration-500 ${
                    i < activeStep ? 'bg-gray-500' : 'bg-gray-700/50'
                  }`}
                />
                <ArrowRight
                  className={`w-3 h-3 -ml-1 transition-colors duration-500 ${
                    i < activeStep ? 'text-gray-500' : 'text-gray-700'
                  }`}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
