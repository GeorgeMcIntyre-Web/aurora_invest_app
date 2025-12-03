// Market data service abstraction
import { HistoricalData, HistoricalDataPoint, StockData } from '../domain/AnalysisTypes';
import { getMockStockData } from '../data/mockData';

const PERIOD_DAY_MAP: Record<HistoricalData['period'], number> = {
  '1M': 21,
  '3M': 63,
  '6M': 126,
  '1Y': 252,
  '5Y': 252 * 5,
};

const PERIOD_RETURN_TARGET: Record<HistoricalData['period'], number> = {
  '1M': 0.04,
  '3M': 0.08,
  '6M': 0.12,
  '1Y': 0.18,
  '5Y': 0.5,
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
  const baseReturn = PERIOD_RETURN_TARGET[period] ?? 0.05;
  const driftVariance = (rng() - 0.5) * 0.2;
  const targetReturn = baseReturn * (1 + driftVariance);
  const denominator = 1 + targetReturn;
  const startPrice = Math.max(1, latestPrice / (denominator === 0 ? 1 : denominator));
  const points: HistoricalDataPoint[] = [];

  let price = startPrice;
  const today = new Date();

  for (let dayIndex = 0; dayIndex < totalDays; dayIndex += 1) {
    const normalized = dayIndex / totalDays;
    const seasonal = Math.sin(normalized * Math.PI * 2) * 0.01; // cyclical feel
    const noise = (rng() - 0.5) * 0.02; // ±1% noise
    const driftPerDay = targetReturn / totalDays;

    price = Math.max(1, price * (1 + driftPerDay + seasonal + noise));

    const volume =
      Math.max(100_000, Math.round(typicalVolume * (0.85 + rng() * 0.3))) || DEFAULT_VOLUME;

    const date = new Date(today);
    date.setDate(today.getDate() - (totalDays - 1 - dayIndex));

    points.push({
      date: date.toISOString().split('T')[0],
      price,
      volume,
    });
  }

  const finalPrice = points[points.length - 1]?.price ?? price;
  const scale = finalPrice > 0 ? latestPrice / finalPrice : 1;

  return points.map((point) => ({
    ...point,
    price: Number((point.price * scale).toFixed(2)),
  }));
}

export interface MarketDataService {
  fetchStockData(ticker: string): Promise<StockData>;
  fetchHistoricalData(
    ticker: string,
    period: HistoricalData['period']
  ): Promise<HistoricalData>;
}

// Mock implementation for demo purposes
export class DemoMarketDataService implements MarketDataService {
  async fetchStockData(ticker: string): Promise<StockData> {
    if (!ticker || ticker?.trim?.()?.length === 0) {
      throw new Error('Ticker is required');
    }

    await simulateDelay(500);

    const data = getMockStockData(ticker);

    if (!data) {
      throw new Error(
        `Stock data not found for ticker: ${ticker}. Available tickers: AAPL, MSFT, TSLA, GOOGL, NVDA`
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

    const upperTicker = ticker.toUpperCase();
    const stock = getMockStockData(upperTicker);

    const latestPrice = stock?.technicals?.price ?? DEFAULT_PRICE;
    const typicalVolume = stock?.technicals?.avgVolume ?? stock?.technicals?.volume ?? DEFAULT_VOLUME;

    return {
      ticker: upperTicker,
      period,
      dataPoints: generateHistoricalSeries(upperTicker, period, latestPrice, typicalVolume),
    };
  }
}

/**
 * Factory to create the active MarketDataService.
 * Currently returns the demo implementation, but is structured so that
 * a real API-backed service can be swapped in via configuration/env.
 */
export function createMarketDataService(): MarketDataService {
  return new DemoMarketDataService();
}

// Default service instance used by the app
export const marketDataService: MarketDataService = createMarketDataService();
