/**
 * Pure analysis engine for AuroraInvest Stock Analyzer
 * 
 * This module contains all business logic for stock analysis. All functions are pure
 * (no side effects, deterministic output). This allows the engine to be easily tested
 * and used in different contexts (client-side, server-side, etc.).
 * 
 * @module auroraEngine
 */

import {
  UserProfile,
  StockData,
  AnalysisResult,
  AnalysisOptions,
  AnalysisSummary,
  ScenarioSummary,
  PlanningGuidance,
  ScenarioBand,
  AnalystConsensus,
  FundamentalsInsight,
  ValuationInsight,
  PegAssessment,
  PegBucket,
  GrowthSource,
  HistoricalData,
  HistoricalDataPoint,
  MetricTooltip,
  MetricId,
} from './AnalysisTypes';

type FundamentalsClass = FundamentalsInsight['classification'];
type ValuationClass = ValuationInsight['classification'];

const DEFAULT_FUNDAMENTALS_INSIGHT: FundamentalsInsight = {
  classification: 'unknown',
  qualityScore: 0,
  drivers: [],
  cautionaryNotes: ['Fundamentals data not available.'],
};

const DEFAULT_VALUATION_INSIGHT: ValuationInsight = {
  classification: 'unknown',
  valuationScore: 0,
  commentary: 'Valuation data not available.',
  drivers: [],
  cautionaryNotes: [],
};

function scorePositiveMetric(value: number | undefined, strong: number, weak: number): number {
  if (value === undefined) {
    return 0.5;
  }
  if (value >= strong) {
    return 1;
  }
  if (value <= weak) {
    return 0;
  }
  return (value - weak) / Math.max(strong - weak, 0.0001);
}

function scoreNegativeMetric(value: number | undefined, strong: number, weak: number): number {
  if (value === undefined) {
    return 0.5;
  }
  if (value <= strong) {
    return 1;
  }
  if (value >= weak) {
    return 0;
  }
  return 1 - (value - strong) / Math.max(weak - strong, 0.0001);
}

function roundScore(score: number): number {
  if (Number.isNaN(score)) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round(score)));
}

function dedupe<T>(items: T[]): T[] {
  return Array.from(new Set(items));
}

const PERIOD_MONTH_MAP: Record<HistoricalData['period'], number> = {
  '1M': 1,
  '3M': 3,
  '6M': 6,
  '1Y': 12,
  '5Y': 60,
};

const TREND_THRESHOLD_MAP: Record<HistoricalData['period'], number> = {
  '1M': 3,
  '3M': 5,
  '6M': 7,
  '1Y': 10,
  '5Y': 15,
};

const TRADING_DAYS_PER_YEAR = 252;

function normalizeHistoricalPoints(data?: HistoricalData): HistoricalDataPoint[] {
  if (!data?.dataPoints?.length) {
    return [];
  }

  return [...data.dataPoints]
    .filter((point) => typeof point?.price === 'number' && typeof point?.date === 'string')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function calculateSlope(points: HistoricalDataPoint[]): number {
  if (points.length < 2) {
    return 0;
  }

  const n = points.length;
  const meanX = (n - 1) / 2;
  const meanY = points.reduce((sum, point) => sum + point.price, 0) / n;

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i += 1) {
    const x = i - meanX;
    numerator += x * (points[i].price - meanY);
    denominator += x * x;
  }

  if (denominator === 0) {
    return 0;
  }

  return numerator / denominator;
}

/**
 * Calculates simple and annualized price returns for the supplied historical series.
 *
 * @param data Historical price data
 * @returns Period and annualized returns (percentage)
 */
export function calculateReturns(
  data: HistoricalData
): { period: number; annualized: number } {
  const points = normalizeHistoricalPoints(data);
  if (points.length < 2) {
    return { period: 0, annualized: 0 };
  }

  const startPrice = points[0].price;
  const endPrice = points[points.length - 1].price;

  if (!startPrice || !endPrice || startPrice <= 0 || endPrice <= 0) {
    return { period: 0, annualized: 0 };
  }

  const rawReturn = ((endPrice - startPrice) / startPrice) * 100;
  const months = PERIOD_MONTH_MAP[data?.period ?? '6M'] ?? 6;
  const years = months / 12;
  const annualizedReturn =
    years > 0 ? (Math.pow(endPrice / startPrice, 1 / years) - 1) * 100 : 0;

  return {
    period: Number(rawReturn.toFixed(2)),
    annualized: Number(annualizedReturn.toFixed(2)),
  };
}

/**
 * Estimates annualized volatility using daily price changes.
 *
 * @param data Historical price data
 * @returns Annualized volatility percentage
 */
export function calculateVolatility(data: HistoricalData): number {
  const points = normalizeHistoricalPoints(data);
  if (points.length < 2) {
    return 0;
  }

  const returns: number[] = [];
  for (let i = 1; i < points.length; i += 1) {
    const prev = points[i - 1].price;
    const curr = points[i].price;

    if (!prev || !curr || prev <= 0 || curr <= 0) {
      continue;
    }

    returns.push((curr - prev) / prev);
  }

  if (!returns.length) {
    return 0;
  }

  const mean = returns.reduce((sum, value) => sum + value, 0) / returns.length;
  const variance =
    returns.reduce((sum, value) => sum + (value - mean) ** 2, 0) / returns.length;

  const dailyStdDev = Math.sqrt(variance);
  const annualized = dailyStdDev * Math.sqrt(TRADING_DAYS_PER_YEAR) * 100;
  return Number(annualized.toFixed(2));
}

/**
 * Detects the dominant price trend for the supplied series.
 *
 * @param data Historical price data
 * @returns Trend classification
 */
export function detectTrend(
  data: HistoricalData
): 'uptrend' | 'downtrend' | 'sideways' {
  const points = normalizeHistoricalPoints(data);
  if (points.length < 2) {
    return 'sideways';
  }

  const startPrice = points[0].price;
  const endPrice = points[points.length - 1].price;

  if (!startPrice || !endPrice || startPrice <= 0 || endPrice <= 0) {
    return 'sideways';
  }

  const changePct = ((endPrice - startPrice) / startPrice) * 100;
  const threshold = TREND_THRESHOLD_MAP[data?.period ?? '6M'] ?? 5;
  const slope = calculateSlope(points);

  let advances = 0;
  let declines = 0;
  for (let i = 1; i < points.length; i += 1) {
    if (points[i].price > points[i - 1].price) {
      advances += 1;
    } else if (points[i].price < points[i - 1].price) {
      declines += 1;
    }
  }

  const breadth = advances + declines > 0 ? advances / (advances + declines) : 0.5;

  if (changePct >= threshold && slope > 0 && breadth >= 0.55) {
    return 'uptrend';
  }

  if (changePct <= -threshold && slope < 0 && breadth <= 0.45) {
    return 'downtrend';
  }

  return 'sideways';
}

