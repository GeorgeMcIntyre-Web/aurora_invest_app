'use client';

import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

/**
 * Financial term definitions for hover tooltips
 */
const FINANCIAL_DEFINITIONS: Record<string, string> = {
  // Fundamentals
  'trailingPE': 'Trailing P/E (Price-to-Earnings) Ratio: Current stock price divided by earnings per share over the last 12 months. Lower values may indicate undervaluation.',
  'forwardPE': 'Forward P/E Ratio: Current stock price divided by estimated future earnings per share. Reflects market expectations for growth.',
  'epsGrowth': 'EPS Growth (Year-over-Year): Percentage change in earnings per share compared to the same period last year. Higher growth indicates improving profitability.',
  'netMargin': 'Net Margin: Percentage of revenue that becomes profit after all expenses. Higher margins indicate better operational efficiency.',
  'fcfYield': 'Free Cash Flow Yield: Free cash flow per share divided by stock price, expressed as a percentage. Higher yields may indicate better value.',
  'roe': 'Return on Equity (ROE): Net income divided by shareholder equity, showing how efficiently a company uses shareholder capital to generate profits.',
  'debtToEquity': 'Debt-to-Equity Ratio: Total debt divided by shareholder equity. Higher ratios indicate more leverage and potentially higher financial risk.',
  'dividendYield': 'Dividend Yield: Annual dividends per share divided by stock price. Represents the cash return to shareholders as a percentage.',
  'pegRatio': 'PEG Ratio: P/E ratio divided by earnings growth rate. A PEG below 1 may indicate undervaluation relative to growth prospects.',
  
  // Technical Indicators
  'sma20': 'Simple Moving Average (20-day): Average closing price over the last 20 trading days. Often used to identify short-term trends.',
  'sma50': 'Simple Moving Average (50-day): Average closing price over the last 50 trading days. Used to identify intermediate trends.',
  'sma200': 'Simple Moving Average (200-day): Average closing price over the last 200 trading days. Key indicator for long-term trend direction.',
  'rsi': 'Relative Strength Index (RSI): Momentum oscillator measuring speed and magnitude of price changes (0-100). Above 70 suggests overbought, below 30 suggests oversold.',
  '52wHigh': '52-Week High: Highest price the stock traded at during the past year. Helps identify resistance levels and overall trend.',
  '52wLow': '52-Week Low: Lowest price the stock traded at during the past year. Helps identify support levels and buying opportunities.',
  'volume': 'Trading Volume: Number of shares traded in a given period. High volume often confirms price trends and indicates liquidity.',
  'avgVolume': 'Average Volume: Mean number of shares traded daily over a specific period. Used as a baseline to identify unusual trading activity.',
  
  // Risk Metrics
  'riskScore': 'Risk Score (1-10): Composite measure of investment risk considering leverage, volatility, liquidity, and sentiment. Higher scores indicate elevated risk.',
  'convictionScore': 'Conviction Score (0-100%): Model\'s confidence level in the 3-month forecast based on data quality, trend consistency, and market conditions.',
  'leverage': 'Leverage: Measure of financial risk based on debt-to-equity ratio. Higher leverage amplifies both gains and losses.',
  'volatility': 'Volatility: Measure of price fluctuation over time, typically based on 52-week price range. Higher volatility indicates greater uncertainty.',
  'liquidity': 'Liquidity: Measure of how easily shares can be bought or sold without impacting price, based on trading volume relative to average.',
  'sentiment': 'Sentiment: Market psychology indicator combining analyst consensus and news tone. Reflects overall market opinion on the stock.',
  
  // Historical Metrics
  'returns': 'Returns: Percentage gain or loss over a specific time period, including both price appreciation and dividends.',
  'annualizedReturns': 'Annualized Returns: Compound annual growth rate (CAGR) over the selected period, allowing comparison across different timeframes.',
  'trend': 'Trend: Directional bias of price movement over time. Uptrend (higher highs/lows), downtrend (lower highs/lows), or sideways (range-bound).',
  'historicalVolatility': 'Historical Volatility: Standard deviation of price changes over time, annualized. Higher values indicate more unpredictable price swings.',
  
  // Sentiment & Analyst Metrics
  'analystConsensus': 'Analyst Consensus: Aggregated recommendation from professional analysts (Strong Buy, Buy, Hold, Sell, Strong Sell).',
  'priceTarget': 'Price Target: Analysts\' expected stock price over the next 12 months based on fundamental analysis and valuation models.',
  'impliedUpside': 'Implied Upside: Percentage difference between current price and mean analyst price target. Positive values suggest potential appreciation.',
  
  // Valuation
  'valuationScore': 'Valuation Score (0-100): Composite assessment of stock price relative to intrinsic value considering multiple metrics (P/E, FCF yield, PEG).',
  'earningsYield': 'Earnings Yield: Inverse of P/E ratio (E/P), showing earnings as a percentage of price. Compare to bond yields for relative value.',
  
  // Planning Guidance
  'pointEstimate': 'Point Estimate: Probability-weighted expected return over the forecast horizon, considering bull, base, and bear scenarios.',
  'positionSizing': 'Position Sizing: Guidelines for determining appropriate investment amount based on risk tolerance, conviction, and portfolio context.',
};

interface FinancialTooltipProps {
  term: keyof typeof FINANCIAL_DEFINITIONS;
  children: React.ReactNode;
  className?: string;
  iconSize?: 'sm' | 'md';
}

/**
 * Wrapper component that adds a financial term tooltip to any element
 */
export function FinancialTooltip({ term, children, className, iconSize = 'sm' }: FinancialTooltipProps) {
  const definition = FINANCIAL_DEFINITIONS[term];
  
  if (!definition) {
    return <>{children}</>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn('inline-flex items-center gap-1 cursor-help', className)}>
          {children}
          <HelpCircle className={cn(
            'text-ai-muted hover:text-ai-primary transition-colors',
            iconSize === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
          )} />
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-[300px]">
        <p className="text-xs leading-relaxed">{definition}</p>
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * Standalone icon tooltip for use in tight spaces
 */
interface FinancialTooltipIconProps {
  term: keyof typeof FINANCIAL_DEFINITIONS;
  className?: string;
}

export function FinancialTooltipIcon({ term, className }: FinancialTooltipIconProps) {
  const definition = FINANCIAL_DEFINITIONS[term];
  
  if (!definition) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className={cn(
          'h-3.5 w-3.5 text-ai-muted hover:text-ai-primary transition-colors cursor-help',
          className
        )} />
      </TooltipTrigger>
      <TooltipContent className="max-w-[300px]">
        <p className="text-xs leading-relaxed">{definition}</p>
      </TooltipContent>
    </Tooltip>
  );
}
