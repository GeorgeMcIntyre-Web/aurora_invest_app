/**
 * Portfolio management domain logic.
 *
 * All functions in this module are pure and deterministic to keep the
 * calculations portable across environments (browser, server, tests).
 */

import type { ScenarioSummary } from './AnalysisTypes';

export type PortfolioAction = 'buy' | 'hold' | 'trim' | 'sell';

export interface PortfolioHolding {
  ticker: string;
  shares: number;
  averageCostBasis: number;
  purchaseDate: string; // ISO date string
}

export interface Portfolio {
  id: string;
  name: string;
  holdings: PortfolioHolding[];
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioMetrics {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPct: number;
  beta: number;
  volatility: number;
}

export interface PortfolioAllocation {
  ticker: string;
  value: number;
  weightPct: number;
  gainLoss: number;
  gainLossPct: number;
}

export interface ConcentrationRisk {
  level: 'low' | 'moderate' | 'high';
  warnings: string[];
  largestPositions: { ticker: string; weightPct: number }[];
}

export interface HoldingScenarioSnapshot {
  ticker: string;
  shares: number;
  currentPrice: number;
  scenarios: ScenarioSummary;
}

export interface PortfolioStressTestResult {
  currentValue: number;
  bullValue: number;
  baseValue: number;
  bearValue: number;
  bullChangePct: number;
  baseChangePct: number;
  bearChangePct: number;
  entries: Array<{
    ticker: string;
    currentValue: number;
    bullValue: number;
    baseValue: number;
    bearValue: number;
  }>;
}

const round = (value: number, digits = 2): number => {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Number(value.toFixed(digits));
};

const normalizeTicker = (ticker: string): string => ticker?.toUpperCase?.() ?? '';

const normalizePriceMap = (prices?: Map<string, number>): Map<string, number> => {
  const normalized = new Map<string, number>();
  if (!prices) {
    return normalized;
  }

  prices.forEach((value, key) => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      normalized.set(normalizeTicker(key), value);
    }
  });

  return normalized;
};

const calculateHoldingValue = (
  holding: PortfolioHolding,
  normalizedPrices: Map<string, number>
): number => {
  const ticker = normalizeTicker(holding.ticker);
  const price = normalizedPrices.get(ticker);
  if (typeof price === 'number' && price > 0) {
    return holding.shares * price;
  }
  return holding.shares * (holding.averageCostBasis ?? 0);
};

/**
 * Calculate per-position allocations including value, weights, and gains.
 */
export function calculateAllocation(
  portfolio: Portfolio,
  currentPrices: Map<string, number> = new Map()
): PortfolioAllocation[] {
  if (!portfolio?.holdings?.length) {
    return [];
  }

  const normalizedPrices = normalizePriceMap(currentPrices);
  const interim = portfolio.holdings.map((holding) => {
    const value = calculateHoldingValue(holding, normalizedPrices);
    const cost = holding.averageCostBasis * holding.shares;
    const gainLoss = value - cost;
    return {
      ticker: normalizeTicker(holding.ticker),
      value,
      cost,
      gainLoss,
      gainLossPct: cost > 0 ? (gainLoss / cost) * 100 : 0,
    };
  });

  const totalValue = interim.reduce((sum, item) => sum + item.value, 0);

  return interim.map((item) => ({
    ticker: item.ticker,
    value: round(item.value, 2),
    weightPct: totalValue > 0 ? round((item.value / totalValue) * 100, 2) : 0,
    gainLoss: round(item.gainLoss, 2),
    gainLossPct: round(item.gainLossPct, 2),
  }));
}

/**
 * Calculate the weighted portfolio beta using optional stock beta inputs.
 */