const PEG_BUCKET_SCORES: Record<PegBucket, number> = {
  discount: 1,
  balanced: 0.7,
  demanding: 0.25,
  distorted: 0.45,
};

const GROWTH_SOURCE_TEXT: Record<GrowthSource, string> = {
  eps: 'EPS growth',
  revenue: 'revenue growth',
};

type GrowthMetricSelection = {
  value: number;
  source: GrowthSource;
};

function selectGrowthMetric(
  fundamentals?: StockData['fundamentals']
): GrowthMetricSelection | undefined {
  if (!fundamentals) {
    return undefined;
  }

  if (typeof fundamentals.epsGrowthYoYPct === 'number') {
    return { value: fundamentals.epsGrowthYoYPct, source: 'eps' };
  }

  if (typeof fundamentals.revenueGrowthYoYPct === 'number') {
    return { value: fundamentals.revenueGrowthYoYPct, source: 'revenue' };
  }

  return undefined;
}

function evaluatePegRatio(fundamentals?: StockData['fundamentals']): PegAssessment | undefined {
  if (!fundamentals) {
    return undefined;
  }

  const growthMetric = selectGrowthMetric(fundamentals);
  if (!growthMetric) {
    return undefined;
  }

  const { value: growth, source } = growthMetric;
  const pe = fundamentals.forwardPE ?? fundamentals.trailingPE;

  if (growth <= 0) {
    return {
      bucket: 'distorted',
      normalizedGrowthPct: growth,
      growthSource: source,
      commentary: `${GROWTH_SOURCE_TEXT[source]} turned negative, so PEG loses meaning.`,
    };
  }

  if (growth < 5) {
    return {
      bucket: 'distorted',
      ratio: pe && growth > 0 ? pe / Math.max(growth, 0.1) : undefined,
      normalizedGrowthPct: growth,
      growthSource: source,
      commentary: `${GROWTH_SOURCE_TEXT[source]} below 5% makes PEG less reliable.`,
    };
  }

  if (!pe) {
    return undefined;
  }

  const ratio = pe / growth;

  let bucket: PegBucket = 'balanced';
  let commentary = 'PEG indicates valuation is broadly aligned with growth.';

  if (ratio <= 1) {
    bucket = 'discount';
    commentary = 'PEG below 1 suggests valuation is discounting future growth.';
  } else if (ratio >= 1.8) {
    bucket = 'demanding';
    commentary =
      ratio >= 3
        ? 'PEG above 3 signals stretched multiples relative to growth.'
        : 'PEG above 1.8 requires flawless execution to justify.';
  }

  return {
    bucket,
    ratio,
    normalizedGrowthPct: growth,
    growthSource: source,
    commentary,
  };
}

/**
 * Calculates a 0-100 fundamentals quality score using weighted metrics.
 *
 * Weighting schema:
 * - EPS growth: 25%
 * - Net margin: 20%
 * - Free cash flow yield: 20%
 * - Return on equity: 15%
 * - Revenue growth: 10%
 * - Debt-to-equity (lower is better): 10%
 *
 * Missing metrics are treated as zero contribution.
 *
 * @param stock - Stock data containing fundamentals
 * @returns Quality score from 0 (weak) to 100 (strong)
 */
export function calculateFundamentalsQualityScore(stock: StockData): number {
  const fundamentals = stock?.fundamentals;
  if (!fundamentals) {
    return 0;
  }

  const weights = {
    epsGrowth: 0.25,
    netMargin: 0.2,
    fcfYield: 0.2,
    roe: 0.15,
    revenueGrowth: 0.1,
    debtToEquity: 0.1,
  };

  const epsScore =
    fundamentals.epsGrowthYoYPct == null
      ? 0
      : scorePositiveMetric(fundamentals.epsGrowthYoYPct, 20, 0);
  const marginScore =
    fundamentals.netMarginPct == null
      ? 0
      : scorePositiveMetric(fundamentals.netMarginPct, 22, 5);
  const fcfScore =
    fundamentals.freeCashFlowYieldPct == null
      ? 0
      : scorePositiveMetric(fundamentals.freeCashFlowYieldPct, 5, 0.5);
  const roeScore =
    fundamentals.roe == null ? 0 : scorePositiveMetric(fundamentals.roe, 25, 8);
  const revenueScore =
    fundamentals.revenueGrowthYoYPct == null
      ? 0
      : scorePositiveMetric(fundamentals.revenueGrowthYoYPct, 12, -5);
  const leverageScore =
    fundamentals.debtToEquity == null
      ? 0
      : scoreNegativeMetric(fundamentals.debtToEquity, 0.8, 3);

  const weightedTotal =
    epsScore * weights.epsGrowth +
    marginScore * weights.netMargin +
    fcfScore * weights.fcfYield +
    roeScore * weights.roe +
    revenueScore * weights.revenueGrowth +
    leverageScore * weights.debtToEquity;

  return roundScore(weightedTotal * 100);
}

/**
 * Builds a fundamentals insight with composite quality scoring.
 */
export function buildFundamentalsInsight(stock: StockData): FundamentalsInsight {
  const fundamentals = stock?.fundamentals;
  if (!fundamentals) {
    return { ...DEFAULT_FUNDAMENTALS_INSIGHT };
  }

  const qualityScore = calculateFundamentalsQualityScore(stock);

  let classification: FundamentalsClass = 'ok';
  if (qualityScore >= 72) {
    classification = 'strong';
  }
  if (qualityScore < 40) {
    classification = 'weak';
  }

  const drivers: string[] = [];
  if ((fundamentals.epsGrowthYoYPct ?? 0) >= 18) {
    drivers.push('EPS growth is running above 18%');
  }
  if ((fundamentals.netMarginPct ?? 0) >= 22) {
    drivers.push('Margins exceed 22%');
  }
  if ((fundamentals.freeCashFlowYieldPct ?? 0) >= 4) {
    drivers.push('Free cash flow yield surpasses 4%');
  }
  if ((fundamentals.roe ?? 0) >= 25) {
    drivers.push('ROE is north of 25%');
  }
  if ((fundamentals.revenueGrowthYoYPct ?? 0) >= 12) {
    drivers.push('Revenue is compounding at double-digit rates');
  }

  const cautionaryNotes: string[] = [];
  if ((fundamentals.debtToEquity ?? 0) > 2.5) {
    cautionaryNotes.push('Leverage is elevated (debt-to-equity > 2.5x)');
  }
  if ((fundamentals.freeCashFlowYieldPct ?? 0) < 0.5) {
    cautionaryNotes.push('Limited free cash flow support (< 0.5%)');
  }
  if ((fundamentals.epsGrowthYoYPct ?? 0) < 0) {
    cautionaryNotes.push('Recent EPS trend turned negative');
  }
  if ((fundamentals.netMarginPct ?? 0) < 8) {
    cautionaryNotes.push('Net margins are below 8%');
  }

  if (classification === 'strong' && cautionaryNotes.length > 0) {
    classification = 'ok';
  }

  return {
    classification,
    qualityScore: roundScore(qualityScore),
    drivers: drivers.slice(0, 3),
    cautionaryNotes,
  };
}

