/**
 * Cloudflare Function: Market Data Proxy
 *
 * Proxies requests to Yahoo Finance API to avoid CORS issues.
 * Yahoo Finance doesn't allow browser-origin requests, so this
 * server-side function fetches data on behalf of the client.
 */

interface YahooQuoteResponse {
  quoteResponse?: {
    result?: Array<{
      symbol: string;
      regularMarketPrice?: number;
      regularMarketVolume?: number;
      regularMarketDayHigh?: number;
      regularMarketDayLow?: number;
      fiftyTwoWeekHigh?: number;
      fiftyTwoWeekLow?: number;
      marketCap?: number;
      trailingPE?: number;
      forwardPE?: number;
      dividendYield?: number;
      averageDailyVolume3Month?: number;
      sharesOutstanding?: number;
      shortName?: string;
      longName?: string;
    }>;
    error?: {
      code: string;
      description: string;
    };
  };
}

// Try multiple Yahoo Finance endpoints - some work better from different regions/IPs
const YAHOO_ENDPOINTS = [
  'https://query1.finance.yahoo.com',
  'https://query2.finance.yahoo.com',
];
const DEFAULT_TIMEOUT_MS = 10_000;

const corsHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const createResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders,
  });

const createErrorResponse = (message: string, status = 500, detail?: string) =>
  createResponse({ error: message, detail }, status);

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        // Use a more complete set of browser headers to avoid being blocked
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,application/json,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Try fetching from multiple Yahoo endpoints until one succeeds
 */
async function fetchFromYahooWithFallback(
  path: string,
  timeoutMs: number
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (const baseUrl of YAHOO_ENDPOINTS) {
    try {
      const response = await fetchWithTimeout(`${baseUrl}${path}`, timeoutMs);
      // If we get a successful response or a client error (4xx), return it
      // Only retry on server errors (5xx) or network issues
      if (response.ok || response.status < 500) {
        return response;
      }
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      // Continue to next endpoint
    }
  }
  
  throw lastError || new Error('All Yahoo Finance endpoints failed');
}

/**
 * GET /api/market-data?ticker=AAPL&type=quote|chart|financial
 * POST /api/market-data { ticker: "AAPL", type: "quote"|"chart"|"financial", range?: "1mo"|"3mo"|"6mo"|"1y"|"5y" }
 */
export async function onRequestGet(context: { request: Request; env: Record<string, string> }) {
  const url = new URL(context.request.url);
  const ticker = url.searchParams.get('ticker')?.trim().toUpperCase();
  const type = url.searchParams.get('type') || 'quote';
  const range = url.searchParams.get('range') || '6mo';

  if (!ticker) {
    return createErrorResponse('Ticker parameter is required', 400);
  }

  return handleMarketDataRequest(ticker, type, range, context.env);
}

export async function onRequestPost(context: { request: Request; env: Record<string, string> }) {
  let body: Record<string, unknown>;
  try {
    body = await context.request.json();
  } catch {
    return createErrorResponse('Request body must be valid JSON', 400);
  }

  const ticker = typeof body?.ticker === 'string' ? body.ticker.trim().toUpperCase() : '';
  const type = typeof body?.type === 'string' ? body.type : 'quote';
  const range = typeof body?.range === 'string' ? body.range : '6mo';

  if (!ticker) {
    return createErrorResponse('Ticker is required', 400);
  }

  return handleMarketDataRequest(ticker, type, range, context.env);
}

async function handleMarketDataRequest(
  ticker: string,
  type: string,
  range: string,
  env: Record<string, string>
): Promise<Response> {
  const timeoutMs = parseInt(env.NEXT_PUBLIC_MARKET_DATA_TIMEOUT_MS || String(DEFAULT_TIMEOUT_MS), 10);

  try {
    let yahooPath: string;

    switch (type) {
      case 'quote':
        yahooPath = `/v7/finance/quote?symbols=${encodeURIComponent(ticker)}`;
        break;
      case 'chart':
        yahooPath = `/v8/finance/chart/${encodeURIComponent(ticker)}?range=${range}&interval=1d`;
        break;
      case 'financial':
        yahooPath = `/v10/finance/quoteSummary/${encodeURIComponent(ticker)}?modules=financialData,defaultKeyStatistics,earnings`;
        break;
      default:
        return createErrorResponse(`Unknown data type: ${type}`, 400);
    }

    const response = await fetchFromYahooWithFallback(yahooPath, timeoutMs);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`Yahoo Finance API error for ${ticker}:`, response.status, errorText);

      if (response.status === 404) {
        return createErrorResponse(`Ticker ${ticker} not found`, 404);
      }

      return createErrorResponse(
        `Yahoo Finance returned HTTP ${response.status}`,
        response.status >= 500 ? 502 : response.status
      );
    }

    const data = await response.json();

    // Check for Yahoo Finance API-level errors
    if (type === 'quote') {
      const quoteResponse = data as YahooQuoteResponse;
      if (quoteResponse.quoteResponse?.error) {
        return createErrorResponse(
          quoteResponse.quoteResponse.error.description || 'Yahoo Finance API error',
          400
        );
      }
      if (!quoteResponse.quoteResponse?.result?.length) {
        return createErrorResponse(`No data found for ticker ${ticker}`, 404);
      }
    }

    return createResponse(data);
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return createErrorResponse('Request to Yahoo Finance timed out', 504);
      }
      console.error(`Market data proxy error for ${ticker}:`, error.message);
      return createErrorResponse(`Network error: ${error.message}`, 502);
    }
    return createErrorResponse('Unknown error occurred', 500);
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: corsHeaders,
  });
}
