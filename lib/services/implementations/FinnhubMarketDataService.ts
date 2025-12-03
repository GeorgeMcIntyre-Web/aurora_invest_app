import {
  AnalystConsensus,
  StockData,
  StockFundamentals,
  StockSentiment,
  StockTechnicals,
} from '../../domain/AnalysisTypes';
import { MarketDataService } from '../marketDataService';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_BACKOFF_MS = 500;
const DEFAULT_NEWS_LOOKBACK_DAYS = 7;
const MAX_NEWS_ITEMS = 4;

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface FinnhubMarketDataServiceOptions {
  timeoutMs?: number;
  maxRetries?: number;
  backoffMs?: number;
  newsLookbackDays?: number;
}

interface FinnhubQuoteResponse {
  c?: number; // current price
  h?: number; // high price of the day
  l?: number; // low price of the day
  pc?: number; // previous close
}

interface FinnhubProfileResponse {
  name?: string;
  ticker?: string;
  currency?: string;
}

interface FinnhubMetricResponse {
  metric?: Record<string, number | string | null | undefined>;
}

interface FinnhubPriceTargetResponse {
  targetMean?: number;
  targetHigh?: number;
  targetLow?: number;
}

type FinnhubRecommendationEntry = {
  period?: string;
  strongBuy?: number;
  buy?: number;
  hold?: number;
  sell?: number;
  strongSell?: number;
};

interface FinnhubNewsItem {
  datetime?: number;
  headline?: string;
  summary?: string;
  category?: string;
}

interface FinnhubErrorResponse {
  error?: string;
}

type FinnhubQueryParams = Record<string, string | number | undefined>;

export class FinnhubMarketDataService implements MarketDataService {
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly backoffMs: number;
  private readonly newsLookbackDays: number;

  constructor(private readonly apiKey: string, options: FinnhubMarketDataServiceOptions = {}) {
    if (!apiKey) {
      throw new Error('Finnhub API key is not configured.');
    }

    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.backoffMs = options.backoffMs ?? DEFAULT_BACKOFF_MS;
    this.newsLookbackDays = options.newsLookbackDays ?? DEFAULT_NEWS_LOOKBACK_DAYS;
  }

  async fetchStockData(rawTicker: string): Promise<StockData> {
    const ticker = rawTicker?.trim?.()?.toUpperCase?.();
    if (!ticker) {
      throw new Error('Ticker is required');
    }

    try {
      const [profile, quote, metrics] = await Promise.all([
        this.getCompanyProfile(ticker),
        this.getQuote(ticker),
        this.getMetrics(ticker),
      ]);

      const price = this.toNumber(quote?.c);
      if (price === undefined) {
        throw new Error(`Finnhub quote did not return a current price for ${ticker}`);
      }

      const priceTargets = await this.safeGet(() => this.getPriceTargets(ticker), 'price-target');
      const recommendations = await this.safeGet(
        () => this.getRecommendations(ticker),
        'recommendations'
      );
      const news = await this.safeGet(() => this.getRecentNews(ticker), 'company-news');

      return {
        ticker,
        name: profile?.name ?? profile?.ticker ?? ticker,
        currency: profile?.currency ?? 'USD',
        fundamentals: this.mapFundamentals(metrics?.metric),
        technicals: this.mapTechnicals(price, metrics?.metric),
        sentiment: this.mapSentiment(priceTargets, recommendations, news),
      };
    } catch (error) {
      throw this.normalizeError(error);
    }
  }

  private getCompanyProfile(symbol: string): Promise<FinnhubProfileResponse> {
    return this.request('/stock/profile2', { symbol });
  }

  private getQuote(symbol: string): Promise<FinnhubQuoteResponse> {
    return this.request('/quote', { symbol });
  }

  private getMetrics(symbol: string): Promise<FinnhubMetricResponse> {
    return this.request('/stock/metric', { symbol, metric: 'all' });
  }

  private getPriceTargets(symbol: string): Promise<FinnhubPriceTargetResponse> {
    return this.request('/stock/price-target', { symbol });
  }

  private getRecommendations(symbol: string): Promise<FinnhubRecommendationEntry[]> {
    return this.request('/stock/recommendation', { symbol });
  }

  private getRecentNews(symbol: string): Promise<FinnhubNewsItem[]> {
    const { from, to } = this.getNewsDateRange();
    return this.request('/company-news', { symbol, from, to });
  }

  private async safeGet<T>(
    task: () => Promise<T>,
    label: string
  ): Promise<T | undefined> {
    try {
      return await task();
    } catch (error) {
      console.warn(`[Finnhub] Optional fetch "${label}" failed: ${this.describeError(error)}`);
      return undefined;
    }
  }

