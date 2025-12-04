import {
  analyzeStock,
  buildFundamentalsInsight,
  buildValuationInsight,
  calculateFundamentalsQualityScore,
  calculateReturns,
  calculateVolatility,
  detectTrend,
  generateMetricTooltip,
} from '../auroraEngine';
import {
  HistoricalData,
  StockData,
  StockFundamentals,
  UserProfile,
} from '../AnalysisTypes';
import { MOCK_STOCK_DATA } from '../../data/mockData';

const baseTechnicals = {
  price: 100,
  price52wHigh: 120,
  price52wLow: 80,
  sma50: 102,
  sma200: 95,
  rsi14: 55,
};

const baseSentiment = {
  analystConsensus: 'hold' as const,
  analystTargetMean: 105,
  analystTargetHigh: 130,
  analystTargetLow: 80,
  newsThemes: ['Test item'],
};

const TEST_USER: UserProfile = {
  riskTolerance: 'moderate',
  horizon: '5-10',
  objective: 'growth',
};

const HIGH_RISK_USER: UserProfile = {
  riskTolerance: 'high',
  horizon: '1-3',
  objective: 'growth',
};

const LOW_RISK_USER: UserProfile = {
  riskTolerance: 'low',
  horizon: '10+',
  objective: 'income',
};

function createStock(overrides: Partial<StockData>): StockData {
  const fundamentals = overrides.fundamentals ?? {
    trailingPE: 18,
    forwardPE: 16,
    dividendYieldPct: 1,
    revenueGrowthYoYPct: 8,
    epsGrowthYoYPct: 10,
    netMarginPct: 15,
    freeCashFlowYieldPct: 3,
    debtToEquity: 1,
    roe: 18,
  };

  return {
    ticker: 'TEST',
    name: 'Test Co',
    currency: 'USD',
    fundamentals,
    technicals: overrides.technicals ?? baseTechnicals,
    sentiment: overrides.sentiment ?? baseSentiment,
  };
}

function buildHistoricalData(
  prices: number[],
  period: HistoricalData['period'] = '6M'
): HistoricalData {
  return {
    ticker: 'TEST',
    period,
    dataPoints: prices.map((price, index) => ({
      date: new Date(2024, 0, 1 + index).toISOString().split('T')[0],
      price,
      volume: 1_000_000 + index * 25_000,
    })),
  };
}

describe('calculateFundamentalsQualityScore', () => {
  it('returns high score for strong fundamentals', () => {
    const score = calculateFundamentalsQualityScore(MOCK_STOCK_DATA.MSFT);
    expect(score).toBeGreaterThanOrEqual(70);
    expect(score).toBeLessThanOrEqual(100);
  });

  it('returns low score for weak fundamentals', () => {
    const weakStock = createStock({
      fundamentals: {
        trailingPE: 60,
        forwardPE: 55,
        dividendYieldPct: 0,
        revenueGrowthYoYPct: -10,
        epsGrowthYoYPct: -5,
        netMarginPct: 2,
        freeCashFlowYieldPct: 0.1,
        debtToEquity: 3.2,
        roe: 4,
      },
    });
    const score = calculateFundamentalsQualityScore(weakStock);
    expect(score).toBeLessThan(30);
    expect(score).toBeGreaterThanOrEqual(0);
  });

  it('handles missing fundamentals by returning zero', () => {
    const partialStock = createStock({
      fundamentals: {
        trailingPE: 22,
        forwardPE: 20,
        // intentionally leaving the rest undefined
      } as StockFundamentals,
    });

    const score = calculateFundamentalsQualityScore(partialStock);
    expect(score).toBe(0);
  });
});

