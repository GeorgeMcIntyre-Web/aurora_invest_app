/**
 * Cloudflare Pages Function: Stock Search
 *
 * Provides real-time stock/ETF/fund search using Yahoo Finance API
 * No API key required - free tier sufficient for search functionality
 *
 * GET /api/search-stocks?q={query}
 *
 * Returns array of search results with ticker, name, type, exchange
 */

interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  exchange: string;
  region: string;
}

interface YahooQuoteResponse {
  quotes: Array<{
    symbol: string;
    shortname?: string;
    longname?: string;
    quoteType?: string;
    exchDisp?: string;
    typeDisp?: string;
    exchange?: string;
    region?: string;
  }>;
}

const YAHOO_FINANCE_API = 'https://query2.finance.yahoo.com/v1/finance/search';

// Asset type mapping for better display
const TYPE_LABELS: Record<string, string> = {
  'EQUITY': 'Stock',
  'ETF': 'ETF',
  'MUTUALFUND': 'Mutual Fund',
  'INDEX': 'Index',
  'CRYPTOCURRENCY': 'Crypto',
  'CURRENCY': 'Currency',
  'FUTURE': 'Future',
};

export async function onRequestGet(context: any) {
  try {
    const url = new URL(context.request.url);
    const query = url.searchParams.get('q');

    if (!query || query.trim().length < 1) {
      return new Response(
        JSON.stringify({ error: 'Query parameter "q" is required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Yahoo Finance search endpoint
    const apiUrl = new URL(YAHOO_FINANCE_API);
    apiUrl.searchParams.set('q', query.trim());
    apiUrl.searchParams.set('quotesCount', '15');
    apiUrl.searchParams.set('newsCount', '0');
    apiUrl.searchParams.set('enableFuzzyQuery', 'true');
    apiUrl.searchParams.set('quotesQueryId', 'tss_match_phrase_query');

    const response = await fetch(apiUrl.toString(), {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status}`);
    }

    const data: YahooQuoteResponse = await response.json();

    // Transform results
    const results: SearchResult[] = (data.quotes || [])
      .filter((quote) => {
        // Filter to relevant asset types
        const validTypes = ['EQUITY', 'ETF', 'MUTUALFUND', 'INDEX'];
        return quote.symbol && validTypes.includes(quote.quoteType || '');
      })
      .map((quote) => ({
        symbol: quote.symbol,
        name: quote.longname || quote.shortname || quote.symbol,
        type: TYPE_LABELS[quote.quoteType || ''] || quote.typeDisp || 'Unknown',
        exchange: quote.exchDisp || quote.exchange || '',
        region: quote.region || 'US',
      }))
      .slice(0, 15);

    return new Response(
      JSON.stringify({
        query: query.trim(),
        results,
        count: results.length,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60',
        },
      }
    );

  } catch (error) {
    console.error('Stock search error:', error);

    if (error instanceof Error && error.name === 'TimeoutError') {
      return new Response(
        JSON.stringify({ error: 'Search request timeout' }),
        {
          status: 504,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: 'Failed to search stocks',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
