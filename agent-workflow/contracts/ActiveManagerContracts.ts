/**
 * Active Manager Feature Contract Types
 *
 * This file serves as the CONTRACT SURFACE for the Active Manager feature.
 * All agents MUST use these types. DO NOT invent new types or property names.
 *
 * IMPORTANT: These types extend and re-export from lib/domain/AnalysisTypes.ts
 * to ensure consistency across the codebase.
 */

// Import types for local use and re-export
import type {
  AnalysisResult,
  UserProfile,
  RiskTolerance,
  InvestmentHorizon,
  InvestmentObjective,
  ScenarioSummary,
  PlanningGuidance,
  AnalysisSummary,
} from '@/lib/domain/AnalysisTypes';

import type {
  PortfolioAction,
  PortfolioHolding,
  PortfolioMetrics,
  Portfolio,
  PortfolioAllocation,
  ConcentrationRisk,
} from '@/lib/domain/portfolioEngine';

// Re-export for convenience
export type {
  AnalysisResult,
  UserProfile,
  RiskTolerance,
  InvestmentHorizon,
  InvestmentObjective,
  ScenarioSummary,
  PlanningGuidance,
  AnalysisSummary,
  PortfolioAction,
  PortfolioHolding,
  PortfolioMetrics,
  Portfolio,
  PortfolioAllocation,
  ConcentrationRisk,
};

// ============================================================================
// ACTIVE MANAGER SPECIFIC TYPES
// ============================================================================

/**
 * Timeframe for Active Manager recommendations.
 *
 * - short_term: 1-3 months
 * - medium_term: 3-12 months
 * - long_term: 12+ months
 */
export type ActiveManagerTimeframe = 'short_term' | 'medium_term' | 'long_term';

/**
 * Active Manager Recommendation
 *
 * This is the PRIMARY OUTPUT of the Active Manager feature.
 *
 * PROPERTY NAMES ARE FIXED - DO NOT CHANGE:
 * - ticker: Stock ticker symbol
 * - primaryAction: 'buy' | 'hold' | 'trim' | 'sell' (from PortfolioAction)
 * - confidenceScore: 0-100 integer
 * - headline: Short summary (1 sentence, ~50-100 chars)
 * - rationale: Array of 3-6 bullet points explaining the recommendation
 * - riskFlags: Array of 0-3 risk warnings (empty if no significant risks)
 * - timeframe: short_term | medium_term | long_term
 * - notes: Optional array of adjustment notes (e.g., "Capped due to risk tolerance")
 */
export interface ActiveManagerRecommendation {
  ticker: string;
  primaryAction: PortfolioAction;
  confidenceScore: number; // 0-100
  headline: string;
  rationale: string[];
  riskFlags: string[];
  timeframe: ActiveManagerTimeframe;
  notes?: string[];
}

/**
 * Input context for generating Active Manager recommendations
 *
 * This bundles all the information needed to generate a recommendation.
 */
export interface ActiveManagerInput {
  ticker: string;
  analysisResult: AnalysisResult;
  userProfile: UserProfile;
  portfolioContext?: {
    existingHolding?: PortfolioHolding;
    currentWeight?: number; // percentage (0-100)
    portfolioMetrics?: PortfolioMetrics;
  };
}

/**
 * Configuration for recommendation generation logic
 *
 * These are the thresholds and guardrails used by the recommendation engine.
 * Agents implementing the logic should use these values, not hardcoded numbers.
 */
export interface ActiveManagerConfig {
  // Conviction thresholds (0-100 scale)
  highConvictionThreshold: number; // e.g., 70
  moderateConvictionThreshold: number; // e.g., 40
  lowConvictionThreshold: number; // e.g., 20

  // Risk score thresholds (1-10 scale)
  highRiskThreshold: number; // e.g., 7
  moderateRiskThreshold: number; // e.g., 4

  // Portfolio weight guardrails (percentages)
  maxSinglePositionWeight: number; // e.g., 25
  trimThreshold: number; // e.g., 25
  minMeaningfulWeight: number; // e.g., 3

  // Timeframe mapping (months)
  shortTermMonths: number; // e.g., 3
  mediumTermMonths: number; // e.g., 12
  longTermMonths: number; // e.g., 36
}

/**
 * Default Active Manager configuration
 *
 * Agents should use this unless user has custom preferences.
 */
export const DEFAULT_ACTIVE_MANAGER_CONFIG: ActiveManagerConfig = {
  highConvictionThreshold: 70,
  moderateConvictionThreshold: 40,
  lowConvictionThreshold: 20,

  highRiskThreshold: 7,
  moderateRiskThreshold: 4,

  maxSinglePositionWeight: 25,
  trimThreshold: 25,
  minMeaningfulWeight: 3,

  shortTermMonths: 3,
  mediumTermMonths: 12,
  longTermMonths: 36,
};

// ============================================================================
// DISCLAIMER TEXT
// ============================================================================

/**
 * Required disclaimer for Active Manager recommendations
 *
 * MUST be included whenever displaying ActiveManagerRecommendation to users.
 */
export const ACTIVE_MANAGER_DISCLAIMER =
  'Active Manager provides framework-based suggestions only and does not constitute personalized financial advice. ' +
  'These recommendations are educational tools based on typical investment frameworks. ' +
  'Consult a qualified financial advisor before making investment decisions.';

// ============================================================================
// FRAMEWORK LANGUAGE EXAMPLES
// ============================================================================

/**
 * Approved framework language patterns for Active Manager
 *
 * USE these patterns in rationale and notes.
 * DO NOT use direct advice language like "You should buy..."
 */
export const FRAMEWORK_LANGUAGE_PATTERNS = {
  positionSizing: [
    'Many investors with similar profiles typically allocate...',
    'Framework guardrails often suggest...',
    'Typical concentration limits range from...',
  ],
  actionSuggestions: [
    'A framework approach might consider...',
    'Under similar scenarios, some investors...',
    'Common frameworks suggest...',
  ],
  riskWarnings: [
    'This position exceeds typical concentration thresholds...',
    'Risk metrics indicate elevated uncertainty...',
    'Diversification principles typically recommend...',
  ],
} as const;
