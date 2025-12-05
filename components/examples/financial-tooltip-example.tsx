'use client';

/**
 * Example usage of FinancialTooltip components and hooks
 * 
 * This file demonstrates how to use the financial tooltip primitives
 * for hover-based financial information display.
 */

import { TooltipProvider } from '@/components/ui/tooltip';
import {
  FinancialTooltip,
  MetricTooltip,
  QuickMetricTooltip,
  RiskTooltip,
} from '@/components/ui/financial-tooltip';
import {
  useFinancialTooltip,
  useFinancialMetric,
  useMetricSentiment,
  useMetricTrend,
  useFinancialTooltips,
} from '@/hooks/use-financial-tooltip';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function FinancialTooltipExample() {
  // Example 1: Using the useFinancialMetric hook
  const peRatioMetric = useFinancialMetric('P/E Ratio', 23.5, {
    type: 'ratio',
    description: 'Price-to-earnings ratio indicates how much investors are willing to pay per dollar of earnings.',
    benchmark: 20,
    previousValue: 22.1,
    changeLabel: '1 month',
  });

  // Example 2: Using useFinancialTooltip for state management
  const { metric: dividendMetric } = useFinancialTooltip({
    label: 'Dividend Yield',
    value: 3.25,
    type: 'percentage',
    description: 'Annual dividend payment as a percentage of stock price.',
    sentiment: 'positive',
    benchmark: '2.5%',
  });

  // Example 3: Using useMetricTrend
  const { trend, change } = useMetricTrend(150.25, 145.80);

  // Example 4: Using useMetricSentiment
  const debtSentiment = useMetricSentiment(1.8, 1.0, true); // inverted - lower is better

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Financial Tooltip Examples</CardTitle>
            <CardDescription>
              Hover over the highlighted metrics to see detailed tooltips
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Example 1: FinancialTooltip with full metric object */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-ai-text">Example 1: Full Financial Tooltip</h3>
              <div className="text-ai-muted">
                The{' '}
                <FinancialTooltip metric={peRatioMetric}>
                  <span className="text-ai-accent font-semibold border-b border-dashed border-ai-accent">
                    P/E ratio is {peRatioMetric.value}
                  </span>
                </FinancialTooltip>
                {' '}for this stock.
              </div>
            </div>

            {/* Example 2: MetricTooltip variant */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-ai-text">Example 2: Metric Tooltip Variant</h3>
              <div className="text-ai-muted">
                Current{' '}
                <MetricTooltip
                  label="Revenue Growth"
                  value={15.3}
                  type="percentage"
                  description="Year-over-year revenue growth rate"
                  benchmark={10}
                  sentiment="positive"
                  trend="up"
                  change={2.1}
                  changeLabel="vs Q3"
                >
                  <span className="text-emerald-400 font-semibold border-b border-dashed border-emerald-400">
                    revenue growth is strong
                  </span>
                </MetricTooltip>
                .
              </div>
            </div>

            {/* Example 3: QuickMetricTooltip for simple cases */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-ai-text">Example 3: Quick Metric Tooltip</h3>
              <div className="text-ai-muted">
                The stock has a{' '}
                <QuickMetricTooltip
                  label="Market Cap"
                  value="$1.2B"
                  description="Total market value of all outstanding shares"
                >
                  <span className="text-ai-accent font-semibold border-b border-dashed border-ai-accent">
                    market cap of $1.2B
                  </span>
                </QuickMetricTooltip>
                .
              </div>
            </div>

            {/* Example 4: RiskTooltip */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-ai-text">Example 4: Risk Tooltip</h3>
              <div className="text-ai-muted">
                This investment is classified as{' '}
                <RiskTooltip
                  riskLevel="medium"
                  value={5.5}
                  description="Moderate volatility with balanced risk-reward profile. Suitable for investors with medium risk tolerance."
                >
                  <span className="text-yellow-400 font-semibold border-b border-dashed border-yellow-400">
                    medium risk
                  </span>
                </RiskTooltip>
                .
              </div>
            </div>

            {/* Example 5: Dividend metric with custom state */}
            {dividendMetric && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-ai-text">Example 5: Dividend Yield with State</h3>
                <div className="text-ai-muted">
                  Annual{' '}
                  <FinancialTooltip metric={dividendMetric}>
                    <span className="text-emerald-400 font-semibold border-b border-dashed border-emerald-400">
                      dividend yield of {dividendMetric.value}%
                    </span>
                  </FinancialTooltip>
                  {' '}makes this stock attractive for income investors.
                </div>
              </div>
            )}

            {/* Example 6: Metric grid with tooltips */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-ai-text">Example 6: Metrics Grid</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-ai-bg p-4 rounded-lg">
                  <MetricTooltip
                    label="EPS"
                    value={5.42}
                    type="currency"
                    description="Earnings per share (diluted)"
                    benchmark={5.0}
                    sentiment="positive"
                  >
                    <div className="cursor-help">
                      <div className="text-xs text-ai-muted">EPS</div>
                      <div className="text-xl font-bold text-ai-text">$5.42</div>
                    </div>
                  </MetricTooltip>
                </div>

                <div className="bg-ai-bg p-4 rounded-lg">
                  <MetricTooltip
                    label="Debt-to-Equity"
                    value={1.8}
                    type="ratio"
                    description="Total debt divided by shareholder equity"
                    benchmark={1.0}
                    sentiment={debtSentiment}
                    trend="down"
                  >
                    <div className="cursor-help">
                      <div className="text-xs text-ai-muted">Debt/Equity</div>
                      <div className="text-xl font-bold text-ai-text">1.8x</div>
                    </div>
                  </MetricTooltip>
                </div>

                <div className="bg-ai-bg p-4 rounded-lg">
                  <MetricTooltip
                    label="ROE"
                    value={18.5}
                    type="percentage"
                    description="Return on equity - profitability metric"
                    benchmark={15}
                    sentiment="positive"
                  >
                    <div className="cursor-help">
                      <div className="text-xs text-ai-muted">ROE</div>
                      <div className="text-xl font-bold text-ai-text">18.5%</div>
                    </div>
                  </MetricTooltip>
                </div>

                <div className="bg-ai-bg p-4 rounded-lg">
                  <QuickMetricTooltip
                    label="Volume"
                    value="2.3M"
                    description="Today's trading volume"
                  >
                    <div className="cursor-help">
                      <div className="text-xs text-ai-muted">Volume</div>
                      <div className="text-xl font-bold text-ai-text">2.3M</div>
                    </div>
                  </QuickMetricTooltip>
                </div>
              </div>
            </div>

            {/* Example 7: Trend indicator */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-ai-text">Example 7: Price Trend</h3>
              <div className="text-ai-muted">
                Stock price is{' '}
                <MetricTooltip
                  label="Current Price"
                  value={150.25}
                  type="currency"
                  description="Latest trading price"
                  trend={trend}
                  change={change}
                  changeLabel="1 day"
                  sentiment={trend === 'up' ? 'positive' : 'negative'}
                >
                  <span className={`font-semibold border-b border-dashed ${
                    trend === 'up' ? 'text-emerald-400 border-emerald-400' : 'text-red-400 border-red-400'
                  }`}>
                    ${150.25} ({change && change > 0 ? '+' : ''}{change?.toFixed(2)}%)
                  </span>
                </MetricTooltip>
                .
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage Notes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-ai-muted space-y-2">
            <p>• Wrap your component tree with <code className="text-ai-accent">TooltipProvider</code></p>
            <p>• Use <code className="text-ai-accent">useFinancialMetric</code> hook for computed metrics with sentiment and trends</p>
            <p>• Use <code className="text-ai-accent">FinancialTooltip</code> for full control over metric display</p>
            <p>• Use <code className="text-ai-accent">MetricTooltip</code> for quick inline tooltips with all features</p>
            <p>• Use <code className="text-ai-accent">QuickMetricTooltip</code> for simple tooltips without sentiment</p>
            <p>• Use <code className="text-ai-accent">RiskTooltip</code> for risk-level indicators</p>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
