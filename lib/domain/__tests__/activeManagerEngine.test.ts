import {
  buildActiveManagerRecommendation,
  determineTimeframe,
  calculateConfidenceScore,
  determinePrimaryAction,
  generateRiskFlags,
  generateHeadline,
  generateRationale,
} from '../activeManagerEngine';
import type {
  ActiveManagerInput,
  AnalysisResult,
  UserProfile,
} from '../AnalysisTypes';
import { DEFAULT_ACTIVE_MANAGER_CONFIG } from '../AnalysisTypes';

// Test helpers
const createMockAnalysis = (
  convictionScore: number,
  riskScore: number
): AnalysisResult => ({
  ticker: 'TEST',
  name: 'Test Stock',
  summary: {
    headlineView: 'Test headline',
    riskScore,
    convictionScore3m: convictionScore,
    keyTakeaways: ['Test takeaway'],
  },
  fundamentalsView: 'Test fundamentals',
  valuationView: 'Test valuation',
  technicalView: 'Test technical',
  sentimentView: 'Test sentiment',
  scenarios: {
    horizonMonths: 3,
    bull: {
      expectedReturnPctRange: [15, 25],
      probabilityPct: 30,
      description: 'Bull case',
    },
    base: {
      expectedReturnPctRange: [5, 10],
      probabilityPct: 50,
      description: 'Base case',
    },
    bear: {
      expectedReturnPctRange: [-10, 0],
      probabilityPct: 20,
      description: 'Bear case',
    },
    pointEstimateReturnPct: 7,
    uncertaintyComment: 'Moderate uncertainty',
  },
  planningGuidance: {
    positionSizing: ['Test sizing'],
    timing: ['Test timing'],
    riskNotes: ['Test risk'],
    languageNotes: 'Test language',
  },
  disclaimer: 'Test disclaimer',
  generatedAt: new Date().toISOString(),
});

const createMockProfile = (
  riskTolerance: 'low' | 'moderate' | 'high',
  horizon: '1-3' | '5-10' | '10+'
): UserProfile => ({
  riskTolerance,
  horizon,
  objective: 'growth',
});

describe('determineTimeframe', () => {
  it('should return short_term for 1-3 year horizon', () => {
    const analysis = createMockAnalysis(75, 5);
    const profile = createMockProfile('moderate', '1-3');

    const result = determineTimeframe(analysis, profile);

    expect(result).toBe('short_term');
  });

  it('should return medium_term for 5-10 year horizon', () => {
    const analysis = createMockAnalysis(75, 5);
    const profile = createMockProfile('moderate', '5-10');

    const result = determineTimeframe(analysis, profile);

    expect(result).toBe('medium_term');
  });

  it('should return long_term for 10+ year horizon', () => {
    const analysis = createMockAnalysis(75, 5);
    const profile = createMockProfile('moderate', '10+');

    const result = determineTimeframe(analysis, profile);

    expect(result).toBe('long_term');
  });
});

describe('calculateConfidenceScore', () => {
  it('should return base conviction score when risk matches tolerance', () => {
    const analysis = createMockAnalysis(75, 5);
    const profile = createMockProfile('moderate', '5-10');

    const result = calculateConfidenceScore(
      analysis,
      profile,
      DEFAULT_ACTIVE_MANAGER_CONFIG
    );

    expect(result).toBe(65); // 75 - 10 for moderate risk with moderate tolerance
  });

  it('should reduce confidence when high risk meets low tolerance', () => {
    const analysis = createMockAnalysis(70, 8);
    const profile = createMockProfile('low', '5-10');

    const result = calculateConfidenceScore(
      analysis,
      profile,
      DEFAULT_ACTIVE_MANAGER_CONFIG
    );

    expect(result).toBe(50); // 70 - 20 for high risk with low tolerance
  });

  it('should increase confidence when low risk meets high tolerance', () => {
    const analysis = createMockAnalysis(60, 3);
    const profile = createMockProfile('high', '5-10');

    const result = calculateConfidenceScore(
      analysis,
      profile,
      DEFAULT_ACTIVE_MANAGER_CONFIG
    );

    expect(result).toBe(70); // 60 + 10 for low risk with high tolerance
  });

  it('should clamp confidence score to 0-100 range', () => {
    const highAnalysis = createMockAnalysis(95, 2);
    const lowAnalysis = createMockAnalysis(15, 9);
    const profileHigh = createMockProfile('high', '5-10');
    const profileLow = createMockProfile('low', '5-10');

    const highResult = calculateConfidenceScore(
      highAnalysis,
      profileHigh,
      DEFAULT_ACTIVE_MANAGER_CONFIG
    );
    const lowResult = calculateConfidenceScore(
      lowAnalysis,
      profileLow,
      DEFAULT_ACTIVE_MANAGER_CONFIG
    );

    expect(highResult).toBeLessThanOrEqual(100);
    expect(lowResult).toBeGreaterThanOrEqual(0);
  });
});