/**
 * Builds a valuation insight that balances PEG, earnings yield, and cash flow.
 */
export function buildValuationInsight(stock: StockData): ValuationInsight {
  const fundamentals = stock?.fundamentals;
  if (!fundamentals) {
    return { ...DEFAULT_VALUATION_INSIGHT };
  }

  const forwardPE = fundamentals.forwardPE ?? fundamentals.trailingPE;
  const fallbackGrowth = fundamentals.epsGrowthYoYPct ?? fundamentals.revenueGrowthYoYPct;
  const pegAssessment = evaluatePegRatio(fundamentals);
  const peg =
    pegAssessment?.ratio ??
    (forwardPE && fallbackGrowth && fallbackGrowth > 0
      ? forwardPE / Math.max(fallbackGrowth, 1)
      : undefined);
  const earningsYieldPct = forwardPE ? (1 / forwardPE) * 100 : undefined;
  const fcfYield = fundamentals.freeCashFlowYieldPct;
  const dividendYield = fundamentals.dividendYieldPct;

  const weights = {
    peg: 0.35,
    earningsYield: 0.25,
    fcfYield: 0.25,
    dividend: 0.15,
  };

  let weightedScore = 0;
  let totalWeight = 0;

  const addScore = (
    value: number | undefined,
    scorer: (v: number | undefined, strong: number, weak: number) => number,
    strong: number,
    weak: number,
    weight: number
  ) => {
    if (value === undefined) {
      return;
    }
    weightedScore += scorer(value, strong, weak) * weight;
    totalWeight += weight;
  };

  if (pegAssessment) {
    weightedScore += PEG_BUCKET_SCORES[pegAssessment.bucket] * weights.peg;
    totalWeight += weights.peg;
  } else {
    addScore(forwardPE, scoreNegativeMetric, 15, 35, weights.peg);
  }
  addScore(earningsYieldPct, scorePositiveMetric, 6, 2, weights.earningsYield);
  addScore(fcfYield, scorePositiveMetric, 5, 1, weights.fcfYield);
  addScore(dividendYield, scorePositiveMetric, 3, 0.2, weights.dividend);

  if (totalWeight === 0) {
    return { ...DEFAULT_VALUATION_INSIGHT };
  }

  const valuationScore = (weightedScore / totalWeight) * 100;

  let classification: ValuationClass = 'fair';
  if (valuationScore >= 65) {
    classification = 'cheap';
  }
  if (valuationScore < 35) {
    classification = 'rich';
  }

  let commentary = '';
  if (classification === 'cheap') {
    commentary = 'Multiples screen at a discount relative to growth and cash generation';
  } else if (classification === 'rich') {
    commentary = 'Premium multiples rely on sustained growth to be justified';
  } else {
    commentary = 'Valuation metrics look balanced versus growth profile';
  }

  const drivers: string[] = [];
  const cautionaryNotes: string[] = [];

  if (pegAssessment) {
    if (pegAssessment.bucket === 'discount') {
      drivers.push('PEG screens below 1x relative to growth inputs');
    }
    if (pegAssessment.bucket === 'balanced') {
      drivers.push('PEG roughly aligned with growth trajectory');
    }
    if (pegAssessment.bucket === 'demanding') {
      cautionaryNotes.push('Growth-adjusted PEG above 1.8x carries premium expectations');
    }
    if (pegAssessment.bucket === 'distorted') {
      cautionaryNotes.push('PEG distorted because growth is limited or negative');
    }

    if (
      pegAssessment.normalizedGrowthPct != null &&
      pegAssessment.normalizedGrowthPct >= 20
    ) {
      const sourceLabel = pegAssessment.growthSource
        ? GROWTH_SOURCE_TEXT[pegAssessment.growthSource]
        : 'Growth';
      drivers.push(`${sourceLabel} running near ${pegAssessment.normalizedGrowthPct.toFixed(0)}%`);
    }
  }

  if (earningsYieldPct !== undefined) {
    if (earningsYieldPct >= 6.5) {
      drivers.push(`Earnings yield ${earningsYieldPct.toFixed(1)}% clears 6% hurdle`);
    } else if (earningsYieldPct < 3) {
      cautionaryNotes.push('Earnings yield below 3% offers thin cash support');
    }
  }

  if (fcfYield !== undefined) {
    if (fcfYield >= 5) {
      drivers.push('Free cash flow yield exceeds 5%');
    } else if (fcfYield < 1) {
      cautionaryNotes.push('Free cash flow yield under 1% provides little downside protection');
    }
  }

  if (dividendYield !== undefined && dividendYield >= 3) {
    drivers.push('Dividend yield north of 3% adds income support');
  }

  if ((forwardPE ?? 0) >= 35) {
    cautionaryNotes.push('Earnings multiples above 35x embed perfection');
  }

  const detailParts: string[] = [];
  if (peg !== undefined) {
    detailParts.push(`PEG ${peg.toFixed(2)}`);
  }
  if (pegAssessment?.commentary) {
    detailParts.push(pegAssessment.commentary);
  }
  if (earningsYieldPct !== undefined) {
    detailParts.push(`Earnings yield ${earningsYieldPct.toFixed(1)}%`);
  }
  if (fcfYield !== undefined) {
    detailParts.push(`FCF yield ${fcfYield.toFixed(1)}%`);
  }
  if (dividendYield !== undefined) {
    detailParts.push(`Dividend yield ${dividendYield.toFixed(2)}%`);
  }

  if (detailParts.length > 0) {
    commentary = `${commentary} (${detailParts.join(' | ')})`;
  }

  const driverList = dedupe(drivers).slice(0, 3);
  const cautionList = dedupe(cautionaryNotes).slice(0, 3);

  return {
    classification,
    valuationScore: roundScore(valuationScore),
    commentary,
    pegRatio: peg,
    pegAssessment,
    earningsYieldPct,
    freeCashFlowYieldPct: fcfYield,
    dividendYieldPct: dividendYield,
    drivers: driverList,
    cautionaryNotes: cautionList,
  };
}

/**
 * Classifies stock fundamentals as 'strong', 'ok', 'weak', or 'unknown'.
 * 
 * Uses composite quality score with thresholds:
 * - Strong: Score ≥ 70
 * - OK: Score 40-69
 * - Weak: Score < 40
 * - Unknown: Missing data
 * 
 * @param stock - Stock data containing fundamentals
 * @returns Classification string indicating fundamentals strength
 */
export function classifyFundamentals(stock: StockData): 'strong' | 'ok' | 'weak' | 'unknown' {
  if (!stock?.fundamentals) {
    return 'unknown';
  }
  const score = calculateFundamentalsQualityScore(stock);
  if (score >= 70) {
    return 'strong';
  }
  if (score >= 40) {
    return 'ok';
  }
  return 'weak';
}

