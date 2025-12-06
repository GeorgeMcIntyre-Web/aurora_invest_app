const SUCCESS_STATUS = 'success';
const DEFAULT_MODEL = 'deepseek-chat';
const DEFAULT_BASE_URL = 'https://api.deepseek.com';
const DEFAULT_TIMEOUT_MS = 20_000;

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

const createResponse = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders,
  });

const buildError = (status, message, detail, retryable = true) => ({
  status,
  message,
  detail,
  retryable,
});

const clampConfidence = (value) => {
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

const inferConfidenceLabel = (score, label) => {
  if (label === 'low' || label === 'medium' || label === 'high') {
    return label;
  }
  if (score >= 67) {
    return 'high';
  }
  if (score >= 40) {
    return 'medium';
  }
  return 'low';
};

const normalizeBulletPoints = (value) => {
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

const buildPrompt = (ticker, fundamentals = {}, technicals = {}) => {
  const pe = fundamentals?.trailingPE ?? 'N/A';
  const growth = fundamentals?.epsGrowthYoYPct ?? 'N/A';
  const margin = fundamentals?.netMarginPct ?? 'N/A';
  const price = technicals?.price ?? 'N/A';
  const rsi = technicals?.rsi14 ?? 'N/A';

  return `You are a quantitative research assistant who stress-tests AuroraInvest's educational framework.

Stock: ${ticker}
Price snapshot: ${price}
Trailing P/E: ${pe}
EPS growth YoY (%): ${growth}
Net margin (%): ${margin}
RSI(14): ${rsi}

Perform the "Deep Math V2" verification:
1. Reconcile valuation vs growth using simple PEG math.
2. Run a quick DCF-style sanity check using the growth inputs.
3. Explain how current technical posture and sentiment either confirm or contradict the math.

Respond as JSON with the following keys:
- "verdict": concise framework-friendly summary.
- "confidenceLabel": "low" | "medium" | "high".
- "confidenceScore": number 0-100.
- "reasoning": detailed numbered reasoning steps.
- "analysis": strategic conclusion for educational investors.
- "bulletPoints": array of 3-5 highlights or cautionary flags.`;
};

export async function onRequestPost(context) {
  const env = context?.env ?? {};
  const apiKey = typeof env.DEEPSEEK_API_KEY === 'string' ? env.DEEPSEEK_API_KEY.trim() : '';
  if (apiKey.length === 0) {
    return createResponse(
      buildError(
        'config_error',
        'DeepSeek API key is not configured.',
        'Set DEEPSEEK_API_KEY in Cloudflare Pages settings.',
        false
      ),
      500
    );
  }

  let body = null;
  try {
    body = await context.request.json();
  } catch (parseError) {
    return createResponse(
      buildError(
        'bad_request',
        'Request body must be valid JSON.',
        parseError?.message ?? 'JSON parse failure.',
        false
      ),
      400
    );
  }

  const ticker =
    typeof body?.ticker === 'string' ? body.ticker.trim().toUpperCase() : '';
  if (ticker.length === 0) {
    return createResponse(
      buildError('bad_request', 'Ticker is required for Deep Verification.', 'Missing ticker.', false),
      400
    );
  }

  const fundamentals = body?.fundamentals ?? {};
  const technicals = body?.technicals ?? {};
  const baseUrl = env.DEEPSEEK_API_BASE ?? DEFAULT_BASE_URL;
  const model = env.DEEPSEEK_MODEL ?? DEFAULT_MODEL;
  const timeoutMs = Number(env.DEEP_VERIFICATION_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS);

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
          {
            role: 'user',
            content: `Run the Deep Math V2 verification for ${ticker} and respond with JSON.`,
          },
        ],
      }),
      signal: controller.signal,
    });

    const rawText = await response.text();
    if (rawText.trim().length === 0) {
      return createResponse(
        buildError(
          'upstream_error',
          'DeepSeek returned an empty response.',
          'Empty body.',
          true
        ),
        502
      );
    }

    let payload = null;
    try {
      payload = JSON.parse(rawText);
    } catch (jsonError) {
      return createResponse(
        buildError(
          'upstream_error',
          'DeepSeek returned malformed JSON.',
          jsonError?.message ?? 'Invalid JSON.',
          true
        ),
        502
      );
    }

    if (response.ok !== true) {
      const detail =
        payload?.error?.message ??
        payload?.message ??
        `HTTP ${response.status}`;
      return createResponse(
        buildError('upstream_error', 'DeepSeek rejected the verification request.', detail, true),
        response.status
      );
    }

    const content = payload?.choices?.[0]?.message?.content ?? '';
    let structured = null;
    try {
      structured = typeof content === 'string' && content.trim().length > 0
        ? JSON.parse(content)
        : null;
    } catch (structureError) {
      structured = null;
    }

    const fallbackAnalysis = typeof content === 'string' && content.trim().length > 0
      ? content.trim()
      : 'DeepSeek completed the verification.';

    const confidenceScore = clampConfidence(structured?.confidenceScore);
    const successPayload = {
      status: SUCCESS_STATUS,
      provider: 'deepseek',
      verdict:
        typeof structured?.verdict === 'string' && structured.verdict.trim().length > 0
          ? structured.verdict.trim()
          : fallbackAnalysis,
      confidenceLabel: inferConfidenceLabel(confidenceScore, structured?.confidenceLabel),
      confidenceScore,
      reasoning:
        typeof structured?.reasoning === 'string' && structured.reasoning.trim().length > 0
          ? structured.reasoning.trim()
          : fallbackAnalysis,
      analysis:
        typeof structured?.analysis === 'string' && structured.analysis.trim().length > 0
          ? structured.analysis.trim()
          : fallbackAnalysis,
      bulletPoints:
        normalizeBulletPoints(structured?.bulletPoints ?? structured?.keyPoints ?? []) ??
        [],
      generatedAt: new Date().toISOString(),
      rawResponse: typeof content === 'string' ? content : undefined,
    };

    return createResponse(successPayload, 200);
  } catch (error) {
    if (error?.name === 'AbortError') {
      return createResponse(
        buildError(
          'timeout',
          'Deep verification timed out.',
          'DeepSeek did not respond in time.',
          true
        ),
        504
      );
    }

    console.error('[Deep Verification] Unexpected failure', error);
    return createResponse(
      buildError(
        'ai_unavailable',
        'Deep verification is temporarily unavailable.',
        error?.message ?? 'Unknown error.',
        true
      ),
      502
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      ...corsHeaders,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