export function calculatePortfolioBeta(
  holdings: PortfolioHolding[],
  stockBetas: Map<string, number> = new Map(),
  currentPrices?: Map<string, number>
): number {
  if (!holdings?.length) {
    return 0;
  }

  const normalizedPrices = normalizePriceMap(currentPrices);
  const rows = holdings
    .map((holding) => {
      const ticker = normalizeTicker(holding.ticker);
      const price = normalizedPrices.get(ticker) ?? holding.averageCostBasis;
      const value = holding.shares * (price ?? 0);
      const beta = stockBetas?.get?.(ticker) ?? 1;
      return { value, beta };
    })
    .filter((row) => row.value > 0);

  const totalValue = rows.reduce((sum, row) => sum + row.value, 0);
  if (totalValue === 0) {
    return 0;
  }

  const weightedBeta = rows.reduce((sum, row) => sum + row.beta * row.value, 0) / totalValue;
  return round(weightedBeta, 2);
}

const estimateVolatility = (allocations: PortfolioAllocation[]): number => {
  if (!allocations.length) {
    return 0;
  }

  const weightSquares = allocations.reduce((sum, allocation) => {
    const weight = allocation.weightPct / 100;
    return sum + weight * weight;
  }, 0);
  const concentrationPenalty = Math.max(0, Math.max(...allocations.map((a) => a.weightPct)) - 25);
  const volatility = 12 + Math.sqrt(weightSquares) * 15 + concentrationPenalty * 0.3;
  return round(volatility, 2);
};

const getScenarioMidpoint = (range?: [number, number]): number => {
  if (!range || range.length !== 2) {
    return 0;
  }
  const [low, high] = range;
  const safeLow = Number.isFinite(low) ? low : 0;
  const safeHigh = Number.isFinite(high) ? high : safeLow;
  return (safeLow + safeHigh) / 2;
};

const projectScenarioValue = (currentValue: number, range?: [number, number]): number => {
  const midpoint = getScenarioMidpoint(range);
  const projected = currentValue * (1 + midpoint / 100);
  return round(projected, 2);
};

/**
 * Calculate aggregate portfolio metrics such as total value and gain/loss.
 */
export function calculatePortfolioMetrics(
  portfolio: Portfolio,
  currentPrices: Map<string, number> = new Map(),
  stockBetas: Map<string, number> = new Map()
): PortfolioMetrics {
  const allocations = calculateAllocation(portfolio, currentPrices);
  const totalValue = allocations.reduce((sum, allocation) => sum + allocation.value, 0);
  const totalCost = portfolio?.holdings?.reduce(
    (sum, holding) => sum + holding.averageCostBasis * holding.shares,
    0
  ) ?? 0;
  const totalGainLoss = totalValue - totalCost;
  const totalGainLossPct = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
  const beta = calculatePortfolioBeta(portfolio?.holdings ?? [], stockBetas, currentPrices);
  const volatility = estimateVolatility(allocations);

  return {
    totalValue: round(totalValue, 2),
    totalCost: round(totalCost, 2),
    totalGainLoss: round(totalGainLoss, 2),
    totalGainLossPct: round(totalGainLossPct, 2),
    beta,
    volatility,
  };
}

/**
 * Detect concentration risks in a portfolio.
 */
export function detectConcentrationRisk(allocations: PortfolioAllocation[]): ConcentrationRisk {
  if (!allocations.length) {
    return {
      level: 'low',
      warnings: [],
      largestPositions: [],
    };
  }

  const warnings: string[] = [];
  let level: ConcentrationRisk['level'] = 'low';

  allocations.forEach((allocation) => {
    if (allocation.weightPct >= 30) {
      warnings.push(
        `${allocation.ticker} represents ${allocation.weightPct.toFixed(1)}% of portfolio value which exceeds typical 25% guardrails.`
      );
      level = 'high';
    } else if (allocation.weightPct >= 22 && level !== 'high') {
      warnings.push(
        `${allocation.ticker} is ${allocation.weightPct.toFixed(1)}% of the portfolio. Keep it under 25% to avoid concentration risk.`
      );
      level = level === 'low' ? 'moderate' : level;
    }
  });

  const largestPositions = [...allocations]
    .sort((a, b) => b.weightPct - a.weightPct)
    .slice(0, 3)
    .map((allocation) => ({
      ticker: allocation.ticker,
      weightPct: round(allocation.weightPct, 2),
    }));

  return {
    level,
    warnings,
    largestPositions,
  };
}

/**
 * Provide a portfolio-aware action suggestion for a holding.
 */
