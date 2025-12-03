import { describe, it, expect } from 'vitest';

import {
  analyzeStock,
  classifyFundamentals,
  classifyValuation,
} from './auroraEngine';
import type { StockData, UserProfile } from './AnalysisTypes';
import { MOCK_STOCK_DATA } from '../data/mockData';

const cloneStock = (ticker: keyof typeof MOCK_STOCK_DATA): StockData =>
  JSON.parse(JSON.stringify(MOCK_STOCK_DATA[ticker]));

describe('classifyFundamentals', () => {
  it('returns strong for stocks with top-tier metrics', () => {
    const msft = cloneStock('MSFT');
    expect(classifyFundamentals(msft)).toBe('strong');
  });

  it('returns weak when both growth and margins disappoint', () => {
    const weakStock: StockData = {
      ticker: 'WEAK',
      fundamentals: {
        epsGrowthYoYPct: 2.1,
        netMarginPct: 6.5,
      },
      technicals: {
        price: 15,
      },
      sentiment: {
        analystConsensus: 'hold',
        newsThemes: [],
      },
    };

    expect(classifyFundamentals(weakStock)).toBe('weak');
  });

  it('returns unknown when fundamentals are missing', () => {
    const unknownFundamentals = {
      ticker: 'MYST',
      fundamentals: undefined as unknown as StockData['fundamentals'],
      technicals: {
        price: 20,
      },
      sentiment: {
        analystConsensus: 'buy',
        newsThemes: [],
      },
    } as StockData;

    expect(classifyFundamentals(unknownFundamentals)).toBe('unknown');
  });
});

describe('classifyValuation', () => {
  it('flags cheap valuations when PEG and forward P/E are low', () => {
    const cheapStock: StockData = {
      ticker: 'VALUE',
      fundamentals: {
        forwardPE: 18,
        epsGrowthYoYPct: 28,
      },
      technicals: {
        price: 32,
      },
      sentiment: {
        analystConsensus: 'buy',
        newsThemes: [],
      },
    };

    expect(classifyValuation(cheapStock)).toBe('cheap');
  });

  it('flags rich valuations when forward P/E is elevated', () => {
    const tsla = cloneStock('TSLA');
    expect(classifyValuation(tsla)).toBe('rich');
  });

  it('returns unknown when valuation inputs are unavailable', () => {
    const unknownValuation = {
      ticker: 'NOVAL',
      fundamentals: undefined as unknown as StockData['fundamentals'],
      technicals: {
        price: 50,
      },
      sentiment: {
        analystConsensus: 'hold',
        newsThemes: [],
      },
    } as StockData;

    expect(classifyValuation(unknownValuation)).toBe('unknown');
  });
});

describe('analyzeStock', () => {
  const user: UserProfile = {
    riskTolerance: 'moderate',
    horizon: '5-10',
    objective: 'growth',
  };

  it('produces a coherent summary aligned with fundamentals and valuation', () => {
    const stock = cloneStock('AAPL');
    const fundamentalsClass = classifyFundamentals(stock);
    const valuationClass = classifyValuation(stock);

    const result = analyzeStock(user, stock);

    expect(result.summary.keyTakeaways).toContain(
      `Fundamentals: ${fundamentalsClass}`
    );
    expect(result.summary.keyTakeaways).toContain(
      `Valuation: ${valuationClass}`
    );
    expect(result.scenarios.horizonMonths).toBe(3);
    expect(result.planningGuidance.positionSizing.length).toBeGreaterThan(0);
  });

  it('respects a custom horizon and emits educational disclaimer', () => {
    const stock = cloneStock('MSFT');
    const result = analyzeStock(user, stock, { horizonMonths: 6 });

    expect(result.scenarios.horizonMonths).toBe(6);
    expect(result.disclaimer).toMatch(/educational/i);
    expect(result.scenarios.pointEstimateReturnPct).toBeGreaterThan(-50);
    expect(result.scenarios.pointEstimateReturnPct).toBeLessThan(50);
  });
});