describe('buildFundamentalsInsight', () => {
  it('scores high quality companies as strong', () => {
    const insight = buildFundamentalsInsight(MOCK_STOCK_DATA.MSFT);
    expect(insight.classification).toBe('strong');
    expect(insight.qualityScore).toBeGreaterThanOrEqual(60);
    expect(insight.cautionaryNotes).toHaveLength(0);
  });

  it('flags weak fundamentals with leverage warnings', () => {
    const stressedStock = createStock({
      fundamentals: {
        trailingPE: 55,
        forwardPE: 48,
        dividendYieldPct: 0,
        revenueGrowthYoYPct: -6,
        epsGrowthYoYPct: -4,
        netMarginPct: 4,
        freeCashFlowYieldPct: 0.2,
        debtToEquity: 3.5,
        roe: 5,
      },
    });

    const insight = buildFundamentalsInsight(stressedStock);
    expect(insight.classification).toBe('weak');
    expect(insight.qualityScore).toBeLessThan(40);
    expect(insight.cautionaryNotes.some((note) => note.includes('Leverage'))).toBe(true);
  });
});

describe('classifyFundamentals thresholds', () => {
  it('classifies as strong when score is >= 70', () => {
    const strongStock = createStock({
      fundamentals: {
        trailingPE: 20,
        forwardPE: 18,
        dividendYieldPct: 1,
        revenueGrowthYoYPct: 13,
        epsGrowthYoYPct: 22,
        netMarginPct: 24,
        freeCashFlowYieldPct: 6,
        debtToEquity: 0.7,
        roe: 28,
      },
    });
    expect(buildFundamentalsInsight(strongStock).classification).toBe('strong');
  });

  it('classifies as ok when score is between 40 and 69', () => {
    const midStock = createStock({
      fundamentals: {
        trailingPE: 25,
        forwardPE: 22,
        dividendYieldPct: 0.8,
        revenueGrowthYoYPct: 5,
        epsGrowthYoYPct: 8,
        netMarginPct: 12,
        freeCashFlowYieldPct: 3,
        debtToEquity: 1.2,
        roe: 16,
      },
    });
    expect(buildFundamentalsInsight(midStock).classification).toBe('ok');
  });

  it('classifies as weak when score is below 40', () => {
    const weakStock = createStock({
      fundamentals: {
        trailingPE: 60,
        forwardPE: 55,
        dividendYieldPct: 0,
        revenueGrowthYoYPct: -8,
        epsGrowthYoYPct: -3,
        netMarginPct: 4,
        freeCashFlowYieldPct: 0.2,
        debtToEquity: 3,
        roe: 6,
      },
    });
    expect(buildFundamentalsInsight(weakStock).classification).toBe('weak');
  });
});

describe('buildValuationInsight', () => {
  it('labels discounted valuations as cheap', () => {
    const valueStock = createStock({
      fundamentals: {
        trailingPE: 14,
        forwardPE: 12,
        dividendYieldPct: 2.6,
        revenueGrowthYoYPct: 11,
        epsGrowthYoYPct: 18,
        netMarginPct: 18,
        freeCashFlowYieldPct: 6,
        debtToEquity: 0.8,
        roe: 22,
      },
    });

    const insight = buildValuationInsight(valueStock);
    expect(insight.classification).toBe('cheap');
    expect(insight.valuationScore).toBeGreaterThanOrEqual(65);
    expect(insight.commentary).toContain('discount');
    expect(insight.pegAssessment?.bucket).toBe('discount');
    expect(insight.drivers.some((driver) => driver.includes('PEG'))).toBe(true);
  });

  it('detects premium valuations as rich', () => {
    const momentumStock = createStock({
      fundamentals: {
        trailingPE: 90,
        forwardPE: 70,
        dividendYieldPct: 0,
        revenueGrowthYoYPct: 8,
        epsGrowthYoYPct: 6,
        netMarginPct: 10,
        freeCashFlowYieldPct: 0.3,
        debtToEquity: 1.2,
        roe: 12,
      },
    });

    const insight = buildValuationInsight(momentumStock);
    expect(insight.classification).toBe('rich');
    expect(insight.valuationScore).toBeLessThan(35);
    expect(insight.commentary).toContain('Premium');
    expect(insight.pegAssessment?.bucket).toBe('demanding');
    expect(
      insight.cautionaryNotes.some((note) => note.includes('premium') || note.includes('PEG'))
    ).toBe(true);
  });

  it('marks peg as distorted when growth is negative', () => {
    const shrinkingStock = createStock({
      fundamentals: {
        trailingPE: 28,
        forwardPE: 26,
        dividendYieldPct: 0.5,
        revenueGrowthYoYPct: -4,
        epsGrowthYoYPct: -6,
        netMarginPct: 8,
        freeCashFlowYieldPct: 0.6,
        debtToEquity: 1.4,
        roe: 10,
      },
    });

    const insight = buildValuationInsight(shrinkingStock);
    expect(insight.pegAssessment?.bucket).toBe('distorted');
    expect(
      insight.cautionaryNotes.some((note) => note.toLowerCase().includes('peg distorted'))
    ).toBe(true);
  });
});

