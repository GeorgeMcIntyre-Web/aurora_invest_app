'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle, Shield, Award, Lightbulb, AlertTriangle } from 'lucide-react';
import { AnalysisResult, StockData, HistoricalData, PortfolioContext, ActiveManagerRecommendation } from '@/lib/domain/AnalysisTypes';
import { FundamentalsCard } from './fundamentals-card';
import { TechnicalsCard } from './technicals-card';
import { SentimentCard } from './sentiment-card';
import { ScenarioCards } from './scenario-cards';
import { ExportButtons } from './export-buttons';
import { RiskCard } from './risk-card';
import { HistoricalChart } from './historical-chart';
import { HistoricalCard } from './historical-card';
import { ActiveManagerCard } from './active-manager-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TooltipProvider } from '@/components/ui/tooltip';
import { FinancialTooltip } from './financial-tooltip';
import { useAiVerification } from '@/hooks/use-ai-verification';
import { AiVerificationCard } from './ai-verification-card';

type HistoricalPeriod = HistoricalData['period'];

interface AnalysisDashboardProps {
  result: AnalysisResult;
  stock: StockData;
  historicalSeries?: Partial<Record<HistoricalPeriod, HistoricalData>>;
  selectedPeriod?: HistoricalPeriod;
  onPeriodChange?: (period: HistoricalPeriod) => void;
  historicalLoading?: boolean;
  historicalError?: string | null;
  portfolioContext?: PortfolioContext | null;
  portfolioLoading?: boolean;
  portfolioError?: string | null;
  onQuickAddHolding?: (input: { shares: number; averageCostBasis: number; purchaseDate: string }) => Promise<void>;
  quickAddBusy?: boolean;
  activeManagerRecommendation?: ActiveManagerRecommendation | null;
  activeManagerLoading?: boolean;
  activeManagerError?: string | null;
}

