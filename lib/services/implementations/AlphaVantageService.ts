import {
  AnalystConsensus,
  StockData,
  StockFundamentals,
  StockSentiment,
  StockTechnicals,
} from '../../domain/AnalysisTypes';
import { MarketDataService } from '../marketDataService';

const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';
const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_BACKOFF_MS = 500;
const DEFAULT_OUTPUT_SIZE: AlphaVantageOutputSize = 'compact';
const MAX_TIME_SERIES_POINTS = 400;
const SMA_WINDOWS = [20, 50, 200] as const;
const RSI_PERIOD = 14;
const NEWS_THEME_LIMIT = 3;

type AlphaVantageOutputSize = 'compact' | 'full';

interface AlphaVantageServiceOptions {
  timeoutMs?: number;
  maxRetries?: number;
  backoffMs?: number;
  outputSize?: AlphaVantageOutputSize;
}

interface AlphaVantageParams {
  [key: string]: string;
}

interface AlphaVantageOverviewResponse {
  Symbol?: string;
  Name?: string;
  Currency?: string;
  Description?: string;
  Exchange?: string;
  Country?: string;
  Sector?: string;
  Industry?: string;
  PERatio?: string;
  ForwardPE?: string;
  DividendYield?: string;
  QuarterlyRevenueGrowthYOY?: string;
  QuarterlyEarningsGrowthYOY?: string;
  ProfitMargin?: string;
  FreeCashFlowPerShareTTM?: string;
  ReturnOnEquityTTM?: string;
  DebtToEquity?: string;
}

interface AlphaVantageGlobalQuoteResponse {
  'Global Quote'?: {
    '01. symbol'?: string;
    '05. price'?: string;
    '06. volume'?: string;
    '08. previous close'?: string;
    '09. change'?: string;
    '10. change percent'?: string;
  };
  Note?: string;
  'Error Message'?: string;
}

type AlphaVantageTimeSeriesEntry = {
  '1. open'?: string;
  '2. high'?: string;
  '3. low'?: string;
  '4. close'?: string;
  '5. adjusted close'?: string;
  '6. volume'?: string;
};

interface AlphaVantageTimeSeriesResponse {
  'Time Series (Daily)'?: Record<string, AlphaVantageTimeSeriesEntry>;
  Note?: string;
  'Error Message'?: string;
}

type AlphaVantageErrorPayload = {
  Note?: string;
  Information?: string;
  'Error Message'?: string;
};

type NormalizedSeriesEntry = {
  date: string;
  high?: number;
  low?: number;
  close?: number;
  adjustedClose?: number;
  volume?: number;
};

export class AlphaVantageService implements MarketDataService {
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly backoffMs: number;
  private readonly outputSize: AlphaVantageOutputSize;

  constructor(private readonly apiKey: string, options: AlphaVantageServiceOptions = {}) {
    if (!apiKey) {
      throw new Error('Alpha Vantage API key is not configured.');
    }

    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.backoffMs = options.backoffMs ?? DEFAULT_BACKOFF_MS;
    this.outputSize = options.outputSize ?? DEFAULT_OUTPUT_SIZE;
  }