describe('historical analysis helpers', () => {
  it('calculates period and annualized returns for longer periods', () => {
    const data = buildHistoricalData([100, 112, 120], '1Y');
    const result = calculateReturns(data);
    expect(result.period).toBeGreaterThan(15);
    expect(result.annualized).toBeGreaterThan(15);
  });

  it('returns zeroes when insufficient data is provided', () => {
    const data = buildHistoricalData([100], '3M');
    const result = calculateReturns(data);
    expect(result.period).toBe(0);
    expect(result.annualized).toBe(0);
    expect(calculateVolatility(data)).toBe(0);
    expect(detectTrend(data)).toBe('sideways');
  });

  it('detects clear uptrends and downtrends', () => {
    const uptrend = buildHistoricalData([100, 104, 109, 115, 123], '6M');
    const downtrend = buildHistoricalData([150, 142, 135, 129, 120], '6M');

    expect(detectTrend(uptrend)).toBe('uptrend');
    expect(detectTrend(downtrend)).toBe('downtrend');
  });

  it('estimates volatility for choppy series', () => {
    const noisy = buildHistoricalData([100, 103, 99, 104, 101, 107], '3M');
    const volatility = calculateVolatility(noisy);
    expect(volatility).toBeGreaterThan(0);
    expect(volatility).toBeLessThan(120);
  });
});

describe('analyzeStock', () => {
  it('embeds insight metadata inside the analysis result', () => {
    const result = analyzeStock(TEST_USER, MOCK_STOCK_DATA.AAPL, { horizonMonths: 6 });
    expect(result.fundamentalsInsight?.classification).toBeDefined();
    expect(result.valuationInsight?.classification).toBeDefined();
    expect(result.fundamentalsView).toContain('Quality Score');
    expect(result.summary.keyTakeaways.some((takeaway) => takeaway.includes('Quality score'))).toBe(
      true
    );
  });
});

describe('analyzeStock scenarios and guidance', () => {
  it('throws when user or stock inputs are missing', () => {
    expect(() => analyzeStock(undefined as unknown as UserProfile, MOCK_STOCK_DATA.AAPL)).toThrow(
      'User profile and stock data are required'
    );
    expect(() => analyzeStock(TEST_USER, undefined as unknown as StockData)).toThrow(
      'User profile and stock data are required'
    );
  });

  it('honors custom horizons and widens scenario ranges for high risk tolerance', () => {
    const lowRiskScenarios = analyzeStock(LOW_RISK_USER, MOCK_STOCK_DATA.TSLA, {
      horizonMonths: 12,
    }).scenarios;
    const highRiskScenarios = analyzeStock(HIGH_RISK_USER, MOCK_STOCK_DATA.TSLA, {
      horizonMonths: 12,
    }).scenarios;

    expect(lowRiskScenarios.horizonMonths).toBe(12);
    expect(highRiskScenarios.horizonMonths).toBe(12);
    expect(highRiskScenarios.bull.expectedReturnPctRange[1]).toBeGreaterThan(
      lowRiskScenarios.bull.expectedReturnPctRange[1]
    );
    expect(highRiskScenarios.bear.expectedReturnPctRange[0]).toBeLessThan(
      lowRiskScenarios.bear.expectedReturnPctRange[0]
    );
  });

  it('returns educational guidance and disclaimers for end users', () => {
    const result = analyzeStock(TEST_USER, MOCK_STOCK_DATA.NVDA);
    expect(result.planningGuidance.positionSizing.length).toBeGreaterThan(0);
    expect(result.summary.keyTakeaways.some((item) => item.includes('Fundamentals'))).toBe(true);
    expect(result.disclaimer).toContain('educational');
  });
});