export function AnalysisDashboard({
  result,
  stock,
  historicalSeries,
  selectedPeriod = '6M',
  onPeriodChange,
  historicalLoading = false,
  historicalError = null,
  portfolioContext,
  portfolioLoading = false,
  portfolioError = null,
  onQuickAddHolding,
  quickAddBusy = false,
  activeManagerRecommendation,
  activeManagerLoading = false,
  activeManagerError = null,
}: AnalysisDashboardProps) {
  const [quickAddShares, setQuickAddShares] = useState('');
  const [quickAddCost, setQuickAddCost] = useState('');
  const [quickAddDate, setQuickAddDate] = useState(new Date().toISOString().split('T')[0]);
  const [quickAddMessage, setQuickAddMessage] = useState<string | null>(null);
  const {
    result: aiVerificationResult,
    status: aiVerificationStatus,
    error: aiVerificationError,
    runVerification: runAiVerification,
  } = useAiVerification({ stock, analysis: result });

  if (!result) {
    return null;
  }

  const summary = result?.summary;
  const scenarios = result?.scenarios;
  const planningGuidance = result?.planningGuidance;
  const historicalDataset = historicalSeries?.[selectedPeriod] ?? null;

  const handleQuickAdd = async () => {
    if (!onQuickAddHolding) {
      return;
    }
    const shares = Number(quickAddShares);
    const cost = Number(quickAddCost);
    if (!shares || !cost) {
      setQuickAddMessage('Enter a valid share count and cost basis.');
      return;
    }
    setQuickAddMessage(null);
    try {
      await onQuickAddHolding({
        shares,
        averageCostBasis: cost,
        purchaseDate: quickAddDate,
      });
      setQuickAddShares('');
      setQuickAddCost('');
      setQuickAddMessage('Holding added to portfolio.');
    } catch (error) {
      console.error(error);
      setQuickAddMessage('Unable to add holding. Try again from the portfolio page.');
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-ai-primary to-ai-accent rounded-lg p-8 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">
                {result?.name ?? result?.ticker ?? 'Stock'} ({result?.ticker})
              </h1>
              <p className="text-sm opacity-90 mt-1">
                Analysis generated on {new Date(result?.generatedAt ?? '').toLocaleString()}
              </p>
            </div>
            <ExportButtons result={result} />
          </div>
        </div>

        {/* Summary Banner */}
        <div className="bg-ai-card border border-gray-700 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Award className="h-6 w-6 text-ai-accent" />
            <h2 className="text-xl font-bold text-ai-text">Analysis Summary</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Headline View */}
            <div className="md:col-span-3">
              <p className="text-lg text-ai-text">{summary?.headlineView ?? ''}</p>
            </div>

            {/* Risk Score */}
            <div className="bg-ai-bg p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-ai-primary" />
                <FinancialTooltip term="riskScore">
                  <div className="text-sm text-ai-muted">Risk Score</div>
                </FinancialTooltip>
              </div>
              <div className="text-3xl font-bold text-ai-text">
                {summary?.riskScore ?? 0}/10
              </div>
              <div className="text-xs text-ai-muted mt-1">
                {summary?.riskScore <= 3 && 'Low Risk'}
                {summary?.riskScore > 3 && summary?.riskScore <= 7 && 'Moderate Risk'}
                {summary?.riskScore > 7 && 'High Risk'}
              </div>
            </div>

            {/* Conviction Score */}
            <div className="bg-ai-bg p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-ai-accent" />
                <FinancialTooltip term="convictionScore">
                  <div className="text-sm text-ai-muted">3-Month Conviction</div>
                </FinancialTooltip>
              </div>
              <div className="text-3xl font-bold text-ai-text">
                {summary?.convictionScore3m ?? 0}%
              </div>
              <div className="text-xs text-ai-muted mt-1">
                {summary?.convictionScore3m < 45 && 'Low Confidence'}
                {summary?.convictionScore3m >= 45 && summary?.convictionScore3m <= 55 && 'Moderate Confidence'}
                {summary?.convictionScore3m > 55 && 'Higher Confidence'}
              </div>
            </div>

            {/* Weighted Estimate */}
            <div className="bg-ai-bg p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                <FinancialTooltip term="pointEstimate">
                  <div className="text-sm text-ai-muted">3-Month Estimate</div>
                </FinancialTooltip>
              </div>
              <div className="text-3xl font-bold text-ai-text">
                {scenarios?.pointEstimateReturnPct > 0 ? '+' : ''}
                {scenarios?.pointEstimateReturnPct?.toFixed?.(1) ?? '0.0'}%
              </div>
              <div className="text-xs text-ai-muted mt-1">Probability-weighted</div>
            </div>
          </div>

        {/* Key Takeaways */}
        <div className="mt-6">
          <div className="text-sm font-medium text-ai-muted mb-3">Key Takeaways</div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {summary?.keyTakeaways?.map((takeaway, index) => (
              <li key={index} className="text-sm text-ai-text bg-ai-bg p-3 rounded-lg flex items-start gap-2">
                <span className="text-ai-accent mt-0.5">•</span>
                <span>{takeaway}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

        <AiVerificationCard
          verification={aiVerificationResult}
          status={aiVerificationStatus}
          error={aiVerificationError}
          onRun={() => void runAiVerification()}
          disabled={!stock?.ticker}
        />

        {/* Active Manager Recommendation - Moved to top for visibility */}
        <ActiveManagerCard
          recommendation={activeManagerRecommendation ?? null}
          loading={activeManagerLoading}
          error={activeManagerError}
        />

      {(portfolioLoading || portfolioContext || portfolioError) && (
        <div className="bg-ai-card border border-gray-700 rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-ai-primary" />
            <h2 className="text-lg font-semibold text-ai-text">Portfolio Context</h2>
            <div className="flex-1" />
            <Link href="/portfolio">
              <Button variant="outline" size="sm" type="button">
                View Portfolio
              </Button>
            </Link>
          </div>
          {portfolioLoading && <p className="text-sm text-ai-muted">Loading portfolio insights...</p>}
          {portfolioError && <p className="text-sm text-red-400">{portfolioError}</p>}
          {portfolioContext && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-gray-800 p-4">
                  <p className="text-xs uppercase text-ai-muted mb-1">Current position</p>
                  {portfolioContext.existingHolding ? (
                    <div className="text-sm text-ai-text space-y-1">
                      <p>
                        Shares:{' '}
                        <span className="font-semibold">
                          {portfolioContext.existingHolding.shares.toLocaleString()}
                        </span>
                      </p>
                      <p>
                        Avg cost:{' '}
                        <span className="font-semibold">
                          ${portfolioContext.existingHolding.averageCostBasis.toFixed(2)}
                        </span>
                      </p>
                      <p>
                        Portfolio weight:{' '}
                        <span className="font-semibold">
                          {(portfolioContext.currentWeightPct ?? 0).toFixed(2)}%
                        </span>
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-ai-muted">
                      Not currently held in the default portfolio.
                    </p>
                  )}
                </div>
                <div className="rounded-lg border border-gray-800 p-4">
                  <p className="text-xs uppercase text-ai-muted mb-1">Portfolio metrics</p>
                  <p className="text-sm text-ai-text">
                    Value:{' '}
                    <span className="font-semibold">
                      ${portfolioContext.portfolioMetrics.totalValue.toLocaleString()}
                    </span>
                  </p>
                  <p className="text-sm text-ai-muted">
                    Gain/Loss:{' '}
                    <span className={portfolioContext.portfolioMetrics.totalGainLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                      ${portfolioContext.portfolioMetrics.totalGainLoss.toLocaleString()} (
                      {portfolioContext.portfolioMetrics.totalGainLossPct.toFixed(2)}%)
                    </span>
                  </p>
                </div>
              </div>
              <div className="rounded-lg border border-gray-800 p-4">
                <p className="text-xs uppercase text-ai-muted mb-2">Suggested action</p>
                <p className="text-sm font-semibold text-ai-text">
                  {portfolioContext.suggestedAction.toUpperCase()}
                </p>
                <ul className="mt-2 space-y-1">
                  {portfolioContext.reasoning.map((reason) => (
                    <li key={reason} className="text-xs text-ai-muted">
                      • {reason}
                    </li>
                  ))}
                </ul>
              </div>
              {onQuickAddHolding && (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                  <div>
                    <Label htmlFor="quickShares">Shares</Label>
                    <Input
                      id="quickShares"
                      type="number"
                      min="0"
                      value={quickAddShares}
                      onChange={(event) => setQuickAddShares(event.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="quickCost">Cost Basis ($)</Label>
                    <Input
                      id="quickCost"
                      type="number"
                      min="0"
                      value={quickAddCost}
                      onChange={(event) => setQuickAddCost(event.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="quickDate">Purchase Date</Label>
                    <Input
                      id="quickDate"
                      type="date"
                      value={quickAddDate}
                      onChange={(event) => setQuickAddDate(event.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button type="button" onClick={() => void handleQuickAdd()} disabled={quickAddBusy}>
                      {portfolioContext.existingHolding ? 'Add Lots' : 'Add to Portfolio'}
                    </Button>
                  </div>
                  {quickAddMessage && (
                    <p className="col-span-full text-sm text-ai-muted">{quickAddMessage}</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Risk Insights */}
      <RiskCard result={result} stock={stock} />

      {/* Fundamentals & Valuation */}
      <FundamentalsCard
        stock={stock}
        fundamentalsView={result?.fundamentalsView ?? ''}
        valuationView={result?.valuationView ?? ''}
      />

      {/* Technical Analysis */}
      <TechnicalsCard stock={stock} technicalView={result?.technicalView ?? ''} />

      {/* Historical Analysis */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <HistoricalChart
          data={historicalDataset}
          selectedPeriod={selectedPeriod}
          onPeriodChange={onPeriodChange}
          isLoading={historicalLoading}
          error={historicalError}
        />
        <HistoricalCard
          data={historicalDataset}
          selectedPeriod={selectedPeriod}
          isLoading={historicalLoading}
        />
      </div>

      {/* Market Sentiment */}
      <SentimentCard stock={stock} sentimentView={result?.sentimentView ?? ''} />

      {/* Scenarios */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Lightbulb className="h-6 w-6 text-ai-accent" />
          <h2 className="text-xl font-bold text-ai-text">3-Month Scenarios</h2>
        </div>
        <ScenarioCards scenarios={scenarios} />
      </div>

      {/* Planning Guidance */}
      <div className="bg-ai-card border border-gray-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <Lightbulb className="h-6 w-6 text-ai-primary" />
          <h2 className="text-xl font-bold text-ai-text">Planning Guidance</h2>
        </div>

        <div className="space-y-6">
          {/* Position Sizing */}
          {planningGuidance?.positionSizing && planningGuidance?.positionSizing?.length > 0 && (
            <div>
              <div className="text-sm font-medium text-ai-muted mb-3">Position Sizing Considerations</div>
              <ul className="space-y-2">
                {planningGuidance.positionSizing.map((item, index) => (
                  <li key={index} className="text-sm text-ai-text bg-ai-bg p-3 rounded-lg flex items-start gap-2">
                    <span className="text-ai-accent mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Timing */}
          {planningGuidance?.timing && planningGuidance?.timing?.length > 0 && (
            <div>
              <div className="text-sm font-medium text-ai-muted mb-3">Timing Considerations</div>
              <ul className="space-y-2">
                {planningGuidance.timing.map((item, index) => (
                  <li key={index} className="text-sm text-ai-text bg-ai-bg p-3 rounded-lg flex items-start gap-2">
                    <span className="text-ai-accent mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Risk Notes */}
          {planningGuidance?.riskNotes && planningGuidance?.riskNotes?.length > 0 && (
            <div>
              <div className="text-sm font-medium text-ai-muted mb-3">Risk Considerations</div>
              <ul className="space-y-2">
                {planningGuidance.riskNotes.map((item, index) => (
                  <li key={index} className="text-sm text-ai-text bg-ai-bg p-3 rounded-lg flex items-start gap-2">
                    <span className="text-yellow-500 mt-0.5">⚠</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Language Notes */}
          {planningGuidance?.languageNotes && (
            <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
              <p className="text-sm text-blue-300">{planningGuidance.languageNotes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-yellow-500 mb-2">Important Disclaimer</h3>
            <p className="text-sm text-yellow-200">{result?.disclaimer ?? ''}</p>
          </div>
        </div>
      </div>
      </div>
    </TooltipProvider>
  );
}