  async fetchStockData(rawTicker: string): Promise<StockData> {
    const ticker = rawTicker?.trim?.()?.toUpperCase?.();
    if (!ticker) {
      throw new Error('Ticker is required');
    }

    try {
      const overview = await this.getOverview(ticker);
      const quote = await this.getGlobalQuote(ticker);
      const timeSeries = await this.getTimeSeries(ticker);
      const normalizedSeries = this.normalizeSeries(timeSeries);

      const price =
        this.toNumber(quote?.['Global Quote']?.['05. price']) ??
        normalizedSeries[0]?.close ??
        normalizedSeries[0]?.adjustedClose;

      if (price === undefined) {
        throw new Error(`Alpha Vantage did not return a current price for ${ticker}.`);
      }

      return {
        ticker,
        name: overview?.Name ?? quote?.['Global Quote']?.['01. symbol'] ?? ticker,
        currency: overview?.Currency ?? 'USD',
        fundamentals: this.mapFundamentals(overview),
        technicals: this.mapTechnicals(price, normalizedSeries, quote),
        sentiment: this.mapSentiment(price, normalizedSeries, quote),
      };
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  private getOverview(symbol: string): Promise<AlphaVantageOverviewResponse> {
    return this.request('OVERVIEW', {
      function: 'OVERVIEW',
      symbol,
    });
  }

  private getGlobalQuote(symbol: string): Promise<AlphaVantageGlobalQuoteResponse> {
    return this.request('GLOBAL_QUOTE', {
      function: 'GLOBAL_QUOTE',
      symbol,
    });
  }

  private getTimeSeries(symbol: string): Promise<AlphaVantageTimeSeriesResponse> {
    return this.request('TIME_SERIES_DAILY_ADJUSTED', {
      function: 'TIME_SERIES_DAILY_ADJUSTED',
      symbol,
      outputsize: this.outputSize,
    });
  }

  private async request<T>(label: string, params: AlphaVantageParams): Promise<T> {
    const url = new URL(ALPHA_VANTAGE_BASE_URL);
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
    url.searchParams.set('apikey', this.apiKey);

    return this.withRetry(() => this.fetchJson<T>(url, label), label);
  }

  private async fetchJson<T>(url: URL, label: string): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        const body = await response.text().catch(() => response.statusText);
        throw new Error(`[${label}] ${response.status} ${response.statusText} - ${body}`);
      }

      const payload = (await response.json()) as T & AlphaVantageErrorPayload;
      this.ensureNoApiError(payload, label);
      return payload as T;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`[${label}] Request timed out after ${this.timeoutMs}ms`);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private ensureNoApiError(payload: AlphaVantageErrorPayload, label: string) {
    if (payload?.Note) {
      throw new Error(`[${label}] ${payload.Note}`);
    }
    if (payload?.Information) {
      throw new Error(`[${label}] ${payload.Information}`);
    }
    if (payload?.['Error Message']) {
      throw new Error(`[${label}] ${payload['Error Message']}`);
    }
  }

