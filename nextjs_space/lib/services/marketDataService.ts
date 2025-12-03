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
      throw new Error(`Stock data not found for ticker: ${ticker}. Available tickers: AAPL, MSFT, TSLA, GOOGL, NVDA`);
    }

    return data;
  }
}

// Default service instance
export const marketDataService = new MockMarketDataService();
