'use client';

import { useCallback, useEffect, useState } from 'react';
import type {
  AiVerificationResult,
  AnalysisResult,
  StockData,
} from '@/lib/domain/AnalysisTypes';
import { runAiVerification } from '@/lib/services/ai/aiOrchestrator';

type VerificationStatus = 'idle' | 'loading' | 'success' | 'error';

interface UseAiVerificationOptions {
  stock: StockData | null;
  analysis: AnalysisResult | null;
}

interface UseAiVerificationResult {
  result: AiVerificationResult | null;
  status: VerificationStatus;
  error: string | null;
  runVerification: () => Promise<AiVerificationResult | null>;
  resetVerification: () => void;
}

export const useAiVerification = ({
  stock,
  analysis,
}: UseAiVerificationOptions): UseAiVerificationResult => {
  const [result, setResult] = useState<AiVerificationResult | null>(null);
  const [status, setStatus] = useState<VerificationStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const resetVerification = useCallback(() => {
    setResult(null);
    setStatus('idle');
    setError(null);
  }, []);

  useEffect(() => {
    resetVerification();
  }, [resetVerification, stock?.ticker]);

  const runVerification = useCallback(async () => {
    const ticker = stock?.ticker?.trim().toUpperCase();
    if (!ticker) {
      setError('Run an Aurora analysis before requesting Deep Verification.');
      setStatus('error');
      return null;
    }

    setStatus('loading');
    setError(null);

    try {
      const verification = await runAiVerification({
        ticker,
        fundamentals: stock?.fundamentals,
        technicals: stock?.technicals,
        analysisSummary: analysis?.summary?.headlineView,
      });
      setResult(verification);
      setStatus('success');
      return verification;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'AI verification is unavailable.';
      setError(message);
      setResult(null);
      setStatus('error');
      return null;
    }
  }, [analysis?.summary?.headlineView, stock]);

  return {
    result,
    status,
    error,
    runVerification,
    resetVerification,
  };
};
