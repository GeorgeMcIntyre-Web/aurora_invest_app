'use client';

import { useState } from 'react';
import { Search, TrendingUp } from 'lucide-react';
import { UserProfile, RiskTolerance, InvestmentHorizon, InvestmentObjective } from '@/lib/domain/AnalysisTypes';

interface StockFormProps {
  onAnalyze: (ticker: string, profile: UserProfile) => void;
  isLoading: boolean;
}

export function StockForm({ onAnalyze, isLoading }: StockFormProps) {
  const [ticker, setTicker] = useState('');
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>('moderate');
  const [horizon, setHorizon] = useState<InvestmentHorizon>('5-10');
  const [objective, setObjective] = useState<InvestmentObjective>('growth');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e?.preventDefault?.();
    
    if (!ticker || ticker?.trim?.()?.length === 0) {
      setValidationError('Please enter a stock ticker (e.g., AAPL, MSFT, TSLA).');
      return;
    }

    setValidationError(null);

    onAnalyze?.(ticker?.toUpperCase?.(), {
      riskTolerance,
      horizon,
      objective,
    });
  };

  return (
    <div className="bg-ai-card rounded-lg shadow-lg p-8">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="h-6 w-6 text-ai-accent" />
        <h2 className="text-2xl font-bold text-ai-text">Stock Analysis</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Ticker Input */}
        <div>
          <label htmlFor="ticker" className="block text-sm font-medium text-ai-text mb-2">
            Stock Ticker
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ai-muted" />
            <input
              type="text"
              id="ticker"
              value={ticker}
              onChange={(e) => setTicker(e?.target?.value ?? '')}
              placeholder="e.g., AAPL, MSFT, TSLA"
              className="w-full pl-10 pr-4 py-3 bg-ai-bg border border-gray-700 rounded-lg text-ai-text placeholder-ai-muted focus:outline-none focus:ring-2 focus:ring-ai-primary"
              disabled={isLoading}
            />
          </div>
          <p className="text-xs text-ai-muted mt-1">Available: AAPL, MSFT, TSLA, GOOGL, NVDA</p>
          {validationError && (
            <p className="mt-1 text-xs text-red-400">{validationError}</p>
          )}
        </div>

        {/* Risk Tolerance */}
        <div>
          <label htmlFor="risk" className="block text-sm font-medium text-ai-text mb-2">
            Risk Tolerance
          </label>
          <select
            id="risk"
            value={riskTolerance}
            onChange={(e) => setRiskTolerance(e?.target?.value as RiskTolerance)}
            className="w-full px-4 py-3 bg-ai-bg border border-gray-700 rounded-lg text-ai-text focus:outline-none focus:ring-2 focus:ring-ai-primary"
            disabled={isLoading}
          >
            <option value="low">Low - Conservative</option>
            <option value="moderate">Moderate - Balanced</option>
            <option value="high">High - Aggressive</option>
          </select>
        </div>

        {/* Investment Horizon */}
        <div>
          <label htmlFor="horizon" className="block text-sm font-medium text-ai-text mb-2">
            Investment Horizon
          </label>
          <select
            id="horizon"
            value={horizon}
            onChange={(e) => setHorizon(e?.target?.value as InvestmentHorizon)}
            className="w-full px-4 py-3 bg-ai-bg border border-gray-700 rounded-lg text-ai-text focus:outline-none focus:ring-2 focus:ring-ai-primary"
            disabled={isLoading}
          >
            <option value="1-3">1-3 Years - Short Term</option>
            <option value="5-10">5-10 Years - Medium Term</option>
            <option value="10+">10+ Years - Long Term</option>
          </select>
        </div>

        {/* Investment Objective */}
        <div>
          <label htmlFor="objective" className="block text-sm font-medium text-ai-text mb-2">
            Investment Objective
          </label>
          <select
            id="objective"
            value={objective}
            onChange={(e) => setObjective(e?.target?.value as InvestmentObjective)}
            className="w-full px-4 py-3 bg-ai-bg border border-gray-700 rounded-lg text-ai-text focus:outline-none focus:ring-2 focus:ring-ai-primary"
            disabled={isLoading}
          >
            <option value="growth">Growth - Capital Appreciation</option>
            <option value="income">Income - Dividends & Yield</option>
            <option value="balanced">Balanced - Mixed Approach</option>
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !ticker || ticker?.trim?.()?.length === 0}
          className="w-full bg-ai-primary hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <TrendingUp className="h-5 w-5" />
              <span>Analyze Stock</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