  private async request<T>(path: string, params: FinnhubQueryParams = {}): Promise<T> {
    const url = new URL(`${FINNHUB_BASE_URL}${path}`);
    url.searchParams.set('token', this.apiKey);

    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }
      url.searchParams.set(key, String(value));
    });

    return this.withRetry(() => this.fetchJson<T>(url), path);
  }

  private async fetchJson<T>(url: URL): Promise<T> {
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
        const errorBody = await response.text().catch(() => response.statusText);
        throw new Error(`${response.status} ${response.statusText} - ${errorBody}`.trim());
      }

      const payload = (await response.json()) as T | FinnhubErrorResponse;

      if (this.hasFinnhubError(payload)) {
        throw new Error(payload.error ?? 'Finnhub API returned an error.');
      }

      return payload as T;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timed out');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private hasFinnhubError(payload: unknown): payload is FinnhubErrorResponse {
    return Boolean(
      payload &&
      typeof payload === 'object' &&
      'error' in payload &&
      (payload as FinnhubErrorResponse).error
    );
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

        const delayDuration = this.backoffMs * Math.pow(2, attempt);
        await delay(delayDuration);
        attempt += 1;
      }
    }

    const message =
      lastError instanceof Error
        ? `[${label}] ${lastError.message}`
        : `[${label}] Unknown error occurred`;
    throw new Error(message);
  }

  private mapFundamentals(metric?: Record<string, number | string | null | undefined>): StockFundamentals {
    return {
      trailingPE: this.toNumber(metric?.peTTM ?? metric?.peExcludeExtraTTM),
      forwardPE: this.toNumber(metric?.peForwardAnnual ?? metric?.peForward),
      dividendYieldPct: this.toPercent(
        metric?.dividendYieldIndicatedAnnual ?? metric?.dividendYieldTTM
      ),
      revenueGrowthYoYPct: this.toPercent(metric?.revenueGrowthTTMYoY),
      epsGrowthYoYPct: this.toPercent(metric?.epsGrowthTTMYoY),
      netMarginPct: this.toPercent(metric?.netProfitMarginTTM),
      freeCashFlowYieldPct: this.toPercent(metric?.freeCashFlowYieldTTM),
      debtToEquity: this.toNumber(metric?.totalDebtTotalEquityAnnual),
      roe: this.toPercent(metric?.roeTTM),
    };
  }

  private mapTechnicals(
    price: number,
    metric?: Record<string, number | string | null | undefined>
  ): StockTechnicals {
    const metrics = metric ?? {};

    return {
      price,
      price52wHigh: this.toNumber(metrics['52WeekHigh']),
      price52wLow: this.toNumber(metrics['52WeekLow']),
      sma20: this.toNumber(metrics['20DayMovingAverage']),
      sma50: this.toNumber(metrics['50DayMovingAverage']),
      sma200: this.toNumber(metrics['200DayMovingAverage']),
      rsi14: this.toNumber(metrics['14DayRelativeStrengthIndex']),
      volume: undefined,
      avgVolume: this.toNumber(metrics['10DayAverageTradingVolume']),
    };
  }

  private mapSentiment(
    priceTargets?: FinnhubPriceTargetResponse,
    recommendations?: FinnhubRecommendationEntry[],
    news?: FinnhubNewsItem[]
  ): StockSentiment {
    return {
      analystConsensus: this.deriveConsensus(recommendations),
      analystTargetMean: this.toNumber(priceTargets?.targetMean),
      analystTargetHigh: this.toNumber(priceTargets?.targetHigh),
      analystTargetLow: this.toNumber(priceTargets?.targetLow),
      newsThemes: this.extractNewsThemes(news),
    };
  }

  private deriveConsensus(
    recommendations?: FinnhubRecommendationEntry[]
  ): AnalystConsensus | undefined {
    if (!recommendations?.length) {
      return undefined;
    }

    const latest = [...recommendations].sort((a, b) =>
      (b.period ?? '').localeCompare(a.period ?? '')
    )[0];

    const buckets: Array<{ label: AnalystConsensus; value: number }> = [
      { label: 'strong_buy', value: latest.strongBuy ?? 0 },
      { label: 'buy', value: latest.buy ?? 0 },
      { label: 'hold', value: latest.hold ?? 0 },
      { label: 'sell', value: latest.sell ?? 0 },
      { label: 'strong_sell', value: latest.strongSell ?? 0 },
    ];

    return buckets.reduce((best, current) => (current.value > best.value ? current : best)).label;
  }

  private extractNewsThemes(news?: FinnhubNewsItem[]): string[] {
    if (!news?.length) {
      return [];
    }

    return news
      .filter((item) => Boolean(item?.headline))
      .slice(0, MAX_NEWS_ITEMS)
      .map((item) => item?.headline?.trim() ?? '')
      .filter((headline) => headline.length > 0);
  }

  private getNewsDateRange(): { from: string; to: string } {
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - this.getNewsLookbackDays());

    return {
      from: this.formatDate(fromDate),
      to: this.formatDate(toDate),
    };
  }

  private formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private toNumber(value: unknown): number | undefined {
    const numeric =
      typeof value === 'string' ? Number(value) : typeof value === 'number' ? value : undefined;

    if (numeric === undefined || Number.isNaN(numeric) || !Number.isFinite(numeric)) {
      return undefined;
    }

    return Number(numeric);
  }

  private toPercent(value: unknown): number | undefined {
    const numeric = this.toNumber(value);
    if (numeric === undefined) {
      return undefined;
    }

    const scaled = Math.abs(numeric) <= 1 ? numeric * 100 : numeric;
    return Number(scaled.toFixed(2));
  }

  private getNewsLookbackDays(): number {
    return Math.max(1, this.newsLookbackDays);
  }

  private normalizeError(error: unknown): Error {
    if (error instanceof Error) {
      if (/429/.test(error.message)) {
        return new Error(
          'Finnhub rate limit reached. Please wait a few seconds before trying again.'
        );
      }

      if (error.message.toLowerCase().includes('timeout')) {
        return new Error('Finnhub request timed out before completing.');
      }

      if (error.message.toLowerCase().includes('not return a current price')) {
        return new Error(error.message);
      }

      if (error.message.toLowerCase().includes('stock data not found')) {
        return error;
      }

      return new Error(`Finnhub API error: ${error.message}`);
    }

    return new Error('Unexpected error while communicating with Finnhub API.');
  }

  private describeError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }
}
