// Market data service abstraction
import { StockData } from '../domain/AnalysisTypes';
import { getMockStockData } from '../data/mockData';
import { AlphaVantageService } from './implementations/AlphaVantageService';

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
 * Selects between the mock demo dataset and real providers based on env config.
 */
export function createMarketDataService(): MarketDataService {
  const providerPreference =
    process.env.NEXT_PUBLIC_MARKET_DATA_PROVIDER?.toLowerCase?.() ?? 'demo';

  if (providerPreference === 'alpha_vantage') {
    const apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
      console.warn(
        '[marketDataService] Alpha Vantage selected but NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY is missing. Falling back to mock data.'
      );
    } else {
      const timeoutMs = parseEnvNumber(process.env.NEXT_PUBLIC_MARKET_DATA_TIMEOUT_MS, 10_000);
      const maxRetries = parseEnvNumber(process.env.NEXT_PUBLIC_MARKET_DATA_MAX_RETRIES, 2);
      const backoffMs = parseEnvNumber(process.env.NEXT_PUBLIC_MARKET_DATA_BACKOFF_MS, 500);
      const outputSize = parseOutputSize(
        process.env.NEXT_PUBLIC_ALPHA_VANTAGE_OUTPUT_SIZE,
        'compact'
      );

      return new AlphaVantageService(apiKey, {
        timeoutMs,
        maxRetries,
        backoffMs,
        outputSize,
      });
    }
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

function parseOutputSize(
  value: string | undefined,
  fallback: 'compact' | 'full'
): 'compact' | 'full' {
  if (!value) {
    return fallback;
  }

  return value.toLowerCase() === 'full' ? 'full' : 'compact';
}