/**
 * Classifies stock valuation as 'cheap', 'fair', 'rich', or 'unknown'.
 * 
 * Uses multi-factor valuation insight with composite scoring.
 * 
 * @param stock - Stock data containing fundamentals
 * @returns Classification string indicating valuation level
 */
export function classifyValuation(stock: StockData): 'cheap' | 'fair' | 'rich' | 'unknown' {
  return buildValuationInsight(stock).classification;
}

/**
 * Analyzes technical indicators to determine trend, momentum, and price position.
 * 
 * **Trend Analysis** (using moving averages):
 * - Bullish: Price > SMA50 > SMA200 (uptrend)
 * - Bearish: Price < SMA50 < SMA200 (downtrend)
 * - Neutral: Mixed or missing data
 * 
 * **Momentum Analysis** (using RSI):
 * - Overbought: RSI > 70
 * - Oversold: RSI < 30
 * - Neutral: RSI between 30-70
 * 
 * **Price Position** (using 52-week range):
 * - Near 52-week high: Price in top 20% of range
 * - Near 52-week low: Price in bottom 20% of range
 * - Mid-range: Everything else
 * 
 * @param stock - Stock data containing technical indicators
 * @returns Object with trend, momentum, and price position analysis
 */
function analyzeTechnicals(stock: StockData): {
  trend: 'bullish' | 'bearish' | 'neutral';
  momentum: 'overbought' | 'oversold' | 'neutral';
  pricePosition: string;
} {
  const t = stock?.technicals;
  if (!t) {
    return {
      trend: 'neutral',
      momentum: 'neutral',
      pricePosition: 'Unknown',
    };
  }

  const price = t?.price ?? 0;
  const sma50 = t?.sma50;
  const sma200 = t?.sma200;
  const rsi = t?.rsi14;
  const high52w = t?.price52wHigh;
  const low52w = t?.price52wLow;

  // Trend determination
  let trend: 'bullish' | 'bearish' | 'neutral' = 'neutral';
  if (sma50 && sma200) {
    if (price > sma50 && sma50 > sma200) {
      trend = 'bullish';
    }
    if (price < sma50 && sma50 < sma200) {
      trend = 'bearish';
    }
  }

  // Momentum determination
  let momentum: 'overbought' | 'oversold' | 'neutral' = 'neutral';
  if (rsi) {
    if (rsi > 70) {
      momentum = 'overbought';
    }
    if (rsi < 30) {
      momentum = 'oversold';
    }
  }

  // Price position
  let pricePosition = 'Mid-range';
  if (high52w && low52w) {
    const range = high52w - low52w;
    const fromLow = price - low52w;
    const pct = (fromLow / range) * 100;

    if (pct > 80) {
      pricePosition = 'Near 52-week high';
    }
    if (pct < 20) {
      pricePosition = 'Near 52-week low';
    }
  }

  return { trend, momentum, pricePosition };
}

/**
 * Analyzes market sentiment based on analyst consensus, price targets, and news themes.
 * 
 * **Analyst Consensus**: Maps analyst consensus rating to human-readable text.
 * 
 * **Target vs Price**: Calculates upside/downside based on analyst target mean:
 * - Significant upside: > 15% above current price
 * - Downside risk: > 15% below current price
 * - Limited movement: Within ±15%
 * 
 * **News Themes**: Extracts first 3 news themes and formats as highlight.
 * 
 * @param stock - Stock data containing sentiment information
 * @returns Object with consensus text, target analysis, and news highlight
 */
function analyzeSentiment(stock: StockData): {
  consensusText: string;
  targetVsPrice: string;
  newsHighlight: string;
} {
  const s = stock?.sentiment;
  if (!s) {
    return {
      consensusText: 'No analyst data available',
      targetVsPrice: 'Unknown',
      newsHighlight: 'No news themes available',
    };
  }

  // Consensus mapping
  const consensusMap: Record<AnalystConsensus, string> = {
    strong_buy: 'Strong Buy',
    buy: 'Buy',
    hold: 'Hold',
    sell: 'Sell',
    strong_sell: 'Strong Sell',
  };

  const consensusText = s?.analystConsensus
    ? consensusMap[s.analystConsensus] ?? 'Unknown'
    : 'No consensus';

  // Target vs price
  const targetMean = s?.analystTargetMean;
  const currentPrice = stock?.technicals?.price ?? 0;
  let targetVsPrice = 'Unknown';

  if (targetMean && currentPrice > 0) {
    const upside = ((targetMean - currentPrice) / currentPrice) * 100;
    if (upside > 15) {
      targetVsPrice = `Significant upside (${upside.toFixed(1)}%)`;
    }
    if (upside < -15) {
      targetVsPrice = `Downside risk (${upside.toFixed(1)}%)`;
    }
    if (upside >= -15 && upside <= 15) {
      targetVsPrice = `Limited upside/downside (${upside.toFixed(1)}%)`;
    }
  }

  // News themes
  const themes = s?.newsThemes ?? [];
  const newsHighlight =
    themes?.length > 0
      ? themes.slice(0, 3).join('. ') + '.'
      : 'No recent news themes available.';

  return { consensusText, targetVsPrice, newsHighlight };
}

/**
 * Generates Bull/Base/Bear scenario projections for the specified time horizon.
 * 
 * Creates three scenarios with probability-weighted return ranges:
 * - **Bull Scenario**: 25% probability, positive return range
 * - **Base Scenario**: 50% probability, moderate return range
 * - **Bear Scenario**: 25% probability, negative return range
 * 
 * Return ranges are adjusted based on user risk tolerance:
 * - High risk tolerance: Wider ranges (more volatility)
 * - Low risk tolerance: Narrower ranges (less volatility)
 * 
 * Also calculates a probability-weighted point estimate for expected return.
 * 
 * **Important**: These scenarios are illustrative only and do not constitute predictions.
 * 
 * @param user - User profile (risk tolerance affects scenario ranges)
 * @param stock - Stock data (currently not used, but available for future enhancements)
 * @param horizonMonths - Time horizon in months (default: 3)
 * @returns Scenario summary with bull/base/bear projections and point estimate
 */
