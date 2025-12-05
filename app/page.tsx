'use client';

import { useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import { Sparkles, Wallet } from 'lucide-react';
import { StockForm } from '@/components/stock-form';
import { AnalysisDashboard } from '@/components/analysis-dashboard';
import {
  UserProfile,
  AnalysisResult,
  StockData,
  HistoricalData,
  PortfolioContext,
} from '@/lib/domain/AnalysisTypes';
import { analyzeStock } from '@/lib/domain/auroraEngine';
import { marketDataService } from '@/lib/services/marketDataService';
// Portfolio imports - temporarily disabled until service methods are implemented
// import {
//   calculateAllocation,
//   calculatePortfolioMetrics,
//   detectConcentrationRisk,
//   suggestPortfolioAction,
// } from '@/lib/domain/portfolioEngine';
// import { portfolioService } from '@/lib/services/portfolioService';

type ErrorCategory = 'network' | 'data' | 'analysis' | 'unknown';

interface UserFriendlyError {
  category: ErrorCategory;
  message: string;
  suggestion: string;
}

const FETCH_TIMEOUT_MS = 10_000;
const MAX_RETRIES = 2;
const BASE_BACKOFF_MS = 500;
const DEMO_TICKERS = ['AAPL', 'MSFT', 'TSLA', 'GOOGL', 'NVDA'];
type HistoricalPeriod = HistoricalData['period'];
const HISTORICAL_PERIODS: HistoricalPeriod[] = ['1M', '3M', '6M', '1Y', '5Y'];

type LoadingStage = 'idle' | 'fetching' | 'analyzing' | 'presenting';

const LOADING_STAGE_DETAILS: Record<
  LoadingStage,
  { label: string; helper: string; progress: number }
> = {
  idle: {
    label: 'Ready to analyze',
    helper: 'Awaiting ticker and profile information.',
    progress: 0,
  },
  fetching: {
    label: 'Fetching stock data...',
    helper: 'Contacting the data provider and retrieving the latest snapshot.',
    progress: 30,
  },
  analyzing: {
    label: 'Analyzing fundamentals...',
    helper: 'Running the Aurora engine across fundamentals, technicals, and sentiment.',
    progress: 65,
  },
  presenting: {
    label: 'Generating insights...',
    helper: 'Preparing dashboard cards, scenarios, and recommendations.',
    progress: 90,
  },
};

const LOADING_SEQUENCE: LoadingStage[] = ['fetching', 'analyzing', 'presenting'];

const CANCELLATION_ERROR: UserFriendlyError = {
  category: 'unknown',
  message: 'Analysis canceled before completion.',
  suggestion: 'Adjust your inputs and start a new analysis when you are ready.',
};

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_CACHE_ENTRIES = 5;
const MAX_QUEUE_LENGTH = 5;

interface CachedAnalysisRecord {
  stock: StockData;
  result: AnalysisResult;
  cachedAt: number;
}

interface AnalysisRequest {
  ticker: string;
  profile: UserProfile;
  cacheKey: string;
  enqueuedAt: number;
}

const normalizeTicker = (ticker: string) => ticker.trim().toUpperCase();

const buildCacheKey = (ticker: string, profile: UserProfile) => {
  const normalizedTicker = normalizeTicker(ticker);
  return `${normalizedTicker}::${profile.riskTolerance}|${profile.horizon}|${profile.objective}`;
};

const describeCacheAge = (cachedAt: number) => {
  const elapsedMs = Date.now() - cachedAt;

  if (elapsedMs < 60_000) {
    return `${Math.max(1, Math.floor(elapsedMs / 1000))}s`;
  }

  if (elapsedMs < 3_600_000) {
    return `${Math.floor(elapsedMs / 60_000)}m`;
  }

  return `${Math.floor(elapsedMs / 3_600_000)}h`;
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error('Request timed out')), timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
};

