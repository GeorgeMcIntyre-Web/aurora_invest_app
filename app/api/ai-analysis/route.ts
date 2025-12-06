import { NextResponse } from 'next/server';
import type { DeepVerificationResult, DeepVerificationSuccess } from '@/lib/domain/AnalysisTypes';

const SUCCESS_STATUS: DeepVerificationSuccess['status'] = 'success';
const DEFAULT_MODEL = 'deepseek-chat';
const DEFAULT_BASE_URL = 'https://api.deepseek.com';
const DEFAULT_TIMEOUT_MS = 20_000;

const respond = (body: DeepVerificationResult, status = 200) =>
  NextResponse.json(body, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  });

const buildError = (
  status: Exclude<DeepVerificationResult['status'], 'success'>,
  message: string,
  detail?: string,
  retryable = true
): DeepVerificationResult => ({
  status,
  message,
  detail,
  retryable,
});

const clampConfidence = (value: unknown): number => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 50;
  }
  if (value < 0) {
    return 0;
  }
  if (value > 100) {
    return 100;
  }
  return Number(value.toFixed(2));
};

const inferConfidenceLabel = (
  score: number,
  label: unknown
): 'low' | 'medium' | 'high' => {
  if (label === 'low' || label === 'medium' || label === 'high') {
    return label;
  }
  if (score >= 67) {
    return 'high' as const;
  }
  if (score >= 40) {
    return 'medium' as const;
  }
  return 'low' as const;
};

const normalizeBulletPoints = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
      .filter((entry) => entry.length > 0)
      .slice(0, 5);
  }
  if (typeof value === 'string') {
    return value
      .split(/\r?\n|•|-\s/)
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0)
      .slice(0, 5);
  }
  return [];
};

const buildPrompt = (
  ticker: string,
  fundamentals: Record<string, unknown> | undefined,
  technicals: Record<string, unknown> | undefined
) => {
  const trailingPe = fundamentals?.trailingPE ?? 'N/A';
  const growth = fundamentals?.epsGrowthYoYPct ?? 'N/A';
  const margin = fundamentals?.netMarginPct ?? 'N/A';
  const price = technicals?.price ?? 'N/A';
  const rsi = technicals?.rsi14 ?? 'N/A';

  return `You are validating AuroraInvest's educational analysis for ${ticker}.

Key data
- Price: ${price}
- Trailing P/E: ${trailingPe}
- EPS growth (YoY %): ${growth}
- Net margin (%): ${margin}
- RSI(14): ${rsi}

Deep Math V2 checklist:
1. Contrast valuation (P/E, PEG) with sustainable growth.
2. Run a lightweight DCF expectation check.
3. Explain how technicals and sentiment either confirm or contradict the math.

Reply with JSON fields: verdict, confidenceLabel, confidenceScore, reasoning, analysis, bulletPoints (array of strings). Maintain framework language and uncertainty.`;
};

export async function POST(request: Request) {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
  if (!apiKey) {
    return respond(
      buildError(
        'config_error',
        'DeepSeek API key missing.',
        'Set DEEPSEEK_API_KEY in your environment.',
        false
      ),
      500
    );
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch (error) {
    return respond(
      buildError('bad_request', 'Invalid JSON payload.', (error as Error)?.message, false),
      400
    );
  }

  const ticker =
    typeof payload?.ticker === 'string' ? payload.ticker.trim().toUpperCase() : '';
  if (ticker.length === 0) {
    return respond(
      buildError('bad_request', 'Ticker is required for Deep Verification.', 'Missing ticker.', false),
      400
    );
  }

  const fundamentals: Record<string, unknown> =
    typeof payload.fundamentals === 'object' && payload.fundamentals !== null
      ? (payload.fundamentals as Record<string, unknown>)
      : {};
  const technicals: Record<string, unknown> =
    typeof payload.technicals === 'object' && payload.technicals !== null
      ? (payload.technicals as Record<string, unknown>)
      : {};

  const baseUrl = process.env.DEEPSEEK_API_BASE ?? DEFAULT_BASE_URL;
  const model = process.env.DEEPSEEK_MODEL ?? DEFAULT_MODEL;
  const timeoutMs = Number(process.env.DEEP_VERIFICATION_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        stream: false,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: buildPrompt(ticker, fundamentals, technicals) },
          { role: 'user', content: `Run Deep Math V2 for ${ticker}.` },
        ],
      }),
      signal: controller.signal,
    });

    const text = await response.text();
    if (text.trim().length === 0) {
      return respond(
        buildError('upstream_error', 'DeepSeek returned an empty response.', 'Empty body.'),
        502
      );
    }

    let body: any;
    try {
      body = JSON.parse(text);
    } catch (error) {
      return respond(
        buildError(
          'upstream_error',
          'DeepSeek returned malformed JSON.',
          (error as Error)?.message
        ),
        502
      );
    }

    if (!response.ok) {
      const detail =
        body?.error?.message ?? body?.message ?? `HTTP ${response.status}`;
      return respond(
        buildError('upstream_error', 'DeepSeek rejected the verification request.', detail),
        response.status
      );
    }

    const choiceContent = body?.choices?.[0]?.message?.content ?? '';
    let structured: Record<string, unknown> | null = null;
    try {
      structured =
        typeof choiceContent === 'string' && choiceContent.trim().length > 0
          ? JSON.parse(choiceContent)
          : null;
    } catch {
      structured = null;
    }

    const fallbackText =
      typeof choiceContent === 'string' && choiceContent.trim().length > 0
        ? choiceContent.trim()
        : 'DeepSeek completed the verification.';

    const confidenceScore = clampConfidence(structured?.confidenceScore);
    const verdictPayload: DeepVerificationResult = {
      status: SUCCESS_STATUS,
      provider: 'deepseek',
      verdict:
        typeof structured?.verdict === 'string' && structured.verdict.trim().length > 0
          ? structured.verdict.trim()
          : fallbackText,
      confidenceLabel: inferConfidenceLabel(confidenceScore, structured?.confidenceLabel),
      confidenceScore,
      reasoning:
        typeof structured?.reasoning === 'string' && structured.reasoning.trim().length > 0
          ? structured.reasoning.trim()
          : fallbackText,
      analysis:
        typeof structured?.analysis === 'string' && structured.analysis.trim().length > 0
          ? structured.analysis.trim()
          : fallbackText,
      bulletPoints: normalizeBulletPoints(structured?.bulletPoints ?? structured?.keyPoints),
      generatedAt: new Date().toISOString(),
      rawResponse: typeof choiceContent === 'string' ? choiceContent : undefined,
    };

    return respond(verdictPayload, 200);
  } catch (error) {
    if ((error as Error)?.name === 'AbortError') {
      return respond(
        buildError('timeout', 'Deep verification timed out.', 'DeepSeek did not respond in time.'),
        504
      );
    }

    return respond(
      buildError(
        'ai_unavailable',
        'Deep verification is temporarily unavailable.',
        (error as Error)?.message ?? 'Unknown error.'
      ),
      502
    );
  } finally {
    clearTimeout(timeoutId);
  }
}
