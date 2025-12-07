'use client';

import { useState, useMemo } from 'react';
import { Search, TrendingUp, Zap, Database } from 'lucide-react';
import { UserProfile, RiskTolerance, InvestmentHorizon, InvestmentObjective } from '@/lib/domain/AnalysisTypes';
import { StockSearchInput } from './stock-search-input';
import { InvestmentProfileSelector } from './investment-profile-selector';

interface StockFormProps {
  onAnalyze: (ticker: string, profile: UserProfile) => void;
  isLoading: boolean;
}

// Demo mode tickers (available without API key)
const DEMO_TICKERS = ['AAPL', 'MSFT', 'TSLA', 'GOOGL', 'NVDA'] as const;

// Popular tickers for quick selection (when live data is available)
const POPULAR_TICKERS = [
  { symbol: 'AAPL', name: 'Apple' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'GOOGL', name: 'Alphabet' },
  { symbol: 'AMZN', name: 'Amazon' },
  { symbol: 'NVDA', name: 'NVIDIA' },
  { symbol: 'META', name: 'Meta' },
  { symbol: 'TSLA', name: 'Tesla' },
  { symbol: 'JPM', name: 'JPMorgan' },
  { symbol: 'V', name: 'Visa' },
  { symbol: 'JNJ', name: 'J&J' },
  { symbol: 'WMT', name: 'Walmart' },
  { symbol: 'PG', name: 'P&G' },
] as const;

// Check if we're in live data mode
const getDataMode = (): 'live' | 'demo' => {
  if (typeof window === 'undefined') return 'demo';
  const provider = process.env.NEXT_PUBLIC_MARKET_DATA_PROVIDER?.toLowerCase?.() ?? 'demo';
  const apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY;

  // Live mode when using Yahoo (no key needed) or Alpha Vantage (with key)
  if (provider === 'yahoo') return 'live';
  if (provider === 'alpha_vantage' && apiKey) return 'live';

  return 'demo';
};

