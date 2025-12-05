import {
  AnalysisResult,
  UserProfile,
  PortfolioContext,
  ActiveManagerRecommendation,
} from '@/lib/domain/AnalysisTypes';
import { PortfolioAction, suggestPortfolioAction } from '@/lib/domain/portfolioEngine';

export interface BuildActiveManagerInput {
  analysis: AnalysisResult;
  profile: UserProfile;
  portfolioContext?: PortfolioContext | null;
}

type ReturnBias = 'positive' | 'neutral' | 'negative';

const DEFAULT_CONFIDENCE = 50;
const CONFIDENCE_MIN = 0;
const CONFIDENCE_MAX = 100;
const ZERO_DATE = '1970-01-01T00:00:00.000Z';

const ACTION_LABEL: Record<PortfolioAction, string> = {
  buy: 'Buy',
  hold: 'Hold',
  trim: 'Trim',
  sell: 'Sell',
};

const HORIZON_MAP: Record<UserProfile['horizon'], ActiveManagerRecommendation['horizon']> = {
  '1-3': 'short_term',
  '5-10': 'medium_term',
  '10+': 'long_term',
};

function clampConfidence(value?: number): number {
  const numericValue = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numericValue)) {
    return DEFAULT_CONFIDENCE;
  }
  if (numericValue < CONFIDENCE_MIN) {
    return CONFIDENCE_MIN;
  }
  if (numericValue > CONFIDENCE_MAX) {
    return CONFIDENCE_MAX;
  }
  return numericValue;
}

function mapHorizon(horizon?: UserProfile['horizon']): ActiveManagerRecommendation['horizon'] {
  if (!horizon) {
    return 'medium_term';
  }
  return HORIZON_MAP[horizon] ?? 'medium_term';
}

function determineReturnBias(pointEstimate?: number): ReturnBias {
  if (typeof pointEstimate !== 'number' || Number.isNaN(pointEstimate)) {
    return 'neutral';
  }
  if (pointEstimate >= 6) {
    return 'positive';
  }
  if (pointEstimate <= -4) {
    return 'negative';
  }
  return 'neutral';
}

function describeReturnBand(pointEstimate?: number): string | null {
  if (typeof pointEstimate !== 'number' || Number.isNaN(pointEstimate)) {
    return null;
  }
  const value = Number(pointEstimate.toFixed(1));
  if (value >= 10) {
    return `double-digit upside (~${value}% over 3M)`;
  }
  if (value >= 5) {
    return `mid-to-high single-digit upside (~${value}% over 3M)`;
  }
  if (value >= 0) {
    return `flat to modest +${value}% over 3M`;
  }
  if (value <= -10) {
    return `~${Math.abs(value)}% downside risk over 3M`;
  }
  if (value <= -4) {
    return `mid-single-digit downside (~${Math.abs(value)}% over 3M)`;
  }
  return `~${value}% drift over 3M`;
}

function buildHeadline(action: PortfolioAction, pointEstimate?: number): string {
  const label = ACTION_LABEL[action];
  if (typeof pointEstimate !== 'number' || Number.isNaN(pointEstimate)) {
    return `${label} – 3M outlook pending`;
  }
  const value = Number(pointEstimate.toFixed(1));
  const sign = value >= 0 ? '+' : '';
  return `${label} – ${sign}${value}% expected over 3M`;
}

function dedupePhrases(items: string[]): string[] {
  const filtered = items.filter((item) => Boolean(item && item.trim()));
  return Array.from(new Set(filtered));
}

function computeWeightPct(context?: PortfolioContext | null): number | null {
  if (!context) {
    return null;
  }
  if (typeof context.positionWeightPct === 'number' && Number.isFinite(context.positionWeightPct)) {
    return context.positionWeightPct;
  }
  const totalValue = context.portfolioMetrics?.totalValue;
  const holding = context.existingHolding;
  if (typeof totalValue !== 'number' || !holding || totalValue <= 0) {
    return null;
  }
  const basisValue = (holding.averageCostBasis ?? 0) * holding.shares;
  if (!Number.isFinite(basisValue) || basisValue <= 0) {
    return null;
  }
  return (basisValue / totalValue) * 100;
}

function buildPortfolioForSuggestion(context: PortfolioContext) {
  const holdings = context.existingHolding ? [context.existingHolding] : [];
  return {
    id: context.portfolioId,
    name: 'Active Manager Context',
    holdings,
    createdAt: ZERO_DATE,
    updatedAt: ZERO_DATE,
  } as Parameters<typeof suggestPortfolioAction>[1];
}

function estimateActionFromAnalysis(
  bias: ReturnBias,
  pointEstimate?: number
): PortfolioAction {
  if (bias === 'positive') {
    return 'buy';
  }
  if (bias === 'negative' && typeof pointEstimate === 'number' && pointEstimate <= -8) {
    return 'sell';
  }
  if (bias === 'negative') {
    return 'trim';
  }
  return 'hold';
}

