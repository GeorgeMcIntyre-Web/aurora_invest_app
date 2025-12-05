// Central contract surface for Active Manager domain types.
// UI and service layers should import from here (or AnalysisTypes.ts directly).

export type {
  ActiveManagerRecommendation,
  ActiveManagerTimeframe,
  PortfolioActionSuggestion,
  PortfolioContext,
} from '@/lib/domain/AnalysisTypes';

export type { PortfolioAction } from '@/lib/domain/portfolioEngine';
