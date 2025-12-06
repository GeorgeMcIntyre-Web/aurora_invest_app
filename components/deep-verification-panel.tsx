'use client';

import { useCallback, useMemo, useState } from 'react';
import { BrainCircuit, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { StockData, AnalysisResult, DeepVerificationResult } from '@/lib/domain/AnalysisTypes';
import { runDeepVerification } from '@/lib/services/deepVerificationService';
import { describeDeepVerificationStatus } from './deep-verification-messages';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DeepVerificationPanelProps {
  stock: StockData;
  analysis?: AnalysisResult | null;
}

const COOLDOWN_MS = 15_000;

const toneClassMap: Record<string, string> = {
  danger: 'border-red-700/60 bg-red-900/20 text-red-200',
  warning: 'border-yellow-700/60 bg-yellow-900/20 text-yellow-200',
  success: 'border-emerald-700/60 bg-emerald-900/20 text-emerald-200',
  info: 'border-ai-accent/40 bg-ai-accent/10 text-ai-text',
};

export function DeepVerificationPanel({ stock, analysis }: DeepVerificationPanelProps) {
  const [verification, setVerification] = useState<DeepVerificationResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  const normalizedTicker = typeof stock?.ticker === 'string' ? stock.ticker.trim() : '';
  const now = Date.now();
  const isCoolingDown = typeof cooldownUntil === 'number' && cooldownUntil > now;
  const cooldownSeconds = isCoolingDown ? Math.max(1, Math.ceil((cooldownUntil - now) / 1000)) : 0;
  const banner = describeDeepVerificationStatus(verification, { isCoolingDown });

  const verdictBullets = useMemo(() => {
    if (verification?.status !== 'success') {
      return [];
    }
    return verification.bulletPoints;
  }, [verification]);

  const confidenceCopy = useMemo(() => {
    if (verification?.status !== 'success') {
      return null;
    }
    const adjective =
      verification.confidenceLabel === 'high'
        ? 'higher conviction'
        : verification.confidenceLabel === 'medium'
        ? 'balanced conviction'
        : 'lower conviction';

    return `${verification.confidenceScore}/100 • ${adjective}`;
  }, [verification]);

  const runVerification = useCallback(async () => {
    if (busy) {
      return;
    }
    if (isCoolingDown) {
      return;
    }

    setBusy(true);
    setErrorDetail(null);
    try {
      const response = await runDeepVerification({
        ticker: normalizedTicker,
        fundamentals: stock.fundamentals,
        technicals: stock.technicals,
      });
      setVerification(response);
      setCooldownUntil(Date.now() + COOLDOWN_MS);

      if (response.status !== 'success') {
        setErrorDetail(response.message);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to reach DeepSeek.';
      setErrorDetail(message);
    } finally {
      setBusy(false);
    }
  }, [busy, isCoolingDown, normalizedTicker, stock.fundamentals, stock.technicals]);

  if (normalizedTicker.length === 0) {
    return null;
  }

  const bannerToneClass = toneClassMap[banner.tone] ?? toneClassMap.info;

  return (
    <div className="bg-ai-card border border-ai-accent/30 rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BrainCircuit className="h-6 w-6 text-purple-400" />
          <div>
            <p className="text-xl font-bold text-ai-text">Deep Math V2 Verification</p>
            <p className="text-xs text-ai-muted">
              DeepSeek audits Aurora&apos;s analysis with deterministic reasoning.
            </p>
          </div>
        </div>
        <Button
          onClick={() => void runVerification()}
          disabled={busy || isCoolingDown}
          className="bg-purple-600 hover:bg-purple-700 text-white min-w-[180px]"
        >
          {busy ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying
            </span>
          ) : isCoolingDown ? (
            `Cooling down (${cooldownSeconds}s)`
          ) : (
            'Run Deep Verification'
          )}
        </Button>
      </div>

      <div className={`rounded-lg border px-4 py-3 text-sm ${bannerToneClass}`}>
        <p className="font-semibold">{banner.title}</p>
        <p className="text-xs opacity-80 mt-1">{banner.message}</p>
        {errorDetail && (
          <p className="text-xs opacity-60 mt-1">
            {errorDetail}
          </p>
        )}
      </div>

      {verification?.status === 'success' && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="bg-black/20 border-purple-500/30">
            <CardHeader>
              <CardTitle className="text-sm font-mono text-purple-300">
                Step-by-step reasoning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert prose-sm max-h-[360px] overflow-y-auto font-mono text-xs text-gray-300 whitespace-pre-wrap bg-black/40 p-4 rounded">
                {verification.reasoning}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-ai-bg/50 border border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-ai-accent">
                <CheckCircle2 className="h-4 w-4" />
                Strategic conclusion
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-ai-text whitespace-pre-wrap">{verification.analysis}</p>
              {verdictBullets.length > 0 && (
                <ul className="space-y-2">
                  {verdictBullets.map((point) => (
                    <li key={point} className="text-sm text-ai-text bg-ai-bg p-3 rounded-lg flex gap-2">
                      <span className="text-ai-accent mt-0.5">•</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              )}
              {confidenceCopy && (
                <div className="text-xs text-ai-muted">
                  Confidence: {confidenceCopy}. DeepSeek provider: {verification.provider}.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {analysis?.disclaimer && (
        <div className="flex items-start gap-2 rounded-lg border border-yellow-700/50 bg-yellow-950/40 p-3 text-xs text-yellow-200">
          <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5" />
          <span>
            {analysis.disclaimer} Deep verification remains an educational stress test rather than
            personalized guidance.
          </span>
        </div>
      )}
    </div>
  );
}
