/**
 * Yahoo Finance Service Implementation
 *
 * Provides real market data using Yahoo Finance API
 * No API key required - free tier sufficient for basic functionality
 *
 * Features:
 * - Real-time stock quotes
 * - Historical price data
 * - Company fundamentals
 * - Technical indicators
 * - Support for stocks, ETFs, mutual funds
 *
 * Note: Yahoo Finance API is unofficial and subject to change
 */

import { MarketDataService } from '../marketDataService';
import { StockData, HistoricalData, HistoricalDataPoint } from '@/lib/domain/AnalysisTypes';

interface YahooQuote {
  symbol: string;
  regularMarketPrice?: number;
  regularMarketVolume?: number;
  regularMarketDayHigh?: number;
  regularMarketDayLow?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  marketCap?: number;
  trailingPE?: number;
  forwardPE?: number;
  dividendYield?: number;
  averageDailyVolume3Month?: number;
  sharesOutstanding?: number;
  shortName?: string;
  longName?: string;
}

interface YahooChartData {
  chart: {
    result?: Array<{
      meta?: {
        symbol: string;
        regularMarketPrice?: number;
        currency?: string;
        exchangeName?: string;
      };
      timestamp?: number[];
      indicators?: {
        quote?: Array<{
          open?: number[];
          high?: number[];
          low?: number[];
          close?: number[];
          volume?: number[];
        }>;
        adjclose?: Array<{
          adjclose?: number[];
        }>;
      };
    }>;
    error?: {
      code: string;
      description: string;
    };
  };
}

interface YahooFinancialData {
  quoteSummary?: {
    result?: Array<{
      financialData?: {
        revenueGrowth?: { raw?: number };
        profitMargins?: { raw?: number };
        returnOnEquity?: { raw?: number };
        freeCashflow?: { raw?: number };
        totalDebt?: { raw?: number };
        totalCash?: { raw?: number };
      };
      defaultKeyStatistics?: {
        trailingEps?: { raw?: number };
        forwardEps?: { raw?: number };
      };
      earnings?: {
        financialsChart?: {
          yearly?: Array<{
            revenue?: { raw?: number };
            earnings?: { raw?: number };
          }>;
        };
      };
    }>;
  };
}

export class YahooFinanceService implements MarketDataService {
  private readonly BASE_URL = 'https://query2.finance.yahoo.com';
  private readonly timeout: number;
  private readonly maxRetries: number;
  private readonly backoffMs: number;

  constructor() {
    this.timeout = parseInt(process.env.NEXT_PUBLIC_MARKET_DATA_TIMEOUT_MS || '10000', 10);
    this.maxRetries = parseInt(process.env.NEXT_PUBLIC_MARKET_DATA_MAX_RETRIES || '2', 10);
    this.backoffMs = parseInt(process.env.NEXT_PUBLIC_MARKET_DATA_BACKOFF_MS || '500', 10);
  }

