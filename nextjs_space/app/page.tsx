'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { StockForm } from '@/components/stock-form';
import { AnalysisDashboard } from '@/components/analysis-dashboard';
import { UserProfile, AnalysisResult, StockData } from '@/lib/domain/AnalysisTypes';
import { analyzeStock } from '@/lib/domain/auroraEngine';
import { marketDataService } from '@/lib/services/marketDataService';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [stock, setStock] = useState<StockData | null>(null);

  const handleAnalyze = async (ticker: string, profile: UserProfile) => {
    if (!ticker || !profile) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    setStock(null);

    try {
      // Fetch stock data
      const stockData = await marketDataService?.fetchStockData?.(ticker);
      
      if (!stockData) {
        throw new Error('Failed to fetch stock data');
      }

      // Analyze
      const analysisResult = analyzeStock(profile, stockData);
      
      if (!analysisResult) {
        throw new Error('Analysis failed');
      }

      setStock(stockData);
      setResult(analysisResult);
    } catch (err) {
      const rawMessage = err instanceof Error ? err?.message : 'An unexpected error occurred';

      // Map low-level errors to user-friendly messages where possible
      if (typeof rawMessage === 'string' && rawMessage.includes('Stock data not found')) {
        setError(
          'This ticker is not available in the current demo dataset. Try one of: AAPL, MSFT, TSLA, GOOGL, NVDA.'
        );
      } else if (typeof rawMessage === 'string' && rawMessage.includes('Ticker is required')) {
        setError('Please enter a valid stock ticker to run an analysis.');
      } else {
        setError(rawMessage ?? 'An unexpected error occurred while running the analysis.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ai-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-ai-card/95 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-ai-primary to-ai-accent rounded-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-ai-text">AuroraInvest</h1>
              <p className="text-sm text-ai-muted">Stock Analyzer</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Form */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24">
              <StockForm onAnalyze={handleAnalyze} isLoading={isLoading} />

              {/* Error Display */}
              {error && (
                <div className="mt-6 bg-red-900/20 border border-red-700 rounded-lg p-4">
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="lg:col-span-2">
            {!result && !isLoading && (
              <div className="bg-ai-card border border-gray-700 rounded-lg p-12 text-center">
                <Sparkles className="h-16 w-16 text-ai-muted mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-ai-text mb-2">
                  Ready to Analyze
                </h2>
                <p className="text-ai-muted max-w-md mx-auto">
                  Enter a stock ticker and your investment profile to receive a comprehensive
                  analysis including fundamentals, technicals, sentiment, and scenario projections.
                </p>
              </div>
            )}

            {isLoading && (
              <div className="bg-ai-card border border-gray-700 rounded-lg p-12 text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-ai-primary mx-auto mb-4"></div>
                <h2 className="text-xl font-semibold text-ai-text mb-2">Analyzing...</h2>
                <p className="text-ai-muted">Processing stock data and generating insights</p>
              </div>
            )}

            {result && stock && !isLoading && (
              <AnalysisDashboard result={result} stock={stock} />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 py-8 mt-16 border-t border-gray-700">
        <div className="text-center text-sm text-ai-muted">
          <p className="mb-2">
            AuroraInvest Stock Analyzer • Educational Tool for Investment Analysis
          </p>
          <p className="text-xs">
            Not financial advice • Always consult with a licensed professional
          </p>
        </div>
      </footer>
    </div>
  );
}