  private async withRetry<T>(task: () => Promise<T>, label: string): Promise<T> {
    let attempt = 0;
    let lastError: unknown;

    while (attempt <= this.maxRetries) {
      try {
        return await task();
      } catch (error) {
        lastError = error;
        if (attempt >= this.maxRetries) {
          break;
        }

        const delayMs = this.backoffMs * Math.pow(2, attempt);
        await this.delay(delayMs);
        attempt += 1;
      }
    }

    const message =
      lastError instanceof Error ? lastError.message : 'Unknown error contacting Alpha Vantage.';
    throw new Error(`[${label}] ${message}`);
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private normalizeSeries(
    payload: AlphaVantageTimeSeriesResponse
  ): NormalizedSeriesEntry[] {
    const series = payload?.['Time Series (Daily)'];
    if (!series) {
      return [];
    }

    return Object.entries(series)
      .slice(0, MAX_TIME_SERIES_POINTS)
      .map<NormalizedSeriesEntry>(([date, entry]) => ({
        date,
        high: this.toNumber(entry['2. high']),
        low: this.toNumber(entry['3. low']),
        close: this.toNumber(entry['4. close']),
        adjustedClose: this.toNumber(entry['5. adjusted close']) ?? this.toNumber(entry['4. close']),
        volume: this.toNumber(entry['6. volume']),
      }))
      .filter((entry) => entry.close !== undefined && entry.date)
      .sort((a, b) => (a.date > b.date ? -1 : 1));
  }

  private mapFundamentals(overview: AlphaVantageOverviewResponse): StockFundamentals {
    return {
      trailingPE: this.toNumber(overview?.PERatio),
      forwardPE: this.toNumber(overview?.ForwardPE),
      dividendYieldPct: this.toPercent(overview?.DividendYield),
      revenueGrowthYoYPct: this.toPercent(overview?.QuarterlyRevenueGrowthYOY),
      epsGrowthYoYPct: this.toPercent(overview?.QuarterlyEarningsGrowthYOY),
      netMarginPct: this.toPercent(overview?.ProfitMargin),
      freeCashFlowYieldPct: this.estimateFcfYield(
        overview?.FreeCashFlowPerShareTTM,
        overview?.PERatio,
        overview?.ForwardPE
      ),
      debtToEquity: this.toNumber(overview?.DebtToEquity),
      roe: this.toPercent(overview?.ReturnOnEquityTTM),
    };
  }

  private estimateFcfYield(
    fcfPerShare?: string,
    trailingPE?: string,
    forwardPE?: string
  ): number | undefined {
    const fcf = this.toNumber(fcfPerShare);
    const pe = this.toNumber(trailingPE ?? forwardPE);
    if (!fcf || !pe || pe === 0) {
      return undefined;
    }

    const impliedPrice = fcf * pe;
    if (!impliedPrice || impliedPrice === 0) {
      return undefined;
    }

    const yieldPct = (fcf / impliedPrice) * 100;
    return Number(yieldPct.toFixed(2));
  }

  private mapTechnicals(
    price: number,
    series: NormalizedSeriesEntry[],
    quote: AlphaVantageGlobalQuoteResponse
  ): StockTechnicals {
    const highs = series.map((entry) => entry.high).filter((value): value is number => value !== undefined);
    const lows = series.map((entry) => entry.low).filter((value): value is number => value !== undefined);

    const smaMap: Partial<Record<(typeof SMA_WINDOWS)[number], number>> = {};
    SMA_WINDOWS.forEach((window) => {
      const smaValue = this.calculateSMA(series, window);
      if (smaValue !== undefined) {
        smaMap[window] = smaValue;
      }
    });

    const rsi = this.calculateRSI(series, RSI_PERIOD);
    const avgVolume = this.calculateAverageVolume(series, 20);

    return {
      price,
      price52wHigh: highs.length ? Math.max(...highs) : undefined,
      price52wLow: lows.length ? Math.min(...lows) : undefined,
      sma20: smaMap[20],
      sma50: smaMap[50],
      sma200: smaMap[200],
      rsi14: rsi,
      volume: this.toNumber(quote?.['Global Quote']?.['06. volume']),
      avgVolume,
    };
  }

  private mapSentiment(
    price: number,
    series: NormalizedSeriesEntry[],
    quote: AlphaVantageGlobalQuoteResponse
  ): StockSentiment {
    const changePercent = this.toPercent(quote?.['Global Quote']?.['10. change percent']);
    const latest = series[0];
    const previous = series[1];
    const weeklyChange = this.calculateChangePct(latest?.close, series[5]?.close);

    const trendThemes: string[] = [];
    if (changePercent !== undefined) {
      trendThemes.push(
        changePercent >= 0
          ? `Shares are up ${changePercent.toFixed(2)}% today.`
          : `Shares are down ${Math.abs(changePercent).toFixed(2)}% today.`
      );
    }
    if (weeklyChange !== undefined) {
      trendThemes.push(
        weeklyChange >= 0
          ? `Price gained ${weeklyChange.toFixed(2)}% over the past week.`
          : `Price slipped ${Math.abs(weeklyChange).toFixed(2)}% over the past week.`
      );
    }

    const rangeTheme = this.buildRangeTheme(price, series);
    if (rangeTheme) {
      trendThemes.push(rangeTheme);
    }

    return {
      analystConsensus: this.deriveConsensus(changePercent, latest?.close, previous?.close),
      analystTargetMean: undefined,
      analystTargetHigh: undefined,
      analystTargetLow: undefined,
      newsThemes: trendThemes.slice(0, NEWS_THEME_LIMIT),
    };
  }

  private deriveConsensus(
    changePercent?: number,
    latestClose?: number,
    previousClose?: number
  ): AnalystConsensus | undefined {
    if (changePercent !== undefined) {
      if (changePercent >= 2) {
        return 'strong_buy';
      }
      if (changePercent >= 0.5) {
        return 'buy';
      }
      if (changePercent <= -2) {
        return 'strong_sell';
      }
      if (changePercent <= -0.5) {
        return 'sell';
      }
      return 'hold';
    }

    if (latestClose !== undefined && previousClose !== undefined) {
      if (latestClose > previousClose) {
        return 'buy';
      }
      if (latestClose < previousClose) {
        return 'sell';
      }
      return 'hold';
    }

    return undefined;
  }

  private buildRangeTheme(price: number, series: NormalizedSeriesEntry[]): string | undefined {
    if (!series.length) {
      return undefined;
    }

    const highs = series.map((entry) => entry.high).filter((value): value is number => value !== undefined);
    const lows = series.map((entry) => entry.low).filter((value): value is number => value !== undefined);

    if (!highs.length || !lows.length) {
      return undefined;
    }

    const rangeHigh = Math.max(...highs);
    const rangeLow = Math.min(...lows);
    const positionPct =
      rangeHigh !== rangeLow ? ((price - rangeLow) / (rangeHigh - rangeLow)) * 100 : undefined;

    if (positionPct === undefined) {
      return undefined;
    }

    if (positionPct >= 80) {
      return 'Shares are trading near the top of their 52-week range.';
    }
    if (positionPct <= 20) {
      return 'Shares are trading near the bottom of their 52-week range.';
    }
    return 'Shares are mid-range versus the past year.';
  }

  private calculateSMA(series: NormalizedSeriesEntry[], window: number): number | undefined {
    if (series.length < window) {
      return undefined;
    }

    const slice = series.slice(0, window);
    const values = slice.map((entry) => entry.close ?? entry.adjustedClose).filter(
      (value): value is number => value !== undefined
    );

    if (values.length < window) {
      return undefined;
    }

    const avg = values.reduce((acc, value) => acc + value, 0) / window;
    return Number(avg.toFixed(2));
  }

  private calculateRSI(series: NormalizedSeriesEntry[], period: number): number | undefined {
    if (series.length <= period) {
      return undefined;
    }

    let gains = 0;
    let losses = 0;

    for (let i = 0; i < period; i += 1) {
      const current = series[i]?.close ?? series[i]?.adjustedClose;
      const previous = series[i + 1]?.close ?? series[i + 1]?.adjustedClose;
      if (current === undefined || previous === undefined) {
        return undefined;
      }
      const change = current - previous;
      if (change > 0) {
        gains += change;
      } else if (change < 0) {
        losses += Math.abs(change);
      }
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;
    if (avgLoss === 0) {
      return 100;
    }
    const rs = avgGain / avgLoss;
    const rsi = 100 - 100 / (1 + rs);
    return Number(rsi.toFixed(2));
  }

  private calculateAverageVolume(series: NormalizedSeriesEntry[], window: number): number | undefined {
    if (series.length < window) {
      return undefined;
    }

    const slice = series.slice(0, window);
    const volumes = slice.map((entry) => entry.volume).filter(
      (value): value is number => value !== undefined
    );

    if (!volumes.length) {
      return undefined;
    }

    const avg = volumes.reduce((acc, value) => acc + value, 0) / volumes.length;
    return Math.round(avg);
  }

  private calculateChangePct(current?: number, base?: number): number | undefined {
    if (current === undefined || base === undefined || base === 0) {
      return undefined;
    }

    return Number((((current - base) / base) * 100).toFixed(2));
  }

  private toNumber(value: string | number | undefined | null): number | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }

    if (typeof value === 'number') {
      return Number.isFinite(value) ? value : undefined;
    }

    const parsed = Number(value.replace?.(/,/g, ''));
    if (Number.isNaN(parsed) || !Number.isFinite(parsed)) {
      return undefined;
    }

    return parsed;
  }

  private toPercent(value: string | number | undefined | null): number | undefined {
    const numeric = this.toNumber(
      typeof value === 'string' && value.includes('%') ? value.replace('%', '') : value
    );
    if (numeric === undefined) {
      return undefined;
    }

    const scaled = Math.abs(numeric) <= 1 ? numeric * 100 : numeric;
    return Number(scaled.toFixed(2));
  }

  private normalizeError(error: unknown): Error {
    if (error instanceof Error) {
      if (error.message.toLowerCase().includes('note') || error.message.includes('API call frequency')) {
        return new Error('Alpha Vantage rate limit reached. Please wait a few moments and try again.');
      }

      if (error.message.toLowerCase().includes('timeout')) {
        return new Error('Alpha Vantage request timed out before completing.');
      }

      return new Error(`Alpha Vantage error: ${error.message}`);
    }

    return new Error('Unexpected error while communicating with Alpha Vantage.');
  }
}