function generateScenarios(
  user: UserProfile,
  stock: StockData,
  horizonMonths: number = 3
): ScenarioSummary {
  // Base ranges (can be adjusted by risk tolerance)
  let bullRange: [number, number] = [8, 15];
  let baseRange: [number, number] = [-6, 7];
  let bearRange: [number, number] = [-15, -5];

  // Adjust slightly for risk tolerance
  if (user?.riskTolerance === 'high') {
    bullRange = [10, 18];
    baseRange = [-8, 9];
    bearRange = [-20, -7];
  }

  if (user?.riskTolerance === 'low') {
    bullRange = [6, 12];
    baseRange = [-4, 5];
    bearRange = [-12, -3];
  }

  const bull: ScenarioBand = {
    expectedReturnPctRange: bullRange,
    probabilityPct: 25,
    description: 'Positive catalysts materialize, market sentiment improves',
  };

  const base: ScenarioBand = {
    expectedReturnPctRange: baseRange,
    probabilityPct: 50,
    description: 'Current trends continue, no major surprises',
  };

  const bear: ScenarioBand = {
    expectedReturnPctRange: bearRange,
    probabilityPct: 25,
    description: 'Negative developments or broader market weakness',
  };

  // Calculate probability-weighted point estimate
  const bullMid = (bullRange[0] + bullRange[1]) / 2;
  const baseMid = (baseRange[0] + baseRange[1]) / 2;
  const bearMid = (bearRange[0] + bearRange[1]) / 2;

  const pointEstimate = (bullMid * 0.25 + baseMid * 0.5 + bearMid * 0.25);

  return {
    horizonMonths,
    bull,
    base,
    bear,
    pointEstimateReturnPct: Number(pointEstimate?.toFixed(1) ?? 0),
    uncertaintyComment:
      'These scenarios are illustrative only and do not constitute predictions. Actual results may vary significantly.',
  };
}

/**
 * Generates framework-based planning guidance based on user profile.
 * 
 * Provides educational guidance (NOT personalized advice) in three categories:
 * - **Position Sizing**: Framework-based suggestions based on risk tolerance
 * - **Timing**: Entry timing considerations based on investment horizon
 * - **Risk Notes**: Risk considerations based on investment objective
 * 
 * All guidance uses framework language ("many investors...", "typically...")
 * and emphasizes that it's educational, not personalized financial advice.
 * 
 * @param user - User profile (risk tolerance, horizon, objective)
 * @param stock - Stock data (currently not used, but available for future enhancements)
 * @returns Planning guidance with position sizing, timing, and risk notes
 */
function generatePlanningGuidance(
  user: UserProfile,
  stock: StockData
): PlanningGuidance {
  const positionSizing: string[] = [];
  const timing: string[] = [];
  const riskNotes: string[] = [];

  // Position sizing based on risk tolerance
  if (user?.riskTolerance === 'low') {
    positionSizing.push(
      'Conservative investors often limit individual stock positions to 3-5% of total portfolio.'
    );
    positionSizing.push(
      'Many risk-averse investors prefer diversifying across 20+ holdings.'
    );
  }

  if (user?.riskTolerance === 'moderate') {
    positionSizing.push(
      'Moderate investors typically allocate 5-10% per position in growth stocks.'
    );
    positionSizing.push(
      'Balanced portfolios often hold 12-20 positions for adequate diversification.'
    );
  }

  if (user?.riskTolerance === 'high') {
    positionSizing.push(
      'Growth-focused investors may allocate 10-15% to high-conviction positions.'
    );
    positionSizing.push(
      'Concentrated portfolios typically hold 8-12 positions with careful monitoring.'
    );
  }

  // Timing based on horizon
  if (user?.horizon === '1-3') {
    timing.push(
      'Short-term investors often consider entry timing more carefully, watching for technical support levels.'
    );
    timing.push(
      'Some traders use dollar-cost averaging over 2-4 weeks to reduce timing risk.'
    );
  }

  if (user?.horizon === '5-10' || user?.horizon === '10+') {
    timing.push(
      'Long-term investors often prioritize fundamental strength over short-term entry timing.'
    );
    timing.push(
      'Many long-horizon investors use systematic entry strategies over several months.'
    );
  }

  // Risk notes based on objective
  if (user?.objective === 'income') {
    riskNotes.push(
      'Income-focused investors typically compare dividend yield to bond yields and consider payout sustainability.'
    );
  }

  if (user?.objective === 'growth') {
    riskNotes.push(
      'Growth investors often accept higher volatility in exchange for potential capital appreciation.'
    );
  }

  riskNotes.push(
    'All equity investments carry market risk and can lose value, especially in the short term.'
  );
  riskNotes.push(
    'Single-stock positions carry company-specific risk beyond general market risk.'
  );

  return {
    positionSizing,
    timing,
    riskNotes,
    languageNotes:
      'This guidance is educational and framework-based. It does not constitute personalized financial advice.',
  };
}

// Generate summary
function generateSummary(
  user: UserProfile,
  stock: StockData,
  fundamentals: FundamentalsInsight,
  valuation: ValuationInsight,
  technical: ReturnType<typeof analyzeTechnicals>,
  sentiment: ReturnType<typeof analyzeSentiment>
): AnalysisSummary {
  const ticker = stock?.ticker ?? 'UNKNOWN';
  const name = stock?.name ?? ticker;

  const fundamentalsClass = fundamentals.classification;
  const valuationClass = valuation.classification;

  // Headline
  let headlineView = `${name} (${ticker}) shows ${fundamentalsClass} fundamentals with ${valuationClass} valuation.`;
  if (valuation.commentary && valuation.classification !== 'unknown') {
    headlineView = `${headlineView} ${valuation.commentary}`;
  }

  // Risk score (1-10)
  let riskScore = 5;

  if (user?.riskTolerance === 'high') {
    riskScore = 7;
  }
  if (user?.riskTolerance === 'low') {
    riskScore = 3;
  }

  // Adjust for valuation
  if (valuationClass === 'rich') {
    riskScore = Math.min(10, riskScore + 2);
  }
  if (valuationClass === 'cheap') {
    riskScore = Math.max(1, riskScore - 1);
  }

  // Conviction score (0-100, typically 40-60 for 3-month horizon)
  let convictionScore3m = 50;

  if (fundamentalsClass === 'strong' && technical?.trend === 'bullish') {
    convictionScore3m = 60;
  }
  if (fundamentalsClass === 'weak' || technical?.trend === 'bearish') {
    convictionScore3m = 40;
  }

  // Key takeaways
  const keyTakeaways: string[] = [];

  keyTakeaways.push(`Fundamentals: ${fundamentalsClass}`);
  keyTakeaways.push(`Quality score: ${fundamentals.qualityScore}/100`);
  keyTakeaways.push(`Valuation: ${valuationClass}`);
  if (fundamentals.drivers.length > 0) {
    keyTakeaways.push(`Key driver: ${fundamentals.drivers[0]}`);
  }
  if (fundamentals.cautionaryNotes.length > 0) {
    keyTakeaways.push(`Watch list: ${fundamentals.cautionaryNotes[0]}`);
  }
  if (valuation.commentary) {
    keyTakeaways.push(`Valuation context: ${valuation.commentary}`);
  }
  keyTakeaways.push(`Technical trend: ${technical?.trend ?? 'neutral'}`);
  keyTakeaways.push(`Analyst consensus: ${sentiment?.consensusText ?? 'unknown'}`);

  if (sentiment?.targetVsPrice && !sentiment.targetVsPrice.includes('Unknown')) {
    keyTakeaways.push(`Analyst targets suggest ${sentiment.targetVsPrice}`);
  }

  return {
    headlineView,
    riskScore,
    convictionScore3m,
    keyTakeaways,
  };
}

