// Core type definitions for AuroraInvest Stock Analyzer

import type { PortfolioAction, PortfolioHolding, PortfolioMetrics } from './portfolioEngine';

export type RiskTolerance = 'low' | 'moderate' | 'high';
export type InvestmentHorizon = '1-3' | '5-10' | '10+';
export type InvestmentObjective = 'growth' | 'income' | 'balanced';
export type AnalystConsensus = 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
export type FundamentalsClassification = 'strong' | 'ok' | 'weak' | 'unknown';
export type ValuationClassification = 'cheap' | 'fair' | 'rich' | 'unknown';
export type PegBucket = 'discount' | 'balanced' | 'demanding' | 'distorted';

export type GrowthSource = 'eps' | 'revenue';

export interface PegAssessment {
  bucket: PegBucket;
  ratio?: number;
  normalizedGrowthPct?: number;
  growthSource?: GrowthSource;
  commentary: string;
}

export interface UserProfile {
  riskTolerance: RiskTolerance;
  horizon: InvestmentHorizon;
  objective: InvestmentObjective;
}

export interface StockFundamentals {
  trailingPE?: number;
  forwardPE?: number;
  dividendYieldPct?: number;
  revenueGrowthYoYPct?: number;
  epsGrowthYoYPct?: number;
  netMarginPct?: number;
  freeCashFlowYieldPct?: number;
  debtToEquity?: number;
  roe?: number;
}

export interface StockTechnicals {
  price: number;
  price52wHigh?: number;
  price52wLow?: number;
  sma20?: number;
  sma50?: number;
  sma200?: number;
  rsi14?: number;
  volume?: number;
  avgVolume?: number;
}

export interface StockSentiment {
  analystConsensus?: AnalystConsensus;
  analystTargetMean?: number;
  analystTargetHigh?: number;
  analystTargetLow?: number;
  newsThemes: string[];
}

export interface FundamentalsInsight {
  classification: FundamentalsClassification;
  qualityScore: number;
  drivers: string[];
  cautionaryNotes: string[];
}

export interface ValuationInsight {
  classification: ValuationClassification;
  valuationScore: number;
  commentary: string;
  drivers: string[];
  cautionaryNotes: string[];
  pegRatio?: number;
  pegAssessment?: PegAssessment;
  earningsYieldPct?: number;
  freeCashFlowYieldPct?: number;
  dividendYieldPct?: number;
}

export interface StockData {
  ticker: string;
  name?: string;
  currency?: string;
  fundamentals: StockFundamentals;
  technicals: StockTechnicals;
  sentiment: StockSentiment;
}

export interface ScenarioBand {
  expectedReturnPctRange: [number, number];
  probabilityPct: number;
  description: string;
}

export interface ScenarioSummary {
  horizonMonths: number;
  bull: ScenarioBand;
  base: ScenarioBand;
  bear: ScenarioBand;
  pointEstimateReturnPct: number;
  uncertaintyComment: string;
}

export interface AnalysisSummary {
  headlineView: string;
  riskScore: number; // 1-10
  convictionScore3m: number; // 0-100
  keyTakeaways: string[];
}

export interface PlanningGuidance {
  positionSizing: string[];
  timing: string[];
  riskNotes: string[];
  languageNotes: string;
}

export interface AnalysisResult {
  ticker: string;
  name?: string;
  summary: AnalysisSummary;
  fundamentalsView: string;
  valuationView: string;
  technicalView: string;
  sentimentView: string;
  scenarios: ScenarioSummary;
  planningGuidance: PlanningGuidance;
  fundamentalsInsight?: FundamentalsInsight;
  valuationInsight?: ValuationInsight;
  disclaimer: string;
  generatedAt: string;
  aiInsights?: string;
  aiReasoning?: string;
}

export interface AnalysisOptions {
  horizonMonths?: number;
}

export interface HistoricalDataPoint {
  date: string; // ISO date
  price: number;
  volume: number;
}

export interface HistoricalData {
  ticker: string;
  period: '1M' | '3M' | '6M' | '1Y' | '5Y';
  dataPoints: HistoricalDataPoint[];
}

export type PortfolioActionSuggestion = PortfolioAction;

export interface PortfolioContext {
  portfolioId: string;
  existingHolding?: PortfolioHolding;
  portfolioMetrics: PortfolioMetrics;
  suggestedAction: PortfolioActionSuggestion;
  reasoning: string[];
  currentWeightPct?: number;
}

export type DeepVerificationStatus =
  | 'success'
  | 'config_error'
  | 'bad_request'
  | 'upstream_error'
  | 'timeout'
  | 'ai_unavailable';

export type DeepVerificationConfidence = 'low' | 'medium' | 'high';

export interface DeepVerificationRequest {
  ticker: string;
  fundamentals?: StockFundamentals | null;
  technicals?: StockTechnicals | null;
}

export interface DeepVerificationSuccess {
  status: 'success';
  provider: 'deepseek';
  verdict: string;
  confidenceLabel: DeepVerificationConfidence;
  confidenceScore: number;
  reasoning: string;
  analysis: string;
  bulletPoints: string[];
  generatedAt: string;
  rawResponse?: string;
}

export interface DeepVerificationError {
  status: Exclude<DeepVerificationStatus, 'success'>;
  message: string;
  detail?: string;
  retryable: boolean;
}

export type DeepVerificationResult = DeepVerificationSuccess | DeepVerificationError;

// Tooltip Engine Types
export type FinancialTerm =
  // Valuation metrics
  | 'pe_ratio'
  | 'forward_pe'
  | 'peg_ratio'
  | 'earnings_yield'
  | 'price_to_book'
  | 'price_to_sales'
  // Growth metrics
  | 'eps_growth'
  | 'revenue_growth'
  | 'dividend_yield'
  // Profitability metrics
  | 'net_margin'
  | 'operating_margin'
  | 'roe'
  | 'roa'
  | 'roic'
  // Liquidity & Solvency
  | 'debt_to_equity'
  | 'current_ratio'
  | 'quick_ratio'
  | 'free_cash_flow'
  | 'fcf_yield'
  // Technical indicators
  | 'rsi'
  | 'sma_20'
  | 'sma_50'
  | 'sma_200'
  | 'volume'
  | 'beta'
  | 'volatility'
  | '52w_high'
  | '52w_low'
  // Sentiment & Analysis
  | 'analyst_consensus'
  | 'price_target'
  | 'risk_score'
  | 'conviction_score'
  // Portfolio metrics
  | 'portfolio_allocation'
  | 'concentration_risk'
  | 'portfolio_beta'
  | 'portfolio_volatility'
  | 'cost_basis'
  | 'unrealized_gain'
  // Scenario analysis
  | 'bull_scenario'
  | 'base_scenario'
  | 'bear_scenario'
  | 'expected_return';

export interface TooltipContent {
  term: FinancialTerm;
  title: string;
  definition: string;
  interpretation: string;
  example?: string;
  formula?: string;
  category: 'valuation' | 'growth' | 'profitability' | 'liquidity' | 'technical' | 'sentiment' | 'portfolio' | 'scenario';
}

// ============================================================================
// Active Manager Types (re-exported from contracts)
// ============================================================================

export type {
  ActiveManagerTimeframe,
  ActiveManagerRecommendation,
  ActiveManagerInput,
  ActiveManagerConfig,
} from '../../agent-workflow/contracts/ActiveManagerContracts';

export {
  DEFAULT_ACTIVE_MANAGER_CONFIG,
  ACTIVE_MANAGER_DISCLAIMER,
} from '../../agent-workflow/contracts/ActiveManagerContracts';
