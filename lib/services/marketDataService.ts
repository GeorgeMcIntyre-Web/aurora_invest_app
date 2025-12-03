// Market data service abstraction
import { StockData } from '../domain/AnalysisTypes';
import { getMockStockData } from '../data/mockData';

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
  // In the future, check process.env.NEXT_PUBLIC_DATA_SOURCE or similar
  // to decide between mock vs. real implementations.
  return new MockMarketDataService();
}

// Default service instance used by the app
export const marketDataService: MarketDataService = createMarketDataService();
