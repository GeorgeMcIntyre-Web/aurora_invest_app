'use client';

import { MessageSquare, Target, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { StockData } from '@/lib/domain/AnalysisTypes';
import { FinancialTooltip } from './financial-tooltip';
import { TooltipProvider } from '@/components/ui/tooltip';

interface SentimentCardProps {
  stock: StockData;
  sentimentView: string;
}

export function SentimentCard({ stock, sentimentView }: SentimentCardProps) {
  const s = stock?.sentiment;
  const currentPrice = stock?.technicals?.price ?? 0;

  if (!s) {
    return (
      <div className="bg-ai-card border border-gray-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <MessageSquare className="h-5 w-5 text-ai-primary" />
          <h3 className="text-lg font-semibold text-ai-text">Market Sentiment</h3>
        </div>
        <p className="text-ai-muted">No sentiment data available</p>
      </div>
    );
  }

  const consensusMap = {
    strong_buy: { label: 'Strong Buy', color: 'text-ai-accent', icon: TrendingUp },
    buy: { label: 'Buy', color: 'text-blue-400', icon: TrendingUp },
    hold: { label: 'Hold', color: 'text-yellow-500', icon: Minus },
    sell: { label: 'Sell', color: 'text-orange-500', icon: TrendingDown },
    strong_sell: { label: 'Strong Sell', color: 'text-red-600', icon: TrendingDown },
  };

  const consensus = s?.analystConsensus
    ? consensusMap[s.analystConsensus] ?? { label: 'Unknown', color: 'text-ai-muted', icon: Minus }
    : { label: 'No Data', color: 'text-ai-muted', icon: Minus };

  const ConsensusIcon = consensus?.icon;

  // Calculate target upside
  const targetMean = s?.analystTargetMean ?? 0;
  const upside = targetMean > 0 && currentPrice > 0
    ? ((targetMean - currentPrice) / currentPrice) * 100
    : 0;

  return (
    <TooltipProvider>
      <div className="bg-ai-card border border-gray-700 rounded-lg p-6 hover:shadow-xl transition-shadow">
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="h-5 w-5 text-ai-primary" />
          <h3 className="text-lg font-semibold text-ai-text">Market Sentiment</h3>
        </div>

        <div className="space-y-6">
          {/* Sentiment View */}
          <div className="space-y-2">
            <div className="text-sm text-ai-muted">Overview</div>
            <div className="text-sm text-ai-text bg-ai-bg p-3 rounded-lg">{sentimentView}</div>
          </div>

          {/* Analyst Consensus */}
          <div className="bg-ai-bg p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <FinancialTooltip term="analystConsensus">
                <div className="text-sm text-ai-muted">Analyst Consensus</div>
              </FinancialTooltip>
              <ConsensusIcon className={`h-5 w-5 ${consensus?.color}`} />
            </div>
            <div className={`text-2xl font-bold ${consensus?.color}`}>
              {consensus?.label}
            </div>
          </div>

          {/* Price Targets */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-ai-bg p-3 rounded-lg">
              <FinancialTooltip term="priceTarget">
                <div className="text-xs text-ai-muted">Low Target</div>
              </FinancialTooltip>
              <div className="text-lg font-semibold text-ai-text mt-1">
                ${s?.analystTargetLow?.toFixed?.(2) ?? 'N/A'}
              </div>
            </div>
            <div className="bg-ai-bg p-3 rounded-lg border-2 border-ai-primary">
              <FinancialTooltip term="priceTarget">
                <div className="text-xs text-ai-muted">Mean Target</div>
              </FinancialTooltip>
              <div className="text-lg font-semibold text-ai-text mt-1">
                ${s?.analystTargetMean?.toFixed?.(2) ?? 'N/A'}
              </div>
            </div>
            <div className="bg-ai-bg p-3 rounded-lg">
              <FinancialTooltip term="priceTarget">
                <div className="text-xs text-ai-muted">High Target</div>
              </FinancialTooltip>
              <div className="text-lg font-semibold text-ai-text mt-1">
                ${s?.analystTargetHigh?.toFixed?.(2) ?? 'N/A'}
              </div>
            </div>
          </div>

          {/* Upside Potential */}
          {targetMean > 0 && currentPrice > 0 && (
            <div className="bg-ai-bg p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-ai-accent" />
                <FinancialTooltip term="impliedUpside">
                  <div className="text-sm text-ai-muted">Implied Upside to Mean Target</div>
                </FinancialTooltip>
              </div>
              <div className={`text-3xl font-bold ${
                upside > 0 ? 'text-ai-accent' : 'text-red-500'
              }`}>
                {upside > 0 ? '+' : ''}{upside?.toFixed?.(1) ?? '0.0'}%
              </div>
            </div>
          )}

        {/* News Themes */}
        {s?.newsThemes && s?.newsThemes?.length > 0 && (
          <div>
            <div className="text-sm text-ai-muted mb-3">Key News Themes</div>
            <ul className="space-y-2">
              {s.newsThemes.slice(0, 4).map((theme, index) => (
                <li key={index} className="text-sm text-ai-text bg-ai-bg p-3 rounded-lg flex items-start gap-2">
                  <span className="text-ai-accent mt-0.5">•</span>
                  <span>{theme}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        </div>
      </div>
    </TooltipProvider>
  );
}
