import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  MockMarketDataService,
  createMarketDataService,
  marketDataService,
} from '../marketDataService';
import * as mockData from '../../data/mockData';

describe('MockMarketDataService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('resolves with mock data for supported tickers after the simulated delay', async () => {
    vi.useFakeTimers();
    const service = new MockMarketDataService();

    const resultPromise = service.fetchStockData('AAPL');
    await vi.runAllTimersAsync();

    await expect(resultPromise).resolves.toEqual(mockData.MOCK_STOCK_DATA.AAPL);
  });

  it('accepts lowercase tickers by relying on mock data normalization', async () => {
    vi.useFakeTimers();
    const service = new MockMarketDataService();

    const resultPromise = service.fetchStockData('msft');
    await vi.runAllTimersAsync();

    const data = await resultPromise;
    expect(data.ticker).toBe('MSFT');
    expect(data).toEqual(mockData.MOCK_STOCK_DATA.MSFT);
  });

  it('throws a validation error when no ticker is provided', async () => {
    const service = new MockMarketDataService();
    await expect(service.fetchStockData('')).rejects.toThrow('Ticker is required');
  });

  it('throws a descriptive error when the ticker is not found', async () => {
    vi.useFakeTimers();
    const service = new MockMarketDataService();

    const expectation = expect(service.fetchStockData('XYZ')).rejects.toThrow(
      'Stock data not found for ticker: XYZ'
    );
    await vi.runAllTimersAsync();
    await expectation;
  });

  it('waits 500ms before resolving to mirror API latency', async () => {
    vi.useFakeTimers();
    const service = new MockMarketDataService();
    const timeoutSpy = vi.spyOn(globalThis, 'setTimeout');

    const resultPromise = service.fetchStockData('NVDA');
    expect(timeoutSpy).toHaveBeenCalledWith(expect.any(Function), 500);

    await vi.runAllTimersAsync();
    await expect(resultPromise).resolves.toEqual(mockData.MOCK_STOCK_DATA.NVDA);
  });
});

describe('createMarketDataService', () => {
  it('returns fresh MockMarketDataService instances', () => {
    const first = createMarketDataService();
    const second = createMarketDataService();

    expect(first).toBeInstanceOf(MockMarketDataService);
    expect(second).toBeInstanceOf(MockMarketDataService);
    expect(first).not.toBe(second);
  });
});

describe('marketDataService singleton', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('is ready for use and returns mock stock data', async () => {
    vi.useFakeTimers();
    const resultPromise = marketDataService.fetchStockData('GOOGL');
    await vi.runAllTimersAsync();

    await expect(resultPromise).resolves.toEqual(mockData.MOCK_STOCK_DATA.GOOGL);
  });
});