  async fetchStockData(ticker: string): Promise<StockData> {
    try {
      // Fetch quote data
      const quoteData = await this.fetchWithRetry<YahooQuote>(
        `${this.BASE_URL}/v7/finance/quote?symbols=${ticker}`
      );

      // Fetch chart/historical data
      const chartData = await this.fetchWithRetry<YahooChartData>(
        `${this.BASE_URL}/v8/finance/chart/${ticker}?range=1y&interval=1d`
      );

      // Fetch financial data
      const financialData = await this.fetchWithRetry<YahooFinancialData>(
        `${this.BASE_URL}/v10/finance/quoteSummary/${ticker}?modules=financialData,defaultKeyStatistics,earnings`
      );

      return this.transformToStockData(ticker, quoteData, chartData, financialData);
    } catch (error) {
      console.error(`YahooFinanceService error for ${ticker}:`, error);
      throw new Error(`Failed to fetch data for ${ticker}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async fetchHistoricalData(
    ticker: string,
    period: HistoricalData['period']
  ): Promise<HistoricalData> {
    try {
      // Map period to Yahoo Finance range parameter
      const rangeMap: Record<HistoricalData['period'], string> = {
        '1M': '1mo',
        '3M': '3mo',
        '6M': '6mo',
        '1Y': '1y',
        '5Y': '5y',
      };

      const range = rangeMap[period] || '6mo';

      const chartData = await this.fetchWithRetry<YahooChartData>(
        `${this.BASE_URL}/v8/finance/chart/${ticker}?range=${range}&interval=1d`
      );

      const chart = chartData.chart?.result?.[0];
      if (!chart || !chart.timestamp || !chart.indicators?.quote?.[0]) {
        throw new Error('No historical data available');
      }

      const timestamps = chart.timestamp;
      const quotes = chart.indicators.quote[0];
      const closes = quotes.close || [];
      const volumes = quotes.volume || [];

      const dataPoints: HistoricalDataPoint[] = timestamps
        .map((timestamp, index) => {
          const price = closes[index];
          const volume = volumes[index];

          if (!price || price === null) return null;

          const date = new Date(timestamp * 1000);
          return {
            date: date.toISOString().split('T')[0],
            price: Number(price.toFixed(2)),
            volume: volume || 0,
          };
        })
        .filter((point): point is HistoricalDataPoint => point !== null);

      return {
        ticker,
        period,
        dataPoints,
      };
    } catch (error) {
      console.error(`YahooFinanceService historical data error for ${ticker}:`, error);
      throw new Error(`Failed to fetch historical data for ${ticker}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async fetchWithRetry<T>(url: string): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data as T;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');

        if (attempt < this.maxRetries) {
          const delay = this.backoffMs * Math.pow(2, attempt);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }

  private transformToStockData(
    ticker: string,
    quoteResponse: YahooQuote,
    chartResponse: YahooChartData,
    financialResponse: YahooFinancialData
  ): StockData {
    // Extract quote data
    const quote = quoteResponse;
    const chart = chartResponse.chart?.result?.[0];
    const financial = financialResponse.quoteSummary?.result?.[0];

    // Calculate historical data and technical indicators
    const prices = chart?.indicators?.quote?.[0]?.close || [];
    const volumes = chart?.indicators?.quote?.[0]?.volume || [];
    const { sma20, sma50, sma200, rsi14 } = this.calculateTechnicals(prices);

    // Extract fundamentals
    const marketCap = quote.marketCap || 0;
    const sharesOutstanding = quote.sharesOutstanding || 1;
    const price = quote.regularMarketPrice || 0;
    const freeCashflow = financial?.financialData?.freeCashflow?.raw || 0;
    const totalDebt = financial?.financialData?.totalDebt?.raw || 0;
    const totalCash = financial?.financialData?.totalCash?.raw || 0;
    const totalEquity = marketCap - totalDebt + totalCash;

    // Calculate growth rates
    const earningsHistory = financial?.earnings?.financialsChart?.yearly || [];
    const revenueGrowth = this.calculateGrowthRate(
      earningsHistory.map((e) => e?.revenue?.raw || 0)
    );
    const epsGrowth = this.calculateGrowthRate(
      earningsHistory.map((e) => e?.earnings?.raw || 0)
    );

    return {
      ticker,
      name: quote.longName || quote.shortName || ticker,
      currency: chart?.meta?.currency || 'USD',
      fundamentals: {
        trailingPE: quote.trailingPE,
        forwardPE: quote.forwardPE,
        dividendYieldPct: quote.dividendYield ? quote.dividendYield * 100 : undefined,
        revenueGrowthYoYPct: revenueGrowth,
        epsGrowthYoYPct: epsGrowth,
        netMarginPct: financial?.financialData?.profitMargins?.raw
          ? financial.financialData.profitMargins.raw * 100
          : undefined,
        freeCashFlowYieldPct: marketCap > 0 ? (freeCashflow / marketCap) * 100 : undefined,
        debtToEquity: totalEquity > 0 ? totalDebt / totalEquity : undefined,
        roe: financial?.financialData?.returnOnEquity?.raw
          ? financial.financialData.returnOnEquity.raw * 100
          : undefined,
      },
      technicals: {
        price: price,
        price52wHigh: quote.fiftyTwoWeekHigh,
        price52wLow: quote.fiftyTwoWeekLow,
        sma20,
        sma50,
        sma200,
        rsi14,
        volume: quote.regularMarketVolume,
        avgVolume: quote.averageDailyVolume3Month,
      },
      sentiment: {
        analystConsensus: undefined,
        analystTargetMean: undefined,
        analystTargetHigh: undefined,
        analystTargetLow: undefined,
        newsThemes: [],
      },
    };
  }

  private calculateTechnicals(prices: number[]): {
    sma20?: number;
    sma50?: number;
    sma200?: number;
    rsi14?: number;
  } {
    if (prices.length === 0) return {};

    const validPrices = prices.filter((p) => p !== null && p !== undefined && !isNaN(p));

    return {
      sma20: this.calculateSMA(validPrices, 20),
      sma50: this.calculateSMA(validPrices, 50),
      sma200: this.calculateSMA(validPrices, 200),
      rsi14: this.calculateRSI(validPrices, 14),
    };
  }

  private calculateSMA(prices: number[], period: number): number | undefined {
    if (prices.length < period) return undefined;
    const recent = prices.slice(-period);
    const sum = recent.reduce((acc, p) => acc + p, 0);
    return sum / period;
  }

  private calculateRSI(prices: number[], period: number): number | undefined {
    if (prices.length < period + 1) return undefined;

    const changes: number[] = [];
    for (let i = 1; i < prices.length; i++) {
      changes.push(prices[i] - prices[i - 1]);
    }

    const recentChanges = changes.slice(-period);
    const gains = recentChanges.filter((c) => c > 0);
    const losses = recentChanges.filter((c) => c < 0).map((c) => Math.abs(c));

    const avgGain = gains.length > 0 ? gains.reduce((a, b) => a + b, 0) / period : 0;
    const avgLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / period : 0;

    if (avgLoss === 0) return 100;

    const rs = avgGain / avgLoss;
    return 100 - 100 / (1 + rs);
  }

  private calculateGrowthRate(values: number[]): number | undefined {
    if (values.length < 2) return undefined;

    const validValues = values.filter((v) => v > 0);
    if (validValues.length < 2) return undefined;

    const oldest = validValues[0];
    const newest = validValues[validValues.length - 1];
    const periods = validValues.length - 1;

    // CAGR formula: (Ending Value / Beginning Value) ^ (1 / Number of Years) - 1
    return ((Math.pow(newest / oldest, 1 / periods) - 1) * 100);
  }
}
