/**
 * Active Manager Recommendation Engine
 *
 * Pure functions for generating portfolio-aware action recommendations.
 * All functions follow GLOBAL_RULES: guard clauses, no else statements, pure logic only.
 */

import type {
  AnalysisResult,
  UserProfile,
  ActiveManagerTimeframe,
  ActiveManagerRecommendation,
  ActiveManagerInput,
  ActiveManagerConfig,
} from './AnalysisTypes';
import type { PortfolioAction } from './portfolioEngine';
import { DEFAULT_ACTIVE_MANAGER_CONFIG } from './AnalysisTypes';

/**
 * Determines the appropriate timeframe based on user investment horizon.
 *
 * @param _analysisResult - The analysis result (reserved for future use)
 * @param userProfile - User's investment profile
 * @returns Active Manager timeframe classification
 */
export function determineTimeframe(
  _analysisResult: AnalysisResult,
  userProfile: UserProfile
): ActiveManagerTimeframe {
  if (userProfile.horizon === '1-3') {
    return 'short_term';
  }

  if (userProfile.horizon === '10+') {
    return 'long_term';
  }

  return 'medium_term';
}

/**
 * Calculates confidence score adjusted for risk tolerance alignment.
 *
 * @param analysisResult - The analysis result containing conviction and risk scores
 * @param userProfile - User's investment profile
 * @param config - Active Manager configuration with thresholds
 * @returns Confidence score (0-100)
 */
export function calculateConfidenceScore(
  analysisResult: AnalysisResult,
  userProfile: UserProfile,
  config: ActiveManagerConfig
): number {
  const baseScore = analysisResult.summary.convictionScore3m;
  const riskScore = analysisResult.summary.riskScore;
  let adjustedScore = baseScore;

  // Reduce confidence when risk exceeds tolerance
  if (
    riskScore > config.highRiskThreshold &&
    userProfile.riskTolerance === 'low'
  ) {
    adjustedScore -= 20;
  }

  if (
    riskScore > config.moderateRiskThreshold &&
    userProfile.riskTolerance === 'moderate'
  ) {
    adjustedScore -= 10;
  }

  // Increase confidence when risk is low and tolerance is high
  if (
    riskScore < config.moderateRiskThreshold &&
    userProfile.riskTolerance === 'high'
  ) {
    adjustedScore += 10;
  }

  // Clamp to 0-100 range
  const clampedScore = Math.max(0, Math.min(100, adjustedScore));

  return Math.round(clampedScore);
}

/**
 * Determines the primary portfolio action based on conviction, risk, and position context.
 *
 * @param analysisResult - The analysis result
 * @param userProfile - User's investment profile
 * @param portfolioContext - Optional portfolio context (position weight, holdings)
 * @param confidenceScore - Calculated confidence score
 * @param config - Active Manager configuration
 * @returns Portfolio action recommendation
 */
export function determinePrimaryAction(
  analysisResult: AnalysisResult,
  userProfile: UserProfile,
  portfolioContext: ActiveManagerInput['portfolioContext'],
  confidenceScore: number,
  config: ActiveManagerConfig
): PortfolioAction {
  const currentWeight = portfolioContext?.currentWeight ?? 0;
  const hasHolding = currentWeight > 0;

  // No existing holding logic
  if (hasHolding === false) {
    if (confidenceScore >= config.highConvictionThreshold) {
      return 'buy';
    }

    if (confidenceScore < config.lowConvictionThreshold) {
      return 'hold';
    }

    return 'buy';
  }

  // Existing holding logic - concentration risk check first
  if (currentWeight >= 40) {
    return 'sell';
  }

  if (currentWeight >= config.trimThreshold) {
    return 'trim';
  }

  // Small position with high confidence
  if (
    currentWeight <= config.minMeaningfulWeight &&
    confidenceScore >= config.moderateConvictionThreshold
  ) {
    return 'buy';
  }

  // Low conviction with existing position
  if (confidenceScore < config.lowConvictionThreshold) {
    return 'trim';
  }

  return 'hold';
}

/**
 * Generates rationale bullets explaining the recommendation using framework language.
 *
 * @param analysisResult - The analysis result
 * @param userProfile - User's investment profile
 * @param portfolioContext - Optional portfolio context
 * @param primaryAction - The recommended action
 * @param confidenceScore - Calculated confidence score
 * @param config - Active Manager configuration
 * @returns Array of rationale strings (3-6 bullets)
 */