/**
 * Main analysis function - orchestrates the complete stock analysis pipeline.
 * 
 * This is the primary entry point for stock analysis. It:
 * 1. Validates inputs (user profile and stock data required)
 * 2. Classifies fundamentals and valuation
 * 3. Analyzes technical indicators and sentiment
 * 4. Generates scenario projections
 * 5. Generates planning guidance
 * 6. Composes summary and view strings
 * 7. Returns complete AnalysisResult
 * 
 * **Critical Constraints**:
 * - This function is PURE (no side effects, deterministic)
 * - All external data must be passed in via `stock` parameter
 * - No API calls, no database queries, no file I/O
 * 
 * @param user - User investment profile (risk tolerance, horizon, objective)
 * @param stock - Complete stock data (fundamentals, technicals, sentiment)
 * @param opts - Optional analysis options (e.g., horizonMonths, default: 3)
 * @returns Complete analysis result with all classifications, scenarios, and guidance
 * @throws Error if user or stock data is missing
 * 
 * @example
 * ```typescript
 * const result = analyzeStock(
 *   { riskTolerance: 'moderate', horizon: '5-10', objective: 'growth' },
 *   stockData,
 *   { horizonMonths: 6 }
 * );
 * ```
 */
export function analyzeStock(
  user: UserProfile,
  stock: StockData,
  opts?: AnalysisOptions
): AnalysisResult {
  // Guard: check inputs
  if (!user || !stock) {
    throw new Error('User profile and stock data are required');
  }

  const horizonMonths = opts?.horizonMonths ?? 3;

  // Classify fundamentals and valuation with richer insight
  const fundamentalsInsight = buildFundamentalsInsight(stock);
  const valuationInsight = buildValuationInsight(stock);
  const fundamentalsClass = fundamentalsInsight.classification;
  const valuationClass = valuationInsight.classification;

  // Technical analysis
  const technical = analyzeTechnicals(stock);

  // Sentiment analysis
  const sentiment = analyzeSentiment(stock);

  // Generate scenarios
  const scenarios = generateScenarios(user, stock, horizonMonths);

  // Generate planning guidance
  const planningGuidance = generatePlanningGuidance(user, stock);

  // Generate summary
  const summary = generateSummary(
    user,
    stock,
    fundamentalsInsight,
    valuationInsight,
    technical,
    sentiment
  );

  // Compose views
  const fundamentalsView = composeFundamentalsView(stock, fundamentalsInsight);
  const valuationView = composeValuationView(stock, valuationInsight);
  const technicalView = composeTechnicalView(stock, technical);
  const sentimentView = composeSentimentView(sentiment);

  // Disclaimer
  const disclaimer =
    'This analysis is educational only and does not constitute financial advice. Past performance is not a guide to future results. Consider consulting a licensed financial professional before making investment decisions.';

  return {
    ticker: stock?.ticker ?? 'UNKNOWN',
    name: stock?.name,
    summary,
    fundamentalsView,
    valuationView,
    technicalView,
    sentimentView,
    scenarios,
    planningGuidance,
    fundamentalsInsight,
    valuationInsight,
    disclaimer,
    generatedAt: new Date().toISOString(),
  };
}

// Helper: compose fundamentals view
function composeFundamentalsView(stock: StockData, insight: FundamentalsInsight): string {
  const f = stock?.fundamentals;
  if (!f) {
    return 'Fundamentals data not available.';
  }

  const parts: string[] = [];

  parts.push(`Classification: ${insight.classification.toUpperCase()}`);
  if (insight.qualityScore > 0) {
    parts.push(`Quality Score: ${insight.qualityScore}/100`);
  }
  if (insight.drivers.length > 0) {
    parts.push(`Drivers: ${insight.drivers.join(', ')}`);
  }
  if (insight.cautionaryNotes.length > 0) {
    parts.push(`Watch: ${insight.cautionaryNotes.join(', ')}`);
  }

  if (f?.trailingPE) {
    parts.push(`Trailing P/E: ${f.trailingPE.toFixed(1)}`);
  }
  if (f?.forwardPE) {
    parts.push(`Forward P/E: ${f.forwardPE.toFixed(1)}`);
  }
  if (f?.epsGrowthYoYPct) {
    parts.push(`EPS Growth (YoY): ${f.epsGrowthYoYPct.toFixed(1)}%`);
  }
  if (f?.netMarginPct) {
    parts.push(`Net Margin: ${f.netMarginPct.toFixed(1)}%`);
  }
  if (f?.freeCashFlowYieldPct) {
    parts.push(`FCF Yield: ${f.freeCashFlowYieldPct.toFixed(1)}%`);
  }
  if (f?.roe) {
    parts.push(`ROE: ${f.roe.toFixed(1)}%`);
  }

  return parts.join(' | ');
}

// Helper: compose valuation view
function composeValuationView(stock: StockData, insight: ValuationInsight): string {
  const f = stock?.fundamentals;
  if (!f) {
    return 'Valuation data not available.';
  }

  const parts: string[] = [];

  parts.push(`Classification: ${insight.classification.toUpperCase()}`);
  if (insight.valuationScore > 0) {
    parts.push(`Composite Score: ${insight.valuationScore}/100`);
  }
  if (insight.commentary) {
    parts.push(`Notes: ${insight.commentary}`);
  }
  if (insight.drivers && insight.drivers.length > 0) {
    parts.push(`Drivers: ${insight.drivers.join(', ')}`);
  }
  if (insight.cautionaryNotes && insight.cautionaryNotes.length > 0) {
    parts.push(`Watch: ${insight.cautionaryNotes.join(', ')}`);
  }

  if (insight.pegRatio !== undefined) {
    parts.push(`PEG Ratio: ${insight.pegRatio.toFixed(2)}`);
  }

  if (insight.earningsYieldPct !== undefined) {
    parts.push(`Earnings Yield: ${insight.earningsYieldPct.toFixed(1)}%`);
  }

  if (insight.freeCashFlowYieldPct !== undefined) {
    parts.push(`FCF Yield: ${insight.freeCashFlowYieldPct.toFixed(1)}%`);
  }

  if (insight.dividendYieldPct !== undefined) {
    parts.push(`Dividend Yield: ${insight.dividendYieldPct.toFixed(2)}%`);
  }

  return parts.join(' | ');
}