export function suggestPortfolioAction(
  ticker: string,
  portfolio: Portfolio,
  currentWeight: number
): { action: PortfolioAction; reasoning: string[] } {
  const normalizedTicker = normalizeTicker(ticker);
  const reasoning: string[] = [];
  const holdings = portfolio?.holdings ?? [];
  const holding = holdings.find((item) => normalizeTicker(item.ticker) === normalizedTicker);
  const weight = Number.isFinite(currentWeight) ? currentWeight : 0;

  if (!holding) {
    reasoning.push(`${normalizedTicker} is not currently held in the portfolio.`);
    if (!holdings.length) {
      reasoning.push('Adding the first holding will establish your portfolio baseline.');
    } else {
      reasoning.push('Consider how this addition fits alongside existing positions.');
    }
    return { action: 'buy', reasoning };
  }

  if (weight >= 40) {
    reasoning.push(
      `${normalizedTicker} accounts for ${weight.toFixed(1)}% of your portfolio which is well above the typical 25% ceiling.`
    );
    reasoning.push('Taking profits and redeploying into other ideas can reduce single-stock risk.');
    return { action: 'sell', reasoning };
  }

  if (weight >= 25) {
    reasoning.push(
      `${normalizedTicker} represents ${weight.toFixed(1)}% of the portfolio. Consider trimming to stay diversified.`
    );
    return { action: 'trim', reasoning };
  }

  if (weight <= 3) {
    reasoning.push(
      `Position size is only ${weight.toFixed(1)}%. If conviction is high, you could add to reach a 5-10% allocation.`
    );
    return { action: 'buy', reasoning };
  }

  reasoning.push(
    `${normalizedTicker} sits at ${weight.toFixed(1)}% which is within the usual 5-20% guardrails for single positions.`
  );
  reasoning.push('Maintain current size while monitoring fundamentals and risk exposure.');
  return { action: 'hold', reasoning };
}

const defaultStressTestResult: PortfolioStressTestResult = {
  currentValue: 0,
  bullValue: 0,
  baseValue: 0,
  bearValue: 0,
  bullChangePct: 0,
  baseChangePct: 0,
  bearChangePct: 0,
  entries: [],
};

/**
 * Aggregate holding-level scenario outcomes into a portfolio stress test.
 */
export function calculatePortfolioStressTest(
  snapshots: HoldingScenarioSnapshot[]
): PortfolioStressTestResult {
  if (!snapshots?.length) {
    return { ...defaultStressTestResult };
  }

  const entries = snapshots.map((snapshot) => {
    const currentValue = round(snapshot.shares * snapshot.currentPrice, 2);
    const scenarios = snapshot.scenarios ?? null;

    const bullValue = projectScenarioValue(
      currentValue,
      scenarios?.bull?.expectedReturnPctRange
    );
    const baseValue = projectScenarioValue(
      currentValue,
      scenarios?.base?.expectedReturnPctRange
    );
    const bearValue = projectScenarioValue(
      currentValue,
      scenarios?.bear?.expectedReturnPctRange
    );

    return {
      ticker: snapshot.ticker.toUpperCase(),
      currentValue,
      bullValue,
      baseValue,
      bearValue,
    };
  });

  const totals = entries.reduce(
    (acc, entry) => ({
      currentValue: acc.currentValue + entry.currentValue,
      bullValue: acc.bullValue + entry.bullValue,
      baseValue: acc.baseValue + entry.baseValue,
      bearValue: acc.bearValue + entry.bearValue,
    }),
    { currentValue: 0, bullValue: 0, baseValue: 0, bearValue: 0 }
  );

  const changePct = (scenarioValue: number) => {
    if (totals.currentValue === 0) {
      return 0;
    }
    return round(((scenarioValue - totals.currentValue) / totals.currentValue) * 100, 2);
  };

  return {
    currentValue: round(totals.currentValue, 2),
    bullValue: round(totals.bullValue, 2),
    baseValue: round(totals.baseValue, 2),
    bearValue: round(totals.bearValue, 2),
    bullChangePct: changePct(totals.bullValue),
    baseChangePct: changePct(totals.baseValue),
    bearChangePct: changePct(totals.bearValue),
    entries,
  };
}
