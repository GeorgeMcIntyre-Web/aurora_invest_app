import {
  DeepVerificationRequest,
  DeepVerificationResult,
  DeepVerificationError,
  DeepVerificationSuccess,
  DeepVerificationStatus,
  DeepVerificationConfidence,
} from '@/lib/domain/AnalysisTypes';

const DEFAULT_ENDPOINT = '/api/ai-analysis';
const DEFAULT_TIMEOUT_MS = 20_000;
const SUCCESS_STATUS: DeepVerificationStatus = 'success';

interface DeepVerificationOptions {
  endpointOverride?: string;
  timeoutMs?: number;
  signal?: AbortSignal;
}

const toUpperTicker = (ticker?: string): string => {
  if (typeof ticker !== 'string') {
    return '';
  }
  return ticker.trim().toUpperCase();
};

const collectBulletPoints = (source: unknown): string[] => {
  if (Array.isArray(source)) {
    return source
      .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
      .filter((entry) => entry.length > 0)
      .slice(0, 5);
  }

  if (typeof source === 'string') {
    return source
      .split(/\r?\n|•|-\s/)
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0)
      .slice(0, 5);
  }

  return [];
};

const coerceConfidenceLabel = (
  rawLabel: unknown,
  score: number
): DeepVerificationConfidence => {
  if (rawLabel === 'low' || rawLabel === 'medium' || rawLabel === 'high') {
    return rawLabel;
  }

  if (Number.isFinite(score) && score >= 67) {
    return 'high';
  }

  if (Number.isFinite(score) && score >= 40) {
    return 'medium';
  }

  return 'low';
};

const clampScore = (value: unknown): number => {
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

const mapStatus = (value: unknown): DeepVerificationStatus => {
  if (value === 'success') {
    return 'success';
  }
  if (value === 'config_error') {
    return 'config_error';
  }
  if (value === 'bad_request') {
    return 'bad_request';
  }
  if (value === 'upstream_error') {
    return 'upstream_error';
  }
  if (value === 'timeout') {
    return 'timeout';
  }
  if (value === 'ai_unavailable') {
    return 'ai_unavailable';
  }
  return 'upstream_error';
};

const buildError = (
  status: DeepVerificationError['status'],
  message: string,
  detail?: string,
  retryable = true
): DeepVerificationError => ({
  status,
  message,
  detail,
  retryable,
});

const inferEndpoint = (override?: string): string => {
  if (typeof override === 'string' && override.trim().length > 0) {
    return override.trim();
  }

  const fromEnv = process.env.NEXT_PUBLIC_DEEP_VERIFICATION_URL;
  if (typeof fromEnv === 'string' && fromEnv.trim().length > 0) {
    return fromEnv.trim();
  }

  return DEFAULT_ENDPOINT;
};

const parseSuccessPayload = (payload: Record<string, unknown>): DeepVerificationSuccess => {
  const verdict =
    typeof payload.verdict === 'string' && payload.verdict.trim().length > 0
      ? payload.verdict.trim()
      : 'Deep verification completed without a summarized verdict.';

  const reasoning =
    typeof payload.reasoning === 'string' && payload.reasoning.trim().length > 0
      ? payload.reasoning.trim()
      : 'DeepSeek returned the result without detailed reasoning.';

  const analysis =
    typeof payload.analysis === 'string' && payload.analysis.trim().length > 0
      ? payload.analysis.trim()
      : reasoning;

  const confidenceScore = clampScore(payload.confidenceScore);
  const confidenceLabel = coerceConfidenceLabel(payload.confidenceLabel, confidenceScore);
  const bulletPoints =
    collectBulletPoints(payload.bulletPoints).length > 0
      ? collectBulletPoints(payload.bulletPoints)
      : collectBulletPoints(analysis);

  const generatedAt =
    typeof payload.generatedAt === 'string' && payload.generatedAt.trim().length > 0
      ? payload.generatedAt
      : new Date().toISOString();

  const rawResponse =
    typeof payload.rawResponse === 'string' && payload.rawResponse.trim().length > 0
      ? payload.rawResponse
      : undefined;

  return {
    status: SUCCESS_STATUS,
    provider: 'deepseek',
    verdict,
    confidenceLabel,
    confidenceScore,
    reasoning,
    analysis,
    bulletPoints,
    generatedAt,
    rawResponse,
  };
};

export const parseDeepVerificationResponse = (
  payload: unknown
): DeepVerificationResult => {
  if (payload === null || typeof payload !== 'object') {
    return buildError(
      'upstream_error',
      'Deep verification returned an empty response.',
      'Upstream payload missing.',
      true
    );
  }

  const record = payload as Record<string, unknown>;
  const status = mapStatus(record.status);

  if (status === SUCCESS_STATUS) {
    return parseSuccessPayload(record);
  }

  const message =
    typeof record.message === 'string' && record.message.trim().length > 0
      ? record.message.trim()
      : 'Deep verification could not run.';

  const detail =
    typeof record.detail === 'string' && record.detail.trim().length > 0
      ? record.detail.trim()
      : undefined;

  const retryable =
    typeof record.retryable === 'boolean' ? record.retryable : status !== 'bad_request';

  return buildError(status, message, detail, retryable);
};

const attachAbortHandlers = (
  controller: AbortController,
  upstream?: AbortSignal
): (() => void) => {
  if (!upstream) {
    return () => undefined;
  }

  const forwardAbort = () => {
    if (controller.signal.aborted) {
      return;
    }
    controller.abort(upstream.reason);
  };

  if (upstream.aborted) {
    controller.abort(upstream.reason);
    return () => undefined;
  }

  upstream.addEventListener('abort', forwardAbort);
  return () => upstream.removeEventListener('abort', forwardAbort);
};

export async function runDeepVerification(
  request: DeepVerificationRequest,
  options: DeepVerificationOptions = {}
): Promise<DeepVerificationResult> {
  const normalizedTicker = toUpperTicker(request?.ticker);
  if (normalizedTicker.length === 0) {
    return buildError(
      'bad_request',
      'A ticker is required before running Deep Verification.',
      'Missing ticker input.',
      false
    );
  }

  const endpoint = inferEndpoint(options.endpointOverride);
  const timeoutMs = typeof options.timeoutMs === 'number' ? options.timeoutMs : DEFAULT_TIMEOUT_MS;

  const controller = new AbortController();
  const detach = attachAbortHandlers(controller, options.signal);
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...request,
        ticker: normalizedTicker,
      }),
      signal: controller.signal,
    });

    const text = await response.text();
    if (text.trim().length === 0) {
      return buildError(
        'upstream_error',
        'Deep verification returned no data.',
        'Empty response body.',
        true
      );
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (parseError) {
      return buildError(
        'upstream_error',
        'Deep verification response could not be parsed.',
        parseError instanceof Error ? parseError.message : 'Invalid JSON payload.',
        true
      );
    }

    const result = parseDeepVerificationResponse(parsed);
    if (response.ok) {
      return result;
    }

    if (result.status === SUCCESS_STATUS) {
      return buildError(
        'upstream_error',
        'Deep verification returned a non-success status.',
        `HTTP ${response.status}`,
        true
      );
    }

    return result;
  } catch (error) {
    if (controller.signal.aborted) {
      return buildError(
        'timeout',
        'Deep verification timed out.',
        'The DeepSeek request exceeded the allotted time.',
        true
      );
    }

    const detail = error instanceof Error ? error.message : String(error);
    return buildError(
      'ai_unavailable',
      'Deep verification is temporarily unavailable.',
      detail,
      true
    );
  } finally {
    clearTimeout(timeoutId);
    detach();
  }
}
