import {
  buildDeepSeekPrompt,
  mapDeepSeekCompletionToResult,
  extractDeepSeekErrorDetail,
  extractDeepSeekChoiceContent,
} from '../../lib/services/ai/deepseekServerHelpers';
import type { AiVerificationResult } from '../../lib/domain/AnalysisTypes';

const DEFAULT_MODEL = 'deepseek-chat';
const DEFAULT_BASE_URL = 'https://api.deepseek.com';
const DEFAULT_TIMEOUT_MS = 20_000;

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

const createResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders,
  });

export async function onRequestPost(context: { request: Request; env: Record<string, string> }) {
  const apiKey = context?.env?.DEEPSEEK_API_KEY?.trim();
  if (!apiKey) {
    return createResponse(
      { error: 'DeepSeek API key is not configured. Set DEEPSEEK_API_KEY in Cloudflare Pages.' },
      500
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await context.request.json();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid JSON payload.';
    return createResponse({ error: 'Request body must be valid JSON.', detail: message }, 400);
  }

  const ticker =
    typeof body?.ticker === 'string' ? body.ticker.trim().toUpperCase() : '';
  if (!ticker) {
    return createResponse({ error: 'Ticker is required for AI verification.' }, 400);
  }

  const fundamentals =
    typeof body.fundamentals === 'object' && body.fundamentals !== null
      ? (body.fundamentals as Record<string, unknown>)
      : undefined;
  const technicals =
    typeof body.technicals === 'object' && body.technicals !== null
      ? (body.technicals as Record<string, unknown>)
      : undefined;
  const analysisSummary =
    typeof body.analysisSummary === 'string' ? body.analysisSummary : undefined;

  const baseUrl = context.env.DEEPSEEK_API_BASE ?? DEFAULT_BASE_URL;
  const model = context.env.DEEPSEEK_MODEL ?? DEFAULT_MODEL;
  const timeoutMs = Number(context.env.DEEP_VERIFICATION_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS);

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
          {
            role: 'system',
            content: buildDeepSeekPrompt(ticker, fundamentals, technicals, analysisSummary),
          },
          {
            role: 'user',
            content: `Run the Deep Math V2 verification for ${ticker} and respond with JSON.`,
          },
        ],
      }),
      signal: controller.signal,
    });

    const rawText = await response.text();
    if (!rawText || rawText.trim().length === 0) {
      return createResponse({ error: 'DeepSeek returned an empty response.' }, 502);
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(rawText);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid JSON payload.';
      return createResponse({ error: 'DeepSeek returned malformed JSON.', detail: message }, 502);
    }

    if (!response.ok) {
      const detail = extractDeepSeekErrorDetail(parsed, response.status);
      return createResponse(
        { error: 'DeepSeek rejected the verification request.', detail },
        response.status
      );
    }

    const choiceContent = extractDeepSeekChoiceContent(parsed);
    const fallbackText =
      typeof choiceContent === 'string' && choiceContent.trim().length > 0
        ? choiceContent.trim()
        : 'DeepSeek completed the verification.';

    let structured: Record<string, unknown> | null = null;
    try {
      structured =
        typeof choiceContent === 'string' && choiceContent.trim().length > 0
          ? JSON.parse(choiceContent)
          : null;
    } catch {
      structured = null;
    }

    const payload: AiVerificationResult = mapDeepSeekCompletionToResult({
      ticker,
      structured,
      fallbackText,
    });

    return createResponse(payload, 200);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return createResponse({ error: 'Deep verification timed out.' }, 504);
    }
    const detail = error instanceof Error ? error.message : 'Unknown error.';
    return createResponse(
      { error: 'Deep verification is temporarily unavailable.', detail },
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