export function generateRationale(
  analysisResult: AnalysisResult,
  userProfile: UserProfile,
  portfolioContext: ActiveManagerInput['portfolioContext'],
  primaryAction: PortfolioAction,
  confidenceScore: number,
  config: ActiveManagerConfig
): string[] {
  const rationale: string[] = [];
  const riskScore = analysisResult.summary.riskScore;
  const currentWeight = portfolioContext?.currentWeight ?? 0;

  // Conviction-based rationale
  if (confidenceScore >= config.highConvictionThreshold) {
    rationale.push(
      `Framework conviction score of ${confidenceScore} suggests ${primaryAction} aligns with similar investor profiles.`
    );
  }

  if (
    confidenceScore >= config.moderateConvictionThreshold &&
    confidenceScore < config.highConvictionThreshold
  ) {
    rationale.push(
      `Moderate conviction level (${confidenceScore}/100) indicates balanced opportunity-risk profile for this timeframe.`
    );
  }

  if (confidenceScore < config.moderateConvictionThreshold) {
    rationale.push(
      `Lower conviction score (${confidenceScore}/100) suggests cautious positioning may be prudent.`
    );
  }

  // Position weight context
  if (currentWeight > 0) {
    if (currentWeight >= config.maxSinglePositionWeight) {
      rationale.push(
        `Current position weight of ${currentWeight.toFixed(
          1
        )}% exceeds typical concentration guardrails (${
          config.maxSinglePositionWeight
        }%).`
      );
    }

    if (
      currentWeight > 0 &&
      currentWeight < config.maxSinglePositionWeight
    ) {
      rationale.push(
        `Current position weight of ${currentWeight.toFixed(
          1
        )}% falls within typical diversification guidelines.`
      );
    }
  }

  // Risk assessment
  if (riskScore >= config.highRiskThreshold) {
    rationale.push(
      `Risk score of ${riskScore}/10 indicates elevated uncertainty for this holding.`
    );
  }

  if (
    riskScore >= config.moderateRiskThreshold &&
    riskScore < config.highRiskThreshold
  ) {
    rationale.push(
      `Moderate risk level (${riskScore}/10) aligns with typical balanced portfolio parameters.`
    );
  }

  if (riskScore < config.moderateRiskThreshold) {
    rationale.push(
      `Lower risk score (${riskScore}/10) suggests more stable return profile.`
    );
  }

  // Risk tolerance alignment
  if (
    userProfile.riskTolerance === 'low' &&
    riskScore >= config.moderateRiskThreshold
  ) {
    rationale.push(
      'Risk level may exceed conservative investor guardrails; position sizing adjustment recommended.'
    );
  }

  // Ensure 3-6 bullets
  const finalRationale = rationale.slice(0, 6);

  if (finalRationale.length < 3) {
    finalRationale.push(
      `${userProfile.objective.charAt(0).toUpperCase()}${userProfile.objective.slice(
        1
      )} objective guides typical allocation strategy for this analysis.`
    );
  }

  return finalRationale;
}

/**
 * Generates risk flags for concentration or risk-tolerance mismatches.
 *
 * @param analysisResult - The analysis result
 * @param userProfile - User's investment profile
 * @param portfolioContext - Optional portfolio context
 * @param config - Active Manager configuration
 * @returns Array of risk warning strings (0-3 flags)
 */
export function generateRiskFlags(
  analysisResult: AnalysisResult,
  userProfile: UserProfile,
  portfolioContext: ActiveManagerInput['portfolioContext'],
  config: ActiveManagerConfig
): string[] {
  const flags: string[] = [];
  const riskScore = analysisResult.summary.riskScore;
  const currentWeight = portfolioContext?.currentWeight ?? 0;

  if (riskScore >= config.highRiskThreshold) {
    flags.push(
      'High risk score indicates significant uncertainty in return estimates.'
    );
  }

  if (currentWeight >= config.maxSinglePositionWeight) {
    flags.push(
      'Position size exceeds typical concentration limits for diversified portfolios.'
    );
  }

  if (
    userProfile.riskTolerance === 'low' &&
    riskScore >= config.moderateRiskThreshold
  ) {
    flags.push(
      'Risk level may exceed tolerance parameters for conservative profiles.'
    );
  }

  return flags.slice(0, 3);
}

/**
 * Generates a short headline summarizing the recommendation.
 *
 * @param primaryAction - The recommended action
 * @param confidenceScore - Calculated confidence score
 * @param ticker - Stock ticker symbol
 * @returns Headline string
 */
export function generateHeadline(
  primaryAction: PortfolioAction,
  confidenceScore: number,
  ticker: string
): string {
  const actionVerb =
    primaryAction.charAt(0).toUpperCase() + primaryAction.slice(1);

  if (confidenceScore >= 70) {
    return `${actionVerb} ${ticker} - High Confidence`;
  }

  if (confidenceScore >= 40) {
    return `${actionVerb} ${ticker} - Moderate Conviction`;
  }

  return `${actionVerb} ${ticker} - Lower Confidence`;
}

/**
 * Main orchestrator function that generates a complete Active Manager recommendation.
 *
 * @param input - Active Manager input bundle (ticker, analysis, profile, portfolio context)
 * @param config - Optional configuration (defaults to DEFAULT_ACTIVE_MANAGER_CONFIG)
 * @returns Complete Active Manager recommendation
 */
export function buildActiveManagerRecommendation(
  input: ActiveManagerInput,
  config: ActiveManagerConfig = DEFAULT_ACTIVE_MANAGER_CONFIG
): ActiveManagerRecommendation {
  const timeframe = determineTimeframe(
    input.analysisResult,
    input.userProfile
  );

  const confidenceScore = calculateConfidenceScore(
    input.analysisResult,
    input.userProfile,
    config
  );

  const primaryAction = determinePrimaryAction(
    input.analysisResult,
    input.userProfile,
    input.portfolioContext,
    confidenceScore,
    config
  );

  const rationale = generateRationale(
    input.analysisResult,
    input.userProfile,
    input.portfolioContext,
    primaryAction,
    confidenceScore,
    config
  );

  const riskFlags = generateRiskFlags(
    input.analysisResult,
    input.userProfile,
    input.portfolioContext,
    config
  );

  const headline = generateHeadline(
    primaryAction,
    confidenceScore,
    input.ticker
  );

  const notes: string[] = [];

  if (
    input.portfolioContext?.currentWeight &&
    input.portfolioContext.currentWeight > config.maxSinglePositionWeight
  ) {
    notes.push(
      `Position size adjusted to respect ${config.maxSinglePositionWeight}% concentration limit per framework guardrails.`
    );
  }

  return {
    ticker: input.ticker,
    primaryAction,
    confidenceScore,
    headline,
    rationale,
    riskFlags,
    timeframe,
    notes: notes.length > 0 ? notes : undefined,
  };
}