function applyRiskGuardrails(
  current: PortfolioAction,
  riskScore?: number,
  weightPct?: number | null
): PortfolioAction {
  let next = current;
  const highRisk = typeof riskScore === 'number' && riskScore >= 8;
  const overweight = typeof weightPct === 'number' && weightPct >= 20;
  const trimThreshold = typeof weightPct === 'number' && weightPct >= 25;
  if (highRisk && next === 'buy') {
    next = 'hold';
  }
  if (overweight && next === 'buy') {
    next = 'hold';
  }
  if (trimThreshold && next === 'hold') {
    next = 'trim';
  }
  return next;
}

function adjustForProfile(
  current: PortfolioAction,
  profile: UserProfile,
  bias: ReturnBias
): PortfolioAction {
  let next = current;
  if (profile.riskTolerance === 'low' && next === 'buy' && bias !== 'positive') {
    next = 'hold';
  }
  if (profile.riskTolerance === 'high' && next === 'trim' && bias !== 'negative') {
    next = 'hold';
  }
  return next;
}

function adjustConfidenceScore(
  base: number,
  bias: ReturnBias,
  riskScore?: number,
  weightPct?: number | null,
  profile?: UserProfile
): number {
  let score = base;
  if (bias === 'positive') {
    score += 5;
  }
  if (bias === 'negative') {
    score -= 10;
  }
  const numericRisk = typeof riskScore === 'number' ? riskScore : null;
  if (numericRisk != null && numericRisk >= 8) {
    score -= 15;
  }
  if (numericRisk != null && numericRisk < 8 && numericRisk >= 6) {
    score -= 5;
  }
  if (typeof weightPct === 'number' && weightPct >= 20) {
    score -= 10;
  }
  const riskBelowHigh = numericRisk == null || numericRisk < 8;
  if (profile?.riskTolerance === 'high' && bias === 'positive' && riskBelowHigh) {
    score += 5;
  }
  if (profile?.riskTolerance === 'low' && bias === 'positive') {
    score -= 5;
  }
  return clampConfidence(score);
}

export function buildActiveManagerRecommendation(
  input: BuildActiveManagerInput
): ActiveManagerRecommendation | null {
  if (!input?.analysis || !input.analysis.ticker) {
    return null;
  }

  const ticker = input.analysis.ticker.toUpperCase();
  const summary = input.analysis.summary;
  const scenarios = input.analysis.scenarios;
  const pointEstimate = scenarios?.pointEstimateReturnPct;
  const bias = determineReturnBias(pointEstimate);
  const riskScore = summary?.riskScore;
  const convictionScore = summary?.convictionScore3m;
  const profile = input.profile;
  const rationale: string[] = [];
  const riskFlags: string[] = [];
  const notes: string[] = [];

  if (summary?.headlineView) {
    rationale.push(summary.headlineView);
  }
  if (summary?.keyTakeaways?.length) {
    rationale.push(...summary.keyTakeaways.slice(0, 3));
  }
  const bandDescription = describeReturnBand(pointEstimate);
  if (bandDescription) {
    rationale.push(`Scenario guidance points to ${bandDescription}.`);
  }
  if (typeof riskScore === 'number' && riskScore >= 8) {
    riskFlags.push(`Risk score ${riskScore}/10 signals elevated volatility.`);
  }
  if (typeof riskScore === 'number' && riskScore >= 6 && riskScore < 8) {
    riskFlags.push(`Risk score ${riskScore}/10 warrants tighter guardrails.`);
  }

  const weightPct = computeWeightPct(input.portfolioContext);
  if (typeof weightPct === 'number' && weightPct >= 20) {
    riskFlags.push(`Position already near ${weightPct.toFixed(1)}% of portfolio.`);
  }

  let primaryAction = estimateActionFromAnalysis(bias, pointEstimate);
  primaryAction = applyRiskGuardrails(primaryAction, riskScore, weightPct);
  primaryAction = adjustForProfile(primaryAction, profile, bias);

  if (input.portfolioContext) {
    const suggestion = suggestPortfolioAction(
      ticker,
      buildPortfolioForSuggestion(input.portfolioContext),
      typeof weightPct === 'number' ? weightPct : 0
    );
    primaryAction = suggestion.action;
    rationale.push(...suggestion.reasoning);
  }

  primaryAction = applyRiskGuardrails(primaryAction, riskScore, weightPct);

  const horizon = mapHorizon(profile?.horizon);
  notes.push(`Framed for a ${horizon.replace('_', ' ')} objective.`);
  if (profile.objective === 'income') {
    notes.push('Income-focused investors often prioritize capital stability.');
  }
  if (input.portfolioContext?.reasoning?.length) {
    notes.push(...input.portfolioContext.reasoning);
  }

  const baseConfidence = Number.isFinite(convictionScore)
    ? Number(convictionScore)
    : DEFAULT_CONFIDENCE;
  const confidenceScore = adjustConfidenceScore(
    baseConfidence,
    bias,
    riskScore,
    weightPct,
    profile
  );

  const expectedReturn3m =
    typeof pointEstimate === 'number' && Number.isFinite(pointEstimate)
      ? Number(pointEstimate.toFixed(1))
      : undefined;
  const headline = buildHeadline(primaryAction, pointEstimate);

  return {
    ticker,
    primaryAction,
    horizon,
    confidenceScore,
    expectedReturn3m,
    headline,
    rationale: dedupePhrases(rationale),
    riskFlags: dedupePhrases(riskFlags),
    notes: dedupePhrases(notes),
  };
}
