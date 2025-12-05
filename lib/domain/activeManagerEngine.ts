import type { AnalysisResult, InvestmentHorizon, UserProfile } from './AnalysisTypes';
import type { Portfolio, PortfolioAction, PortfolioHolding } from './portfolioEngine';
import { suggestPortfolioAction } from './portfolioEngine';

export type ActiveManagerHorizon = 'short_term' | 'medium_term' | 'long_term';

export interface ActiveManagerEngineOptions {
  portfolio?: Portfolio | null;
  currentPrices?: Map<string, number>;
}

export interface ActiveManagerRecommendation {
  ticker: string;
  action: PortfolioAction;
  horizonLabel: ActiveManagerHorizon;
  confidenceScore: number;
  convictionScore: number;
  riskScore: number;
  weightPct: number;
  overweight: boolean;
  reasoning: string[];
  portfolioAction: {
    action: PortfolioAction;
    reasoning: string[];
  };
}

const clamp = (value: number, min = 0, max = 100): number => {
  if (!Number.isFinite(value)) {
    return min;
  }
  return Math.min(max, Math.max(min, value));
};

const normalizeTicker = (ticker?: string | null): string => ticker?.toUpperCase?.() ?? '';

const EMPTY_PORTFOLIO: Portfolio = Object.freeze({
  id: 'active-manager-empty',
  name: 'Active Manager Virtual Portfolio',
  holdings: [],
  createdAt: '1970-01-01T00:00:00.000Z',
  updatedAt: '1970-01-01T00:00:00.000Z',
});

const mapHorizonLabel = (horizon?: InvestmentHorizon | null): ActiveManagerHorizon => {
  if (horizon === '1-3') {
    return 'short_term';
  }
  if (horizon === '10+') {
    return 'long_term';
  }
  return 'medium_term';
};

const estimateHoldingWeight = (
  portfolio: Portfolio | null | undefined,
  ticker: string,
  prices?: Map<string, number>
): { weightPct: number; holding?: PortfolioHolding } => {
  if (!portfolio?.holdings?.length) {
    return { weightPct: 0 };
  }

  const normalizedTarget = normalizeTicker(ticker);
  let totalValue = 0;
  let holdingValue = 0;
  let existingHolding: PortfolioHolding | undefined;

  portfolio.holdings.forEach((holding) => {
    const normalizedHolding = normalizeTicker(holding.ticker);
    const referencePrice = prices?.get(normalizedHolding) ?? holding.averageCostBasis ?? 0;
    const sanitizedPrice = Number.isFinite(referencePrice) ? Math.max(referencePrice, 0) : 0;
    const sanitizedShares = Number.isFinite(holding.shares) ? Math.max(holding.shares, 0) : 0;
    const value = sanitizedPrice * sanitizedShares;
    totalValue += value;

    if (normalizedHolding === normalizedTarget) {
      holdingValue = value;
      existingHolding = holding;
    }
  });

  if (totalValue <= 0) {
    return { weightPct: 0, holding: existingHolding };
  }

  const weightPct = Number(((holdingValue / totalValue) * 100).toFixed(2));
  return { weightPct, holding: existingHolding };
};

export function runActiveManagerEngine(
  analysis: AnalysisResult | null | undefined,
  profile: UserProfile | null | undefined,
  options: ActiveManagerEngineOptions = {}
): ActiveManagerRecommendation | null {
  if (!analysis?.ticker) {
    return null;
  }

  const ticker = normalizeTicker(analysis.ticker);
  const horizonLabel = mapHorizonLabel(profile?.horizon ?? null);
  const convictionScore = clamp(analysis?.summary?.convictionScore3m ?? 50);
  const riskScore = clamp(analysis?.summary?.riskScore ?? 0, 0, 10);

  const { weightPct } = estimateHoldingWeight(options.portfolio, ticker, options.currentPrices);
  const overweight = weightPct >= 40;

  const portfolio = options.portfolio ?? EMPTY_PORTFOLIO;
  const portfolioSuggestion = suggestPortfolioAction(ticker, portfolio, weightPct);
  const basePortfolioAction = {
    action: portfolioSuggestion.action,
    reasoning: [...portfolioSuggestion.reasoning],
  };

  let finalAction: PortfolioAction = basePortfolioAction.action;
  let confidenceScore = convictionScore;
  const reasoning: string[] = [...basePortfolioAction.reasoning];

  if (finalAction === 'buy' && riskScore >= 8) {
    finalAction = overweight ? 'trim' : 'hold';
    confidenceScore = clamp(confidenceScore - 20);
    reasoning.push('Risk score is elevated (>=8); dialing back aggressive buying.');
  }

  if (overweight) {
    reasoning.push(
      `${ticker} already represents ${weightPct.toFixed(1)}% of the portfolio which exceeds the 40% ceiling.`
    );
    if (finalAction === 'buy') {
      finalAction = 'sell';
    } else if (finalAction === 'hold') {
      finalAction = 'trim';
    }
    confidenceScore = clamp(confidenceScore - 10);
  }

  if (!overweight && finalAction === 'buy' && riskScore <= 4) {
    confidenceScore = clamp(confidenceScore + 5);
  }

  confidenceScore = Math.round(confidenceScore);

  return {
    ticker,
    action: finalAction,
    horizonLabel,
    confidenceScore,
    convictionScore,
    riskScore,
    weightPct,
    overweight,
    reasoning,
    portfolioAction: basePortfolioAction,
  };
}