describe('determinePrimaryAction', () => {
  it('should return buy for high confidence with no existing holding', () => {
    const analysis = createMockAnalysis(80, 5);
    const profile = createMockProfile('moderate', '5-10');

    const result = determinePrimaryAction(
      analysis,
      profile,
      undefined,
      75,
      DEFAULT_ACTIVE_MANAGER_CONFIG
    );

    expect(result).toBe('buy');
  });

  it('should return hold for low confidence with no existing holding', () => {
    const analysis = createMockAnalysis(15, 6);
    const profile = createMockProfile('moderate', '5-10');

    const result = determinePrimaryAction(
      analysis,
      profile,
      undefined,
      15,
      DEFAULT_ACTIVE_MANAGER_CONFIG
    );

    expect(result).toBe('hold');
  });

  it('should return trim when position weight exceeds threshold', () => {
    const analysis = createMockAnalysis(60, 5);
    const profile = createMockProfile('moderate', '5-10');
    const portfolioContext = {
      currentWeight: 28,
    };

    const result = determinePrimaryAction(
      analysis,
      profile,
      portfolioContext,
      60,
      DEFAULT_ACTIVE_MANAGER_CONFIG
    );

    expect(result).toBe('trim');
  });

  it('should return sell when position weight is extremely high', () => {
    const analysis = createMockAnalysis(60, 5);
    const profile = createMockProfile('moderate', '5-10');
    const portfolioContext = {
      currentWeight: 45,
    };

    const result = determinePrimaryAction(
      analysis,
      profile,
      portfolioContext,
      60,
      DEFAULT_ACTIVE_MANAGER_CONFIG
    );

    expect(result).toBe('sell');
  });

  it('should return buy for small position with high confidence', () => {
    const analysis = createMockAnalysis(75, 4);
    const profile = createMockProfile('moderate', '5-10');
    const portfolioContext = {
      currentWeight: 2,
    };

    const result = determinePrimaryAction(
      analysis,
      profile,
      portfolioContext,
      75,
      DEFAULT_ACTIVE_MANAGER_CONFIG
    );

    expect(result).toBe('buy');
  });

  it('should return hold for moderate confidence with balanced position', () => {
    const analysis = createMockAnalysis(55, 5);
    const profile = createMockProfile('moderate', '5-10');
    const portfolioContext = {
      currentWeight: 10,
    };

    const result = determinePrimaryAction(
      analysis,
      profile,
      portfolioContext,
      55,
      DEFAULT_ACTIVE_MANAGER_CONFIG
    );

    expect(result).toBe('hold');
  });
});

describe('generateRiskFlags', () => {
  it('should return empty array when risk is low', () => {
    const analysis = createMockAnalysis(70, 3);
    const profile = createMockProfile('moderate', '5-10');

    const result = generateRiskFlags(
      analysis,
      profile,
      undefined,
      DEFAULT_ACTIVE_MANAGER_CONFIG
    );

    expect(result).toHaveLength(0);
  });

  it('should flag high risk score', () => {
    const analysis = createMockAnalysis(60, 8);
    const profile = createMockProfile('moderate', '5-10');

    const result = generateRiskFlags(
      analysis,
      profile,
      undefined,
      DEFAULT_ACTIVE_MANAGER_CONFIG
    );

    expect(result.length).toBeGreaterThan(0);
    expect(result.some((flag) => flag.toLowerCase().includes('risk'))).toBe(
      true
    );
  });

  it('should flag concentration risk', () => {
    const analysis = createMockAnalysis(60, 5);
    const profile = createMockProfile('moderate', '5-10');
    const portfolioContext = {
      currentWeight: 30,
    };

    const result = generateRiskFlags(
      analysis,
      profile,
      portfolioContext,
      DEFAULT_ACTIVE_MANAGER_CONFIG
    );

    expect(result.length).toBeGreaterThan(0);
    expect(
      result.some((flag) => flag.toLowerCase().includes('concentration'))
    ).toBe(true);
  });

  it('should flag risk-tolerance mismatch', () => {
    const analysis = createMockAnalysis(60, 6);
    const profile = createMockProfile('low', '5-10');

    const result = generateRiskFlags(
      analysis,
      profile,
      undefined,
      DEFAULT_ACTIVE_MANAGER_CONFIG
    );

    expect(result.length).toBeGreaterThan(0);
    expect(
      result.some((flag) => flag.toLowerCase().includes('tolerance'))
    ).toBe(true);
  });
});