// Helper: compose technical view
function composeTechnicalView(
  stock: StockData,
  technical: ReturnType<typeof analyzeTechnicals>
): string {
  const t = stock?.technicals;
  if (!t) {
    return 'Technical data not available.';
  }

  const parts: string[] = [];

  parts.push(`Trend: ${technical?.trend ?? 'neutral'}`);
  parts.push(`Momentum: ${technical?.momentum ?? 'neutral'}`);
  parts.push(`Position: ${technical?.pricePosition ?? 'unknown'}`);

  if (t?.rsi14) {
    parts.push(`RSI(14): ${t.rsi14.toFixed(1)}`);
  }

  return parts.join(' | ');
}

// Helper: compose sentiment view
function composeSentimentView(sentiment: ReturnType<typeof analyzeSentiment>): string {
  const parts: string[] = [];

  parts.push(`Analyst Consensus: ${sentiment?.consensusText ?? 'unknown'}`);
  parts.push(`Target vs Price: ${sentiment?.targetVsPrice ?? 'unknown'}`);
  parts.push(`News: ${sentiment?.newsHighlight ?? 'N/A'}`);

  return parts.join(' | ');
}

/**
 * Generate tooltip content for a financial metric
 * 
 * Provides plain-English explanations and interpretation guidance for metrics
 * displayed throughout the application. Pure function - no side effects.
 * 
 * @param metricId - The identifier of the metric
 * @returns MetricTooltip with explanation, interpretation, and context
 * 
 * @example
 * const tooltip = generateMetricTooltip('trailingPE');
 * // Returns: { title: "Trailing P/E Ratio", explanation: "...", ... }
 */
