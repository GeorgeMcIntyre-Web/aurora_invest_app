import { NextRequest, NextResponse } from 'next/server';

/**
 * Stock Search API Endpoint
 *
 * Provides real-time stock/ETF/fund search using Yahoo Finance API
 * No API key required - free tier sufficient for search functionality
 *
 * GET /api/search-stocks?q={query}
 *
 * Returns array of search results with ticker, name, type, exchange
 */

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
export const runtime = 'edge';

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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.trim().length < 1) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    // Yahoo Finance search endpoint
    const url = new URL(YAHOO_FINANCE_API);
    url.searchParams.set('q', query.trim());
    url.searchParams.set('quotesCount', '15');
    url.searchParams.set('newsCount', '0');
    url.searchParams.set('enableFuzzyQuery', 'true');
    url.searchParams.set('quotesQueryId', 'tss_match_phrase_query');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

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

    return NextResponse.json({
      query: query.trim(),
      results,
      count: results.length,
    });

  } catch (error) {
    console.error('Stock search error:', error);

    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Search request timeout' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to search stocks', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