describe('generateHeadline', () => {
  it('should generate high confidence headline', () => {
    const result = generateHeadline('buy', 75, 'AAPL');

    expect(result).toContain('AAPL');
    expect(result).toContain('Buy');
    expect(result).toContain('High Confidence');
  });

  it('should generate moderate conviction headline', () => {
    const result = generateHeadline('hold', 50, 'MSFT');

    expect(result).toContain('MSFT');
    expect(result).toContain('Hold');
    expect(result).toContain('Moderate Conviction');
  });

  it('should generate lower confidence headline', () => {
    const result = generateHeadline('trim', 25, 'TSLA');

    expect(result).toContain('TSLA');
    expect(result).toContain('Trim');
    expect(result).toContain('Lower Confidence');
  });
});

describe('generateRationale', () => {
  it('should generate 3-6 rationale bullets', () => {
    const analysis = createMockAnalysis(65, 5);
    const profile = createMockProfile('moderate', '5-10');
    const portfolioContext = {
      currentWeight: 10,
    };

    const result = generateRationale(
      analysis,
      profile,
      portfolioContext,
      'hold',
      65,
      DEFAULT_ACTIVE_MANAGER_CONFIG
    );

    expect(result.length).toBeGreaterThanOrEqual(3);
    expect(result.length).toBeLessThanOrEqual(6);
  });

  it('should include conviction-based rationale', () => {
    const analysis = createMockAnalysis(75, 4);
    const profile = createMockProfile('moderate', '5-10');

    const result = generateRationale(
      analysis,
      profile,
      undefined,
      'buy',
      75,
      DEFAULT_ACTIVE_MANAGER_CONFIG
    );

    expect(result.some((item) => item.includes('conviction'))).toBe(true);
  });
});

describe('buildActiveManagerRecommendation', () => {
  it('should generate complete recommendation for new position', () => {
    const input: ActiveManagerInput = {
      ticker: 'AAPL',
      analysisResult: createMockAnalysis(75, 5),
      userProfile: createMockProfile('moderate', '5-10'),
    };

    const result = buildActiveManagerRecommendation(input);

    expect(result.ticker).toBe('AAPL');
    expect(result.primaryAction).toBeDefined();
    expect(result.confidenceScore).toBeGreaterThanOrEqual(0);
    expect(result.confidenceScore).toBeLessThanOrEqual(100);
    expect(result.headline).toContain('AAPL');
    expect(result.rationale).toBeInstanceOf(Array);
    expect(result.rationale.length).toBeGreaterThanOrEqual(3);
    expect(result.rationale.length).toBeLessThanOrEqual(6);
    expect(result.riskFlags).toBeInstanceOf(Array);
    expect(result.timeframe).toMatch(/^(short_term|medium_term|long_term)$/);
  });

  it('should generate trim recommendation for oversized position', () => {
    const input: ActiveManagerInput = {
      ticker: 'TSLA',
      analysisResult: createMockAnalysis(60, 7),
      userProfile: createMockProfile('moderate', '5-10'),
      portfolioContext: {
        currentWeight: 28,
      },
    };

    const result = buildActiveManagerRecommendation(input);

    expect(result.primaryAction).toBe('trim');
    expect(result.notes).toBeDefined();
    expect(result.notes!.length).toBeGreaterThan(0);
  });

  it('should be deterministic for identical inputs', () => {
    const input: ActiveManagerInput = {
      ticker: 'GOOGL',
      analysisResult: createMockAnalysis(68, 6),
      userProfile: createMockProfile('high', '10+'),
      portfolioContext: {
        currentWeight: 12,
      },
    };

    const result1 = buildActiveManagerRecommendation(input);
    const result2 = buildActiveManagerRecommendation(input);

    expect(result1).toEqual(result2);
  });
});