export function generateMetricTooltip(metricId: MetricId): MetricTooltip {
  const tooltips: Record<MetricId, MetricTooltip> = {
    // Fundamentals metrics
    trailingPE: {
      title: 'Trailing P/E Ratio',
      explanation: 'Price divided by earnings per share over the past 12 months. Shows how much investors pay per dollar of historical earnings.',
      interpretation: 'Lower values may indicate undervaluation (< 15 is cheap, 15-25 is fair, > 25 is expensive). High P/E can signal growth expectations or overvaluation.',
      benchmark: 'S&P 500 average: ~20-25',
      caveats: ['Compare within same industry', 'Growth stocks typically have higher P/E', 'Negative earnings make P/E meaningless'],
    },
    forwardPE: {
      title: 'Forward P/E Ratio',
      explanation: 'Price divided by expected earnings per share for the next 12 months. Shows market expectations for future profitability.',
      interpretation: 'Lower is generally better. Forward P/E below Trailing P/E suggests earnings growth. Forward P/E > 20 implies strong growth expectations.',
      benchmark: 'Generally 10-20% below Trailing P/E if growth expected',
      caveats: ['Based on analyst estimates (may be wrong)', 'More speculative than trailing P/E'],
    },
    dividendYield: {
      title: 'Dividend Yield',
      explanation: 'Annual dividends per share divided by current stock price, expressed as a percentage. Measures income return.',
      interpretation: 'Higher yield provides more income. 2-4% is typical for dividend stocks. Very high yields (> 6%) may signal distress or unsustainability.',
      benchmark: 'S&P 500 average: ~1.5-2%',
      caveats: ['High yield may indicate price drop, not sustainability', 'Growth stocks typically have low/no dividends'],
    },
    revenueGrowth: {
      title: 'Revenue Growth (YoY)',
      explanation: 'Percentage increase in total revenue compared to the same quarter last year. Measures top-line expansion.',
      interpretation: 'Positive growth is good. > 10% is strong, > 20% is exceptional. Negative growth may signal declining demand.',
      benchmark: 'Growth stocks: > 15%, Mature companies: 3-7%',
      caveats: ['One-time events can skew growth', 'Check if growth is profitable or cash-burning'],
    },
    epsGrowth: {
      title: 'EPS Growth (YoY)',
      explanation: 'Percentage increase in earnings per share compared to last year. Measures bottom-line profitability growth.',
      interpretation: 'Higher is better. > 10% is solid, > 20% is excellent. Consistent growth over time signals quality.',
      benchmark: 'Quality growth stocks: 15-25% annually',
      caveats: ['Can be manipulated through buybacks', 'Compare with revenue growth for validation'],
    },
    netMargin: {
      title: 'Net Profit Margin',
      explanation: 'Net income divided by revenue, expressed as a percentage. Shows how much profit a company keeps from each dollar of sales.',
      interpretation: 'Higher is better. > 15% is strong, > 25% is exceptional. Indicates pricing power and operational efficiency.',
      benchmark: 'Software: 20-30%, Retail: 2-5%, Manufacturing: 5-10%',
      caveats: ['Varies greatly by industry', 'Can be distorted by one-time items'],
    },
    freeCashFlowYield: {
      title: 'Free Cash Flow Yield',
      explanation: 'Free cash flow per share divided by stock price. Measures cash generation relative to valuation.',
      interpretation: 'Higher is better. > 5% is attractive, > 8% may indicate undervaluation. More reliable than earnings-based metrics.',
      benchmark: 'Value stocks: 6-10%, Growth stocks: 2-4%',
      caveats: ['FCF can be volatile quarter-to-quarter', 'Capital-intensive businesses may have lower yields'],
    },
    debtToEquity: {
      title: 'Debt-to-Equity Ratio',
      explanation: 'Total debt divided by shareholder equity. Measures financial leverage and balance sheet risk.',
      interpretation: 'Lower is generally safer. < 0.5 is conservative, 0.5-1.5 is moderate, > 2.0 is aggressive. High leverage amplifies both gains and losses.',
      benchmark: 'Conservative: < 0.5, Moderate: 0.5-1.5',
      caveats: ['Industry norms vary (utilities have higher ratios)', 'Some debt can be healthy for growth'],
    },
    roe: {
      title: 'Return on Equity (ROE)',
      explanation: 'Net income divided by shareholder equity, expressed as a percentage. Measures profitability relative to equity.',
      interpretation: 'Higher is better. > 15% is solid, > 20% is excellent. Shows how effectively management deploys capital.',
      benchmark: 'Quality companies: 15-25%',
      caveats: ['High leverage inflates ROE', 'Compare with cost of capital', 'Negative equity makes ROE meaningless'],
    },

    // Technical indicators
    price: {
      title: 'Current Price',
      explanation: 'Latest trading price of the stock. Real-time market valuation.',
      interpretation: 'Compare to moving averages, 52-week range, and analyst targets to gauge momentum and position.',
      benchmark: 'Relative to historical range and intrinsic value estimates',
    },
    sma20: {
      title: '20-Day Simple Moving Average',
      explanation: 'Average closing price over the past 20 trading days. Short-term trend indicator.',
      interpretation: 'Price above SMA20 suggests short-term uptrend. Price crossing above SMA20 can signal buying opportunity.',
      benchmark: 'Price > SMA20 = bullish, Price < SMA20 = bearish',
      caveats: ['Lagging indicator', 'Can generate false signals in choppy markets'],
    },
    sma50: {
      title: '50-Day Simple Moving Average',
      explanation: 'Average closing price over the past 50 trading days. Medium-term trend indicator.',
      interpretation: 'Price above SMA50 indicates medium-term strength. SMA50 crossing above SMA200 ("golden cross") is bullish.',
      benchmark: 'Key support/resistance level',
      caveats: ['More reliable than SMA20 but slower to react'],
    },
    sma200: {
      title: '200-Day Simple Moving Average',
      explanation: 'Average closing price over the past 200 trading days. Long-term trend indicator.',
      interpretation: 'Price above SMA200 indicates long-term uptrend. SMA200 is major support/resistance level watched by institutions.',
      benchmark: 'Critical for determining bull/bear market status',
      caveats: ['Very slow to react to changes', 'Less useful for volatile stocks'],
    },
    rsi14: {
      title: 'RSI (14-Day)',
      explanation: 'Relative Strength Index measures momentum on a scale of 0-100. Compares magnitude of recent gains to recent losses.',
      interpretation: 'RSI > 70 = overbought (potential pullback), RSI < 30 = oversold (potential bounce). 40-60 is neutral zone.',
      benchmark: 'Overbought: > 70, Oversold: < 30',
      caveats: ['Can stay overbought/oversold for extended periods in strong trends', 'Not a timing tool on its own'],
    },
    price52wHigh: {
      title: '52-Week High',
      explanation: 'Highest price reached in the past 52 weeks. Represents recent peak valuation.',
      interpretation: 'Distance from 52-week high shows momentum. Stocks near highs often continue higher (momentum), or may be due for pullback.',
      benchmark: 'Within 5% of high = strong momentum',
    },
    price52wLow: {
      title: '52-Week Low',
      explanation: 'Lowest price reached in the past 52 weeks. Represents recent trough valuation.',
      interpretation: 'Distance from 52-week low provides perspective. Near lows may signal opportunity or continued weakness.',
      benchmark: 'Within 10% of low = potential turnaround or falling knife',
    },
    volume: {
      title: 'Volume',
      explanation: 'Number of shares traded today. Measures market participation and liquidity.',
      interpretation: 'Higher volume on up days is bullish. Higher volume on down days is bearish. Low volume moves are less reliable.',
      benchmark: 'Compare to average volume',
    },
    avgVolume: {
      title: 'Average Volume',
      explanation: 'Average number of shares traded per day over a recent period (typically 30-90 days).',
      interpretation: 'Higher average volume indicates better liquidity and easier entry/exit. Institutional ownership typically requires high volume.',
      benchmark: '> 1M shares/day for large caps',
    },

    // Risk metrics
    riskScore: {
      title: 'Risk Score',
      explanation: 'Composite score (1-10) combining leverage, volatility, liquidity, and sentiment factors.',
      interpretation: 'Lower is safer. 1-3 = low risk, 4-7 = moderate risk, 8-10 = high risk. Use for position sizing.',
      benchmark: 'Conservative: < 4, Moderate: 4-7, Aggressive: > 7',
      caveats: ['Risk is multidimensional', 'Score is a starting point, not a complete picture'],
    },
    convictionScore: {
      title: 'Conviction Score',
      explanation: 'Model confidence level (0-100%) for 3-month outlook based on signal strength across all factors.',
      interpretation: 'Higher conviction suggests stronger signal alignment. Low conviction (< 50%) suggests mixed signals or uncertainty.',
      benchmark: 'High conviction: > 70%, Low conviction: < 40%',
      caveats: ['High conviction can be wrong', 'Consider alongside risk score'],
    },
    leverage: {
      title: 'Leverage Risk',
      explanation: 'Assessment of financial leverage risk based on debt-to-equity ratio.',
      interpretation: 'Low leverage (< 0.8) is safer. High leverage (> 1.5) amplifies both gains and losses.',
      benchmark: 'Conservative: < 0.5, Elevated: > 1.5',
    },
    volatility: {
      title: 'Price Volatility',
      explanation: 'Measure of price fluctuation based on 52-week high/low range.',
      interpretation: 'Higher volatility means larger price swings. Low volatility (< 35%) is more stable.',
      benchmark: 'Low: < 35%, Moderate: 35-65%, High: > 65%',
    },
    liquidity: {
      title: 'Liquidity Risk',
      explanation: 'Assessment of trading liquidity based on volume ratio (current vs. average).',
      interpretation: 'Higher volume ratio (> 1.2x average) indicates good liquidity. Low liquidity (< 0.7x) makes entry/exit harder.',
      benchmark: 'Good: > 1.2x, Concerning: < 0.7x',
    },
    sentiment: {
      title: 'Market Sentiment',
      explanation: 'Blend of analyst consensus ratings and narrative sentiment from news/social media.',
      interpretation: 'Positive sentiment (buy/strong buy) suggests institutional support. Negative sentiment may indicate headwinds.',
      benchmark: 'Bullish: strong buy/buy, Neutral: hold, Bearish: sell/strong sell',
      caveats: ['Sentiment is a contrarian indicator when extreme', 'Lags fundamental changes'],
    },

    // Valuation metrics
    pegRatio: {
      title: 'PEG Ratio',
      explanation: 'P/E ratio divided by earnings growth rate. Normalizes valuation for growth.',
      interpretation: 'PEG < 1 suggests undervalued relative to growth. PEG > 2 suggests overvalued. Best for comparing growth stocks.',
      benchmark: 'Attractive: < 1, Fair: 1-2, Expensive: > 2',
      caveats: ['Only works with positive, sustainable growth', 'Quality of growth matters more than quantity'],
    },
    earningsYield: {
      title: 'Earnings Yield',
      explanation: 'Earnings per share divided by price (inverse of P/E), expressed as percentage. Shows earnings return.',
      interpretation: 'Higher is better. Compare to bond yields. > 6% is attractive, especially if > 10-year Treasury.',
      benchmark: 'Should exceed risk-free rate (10-year Treasury)',
    },
    priceToBook: {
      title: 'Price-to-Book Ratio',
      explanation: 'Market cap divided by book value (net assets). Shows premium to accounting value.',
      interpretation: 'Lower may indicate value. P/B < 1 suggests trading below asset value. High P/B signals intangibles or growth premium.',
      benchmark: 'Value: < 1.5, Growth: > 3',
      caveats: ['Book value often outdated', 'Less relevant for asset-light businesses'],
    },
    priceToSales: {
      title: 'Price-to-Sales Ratio',
      explanation: 'Market cap divided by annual revenue. Shows valuation relative to top-line.',
      interpretation: 'Lower is generally better. P/S < 2 is reasonable, > 5 is expensive. Useful for unprofitable companies.',
      benchmark: 'Mature: 1-3, Growth: 3-10',
      caveats: ['Ignores profitability', 'Varies widely by industry margins'],
    },
  };

  return tooltips[metricId] || {
    title: metricId,
    explanation: 'No explanation available for this metric.',
    interpretation: 'Please refer to financial literature for guidance.',
  };
}
