import { describe, it, expect } from 'vitest';
import { getMockStockData, MOCK_STOCK_DATA } from '@/lib/data/mockData';

describe('mock data utilities', () => {
  it('returns stock data for known tickers case-insensitively', () => {
    const sample = getMockStockData('aapl');

    expect(sample).not.toBeNull();
    expect(sample?.ticker).toBe('AAPL');
    expect(sample?.fundamentals.trailingPE).toBeGreaterThan(0);
  });

  it('returns null when ticker is unknown or falsy', () => {
    expect(getMockStockData('UNKNOWN')).toBeNull();
    expect(getMockStockData('')).toBeNull();
    expect(getMockStockData(undefined as unknown as string)).toBeNull();
  });

  it('keeps mock dataset aligned with StockData expectations', () => {
    Object.entries(MOCK_STOCK_DATA).forEach(([ticker, stock]) => {
      expect(stock.ticker).toBe(ticker);
      expect(stock.fundamentals).toBeDefined();
      expect(stock.technicals).toBeDefined();
      expect(stock.sentiment).toBeDefined();
      expect(stock.sentiment.newsThemes.length).toBeGreaterThan(0);
    });
  });
});
