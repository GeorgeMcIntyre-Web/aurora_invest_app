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
  HistoricalData,
  HistoricalDataPoint,
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
 * Calculates simple and annualized returns for the provided historical series.
 *
 * @param data - Historical price series
 * @returns Period and annualized returns in percentage terms
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
 * @param data - Historical price series
 * @returns Annualized volatility percentage (0-∞)
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

  if (returns.length === 0) {
    return 0;
  }

  const mean = returns.reduce((sum, value) => sum + value, 0) / returns.length;
  const variance =
    returns.reduce((sum, value) => sum + (value - mean) ** 2, 0) / returns.length;

  const dailyStdDev = Math.sqrt(variance);
  const annualizedVol = dailyStdDev * Math.sqrt(TRADING_DAYS_PER_YEAR) * 100;

  return Number(annualizedVol.toFixed(2));
}

/**
 * Detects overall price trend direction using change percentage, slope, and breadth.
 *
 * @param data - Historical price series
 * @returns Trend direction classification
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
  const growth = fundamentals.epsGrowthYoYPct ?? fundamentals.revenueGrowthYoYPct ?? 0;
  const peg = forwardPE && growth ? forwardPE / Math.max(growth, 1) : undefined;
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

  const addScore = (value: number | undefined, scorer: (v: number | undefined, strong: number, weak: number) => number, strong: number, weak: number, weight: number) => {
    if (value === undefined) {
      return;
    }
    weightedScore += scorer(value, strong, weak) * weight;
    totalWeight += weight;
  };

  addScore(peg, scoreNegativeMetric, 1.1, 3, weights.peg);
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

  const detailParts: string[] = [];
  if (peg !== undefined) {
    detailParts.push(`PEG ${peg.toFixed(2)}`);
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

  return {
    classification,
    valuationScore: roundScore(valuationScore),
    commentary,
    pegRatio: peg,
    earningsYieldPct,
    freeCashFlowYieldPct: fcfYield,
    dividendYieldPct: dividendYield,
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
