// Pure analysis engine for AuroraInvest Stock Analyzer
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
} from './AnalysisTypes';

// Fundamentals classification
function classifyFundamentals(stock: StockData): 'strong' | 'ok' | 'weak' | 'unknown' {
  const f = stock?.fundamentals;
  if (!f) {
    return 'unknown';
  }

  const trailingPE = f?.trailingPE ?? 999;
  const growth = f?.epsGrowthYoYPct ?? 0;
  const margin = f?.netMarginPct ?? 0;
  const fcfYield = f?.freeCashFlowYieldPct ?? 0;
  const roe = f?.roe ?? 0;

  // Strong: good growth, good margins, solid FCF
  if (growth > 15 && margin > 20 && fcfYield > 3 && roe > 20) {
    return 'strong';
  }

  // Weak: low growth, poor margins
  if (growth < 5 && margin < 10) {
    return 'weak';
  }

  return 'ok';
}

// Valuation classification
function classifyValuation(stock: StockData): 'cheap' | 'fair' | 'rich' | 'unknown' {
  const f = stock?.fundamentals;
  if (!f) {
    return 'unknown';
  }

  const trailingPE = f?.trailingPE ?? 999;
  const forwardPE = f?.forwardPE ?? 999;
  const growth = f?.epsGrowthYoYPct ?? 0;

  // PEG ratio heuristic
  const peg = forwardPE / Math.max(growth, 1);

  if (peg < 1.0 && forwardPE < 20) {
    return 'cheap';
  }

  if (peg > 2.5 || forwardPE > 40) {
    return 'rich';
  }

  return 'fair';
}

// Technical analysis
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

// Sentiment analysis
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

// Generate 3-month scenarios
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

// Generate planning guidance
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
  fundamentalsClass: string,
  valuationClass: string,
  technical: ReturnType<typeof analyzeTechnicals>,
  sentiment: ReturnType<typeof analyzeSentiment>
): AnalysisSummary {
  const ticker = stock?.ticker ?? 'UNKNOWN';
  const name = stock?.name ?? ticker;

  // Headline
  let headlineView = `${name} (${ticker}) shows ${fundamentalsClass} fundamentals with ${valuationClass} valuation.`;

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
  keyTakeaways.push(`Valuation: ${valuationClass}`);
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

// Main analysis function
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

  // Classify fundamentals and valuation
  const fundamentalsClass = classifyFundamentals(stock);
  const valuationClass = classifyValuation(stock);

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
    fundamentalsClass,
    valuationClass,
    technical,
    sentiment
  );

  // Compose views
  const fundamentalsView = composeFundamentalsView(stock, fundamentalsClass);
  const valuationView = composeValuationView(stock, valuationClass);
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
    disclaimer,
    generatedAt: new Date().toISOString(),
  };
}

// Helper: compose fundamentals view
function composeFundamentalsView(stock: StockData, classification: string): string {
  const f = stock?.fundamentals;
  if (!f) {
    return 'Fundamentals data not available.';
  }

  const parts: string[] = [];

  parts.push(`Classification: ${classification.toUpperCase()}`);

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
function composeValuationView(stock: StockData, classification: string): string {
  const f = stock?.fundamentals;
  if (!f) {
    return 'Valuation data not available.';
  }

  const parts: string[] = [];

  parts.push(`Classification: ${classification.toUpperCase()}`);

  if (f?.forwardPE && f?.epsGrowthYoYPct) {
    const peg = f.forwardPE / Math.max(f.epsGrowthYoYPct, 1);
    parts.push(`PEG Ratio: ${peg.toFixed(2)}`);
  }

  if (f?.dividendYieldPct !== undefined) {
    parts.push(`Dividend Yield: ${f.dividendYieldPct.toFixed(2)}%`);
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