describe('generateMetricTooltip', () => {
  it('returns tooltip with all required fields for fundamental metrics', () => {
    const tooltip = generateMetricTooltip('trailingPE');
    expect(tooltip.title).toBe('Trailing P/E Ratio');
    expect(tooltip.explanation).toBeTruthy();
    expect(tooltip.explanation.length).toBeGreaterThan(20);
    expect(tooltip.interpretation).toBeTruthy();
    expect(tooltip.interpretation.length).toBeGreaterThan(20);
  });

  it('provides actionable interpretation guidance for P/E ratios', () => {
    const trailingPE = generateMetricTooltip('trailingPE');
    const forwardPE = generateMetricTooltip('forwardPE');
    
    expect(trailingPE.interpretation).toContain('Lower');
    expect(trailingPE.benchmark).toBeTruthy();
    expect(trailingPE.caveats).toBeDefined();
    expect(trailingPE.caveats!.length).toBeGreaterThan(0);
    
    expect(forwardPE.title).toContain('Forward');
    expect(forwardPE.explanation).toContain('expected');
  });

  it('provides contextual benchmarks for valuation metrics', () => {
    const dividendYield = generateMetricTooltip('dividendYield');
    const roe = generateMetricTooltip('roe');
    
    expect(dividendYield.benchmark).toContain('%');
    expect(dividendYield.interpretation).toContain('income');
    
    expect(roe.benchmark).toContain('%');
    expect(roe.interpretation).toContain('capital');
  });

  it('explains technical indicators with clear thresholds', () => {
    const rsi = generateMetricTooltip('rsi14');
    const sma200 = generateMetricTooltip('sma200');
    
    expect(rsi.explanation).toContain('momentum');
    expect(rsi.interpretation).toContain('70');
    expect(rsi.interpretation).toContain('30');
    expect(rsi.benchmark).toBeTruthy();
    
    expect(sma200.explanation).toContain('200');
    expect(sma200.interpretation).toContain('trend');
  });

  it('provides risk metric context for position sizing', () => {
    const riskScore = generateMetricTooltip('riskScore');
    const convictionScore = generateMetricTooltip('convictionScore');
    
    expect(riskScore.explanation).toContain('1-10');
    expect(riskScore.interpretation).toContain('position sizing');
    expect(riskScore.benchmark).toBeTruthy();
    
    expect(convictionScore.explanation).toContain('0-100');
    expect(convictionScore.interpretation).toContain('conviction');
  });

  it('explains leverage and volatility risks clearly', () => {
    const leverage = generateMetricTooltip('leverage');
    const volatility = generateMetricTooltip('volatility');
    
    expect(leverage.explanation).toContain('debt');
    expect(leverage.interpretation).toContain('leverage');
    
    expect(volatility.explanation).toContain('fluctuation');
    expect(volatility.interpretation).toContain('volatility');
    expect(volatility.benchmark).toBeTruthy();
  });

  it('provides market sentiment interpretation', () => {
    const sentiment = generateMetricTooltip('sentiment');
    
    expect(sentiment.explanation).toContain('analyst');
    expect(sentiment.interpretation).toContain('sentiment');
    expect(sentiment.caveats).toBeDefined();
    expect(sentiment.caveats!.length).toBeGreaterThan(0);
  });

  it('explains advanced valuation metrics like PEG ratio', () => {
    const peg = generateMetricTooltip('pegRatio');
    
    expect(peg.explanation).toContain('growth');
    expect(peg.interpretation).toContain('< 1');
    expect(peg.benchmark).toBeTruthy();
    expect(peg.caveats).toBeDefined();
  });

  it('provides volume and liquidity context', () => {
    const volume = generateMetricTooltip('volume');
    const avgVolume = generateMetricTooltip('avgVolume');
    const liquidity = generateMetricTooltip('liquidity');
    
    expect(volume.explanation).toContain('shares');
    expect(volume.interpretation).toContain('volume');
    
    expect(avgVolume.explanation.toLowerCase()).toContain('average');
    expect(avgVolume.interpretation).toContain('liquidity');
    
    expect(liquidity.explanation).toContain('volume');
    expect(liquidity.interpretation).toContain('liquidity');
  });

  it('handles all fundamental metrics without errors', () => {
    const fundamentalMetrics = [
      'trailingPE', 'forwardPE', 'dividendYield', 'revenueGrowth', 
      'epsGrowth', 'netMargin', 'freeCashFlowYield', 'debtToEquity', 'roe'
    ];
    
    fundamentalMetrics.forEach(metricId => {
      const tooltip = generateMetricTooltip(metricId as any);
      expect(tooltip.title).toBeTruthy();
      expect(tooltip.explanation).toBeTruthy();
      expect(tooltip.interpretation).toBeTruthy();
    });
  });

  it('handles all technical metrics without errors', () => {
    const technicalMetrics = [
      'price', 'sma20', 'sma50', 'sma200', 'rsi14', 
      'price52wHigh', 'price52wLow', 'volume', 'avgVolume'
    ];
    
    technicalMetrics.forEach(metricId => {
      const tooltip = generateMetricTooltip(metricId as any);
      expect(tooltip.title).toBeTruthy();
      expect(tooltip.explanation).toBeTruthy();
      expect(tooltip.interpretation).toBeTruthy();
    });
  });

  it('handles all risk metrics without errors', () => {
    const riskMetrics = [
      'riskScore', 'convictionScore', 'leverage', 
      'volatility', 'liquidity', 'sentiment'
    ];
    
    riskMetrics.forEach(metricId => {
      const tooltip = generateMetricTooltip(metricId as any);
      expect(tooltip.title).toBeTruthy();
      expect(tooltip.explanation).toBeTruthy();
      expect(tooltip.interpretation).toBeTruthy();
    });
  });

  it('handles all valuation metrics without errors', () => {
    const valuationMetrics = [
      'pegRatio', 'earningsYield', 'priceToBook', 'priceToSales'
    ];
    
    valuationMetrics.forEach(metricId => {
      const tooltip = generateMetricTooltip(metricId as any);
      expect(tooltip.title).toBeTruthy();
      expect(tooltip.explanation).toBeTruthy();
      expect(tooltip.interpretation).toBeTruthy();
    });
  });

  it('provides caveats for metrics that need context', () => {
    const metricsWithCaveats = ['trailingPE', 'forwardPE', 'dividendYield', 'debtToEquity', 'roe'];
    
    metricsWithCaveats.forEach(metricId => {
      const tooltip = generateMetricTooltip(metricId as any);
      expect(tooltip.caveats).toBeDefined();
      expect(tooltip.caveats!.length).toBeGreaterThan(0);
    });
  });

  it('is a pure function - returns same output for same input', () => {
    const result1 = generateMetricTooltip('trailingPE');
    const result2 = generateMetricTooltip('trailingPE');
    
    expect(result1).toEqual(result2);
    expect(result1.title).toBe(result2.title);
    expect(result1.explanation).toBe(result2.explanation);
    expect(result1.interpretation).toBe(result2.interpretation);
  });
});