export function StockForm({ onAnalyze, isLoading }: StockFormProps) {
  const [ticker, setTicker] = useState('');
  const [useAdvancedSearch, setUseAdvancedSearch] = useState(true);
  const [investmentProfile, setInvestmentProfile] = useState<{
    riskTolerance: RiskTolerance;
    investmentHorizon: '1-3 years' | '5-10 years' | '10+ years';
    investmentObjective: 'growth' | 'income' | 'balanced';
  }>({
    riskTolerance: 'moderate',
    investmentHorizon: '5-10 years',
    investmentObjective: 'growth',
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  const dataMode = useMemo(() => getDataMode(), []);
  const isLiveMode = dataMode === 'live';

  // Map investment profile format to UserProfile format
  const horizonMap: Record<string, InvestmentHorizon> = {
    '1-3 years': '1-3',
    '5-10 years': '5-10',
    '10+ years': '10+',
  };

  const objectiveMap: Record<string, InvestmentObjective> = {
    'growth': 'growth',
    'income': 'income',
    'balanced': 'balanced',
  };
  
  // In demo mode, only show demo tickers; in live mode, show all popular tickers
  const quickSelectTickers = isLiveMode 
    ? POPULAR_TICKERS 
    : POPULAR_TICKERS.filter(t => DEMO_TICKERS.includes(t.symbol as typeof DEMO_TICKERS[number]));

  const handleSubmit = (e: React.FormEvent) => {
    e?.preventDefault?.();
    
    if (!ticker || ticker?.trim?.()?.length === 0) {
      setValidationError('Please enter a stock ticker (e.g., AAPL, MSFT, TSLA).');
      return;
    }

    // In demo mode, validate against available tickers
    const normalizedTicker = ticker.trim().toUpperCase();
    if (!isLiveMode && !DEMO_TICKERS.includes(normalizedTicker as typeof DEMO_TICKERS[number])) {
      setValidationError(`Demo mode only supports: ${DEMO_TICKERS.join(', ')}. Configure Alpha Vantage API for any ticker.`);
      return;
    }

    setValidationError(null);

    onAnalyze?.(normalizedTicker, {
      riskTolerance: investmentProfile.riskTolerance,
      horizon: horizonMap[investmentProfile.investmentHorizon],
      objective: objectiveMap[investmentProfile.investmentObjective],
    });
  };

  const handleQuickSelect = (symbol: string) => {
    setTicker(symbol);
    setValidationError(null);
  };

  return (
    <div className="bg-ai-card rounded-lg shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-6 w-6 text-ai-accent" />
          <h2 className="text-2xl font-bold text-ai-text">Stock Analysis</h2>
        </div>
        {/* Data Mode Indicator */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
          isLiveMode 
            ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
        }`}>
          {isLiveMode ? (
            <>
              <Zap className="h-3 w-3" />
              <span>Live Data</span>
            </>
          ) : (
            <>
              <Database className="h-3 w-3" />
              <span>Demo Mode</span>
            </>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Ticker Input - Toggle between old and new */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-ai-text">
              Stock Ticker
            </label>
            <button
              type="button"
              onClick={() => setUseAdvancedSearch(!useAdvancedSearch)}
              className="text-xs text-ai-accent hover:text-ai-primary transition-colors"
            >
              {useAdvancedSearch ? 'Use Quick Select' : 'Use Advanced Search'}
            </button>
          </div>

          {useAdvancedSearch ? (
            <>
              <StockSearchInput
                value={ticker}
                onChange={setTicker}
                onSelect={(symbol) => {
                  setTicker(symbol);
                  setValidationError(null);
                }}
                placeholder="Search stocks, ETFs, funds..."
                disabled={isLoading}
              />
              <div className="mt-3">
                <p className="text-xs text-ai-muted mb-2">Popular quick select:</p>
                <div className="flex flex-wrap gap-2">
                  {quickSelectTickers.slice(0, 7).map(({ symbol, name }) => (
                    <button
                      key={symbol}
                      type="button"
                      onClick={() => handleQuickSelect(symbol)}
                      disabled={isLoading}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                        ticker === symbol
                          ? 'bg-ai-primary text-white'
                          : 'bg-ai-bg border border-gray-700 text-ai-text hover:border-ai-primary hover:text-ai-primary'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      title={name}
                    >
                      {symbol}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ai-muted" />
                <input
                  type="text"
                  id="ticker"
                  list="ticker-suggestions"
                  value={ticker}
                  onChange={(e) => {
                    setTicker(e?.target?.value ?? '');
                    setValidationError(null);
                  }}
                  placeholder={isLiveMode ? "Enter any ticker (e.g., AAPL, AMZN)" : "Select from available tickers"}
                  className="w-full pl-10 pr-4 py-3 bg-ai-bg border border-gray-700 rounded-lg text-ai-text placeholder-ai-muted focus:outline-none focus:ring-2 focus:ring-ai-primary uppercase"
                  disabled={isLoading}
                  autoComplete="off"
                />
                <datalist id="ticker-suggestions">
                  {POPULAR_TICKERS.map(({ symbol, name }) => (
                    <option key={symbol} value={symbol}>{name}</option>
                  ))}
                </datalist>
              </div>

              <div className="mt-3">
                <p className="text-xs text-ai-muted mb-2">
                  {isLiveMode ? 'Quick select:' : 'Available in demo mode:'}
                </p>
                <div className="flex flex-wrap gap-2">
                  {quickSelectTickers.map(({ symbol, name }) => (
                    <button
                      key={symbol}
                      type="button"
                      onClick={() => handleQuickSelect(symbol)}
                      disabled={isLoading}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                        ticker === symbol
                          ? 'bg-ai-primary text-white'
                          : 'bg-ai-bg border border-gray-700 text-ai-text hover:border-ai-primary hover:text-ai-primary'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      title={name}
                    >
                      {symbol}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {!isLiveMode && (
            <p className="text-xs text-ai-muted mt-3 p-2 bg-ai-bg/50 rounded border border-gray-700/50">
              <strong>Want any ticker?</strong> Set <code className="text-ai-accent">NEXT_PUBLIC_MARKET_DATA_PROVIDER=alpha_vantage</code> and add your API key to enable live data.
            </p>
          )}

          {validationError && (
            <p className="mt-2 text-xs text-red-400">{validationError}</p>
          )}
        </div>

        {/* Investment Profile - New Enhanced Component */}
        <div>
          <h3 className="text-lg font-semibold text-ai-text mb-4">Investment Profile</h3>
          <InvestmentProfileSelector
            value={investmentProfile}
            onChange={setInvestmentProfile}
            disabled={isLoading}
          />
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
