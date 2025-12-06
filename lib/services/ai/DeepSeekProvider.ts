import type {
  AiVerificationRequest,
  AiVerificationResult,
} from '@/lib/domain/AnalysisTypes';
import type { AiProvider } from './aiProviderContracts';

const DEFAULT_ENDPOINT = '/api/ai-analysis';

const inferEndpoint = (): string => {
  const fromEnv = process.env.NEXT_PUBLIC_DEEP_VERIFICATION_ENDPOINT?.trim();
  if (fromEnv && fromEnv.length > 0) {
    return fromEnv;
  }
  return DEFAULT_ENDPOINT;
};

const parseStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
    .filter((entry) => entry.length > 0);
};

const mapResponse = (payload: unknown, fallbackTicker: string): AiVerificationResult => {
  if (!payload || typeof payload !== 'object') {
    throw new Error('AI verification response was empty.');
  }

  const record = payload as Record<string, unknown>;
  const summary =
    typeof record.summary === 'string' && record.summary.trim().length > 0
      ? record.summary.trim()
      : 'AI verification completed without a summary.';

  const timestamp =
    typeof record.timestampIso === 'string' && record.timestampIso.trim().length > 0
      ? record.timestampIso
      : new Date().toISOString();

  const providerLabel =
    typeof record.rawProviderLabel === 'string' && record.rawProviderLabel.trim().length > 0
      ? record.rawProviderLabel.trim()
      : undefined;

  const rawAnalysis =
    typeof record.rawAnalysis === 'string' && record.rawAnalysis.trim().length > 0
      ? record.rawAnalysis.trim()
      : undefined;

  const reasoningSteps =
    Array.isArray(record.reasoningSteps) && record.reasoningSteps.length > 0
      ? parseStringArray(record.reasoningSteps)
      : rawAnalysis
      ? [rawAnalysis]
      : [summary];

  return {
    ticker:
      typeof record.ticker === 'string' && record.ticker.trim().length > 0
        ? record.ticker.trim()
        : fallbackTicker,
    summary,
    reasoningSteps,
    strengths: parseStringArray(record.strengths),
    weaknesses: parseStringArray(record.weaknesses),
    alignmentWithAuroraView:
      record.alignmentWithAuroraView === 'aligned' ||
      record.alignmentWithAuroraView === 'partially_aligned' ||
      record.alignmentWithAuroraView === 'contradictory' ||
      record.alignmentWithAuroraView === 'unknown'
        ? record.alignmentWithAuroraView
        : 'unknown',
    riskFlags: parseStringArray(record.riskFlags),
    disclaimers: parseStringArray(record.disclaimers),
    providerName:
      record.providerName === 'deepseek' ||
      record.providerName === 'openai' ||
      record.providerName === 'demo'
        ? record.providerName
        : 'deepseek',
    rawProviderLabel: providerLabel,
    timestampIso: timestamp,
    confidenceLevel:
      record.confidenceLevel === 'high' ||
      record.confidenceLevel === 'medium' ||
      record.confidenceLevel === 'low' ||
      record.confidenceLevel === 'unknown'
        ? record.confidenceLevel
        : 'unknown',
    rawAnalysis,
  };
};

export class DeepSeekProvider implements AiProvider {
  readonly name = 'deepseek' as const;

  async verifyAnalysis(request: AiVerificationRequest): Promise<AiVerificationResult> {
    const ticker = request?.ticker?.trim().toUpperCase();
    if (!ticker) {
      throw new Error('Ticker is required for AI verification.');
    }

    const endpoint = inferEndpoint();
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticker,
        fundamentals: request.fundamentals,
        technicals: request.technicals,
        analysisSummary: request.analysisSummary,
        userProfileSummary: request.userProfileSummary,
      }),
    });

    if (!response.ok) {
      const detail = await response.text().catch(() => 'Unknown error');
      throw new Error(`AI verification failed (${response.status}): ${detail}`);
    }

    const payload = await response.json().catch(() => null);
    return mapResponse(payload, ticker);
  }
}

export const mapDeepSeekResponseToAiVerificationResult = mapResponse;
