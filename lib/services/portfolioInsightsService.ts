import type {
  Portfolio,
  PortfolioHolding,
  PortfolioAllocation,
  PortfolioMetrics,
  HoldingScenarioSnapshot,
} from '@/lib/domain/portfolioEngine';
import type {
  AnalysisResult,
  StockData,
  UserProfile,
  ActiveManagerRecommendation,
} from '@/lib/domain/AnalysisTypes';
import { analyzeStock } from '@/lib/domain/auroraEngine';
import { buildActiveManagerRecommendation } from '@/lib/domain/activeManagerEngine';
import {
  calculateAllocation,
  calculatePortfolioMetrics,
} from '@/lib/domain/portfolioEngine';
import { marketDataService } from './marketDataService';

const DEFAULT_PROFILE: UserProfile = {
  riskTolerance: 'moderate',
  horizon: '5-10',
  objective: 'balanced',
};

export interface HoldingInsight {
  ticker: string;
  holding: PortfolioHolding;
  stock: StockData;
  analysis: AnalysisResult;
  activeManager: ActiveManagerRecommendation;
  scenarioSnapshot: HoldingScenarioSnapshot;
  weightPct: number;
}

export interface PortfolioInsightsBundle {
  insights: HoldingInsight[];
  allocations: PortfolioAllocation[];
  metrics: PortfolioMetrics;
}

const normalizeTicker = (ticker: string): string => ticker?.toUpperCase?.() ?? '';

export async function buildPortfolioInsights(
  portfolio: Portfolio,
  profile: UserProfile = DEFAULT_PROFILE
): Promise<PortfolioInsightsBundle> {
  if (!portfolio?.holdings?.length) {
    const emptyMetrics = calculatePortfolioMetrics(portfolio, new Map());
    return {
      insights: [],
      allocations: [],
      metrics: emptyMetrics,
    };
  }

  const baseEntries = await Promise.all(
    portfolio.holdings.map(async (holding) => {
      const ticker = normalizeTicker(holding.ticker);
      try {
        const stock = await marketDataService.fetchStockData(ticker);
        const analysis = analyzeStock(profile, stock);
        if (!analysis) {
          return null;
        }
        return { ticker, holding, stock, analysis };
      } catch (error) {
        console.warn('[portfolioInsights] Failed to build insight for', ticker, error);
        return null;
      }
    })
  );

  const validEntries = baseEntries.filter((entry): entry is NonNullable<typeof entry> => !!entry);

  const priceMap = new Map<string, number>();
  portfolio.holdings.forEach((holding) => {
    const ticker = normalizeTicker(holding.ticker);
    const entry = validEntries.find((candidate) => candidate.ticker === ticker);
    const price = entry?.stock?.technicals?.price ?? holding.averageCostBasis;
    priceMap.set(ticker, price);
  });

  const allocations = calculateAllocation(portfolio, priceMap);
  const metrics = calculatePortfolioMetrics(portfolio, priceMap);
  const weightLookup = new Map(allocations.map((allocation) => [allocation.ticker, allocation.weightPct]));

  const insights: HoldingInsight[] = validEntries.map((entry) => {
    const ticker = entry.ticker;
    const currentPrice = priceMap.get(ticker) ?? entry.stock?.technicals?.price ?? entry.holding.averageCostBasis;
    const scenarioSnapshot: HoldingScenarioSnapshot = {
      ticker,
      shares: entry.holding.shares,
      currentPrice,
      scenarios: entry.analysis.scenarios,
    };

    const activeManager = buildActiveManagerRecommendation({
      ticker,
      analysisResult: entry.analysis,
      userProfile: profile,
      portfolioContext: {
        existingHolding: entry.holding,
        currentWeight: weightLookup.get(ticker) ?? 0,
        portfolioMetrics: metrics,
      },
    });

    return {
      ticker,
      holding: entry.holding,
      stock: entry.stock,
      analysis: entry.analysis,
      activeManager,
      scenarioSnapshot,
      weightPct: weightLookup.get(ticker) ?? 0,
    };
  });

  return { insights, allocations, metrics };
}
