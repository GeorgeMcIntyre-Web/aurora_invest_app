import type {
  AiVerificationAlignment,
  AiVerificationResult,
} from '@/lib/domain/AnalysisTypes';

type FundamentalsPayload = Record<string, unknown> | undefined;
type TechnicalsPayload = Record<string, unknown> | undefined;

const buildDataLine = (label: string, value: unknown) => `${label}: ${value ?? 'N/A'}`;

export const buildDeepSeekPrompt = (
  ticker: string,
  fundamentals: FundamentalsPayload,
  technicals: TechnicalsPayload,
  analysisSummary?: string
): string => {
  const trailingPe = fundamentals?.trailingPE ?? 'N/A';
  const epsGrowth = fundamentals?.epsGrowthYoYPct ?? 'N/A';
  const netMargin = fundamentals?.netMarginPct ?? 'N/A';
  const price = technicals?.price ?? 'N/A';
  const rsi = technicals?.rsi14 ?? 'N/A';
  const summaryLine = analysisSummary
    ? `Aurora summary: ${analysisSummary}`
    : 'Use Aurora inputs to form your own summary.';

  return `You are validating AuroraInvest's educational analysis for ${ticker}.

${summaryLine}

Data snapshot
${buildDataLine('- Price', price)}
${buildDataLine('- Trailing P/E', trailingPe)}
${buildDataLine('- EPS growth YoY (%)', epsGrowth)}
${buildDataLine('- Net margin (%)', netMargin)}
${buildDataLine('- RSI(14)', rsi)}

Deep Math V2 tasks:
1. Reconcile valuation vs growth using transparent math.
2. Run a lightweight DCF expectation check.
3. Explain how technical posture and sentiment align (or conflict) with the math.

Respond as JSON with keys:
- "summary": concise strategic view (framework language, uncertainty emphasized)
- "reasoningSteps": array of numbered steps
- "strengths": array of upside or supportive factors
- "weaknesses": array of concerns or headwinds
- "riskFlags": array of risks investors should monitor
- "alignmentWithAuroraView": "aligned" | "partially_aligned" | "contradictory" | "unknown"
- "confidenceLevel": "low" | "medium" | "high"
- "rawProviderLabel": optional label for your reasoning
- "rawAnalysis": optional verbatim analysis paragraph`;
};

const sanitizeArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
    .filter((entry) => entry.length > 0);
};

const splitReasoning = (value: unknown): string[] => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return [];
  }

  return value
    .split(/\r?\n|(?<=\.)\s+/)
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);
};

const deriveAlignment = (summary: string): AiVerificationAlignment => {
  const normalized = summary.toLowerCase();
  if (normalized.includes('contradict')) {
    return 'contradictory';
  }
  if (normalized.includes('partial') || normalized.includes('mixed')) {
    return 'partially_aligned';
  }
  if (normalized.includes('align') || normalized.includes('confirm')) {
    return 'aligned';
  }
  return 'unknown';
};

const defaultDisclaimers = () => [
  'This verification is educational only. Consult licensed professionals before acting.',
  'AI reasoning may contain errors; treat these notes as a secondary opinion.',
];

export const mapDeepSeekCompletionToResult = (params: {
  ticker: string;
  structured: Record<string, unknown> | null;
  fallbackText: string;
}): AiVerificationResult => {
  const { ticker, structured, fallbackText } = params;

  const summary =
    typeof structured?.summary === 'string' && structured.summary.trim().length > 0
      ? structured.summary.trim()
      : fallbackText;

  const reasoningSteps =
    structured?.reasoningSteps && sanitizeArray(structured.reasoningSteps).length > 0
      ? sanitizeArray(structured.reasoningSteps)
      : splitReasoning(structured?.reasoning ?? fallbackText);

  const strengths = sanitizeArray(structured?.strengths);
  const weaknesses = sanitizeArray(structured?.weaknesses);
  const riskFlags = sanitizeArray(structured?.riskFlags);

  const alignment =
    structured?.alignmentWithAuroraView === 'aligned' ||
    structured?.alignmentWithAuroraView === 'partially_aligned' ||
    structured?.alignmentWithAuroraView === 'contradictory' ||
    structured?.alignmentWithAuroraView === 'unknown'
      ? structured.alignmentWithAuroraView
      : deriveAlignment(summary);

  const confidenceLevel =
    structured?.confidenceLevel === 'high' ||
    structured?.confidenceLevel === 'medium' ||
    structured?.confidenceLevel === 'low'
      ? structured.confidenceLevel
      : 'unknown';

  const disclaimers =
    sanitizeArray(structured?.disclaimers).length > 0
      ? sanitizeArray(structured?.disclaimers)
      : defaultDisclaimers();

  const rawLabel =
    typeof structured?.rawProviderLabel === 'string' &&
    structured.rawProviderLabel.trim().length > 0
      ? structured.rawProviderLabel.trim()
      : undefined;

  const rawAnalysis =
    typeof structured?.rawAnalysis === 'string' && structured.rawAnalysis.trim().length > 0
      ? structured.rawAnalysis.trim()
      : undefined;

  const reasoningFallback = reasoningSteps.length > 0 ? reasoningSteps : [summary];

  return {
    ticker,
    summary,
    reasoningSteps: reasoningFallback,
    strengths: strengths.length > 0 ? strengths : reasoningFallback.slice(0, 2),
    weaknesses,
    alignmentWithAuroraView: alignment,
    riskFlags,
    disclaimers,
    providerName: 'deepseek',
    rawProviderLabel: rawLabel,
    timestampIso: new Date().toISOString(),
    confidenceLevel,
    rawAnalysis,
  };
};

export const extractDeepSeekErrorDetail = (
  payload: unknown,
  status: number
): string => {
  if (!payload || typeof payload !== 'object') {
    return `HTTP ${status}`;
  }

  const record = payload as Record<string, unknown>;
  const errorSection = record.error;
  if (errorSection && typeof errorSection === 'object') {
    const message = (errorSection as Record<string, unknown>).message;
    if (typeof message === 'string' && message.trim().length > 0) {
      return message.trim();
    }
  }

  if (typeof record.message === 'string' && record.message.trim().length > 0) {
    return record.message.trim();
  }

  return `HTTP ${status}`;
};

export const extractDeepSeekChoiceContent = (payload: unknown): string => {
  if (!payload || typeof payload !== 'object') {
    return '';
  }

  const record = payload as Record<string, unknown>;
  const choices = record.choices;
  if (!Array.isArray(choices) || choices.length === 0) {
    return '';
  }

  const first = choices[0];
  if (!first || typeof first !== 'object') {
    return '';
  }

  const message = (first as Record<string, unknown>).message;
  if (!message || typeof message !== 'object') {
    return '';
  }

  const content = (message as Record<string, unknown>).content;
  if (typeof content === 'string') {
    return content;
  }

  return '';
};
