'use client';

import { BrainCircuit, Loader2, ShieldAlert, Sparkles } from 'lucide-react';
import type { AiVerificationResult } from '@/lib/domain/AnalysisTypes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type VerificationStatus = 'idle' | 'loading' | 'success' | 'error';

interface AiVerificationCardProps {
  verification: AiVerificationResult | null;
  status: VerificationStatus;
  error: string | null;
  onRun: () => void;
  disabled?: boolean;
}

const renderList = (label: string, entries: string[], accent: string) => {
  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="bg-ai-bg border border-gray-700 rounded-lg p-4 space-y-2">
      <p className="font-semibold text-ai-text">{label}</p>
      <ul className="space-y-2 text-sm text-ai-text">
        {entries.map((entry) => (
          <li key={`${label}-${entry}`} className="flex items-start gap-2">
            <span className={`${accent} mt-0.5`}>•</span>
            <span>{entry}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export function AiVerificationCard({
  verification,
  status,
  error,
  onRun,
  disabled = false,
}: AiVerificationCardProps) {
  const isLoading = status === 'loading';

  return (
    <div className="bg-ai-card border border-ai-accent/30 rounded-lg p-6 space-y-5">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <BrainCircuit className="h-6 w-6 text-purple-400" />
          <div>
            <p className="text-sm uppercase tracking-wide text-ai-muted">Deep Verification</p>
            <h2 className="text-xl font-bold text-ai-text">Aurora Deep Math V2</h2>
          </div>
        </div>
        <Button
          onClick={() => void onRun()}
          disabled={disabled || isLoading}
          className="bg-purple-600 hover:bg-purple-700 text-white min-w-[180px]"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying
            </span>
          ) : (
            'Run Deep Verification'
          )}
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-yellow-700/50 bg-yellow-900/20 p-4 text-sm text-yellow-100">
          {error}
        </div>
      )}

      {verification && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3 text-xs text-ai-muted">
            <span className="flex items-center gap-2 text-ai-text">
              <Sparkles className="h-4 w-4 text-ai-accent" />
              Provider:{' '}
              <span className="font-semibold uppercase">
                {verification.providerName}
              </span>
            </span>
            <span>Confidence: {verification.confidenceLevel}</span>
            <span>
              Alignment:{' '}
              <span className="capitalize text-ai-text">
                {verification.alignmentWithAuroraView.replace('_', ' ')}
              </span>
            </span>
            <span>{new Date(verification.timestampIso).toLocaleString()}</span>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card className="bg-black/20 border border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-sm font-mono text-purple-300">
                  Reasoning trail
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal space-y-2 pl-5 text-xs text-gray-200">
                  {verification.reasoningSteps.map((step, index) => (
                    <li key={`${step}-${index}`}>{step}</li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            <Card className="bg-ai-bg/50 border border-gray-700">
              <CardHeader>
                <CardTitle className="text-ai-accent">Strategic conclusion</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-ai-text whitespace-pre-wrap">{verification.summary}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {renderList('Strengths', verification.strengths, 'text-ai-accent')}
            {renderList('Weaknesses', verification.weaknesses, 'text-red-400')}
            {renderList('Risk flags', verification.riskFlags, 'text-yellow-400')}
          </div>

          {verification.disclaimers.length > 0 && (
            <div className="flex gap-3 rounded-lg border border-yellow-700/40 bg-yellow-900/15 p-4 text-xs text-yellow-100">
              <ShieldAlert className="h-4 w-4 text-yellow-300 mt-0.5" />
              <ul className="space-y-1">
                {verification.disclaimers.map((note, index) => (
                  <li key={`disclaimer-${index}`}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
