// Core type definitions for AuroraInvest Stock Analyzer

export type RiskTolerance = 'low' | 'moderate' | 'high';
export type InvestmentHorizon = '1-3' | '5-10' | '10+';
export type InvestmentObjective = 'growth' | 'income' | 'balanced';
export type AnalystConsensus = 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell';
export type FundamentalsClassification = 'strong' | 'ok' | 'weak' | 'unknown';
export type ValuationClassification = 'cheap' | 'fair' | 'rich' | 'unknown';

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
  pegRatio?: number;
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
}

export interface AnalysisOptions {
  horizonMonths?: number;
}
