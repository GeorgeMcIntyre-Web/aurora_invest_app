import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { analyzeStock } from '@/lib/domain/auroraEngine';
import type {
  StockData,
  StockFundamentals,
  StockTechnicals,
  StockSentiment,
  UserProfile,
} from '@/lib/domain/AnalysisTypes';

const baseUser: UserProfile = {
  riskTolerance: 'moderate',
  horizon: '5-10',
  objective: 'growth',
};

const fundamentalsTemplate: StockFundamentals = {
  trailingPE: 22,
  forwardPE: 20,
  dividendYieldPct: 1.2,
  revenueGrowthYoYPct: 8,
  epsGrowthYoYPct: 12,
  netMarginPct: 18,
  freeCashFlowYieldPct: 2.5,
  debtToEquity: 0.5,
  roe: 15,
};

const technicalsTemplate: StockTechnicals = {
  price: 100,
  price52wHigh: 120,
  price52wLow: 80,
  sma20: 98,
  sma50: 95,
  sma200: 92,
  rsi14: 55,
  volume: 1_000_000,
  avgVolume: 1_100_000,
};

const sentimentTemplate: StockSentiment = {
  analystConsensus: 'hold',
  analystTargetMean: 110,
  analystTargetHigh: 140,
  analystTargetLow: 80,
  newsThemes: ['Product launch on track', 'Margin expansion'],
};

const buildStock = (overrides: Partial<StockData> = {}): StockData => ({
  ticker: overrides.ticker ?? 'TEST',
  name: overrides.name ?? 'Test Co',
  currency: overrides.currency ?? 'USD',
  fundamentals: {
    ...fundamentalsTemplate,
    ...(overrides.fundamentals ?? {}),
  },
  technicals: {
    ...technicalsTemplate,
    ...(overrides.technicals ?? {}),
  },
  sentiment: {
    ...sentimentTemplate,
    ...(overrides.sentiment ?? {}),
  },
});

describe('analyzeStock', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-02T12:34:56Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('throws when user or stock inputs are missing', () => {
    const stock = buildStock();

    expect(() => analyzeStock(undefined as unknown as UserProfile, stock)).toThrow(
      /User profile and stock data are required/
    );
    expect(() => analyzeStock(baseUser, undefined as unknown as StockData)).toThrow(
      /User profile and stock data are required/
    );
  });

  it('summarizes strong fundamentals, cheap valuation, and bullish technicals', () => {
    const strongStock = buildStock({
      fundamentals: {
        trailingPE: 18,
        forwardPE: 18,
        epsGrowthYoYPct: 26,
        netMarginPct: 32,
        freeCashFlowYieldPct: 4.5,
        roe: 28,
      },
      technicals: {
        price: 125,
        sma20: 120,
        sma50: 115,
        sma200: 100,
        price52wHigh: 150,
        price52wLow: 70,
        rsi14: 65,
      },
      sentiment: {
        analystConsensus: 'buy',
        analystTargetMean: 145,
        newsThemes: [
          'AI services gaining adoption',
          'Cloud momentum remains strong',
          'Subscription growth steady',
          'Extra theme ignored',
        ],
      },
    });

    const result = analyzeStock(baseUser, strongStock, { horizonMonths: 6 });

    expect(result.summary.keyTakeaways).toContain('Fundamentals: strong');
    expect(result.summary.keyTakeaways).toContain('Valuation: cheap');
    expect(result.summary.keyTakeaways).toContain('Technical trend: bullish');
    expect(result.summary.keyTakeaways).toContain('Analyst consensus: Buy');
    expect(result.sentimentView).toContain('Significant upside');
    expect(result.summary.headlineView).toContain('strong fundamentals');
    expect(result.scenarios.horizonMonths).toBe(6);
    expect(result.generatedAt).toBe('2024-01-02T12:34:56.000Z');
  });

  it('widens scenario ranges and guidance for high risk tolerance', () => {
    const highRiskUser: UserProfile = {
      ...baseUser,
      riskTolerance: 'high',
    };

    const result = analyzeStock(highRiskUser, buildStock());

    expect(result.scenarios.bull.expectedReturnPctRange).toEqual([10, 18]);
    expect(result.scenarios.base.expectedReturnPctRange).toEqual([-8, 9]);
    expect(result.scenarios.bear.expectedReturnPctRange).toEqual([-20, -7]);
    expect(result.planningGuidance.positionSizing[0]).toContain('Growth-focused investors');
  });

  it('narrows scenario ranges for low risk tolerance', () => {
    const lowRiskUser: UserProfile = {
      ...baseUser,
      riskTolerance: 'low',
    };

    const result = analyzeStock(lowRiskUser, buildStock());

    expect(result.scenarios.bull.expectedReturnPctRange).toEqual([6, 12]);
    expect(result.scenarios.base.expectedReturnPctRange).toEqual([-4, 5]);
    expect(result.scenarios.bear.expectedReturnPctRange).toEqual([-12, -3]);
    expect(result.planningGuidance.positionSizing[0]).toContain('Conservative investors');
  });

  it('reports neutral technical view when technical indicators are missing', () => {
    const stockWithoutTechnicals: StockData = {
      ...buildStock(),
      technicals: undefined as unknown as StockTechnicals,
    };

    const result = analyzeStock(baseUser, stockWithoutTechnicals);

    expect(result.technicalView).toBe('Technical data not available.');
    expect(result.summary.keyTakeaways).toContain('Technical trend: neutral');
  });
});
