import { describe, it, expect } from 'vitest';

import {
  AnalysisResult,
  ScenarioSummary,
  UserProfile,
  PortfolioContext,
} from '@/lib/domain/AnalysisTypes';
import { buildActiveManagerRecommendation } from '../activeManagerEngine';

const baseGuidance = {
  positionSizing: ['Keep single positions within 5-20% guardrails.'],
  timing: ['Layer entries rather than deploying capital all at once.'],
  riskNotes: ['Expect normal volatility for a large-cap growth stock.'],
  languageNotes: 'Framework guidance only.',
};

function createScenarioSummary(pointEstimate = 6): ScenarioSummary {
  return {
    horizonMonths: 3,
    bull: {
      expectedReturnPctRange: [12, 18],
      probabilityPct: 30,
      description: 'Upside case reflects improving margins.',
    },
    base: {
      expectedReturnPctRange: [4, 8],
      probabilityPct: 50,
      description: 'Base case assumes steady execution.',
    },
    bear: {
      expectedReturnPctRange: [-8, -2],
      probabilityPct: 20,
      description: 'Bear case reflects macro pressure.',
    },
    pointEstimateReturnPct: pointEstimate,
    uncertaintyComment: 'Forecast skewed to execution quality.',
  };
}

function createProfile(overrides?: Partial<UserProfile>): UserProfile {
  return {
    riskTolerance: overrides?.riskTolerance ?? 'moderate',
    horizon: overrides?.horizon ?? '5-10',
    objective: overrides?.objective ?? 'growth',
  };
}

function createAnalysisResult(overrides?: Partial<AnalysisResult>): AnalysisResult {
  const summaryOverride = overrides?.summary;
  const planningOverride = overrides?.planningGuidance;
  return {
    ticker: overrides?.ticker ?? 'AAPL',
    name: overrides?.name ?? 'Sample Corp',
    summary: {
      headlineView: summaryOverride?.headlineView ?? 'Momentum and execution trending better.',
      riskScore: summaryOverride?.riskScore ?? 5,
      convictionScore3m: summaryOverride?.convictionScore3m ?? 65,
      keyTakeaways: summaryOverride?.keyTakeaways ?? ['Revenue growth re-accelerated last quarter.'],
    },
    fundamentalsView: overrides?.fundamentalsView ?? 'Fundamentals look constructive.',
    valuationView: overrides?.valuationView ?? 'Valuation sits near long-term averages.',
    technicalView: overrides?.technicalView ?? 'Trend is forming higher lows.',
    sentimentView: overrides?.sentimentView ?? 'Analyst revisions skew positive.',
    scenarios: overrides?.scenarios ?? createScenarioSummary(),
    planningGuidance: {
      positionSizing: planningOverride?.positionSizing ?? baseGuidance.positionSizing,
      timing: planningOverride?.timing ?? baseGuidance.timing,
      riskNotes: planningOverride?.riskNotes ?? baseGuidance.riskNotes,
      languageNotes: planningOverride?.languageNotes ?? baseGuidance.languageNotes,
    },
    fundamentalsInsight: overrides?.fundamentalsInsight,
    valuationInsight: overrides?.valuationInsight,
    disclaimer: overrides?.disclaimer ?? 'Educational use only.',
    generatedAt: overrides?.generatedAt ?? '2025-01-01T00:00:00.000Z',
  };
}

describe('buildActiveManagerRecommendation', () => {
  it('returns null when analysis ticker is missing', () => {
    const analysis = createAnalysisResult({ ticker: '' });
    const recommendation = buildActiveManagerRecommendation({
      analysis,
      profile: createProfile(),
    });

    expect(recommendation).toBeNull();
  });

  it('boosts action and confidence when conviction and returns are strong', () => {
    const analysis = createAnalysisResult({
      scenarios: createScenarioSummary(9),
      summary: { convictionScore3m: 72 },
    });
    const recommendation = buildActiveManagerRecommendation({
      analysis,
      profile: createProfile({ riskTolerance: 'moderate' }),
    });

    expect(recommendation).not.toBeNull();
    expect(recommendation?.primaryAction).toBe('buy');
    expect(recommendation?.confidenceScore).toBeGreaterThan(72);
    expect(recommendation?.headline).toContain('Buy');
    expect(recommendation?.expectedReturn3m).toBeCloseTo(9, 1);
  });

  it('avoids aggressive buys when risk is elevated', () => {
    const analysis = createAnalysisResult({
      scenarios: createScenarioSummary(11),
      summary: { riskScore: 9, convictionScore3m: 80 },
    });
    const recommendation = buildActiveManagerRecommendation({
      analysis,
      profile: createProfile({ riskTolerance: 'high' }),
    });

    expect(recommendation).not.toBeNull();
    expect(recommendation?.primaryAction).not.toBe('buy');
    expect(recommendation?.riskFlags.some((flag) => flag.includes('Risk score 9'))).toBe(true);
    expect(recommendation?.confidenceScore).toBeLessThan(80);
  });

  it('leans on portfolio context suggestions for overweight holdings', () => {
    const analysis = createAnalysisResult();
    const portfolioContext: PortfolioContext = {
      portfolioId: 'demo-portfolio',
      existingHolding: {
        ticker: 'AAPL',
        shares: 120,
        averageCostBasis: 150,
        purchaseDate: '2024-01-15',
      },
      portfolioMetrics: {
        totalValue: 60000,
        totalCost: 50000,
        totalGainLoss: 10000,
        totalGainLossPct: 20,
        beta: 1.05,
        volatility: 18,
      },
      suggestedAction: 'hold',
      reasoning: ['Position already dominates portfolio exposure.'],
      positionWeightPct: 28,
    };

    const recommendation = buildActiveManagerRecommendation({
      analysis,
      profile: createProfile(),
      portfolioContext,
    });

    expect(recommendation).not.toBeNull();
    expect(recommendation?.primaryAction).toBe('trim');
    expect(
      recommendation?.rationale.some((line) => line.includes('portfolio') || line.includes('diversified'))
    ).toBe(true);
  });
});
