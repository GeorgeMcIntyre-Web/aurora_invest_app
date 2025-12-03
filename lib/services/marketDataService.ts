// Market data service abstraction
import { StockData } from '../domain/AnalysisTypes';
import { getMockStockData } from '../data/mockData';
import { FinnhubMarketDataService } from './implementations/FinnhubMarketDataService';

export interface MarketDataService {
  fetchStockData(ticker: string): Promise<StockData>;
}

// Mock implementation
export class MockMarketDataService implements MarketDataService {
  async fetchStockData(ticker: string): Promise<StockData> {
    // Guard: validate ticker
    if (!ticker || ticker?.trim?.()?.length === 0) {
      throw new Error('Ticker is required');
    }

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Get mock data
    const data = getMockStockData(ticker);
    
    if (!data) {
      throw new Error(
        `Stock data not found for ticker: ${ticker}. Available tickers: AAPL, MSFT, TSLA, GOOGL, NVDA`
      );
    }

    return data;
  }
}

/**
 * Factory to create the active MarketDataService.
 * Currently returns the mock implementation, but is structured so that
 * a real API-backed service can be swapped in via configuration/env.
 */
export function createMarketDataService(): MarketDataService {
  const finnhubKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

  const providerPreference =
    process.env.NEXT_PUBLIC_MARKET_DATA_PROVIDER ??
    (finnhubKey ? 'finnhub' : 'demo');

  if (providerPreference?.toLowerCase() === 'finnhub' && finnhubKey) {
    const timeoutMs = parseEnvNumber(process.env.NEXT_PUBLIC_MARKET_DATA_TIMEOUT_MS, 10_000);
    const maxRetries = parseEnvNumber(process.env.NEXT_PUBLIC_MARKET_DATA_MAX_RETRIES, 2);
    const backoffMs = parseEnvNumber(process.env.NEXT_PUBLIC_MARKET_DATA_BACKOFF_MS, 500);

    return new FinnhubMarketDataService(finnhubKey, {
      timeoutMs,
      maxRetries,
      backoffMs,
    });
  }

  if (providerPreference?.toLowerCase() === 'finnhub' && !finnhubKey) {
    console.warn(
      'Finnhub provider selected but NEXT_PUBLIC_FINNHUB_API_KEY is missing. Falling back to mock data.'
    );
  }

  return new MockMarketDataService();
}

// Default service instance used by the app
export const marketDataService: MarketDataService = createMarketDataService();

function parseEnvNumber(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return parsed;
}