const buildUserFriendlyError = (
  error: unknown,
  fallbackCategory: ErrorCategory = 'unknown'
): UserFriendlyError => {
  if (
    error &&
    typeof error === 'object' &&
    'category' in error &&
    'message' in error &&
    'suggestion' in error
  ) {
    return error as UserFriendlyError;
  }

  const rawMessage = error instanceof Error ? error.message : '';
  const normalized = rawMessage.toLowerCase();

  if (normalized.includes('demo dataset') || normalized.includes('available tickers')) {
    return {
      category: 'data',
      message: 'This ticker is not available in the demo dataset.',
      suggestion: `Try one of: ${DEMO_TICKERS.join(', ')}.`,
    };
  }

  if (normalized.includes('ticker is required')) {
    return {
      category: 'data',
      message: 'Please enter a valid stock ticker to run an analysis.',
      suggestion: 'Provide a ticker (e.g., AAPL) and resubmit the form.',
    };
  }

  if (normalized.includes('not found')) {
    return {
      category: 'data',
      message: 'We could not find stock data for that ticker.',
      suggestion: `Try one of: ${DEMO_TICKERS.join(', ')}.`,
    };
  }

  if (normalized.includes('timeout')) {
    return {
      category: 'network',
      message: 'The data request timed out before completing.',
      suggestion: 'Check your connection and try again in a few seconds.',
    };
  }

  if (normalized.includes('network') || normalized.includes('fetch failed')) {
    return {
      category: 'network',
      message: 'We could not reach the data provider.',
      suggestion: 'Check your internet connection or VPN/firewall settings and try again.',
    };
  }

  if (normalized.includes('analysis')) {
    return {
      category: 'analysis',
      message: 'We were unable to complete the analysis.',
      suggestion: 'Please try again in a moment. If the issue persists, contact support.',
    };
  }

  const fallbackMessages: Record<ErrorCategory, UserFriendlyError> = {
    network: {
      category: 'network',
      message: 'We could not reach the data provider.',
      suggestion: 'Check your connection and try again.',
    },
    data: {
      category: 'data',
      message: 'We were unable to process that ticker.',
      suggestion: `Verify the ticker symbol or try one of: ${DEMO_TICKERS.join(', ')}.`,
    },
    analysis: {
      category: 'analysis',
      message: 'We were unable to complete the analysis.',
      suggestion: 'Please retry in a moment or adjust your input.',
    },
    unknown: {
      category: 'unknown',
      message: rawMessage || 'An unexpected error occurred while running the analysis.',
      suggestion: 'Please try again. If it keeps failing, reach out to support.',
    },
  };

  return fallbackMessages[fallbackCategory];
};

const fetchStockDataWithResilience = async (
  ticker: string,
  shouldAbort?: () => boolean
): Promise<StockData> => {
  let attempt = 0;
  let lastError: unknown = null;

  while (attempt <= MAX_RETRIES) {
    if (shouldAbort?.()) {
      throw CANCELLATION_ERROR;
    }

    try {
      if (!marketDataService?.fetchStockData) {
        throw new Error('Market data service is unavailable.');
      }

      const data = await withTimeout(
        marketDataService.fetchStockData(ticker),
        FETCH_TIMEOUT_MS
      );

      if (!data) {
        throw new Error('Stock data not returned by provider.');
      }

      return data;
    } catch (err) {
      lastError = err;

      if (attempt === MAX_RETRIES || shouldAbort?.()) {
        break;
      }

      const backoff = BASE_BACKOFF_MS * Math.pow(2, attempt);
      await wait(backoff);
    }

    attempt += 1;
  }

  if (shouldAbort?.()) {
    throw CANCELLATION_ERROR;
  }

  const friendly = buildUserFriendlyError(lastError, 'network');
  throw friendly;
};

