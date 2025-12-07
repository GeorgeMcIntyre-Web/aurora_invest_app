// Market data service abstraction
import { HistoricalData, HistoricalDataPoint, StockData } from '../domain/AnalysisTypes';
import { getMockStockData } from '../data/mockData';
import { AlphaVantageService } from './implementations/AlphaVantageService';

const PERIOD_DAY_MAP: Record<HistoricalData['period'], number> = {
  '1M': 21,
  '3M': 63,
  '6M': 126,
  '1Y': 252,
  '5Y': 252 * 5,
};

const DEFAULT_PRICE = 100;
const DEFAULT_VOLUME = 1_000_000;

const simulateDelay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

function hashSeed(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function createDeterministicRandom(seedValue: number): () => number {
  let seed = seedValue % 2147483647;
  if (seed <= 0) {
    seed += 2147483646;
  }

  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function generateHistoricalSeries(
  ticker: string,
  period: HistoricalData['period'],
  latestPrice: number,
  typicalVolume: number
): HistoricalDataPoint[] {
  const totalDays = PERIOD_DAY_MAP[period] ?? 63;
  const rng = createDeterministicRandom(hashSeed(`${ticker}-${period}`));
  const drift = (rng() - 0.5) * 0.25;
  const targetReturn = (PERIOD_DAY_MAP[period] ?? 63) / 252 * (0.18 + drift);
  const startPrice = Math.max(1, latestPrice / Math.max(1 + targetReturn, 0.1));
  const points: HistoricalDataPoint[] = [];
  let price = startPrice;
  const today = new Date();

  for (let i = totalDays - 1; i >= 0; i -= 1) {
    const progress = (totalDays - i) / totalDays;
    const seasonal = Math.sin(progress * Math.PI * 2) * 0.01;
    const noise = (rng() - 0.5) * 0.02;
    const dailyDrift = targetReturn / totalDays;
    price = Math.max(1, price * (1 + dailyDrift + seasonal + noise));

    const date = new Date(today);
    date.setDate(today.getDate() - i);

    const volume =
      Math.max(100_000, Math.round(typicalVolume * (0.85 + rng() * 0.3))) || DEFAULT_VOLUME;

    points.push({
      date: date.toISOString().split('T')[0],
      price: Number(price.toFixed(2)),
      volume,
    });
  }

  const scale = points[points.length - 1]?.price
    ? latestPrice / points[points.length - 1]?.price
    : 1;

  return points.map((point) => ({
    ...point,
    price: Number((point.price * scale).toFixed(2)),
  }));
}

export interface MarketDataService {
  fetchStockData(ticker: string): Promise<StockData>;
  fetchHistoricalData(ticker: string, period: HistoricalData['period']): Promise<HistoricalData>;
}

// Mock implementation
export class MockMarketDataService implements MarketDataService {
  async fetchStockData(ticker: string): Promise<StockData> {
    if (!ticker || ticker?.trim?.()?.length === 0) {
      throw new Error('Ticker is required');
    }

    await simulateDelay(500);

    const normalizedTicker = ticker.toUpperCase();
    const data = getMockStockData(normalizedTicker);

    if (!data) {
      throw new Error(
        `Stock data not found for ticker: ${normalizedTicker}. Available tickers: AAPL, MSFT, TSLA, GOOGL, NVDA`
      );
    }

    return data;
  }

  async fetchHistoricalData(
    ticker: string,
    period: HistoricalData['period']
  ): Promise<HistoricalData> {
    if (!ticker || ticker?.trim?.()?.length === 0) {
      throw new Error('Ticker is required');
    }

    await simulateDelay(350);

    const normalizedTicker = ticker.toUpperCase();
    const stock = getMockStockData(normalizedTicker);
    const latestPrice = stock?.technicals?.price ?? DEFAULT_PRICE;
    const typicalVolume =
      stock?.technicals?.avgVolume ?? stock?.technicals?.volume ?? DEFAULT_VOLUME;

    return {
      ticker: normalizedTicker,
      period,
      dataPoints: generateHistoricalSeries(
        normalizedTicker,
        period,
        latestPrice,
        typicalVolume
      ),
    };
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

/**
 * Returns the current data mode: 'live' (Alpha Vantage) or 'demo' (mock data).
 * Useful for UI indicators and validation logic.
 */
export function getMarketDataMode(): 'live' | 'demo' {
  const providerPreference =
    process.env.NEXT_PUBLIC_MARKET_DATA_PROVIDER?.toLowerCase?.() ?? 'demo';
  const apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;

  if (providerPreference === 'alpha_vantage' && apiKey) {
    return 'live';
  }

  return 'demo';
}

/**
 * List of tickers available in demo mode.
 */
export const DEMO_TICKERS = ['AAPL', 'MSFT', 'TSLA', 'GOOGL', 'NVDA'] as const;

/**
 * Check if a ticker is available in the current data mode.
 * In live mode, any ticker is valid. In demo mode, only DEMO_TICKERS are valid.
 */
export function isTickerAvailable(ticker: string): boolean {
  const normalized = ticker?.trim?.()?.toUpperCase?.();
  if (!normalized) return false;

  const mode = getMarketDataMode();
  if (mode === 'live') return true;

  return DEMO_TICKERS.includes(normalized as typeof DEMO_TICKERS[number]);
}

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
