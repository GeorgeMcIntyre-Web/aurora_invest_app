import { describe, expect, it } from 'vitest';

import { runActiveManagerEngine } from '../activeManagerEngine';
import type { AnalysisResult, ScenarioSummary, PlanningGuidance, UserProfile } from '../AnalysisTypes';
import type { Portfolio, PortfolioHolding } from '../portfolioEngine';

type PartialAnalysis = Partial<Omit<AnalysisResult, 'summary' | 'scenarios' | 'planningGuidance'>> & {
  summary?: Partial<AnalysisResult['summary']>;
  scenarios?: Partial<ScenarioSummary>;
  planningGuidance?: Partial<PlanningGuidance>;
};

const BASE_PROFILE: UserProfile = {
  riskTolerance: 'moderate',
  horizon: '5-10',
  objective: 'growth',
};

const buildPortfolio = (holdings: PortfolioHolding[]): Portfolio => ({
  id: 'portfolio-1',
  name: 'Test Portfolio',
  holdings,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
});

const buildAnalysis = (overrides: PartialAnalysis = {}): AnalysisResult => {
  const {
    summary: summaryOverride,
    scenarios: scenariosOverride,
    planningGuidance: planningOverride,
    ...rest
  } = overrides;

  const baseScenarios: ScenarioSummary = {
    horizonMonths: 3,
    bull: { expectedReturnPctRange: [5, 15], probabilityPct: 25, description: 'Bullish' },
    base: { expectedReturnPctRange: [0, 5], probabilityPct: 50, description: 'Base case' },
    bear: { expectedReturnPctRange: [-10, 0], probabilityPct: 25, description: 'Bearish' },
    pointEstimateReturnPct: 4,
    uncertaintyComment: 'Moderate dispersion',
  };

  const baseGuidance: PlanningGuidance = {
    positionSizing: ['Limit single-name exposure to 5-15% for balanced investors.'],
    timing: ['Spread entries over multiple sessions to reduce timing risk.'],
    riskNotes: ['Use stop levels to enforce discipline.'],
    languageNotes: 'Educational illustration only.',
  };

  return {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    fundamentalsView: 'Robust revenue growth supported by services segment expansion.',
    valuationView: 'Trades at a slight premium to peers but justified by margins.',
    technicalView: 'Shares consolidating above key moving averages.',
    sentimentView: 'Analyst consensus remains positive with incremental estimate revisions.',
    summary: {
      headlineView: 'Quality franchise with balanced risk/reward profile.',
      riskScore: 5,
      convictionScore3m: 55,
      keyTakeaways: ['Strong free cash flow supports ongoing buybacks.'],
      ...(summaryOverride ?? {}),
    },
    scenarios: {
      ...baseScenarios,
      ...(scenariosOverride ?? {}),
      bull: { ...baseScenarios.bull, ...(scenariosOverride?.bull ?? {}) },
      base: { ...baseScenarios.base, ...(scenariosOverride?.base ?? {}) },
      bear: { ...baseScenarios.bear, ...(scenariosOverride?.bear ?? {}) },
    },
    planningGuidance: {
      ...baseGuidance,
      ...(planningOverride ?? {}),
    },
    disclaimer: rest.disclaimer ?? 'Educational illustration only.',
    generatedAt: rest.generatedAt ?? '2024-01-01T00:00:00.000Z',
    ...rest,
  };
};

describe('runActiveManagerEngine', () => {
  it('returns null when analysis is missing or lacks a ticker', () => {
    expect(runActiveManagerEngine(null, BASE_PROFILE)).toBeNull();

    const analysisWithoutTicker = buildAnalysis({ ticker: '' });
    expect(runActiveManagerEngine(analysisWithoutTicker, BASE_PROFILE)).toBeNull();
  });

  it('respects suggestPortfolioAction when a holding is significantly overweight', () => {
    const portfolio = buildPortfolio([
      { ticker: 'AAPL', shares: 200, averageCostBasis: 150, purchaseDate: '2024-01-01' },
      { ticker: 'MSFT', shares: 100, averageCostBasis: 320, purchaseDate: '2024-01-01' },
    ]);
    const currentPrices = new Map<string, number>([
      ['AAPL', 200],
      ['MSFT', 300],
    ]);
    const analysis = buildAnalysis({
      summary: { riskScore: 4, convictionScore3m: 60 },
    });

    const result = runActiveManagerEngine(analysis, BASE_PROFILE, { portfolio, currentPrices });

    expect(result).not.toBeNull();
    expect(result?.overweight).toBe(true);
    expect(result?.portfolioAction.action).toBe('sell');
    expect(result?.action).toBe('sell');
    expect(result?.reasoning.some((note) => note.includes('40%'))).toBe(true);
  });

  it('caps aggressive buy recommendations when riskScore is high', () => {
    const analysis = buildAnalysis({
      summary: { riskScore: 9, convictionScore3m: 70 },
    });
    const result = runActiveManagerEngine(analysis, BASE_PROFILE, {
      portfolio: buildPortfolio([]),
    });

    expect(result).not.toBeNull();
    expect(result?.action).toBe('hold');
    expect(result?.confidenceScore).toBeLessThan(70);
  });

  it('maps profile horizons to short, medium, and long term labels', () => {
    const analysis = buildAnalysis();

    const shortProfile: UserProfile = { ...BASE_PROFILE, horizon: '1-3' };
    const mediumProfile: UserProfile = { ...BASE_PROFILE, horizon: '5-10' };
    const longProfile: UserProfile = { ...BASE_PROFILE, horizon: '10+' };

    expect(runActiveManagerEngine(analysis, shortProfile)?.horizonLabel).toBe('short_term');
    expect(runActiveManagerEngine(analysis, mediumProfile)?.horizonLabel).toBe('medium_term');
    expect(runActiveManagerEngine(analysis, longProfile)?.horizonLabel).toBe('long_term');
  });

  it('derives confidenceScore from convictionScore3m in a predictable way', () => {
    const lowConvictionAnalysis = buildAnalysis({
      summary: { riskScore: 4, convictionScore3m: 35 },
    });
    const highConvictionAnalysis = buildAnalysis({
      summary: { riskScore: 4, convictionScore3m: 65 },
    });

    const lowConfidence = runActiveManagerEngine(lowConvictionAnalysis, BASE_PROFILE);
    const highConfidence = runActiveManagerEngine(highConvictionAnalysis, BASE_PROFILE);

    expect(lowConfidence).not.toBeNull();
    expect(highConfidence).not.toBeNull();
    expect(highConfidence!.confidenceScore).toBeGreaterThan(lowConfidence!.confidenceScore);
  });

  it('produces deterministic output for the same input snapshot', () => {
    const analysis = buildAnalysis({
      summary: { riskScore: 6, convictionScore3m: 58 },
    });
    const portfolio = buildPortfolio([
      { ticker: 'NVDA', shares: 40, averageCostBasis: 400, purchaseDate: '2023-06-01' },
      { ticker: 'AAPL', shares: 20, averageCostBasis: 150, purchaseDate: '2024-01-01' },
    ]);
    const options = {
      portfolio,
      currentPrices: new Map<string, number>([
        ['NVDA', 450],
        ['AAPL', 175],
      ]),
    };

    const first = runActiveManagerEngine(analysis, BASE_PROFILE, options);
    const second = runActiveManagerEngine(analysis, BASE_PROFILE, options);

    expect(first).not.toBeNull();
    expect(second).not.toBeNull();
    expect(second).toEqual(first);
  });
});