const fetchHistoricalSeries = async (ticker: string): Promise<Record<HistoricalPeriod, HistoricalData>> => {
  if (!marketDataService?.fetchHistoricalData) {
    throw new Error('Historical data service unavailable.');
  }

  const entries = await Promise.all(
    HISTORICAL_PERIODS.map(async (period) => {
      const dataset = await withTimeout(
        marketDataService.fetchHistoricalData(ticker, period),
        FETCH_TIMEOUT_MS
      );
      return [period, dataset] as const;
    })
  );

  return entries.reduce<Record<HistoricalPeriod, HistoricalData>>((acc, [period, dataset]) => {
    acc[period] = dataset;
    return acc;
  }, {} as Record<HistoricalPeriod, HistoricalData>);
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorDetail, setErrorDetail] = useState<UserFriendlyError | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [stock, setStock] = useState<StockData | null>(null);
  const [loadingStage, setLoadingStage] = useState<LoadingStage>('idle');
  const [progressPercent, setProgressPercent] = useState(0);
  const [isCancellationPending, setIsCancellationPending] = useState(false);
  const [historicalSeries, setHistoricalSeries] = useState<
    Partial<Record<HistoricalPeriod, HistoricalData>>
  >({});
  const [selectedHistoricalPeriod, setSelectedHistoricalPeriod] =
    useState<HistoricalPeriod>('6M');
  const [historicalLoading, setHistoricalLoading] = useState(false);
  const [historicalError, setHistoricalError] = useState<string | null>(null);
  const [cacheNotice, setCacheNotice] = useState<string | null>(null);
  const [queueNotice, setQueueNotice] = useState<string | null>(null);
  const [queuedCount, setQueuedCount] = useState(0);
  const cancelRequested = useRef(false);
  const cachedAnalyses = useRef<Map<string, CachedAnalysisRecord>>(new Map());
  const requestQueue = useRef<AnalysisRequest[]>([]);
  const processingRef = useRef(false);
  const [portfolioContext, setPortfolioContext] = useState<PortfolioContext | null>(null);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);
  const [quickAddPending, setQuickAddPending] = useState(false);

  const loadPortfolioContext = useCallback(
    async (_ticker: string, _fallbackPrice = 0) => {
      // TODO: Portfolio context integration - needs service methods implemented
      // const normalizedTicker = normalizeTicker(ticker);
      setPortfolioContext(null);
      setPortfolioLoading(false);
      setPortfolioError(null);
    },
    []
  );

  const applyStage = (stage: LoadingStage) => {
    setLoadingStage(stage);
    setProgressPercent(LOADING_STAGE_DETAILS[stage].progress);
  };

  const resetLoadingTracker = () => {
    setLoadingStage('idle');
    setProgressPercent(0);
    setIsCancellationPending(false);
    cancelRequested.current = false;
  };

  const handleHistoricalPeriodChange = (period: HistoricalPeriod) => {
    setSelectedHistoricalPeriod(period);
  };

  const updateQueuedCount = () => setQueuedCount(requestQueue.current.length);

  const getCachedEntry = (key: string) => {
    const entry = cachedAnalyses.current.get(key);

    if (!entry) {
      return null;
    }

    if (Date.now() - entry.cachedAt > CACHE_TTL_MS) {
      cachedAnalyses.current.delete(key);
      return null;
    }

    return entry;
  };

  const persistToCache = (key: string, payload: { stock: StockData; result: AnalysisResult }) => {
    cachedAnalyses.current.set(key, {
      ...payload,
      cachedAt: Date.now(),
    });

    if (cachedAnalyses.current.size <= MAX_CACHE_ENTRIES) {
      return;
    }

    let oldestKey: string | null = null;
    let oldestTimestamp = Infinity;

    cachedAnalyses.current.forEach((entry, entryKey) => {
      if (entry.cachedAt < oldestTimestamp) {
        oldestTimestamp = entry.cachedAt;
        oldestKey = entryKey;
      }
    });

    if (oldestKey) {
      cachedAnalyses.current.delete(oldestKey);
    }
  };

  const startHistoricalFetch = (ticker: string, resetSelection = true) => {
    if (resetSelection) {
      setSelectedHistoricalPeriod('6M');
    }
    setHistoricalSeries({});
    setHistoricalError(null);
    setHistoricalLoading(true);

    return fetchHistoricalSeries(ticker)
      .then((series) => {
        if (series) {
          setHistoricalSeries(series);
        }
        return series;
      })
      .catch((error) => {
        console.error(error);
        setHistoricalError('Unable to load historical pricing data.');
        return null;
      })
      .finally(() => {
        setHistoricalLoading(false);
      });
  };

  const hydrateFromCache = (entry: CachedAnalysisRecord) => {
    setErrorDetail(null);
    setResult(entry.result);
    setStock(entry.stock);
    setCacheNotice(
      `Loaded from recent analysis cache (${describeCacheAge(entry.cachedAt)} old).`
    );
    setQueueNotice(null);
    setIsLoading(false);
    setIsCancellationPending(false);
    resetLoadingTracker();
    void loadPortfolioContext(entry.stock.ticker, entry.stock.technicals?.price ?? 0);
  };

  const runAnalysis = async (request: AnalysisRequest) => {
    setIsLoading(true);
    setErrorDetail(null);
    setResult(null);
    setStock(null);
    setIsCancellationPending(false);
    setCacheNotice(null);
    applyStage('fetching');

    try {
      const stockData = await fetchStockDataWithResilience(request.ticker, () => cancelRequested.current);

      if (cancelRequested.current) {
        throw CANCELLATION_ERROR;
      }

      const historicalPromise = startHistoricalFetch(request.ticker);

      applyStage('analyzing');

      const analysisResult = analyzeStock(request.profile, stockData);

      if (!analysisResult) {
        throw buildUserFriendlyError(
          new Error('Analysis result is empty'),
          'analysis'
        );
      }

      if (cancelRequested.current) {
        throw CANCELLATION_ERROR;
      }

      applyStage('presenting');
      setProgressPercent(100);

      await historicalPromise;
      if (cancelRequested.current) {
        throw CANCELLATION_ERROR;
      }

      setStock(stockData);
      setResult(analysisResult);
      persistToCache(request.cacheKey, { stock: stockData, result: analysisResult });
      await loadPortfolioContext(request.ticker, stockData?.technicals?.price ?? 0);
    } catch (err) {
      setErrorDetail(buildUserFriendlyError(err));
    } finally {
      setIsLoading(false);
      resetLoadingTracker();
    }
  };

  const executeRequest = (request: AnalysisRequest, originatedFromQueue = false) => {
    cancelRequested.current = false;
    processingRef.current = true;

    if (originatedFromQueue) {
      setQueueNotice(
        requestQueue.current.length > 0
          ? `Processing queued analysis for ${request.ticker} (${requestQueue.current.length} waiting).`
          : `Processing queued analysis for ${request.ticker}...`
      );
    } else {
      setQueueNotice(null);
    }

    void runAnalysis(request).finally(() => {
      processingRef.current = false;

      if (requestQueue.current.length > 0) {
        const nextRequest = requestQueue.current.shift()!;
        updateQueuedCount();
        executeRequest(nextRequest, true);
      } else {
        setQueueNotice(null);
      }
    });
  };

  const handleCancelAnalysis = () => {
    if (!isLoading || cancelRequested.current) {
      return;
    }

    cancelRequested.current = true;
    setIsCancellationPending(true);

    if (requestQueue.current.length > 0) {
      requestQueue.current = [];
      updateQueuedCount();
      setQueueNotice('Canceled analysis and cleared queued requests.');
    }
  };

  const handleQuickAddHolding = useCallback(
    async ({
      shares,
      averageCostBasis,
      purchaseDate,
    }: {
      shares: number;
      averageCostBasis: number;
      purchaseDate: string;
    }) => {
      if (!portfolioContext || !result?.ticker) {
        throw new Error('No active analysis to add to the portfolio.');
      }
      const ticker = normalizeTicker(result.ticker);
      setQuickAddPending(true);
      setPortfolioError(null);
      try {
        // TODO: Implement portfolio service addHolding method
        // await portfolioService.addHolding(portfolioContext.portfolioId, {
        //   ticker,
        //   shares,
        //   averageCostBasis,
        //   purchaseDate,
        // });
        await loadPortfolioContext(ticker, stock?.technicals?.price ?? averageCostBasis);
      } catch (err) {
        console.error(err);
        setPortfolioError('Unable to add holding to portfolio.');
        throw err;
      } finally {
        setQuickAddPending(false);
      }
    },
    [portfolioContext, result?.ticker, stock, loadPortfolioContext]
  );

  const handleAnalyze = async (ticker: string, profile: UserProfile) => {
    if (!ticker || !profile) {
      return;
    }

    const normalizedTicker = normalizeTicker(ticker);
    const cacheKey = buildCacheKey(normalizedTicker, profile);
    const cachedEntry = getCachedEntry(cacheKey);
    setPortfolioContext(null);
    setPortfolioError(null);

    if (cachedEntry) {
      hydrateFromCache(cachedEntry);
    void startHistoricalFetch(normalizedTicker);
      return;
    }

    const request: AnalysisRequest = {
      ticker: normalizedTicker,
      profile,
      cacheKey,
      enqueuedAt: Date.now(),
    };

    if (processingRef.current) {
      if (requestQueue.current.length >= MAX_QUEUE_LENGTH) {
        setErrorDetail({
          category: 'analysis',
          message: 'There are already multiple analyses waiting in line.',
          suggestion: 'Please wait for the current queue to finish before adding new requests.',
        });
        return;
      }

      requestQueue.current.push(request);
      updateQueuedCount();
      setQueueNotice(
        `Queued analysis for ${request.ticker} (position ${requestQueue.current.length}).`
      );
      return;
    }

    executeRequest(request);
  };

  const activeStageDetail = LOADING_STAGE_DETAILS[loadingStage];
  const currentStageIndex = Math.max(LOADING_SEQUENCE.indexOf(loadingStage), 0);
  const estimatedSecondsRemaining = Math.max(
    2,
    Math.round(Math.max(100 - progressPercent, 5) / 12)
  );

  return (
    <div className="min-h-screen bg-ai-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-ai-card/95 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-ai-primary to-ai-accent rounded-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-ai-text">AuroraInvest</h1>
                <p className="text-sm text-ai-muted">Stock Analyzer</p>
              </div>
            </div>
            <nav className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-ai-text hover:text-ai-accent transition-colors"
              >
                <Sparkles className="h-4 w-4" />
                Analysis
              </Link>
              <Link
                href="/portfolio"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-ai-text hover:text-ai-accent bg-ai-background/50 rounded-lg border border-gray-700 hover:border-ai-accent transition-colors"
              >
                <Wallet className="h-4 w-4" />
                Portfolio
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Form */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <StockForm onAnalyze={handleAnalyze} isLoading={isLoading} />

              {/* Error Display */}
              {errorDetail && (
                <div className="mt-6 bg-red-900/20 border border-red-700 rounded-lg p-4">
                  <p className="text-xs uppercase tracking-wide text-red-400">
                    {errorDetail.category === 'network' && 'Network issue'}
                    {errorDetail.category === 'data' && 'Data issue'}
                    {errorDetail.category === 'analysis' && 'Analysis issue'}
                    {errorDetail.category === 'unknown' && 'Unexpected issue'}
                  </p>
                  <p className="text-sm text-red-300 font-medium mt-1">
                    {errorDetail.message}
                  </p>
                  <p className="text-xs text-ai-muted mt-2">
                    {errorDetail.suggestion}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="lg:col-span-2">
            {queueNotice && (
              <div className="mb-6 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
                <p className="text-xs uppercase tracking-wide text-amber-400">Request queue</p>
                <p className="text-sm text-ai-text font-medium mt-1">{queueNotice}</p>
                {queuedCount > 0 && (
                  <p className="text-xs text-ai-muted mt-1">
                    {queuedCount} {queuedCount === 1 ? 'analysis remains' : 'analyses remain'} in
                    the queue.
                  </p>
                )}
              </div>
            )}

            {cacheNotice && result && !isLoading && (
              <div className="mb-6 rounded-lg border border-ai-primary/40 bg-ai-primary/5 p-4">
                <p className="text-xs uppercase tracking-wide text-ai-primary">Instant insight</p>
                <p className="text-sm text-ai-text font-medium mt-1">{cacheNotice}</p>
                <p className="text-xs text-ai-muted mt-1">
                  Run a fresh analysis to fetch an updated market snapshot.
                </p>
              </div>
            )}

            {!result && !isLoading && (
              <div className="bg-ai-card border border-gray-700 rounded-lg p-12 text-center">
                <Sparkles className="h-16 w-16 text-ai-muted mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-ai-text mb-2">
                  Ready to Analyze
                </h2>
                <p className="text-ai-muted max-w-md mx-auto">
                  Enter a stock ticker and your investment profile to receive a comprehensive
                  analysis including fundamentals, technicals, sentiment, and scenario projections.
                </p>
              </div>
            )}

            {isLoading && (
              <div className="bg-ai-card border border-gray-700 rounded-lg p-8 lg:p-10">
                <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-start md:justify-between">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full border-2 border-ai-primary/30 flex items-center justify-center">
                      <div className="h-6 w-6 rounded-full border-b-2 border-ai-primary animate-spin" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs uppercase tracking-wide text-ai-muted">
                        Analysis progress
                      </p>
                      <h2 className="text-xl font-semibold text-ai-text mt-1">
                        {activeStageDetail.label}
                      </h2>
                      <p className="text-sm text-ai-muted">{activeStageDetail.helper}</p>
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-sm text-ai-muted">
                      Stage {Math.min(currentStageIndex + 1, LOADING_SEQUENCE.length)} of{' '}
                      {LOADING_SEQUENCE.length}
                    </p>
                    <p className="text-xs text-ai-muted mt-1">
                      Est. {estimatedSecondsRemaining}s remaining
                    </p>
                    {queuedCount > 0 && (
                      <p className="text-xs text-ai-muted mt-1">
                        {queuedCount} queued {queuedCount === 1 ? 'analysis' : 'analyses'} waiting
                        patiently.
                      </p>
                    )}
                    {isCancellationPending && (
                      <p className="text-xs text-red-400 mt-2">Cancellation requested...</p>
                    )}
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex items-center justify-between text-sm text-ai-muted">
                    <span>{Math.min(progressPercent, 100)}% complete</span>
                    <span>{activeStageDetail.label}</span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full mt-3">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isCancellationPending ? 'bg-red-500' : 'bg-ai-primary'
                      }`}
                      style={{ width: `${Math.min(progressPercent, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {LOADING_SEQUENCE.map((stage, index) => {
                    const stageStatus =
                      currentStageIndex > index
                        ? 'done'
                        : currentStageIndex === index
                        ? 'active'
                        : 'pending';
                    const detail = LOADING_STAGE_DETAILS[stage];

                    return (
                      <div key={stage} className="flex gap-3 text-left">
                        <div
                          className={`mt-0.5 h-5 w-5 rounded-full border flex items-center justify-center text-[11px] font-semibold ${
                            stageStatus === 'done'
                              ? 'bg-ai-primary border-ai-primary text-ai-card'
                              : stageStatus === 'active'
                              ? 'border-ai-primary text-ai-primary'
                              : 'border-gray-600 text-gray-500'
                          }`}
                        >
                          {stageStatus === 'done' ? '✓' : index + 1}
                        </div>
                        <div>
                          <p
                            className={`text-sm font-medium ${
                              stageStatus === 'pending' ? 'text-ai-muted' : 'text-ai-text'
                            }`}
                          >
                            {detail.label}
                          </p>
                          <p className="text-xs text-ai-muted">{detail.helper}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={handleCancelAnalysis}
                  disabled={!isLoading || isCancellationPending}
                  className="w-full rounded-lg border border-gray-600 px-4 py-3 text-sm font-medium text-ai-text transition hover:border-ai-primary hover:text-ai-primary disabled:cursor-not-allowed disabled:text-gray-500"
                >
                  {isCancellationPending ? 'Canceling analysis...' : 'Cancel analysis'}
                </button>
              </div>
            )}

            {result && stock && !isLoading && (
              <AnalysisDashboard
                result={result}
                stock={stock}
                historicalSeries={historicalSeries}
                selectedPeriod={selectedHistoricalPeriod}
                onPeriodChange={handleHistoricalPeriodChange}
                historicalLoading={historicalLoading}
                historicalError={historicalError}
                portfolioContext={portfolioContext}
                portfolioLoading={portfolioLoading}
                portfolioError={portfolioError}
                onQuickAddHolding={handleQuickAddHolding}
                quickAddBusy={quickAddPending}
              />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 py-8 mt-16 border-t border-gray-700">
        <div className="text-center text-sm text-ai-muted">
          <p className="mb-2">
            AuroraInvest Stock Analyzer • Educational Tool for Investment Analysis
          </p>
          <p className="text-xs">
            Not financial advice • Always consult with a licensed professional
          </p>
        </div>
      </footer>
    </div>
  );
}
