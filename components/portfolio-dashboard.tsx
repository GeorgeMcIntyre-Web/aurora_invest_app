'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, LineChart, PlusCircle, Wallet } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import {
  Portfolio,
  PortfolioAllocation,
  PortfolioMetrics,
  calculateAllocation,
  calculatePortfolioMetrics,
  detectConcentrationRisk,
} from '@/lib/domain/portfolioEngine';
import { portfolioService } from '@/lib/services/portfolioService';
import { marketDataService } from '@/lib/services/marketDataService';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { cn } from '@/lib/utils';

interface HoldingFormState {
  ticker: string;
  shares: string;
  costBasis: string;
  purchaseDate: string;
}

const EMPTY_METRICS: PortfolioMetrics = {
  totalValue: 0,
  totalCost: 0,
  totalGainLoss: 0,
  totalGainLossPct: 0,
  beta: 0,
  volatility: 0,
};

export function PortfolioDashboard() {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [metrics, setMetrics] = useState<PortfolioMetrics>(EMPTY_METRICS);
  const [allocations, setAllocations] = useState<PortfolioAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formState, setFormState] = useState<HoldingFormState>({
    ticker: '',
    shares: '',
    costBasis: '',
    purchaseDate: new Date().toISOString().split('T')[0],
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function ensurePortfolio() {
      setLoading(true);
      const existing = await portfolioService.getAllPortfolios();
      if (existing.length > 0) {
        setPortfolio(existing[0]);
        setLoading(false);
        return;
      }
      const created = await portfolioService.createPortfolio('My Portfolio');
      setPortfolio(created);
      setLoading(false);
    }

    ensurePortfolio();
  }, []);

  useEffect(() => {
    async function hydrateMetrics(target: Portfolio | null) {
      if (!target) {
        setMetrics(EMPTY_METRICS);
        setAllocations([]);
        return;
      }

      if (!target.holdings.length) {
        setMetrics(EMPTY_METRICS);
        setAllocations([]);
        return;
      }

      setLoading(true);
      try {
        const entries = await Promise.all(
          target.holdings.map(async (holding) => {
            const ticker = holding.ticker.toUpperCase();
            try {
              const stock = await marketDataService.fetchStockData(ticker);
              const price = stock?.technicals?.price ?? holding.averageCostBasis;
              return [ticker, price] as const;
            } catch (fetchError) {
              console.warn('[portfolio-dashboard] price lookup failed', fetchError);
              return [ticker, holding.averageCostBasis] as const;
            }
          })
        );

        const priceMap = new Map(entries);
        setAllocations(calculateAllocation(target, priceMap));
        setMetrics(calculatePortfolioMetrics(target, priceMap));
      } finally {
        setLoading(false);
      }
    }

    hydrateMetrics(portfolio);
  }, [portfolio]);

  const concentration = useMemo(() => detectConcentrationRisk(allocations), [allocations]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(value);

  const formatPercent = (value: number) => `${value.toFixed(2)}%`;

  const handleFormChange = (field: keyof HoldingFormState, value: string) => {
    setFormState((state) => ({ ...state, [field]: value }));
  };

  const handleAddHolding = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!portfolio) {
      return;
    }

    const ticker = formState.ticker.trim().toUpperCase();
    const shares = Number(formState.shares);
    const costBasis = Number(formState.costBasis);
    const purchaseDate = formState.purchaseDate || new Date().toISOString().split('T')[0];

    if (!ticker || Number.isNaN(shares) || shares <= 0 || Number.isNaN(costBasis) || costBasis <= 0) {
      setError('Please provide a valid ticker, share count, and cost basis.');
      return;
    }

    setSaving(true);
    try {
      const updated = await portfolioService.upsertHolding(portfolio.id, {
        ticker,
        shares,
        averageCostBasis: costBasis,
        purchaseDate,
      });
      setPortfolio(updated);
      setFormState({ ticker: '', shares: '', costBasis: '', purchaseDate });
    } catch (serviceError) {
      setError(serviceError instanceof Error ? serviceError.message : 'Unable to save holding.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveHolding = async (ticker: string) => {
    if (!portfolio) {
      return;
    }

    try {
      const updated = await portfolioService.removeHolding(portfolio.id, ticker);
      setPortfolio(updated);
    } catch (serviceError) {
      setError(serviceError instanceof Error ? serviceError.message : 'Unable to remove holding.');
    }
  };

  const holdingsEmpty = !portfolio?.holdings.length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold text-ai-text flex items-center gap-2">
          <Wallet className="h-5 w-5 text-ai-accent" />
          {portfolio?.name ?? 'Portfolio'}
        </h2>
        <p className="text-sm text-ai-muted">
          Track holdings, monitor performance, and surface concentration risks in one view.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Overview</CardTitle>
            <CardDescription>Totals based on latest available pricing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-gray-800 p-4">
                <div className="text-xs uppercase text-ai-muted">Total Value</div>
                <div className="text-3xl font-semibold text-ai-text">{formatCurrency(metrics.totalValue)}</div>
              </div>
              <div className="rounded-lg border border-gray-800 p-4">
                <div className="text-xs uppercase text-ai-muted">Total Cost Basis</div>
                <div className="text-3xl font-semibold text-ai-text">{formatCurrency(metrics.totalCost)}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-gray-800 p-4">
                <div className="text-xs uppercase text-ai-muted">Unrealized Gain</div>
                <div
                  className={cn(
                    'text-3xl font-semibold',
                    metrics.totalGainLoss >= 0 ? 'text-emerald-400' : 'text-red-400'
                  )}
                >
                  {formatCurrency(metrics.totalGainLoss)}
                </div>
                <p className="text-xs text-ai-muted">{formatPercent(metrics.totalGainLossPct)}</p>
              </div>
              <div className="rounded-lg border border-gray-800 p-4">
                <div className="text-xs uppercase text-ai-muted">Beta / Volatility</div>
                <div className="text-3xl font-semibold text-ai-text flex gap-2 items-baseline">
                  <span>{metrics.beta.toFixed(2)}</span>
                  <span className="text-sm text-ai-muted">β</span>
                </div>
                <p className="text-xs text-ai-muted">Volatility: {formatPercent(metrics.volatility)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Risk Metrics</CardTitle>
            <CardDescription>Top positions and concentration warnings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-ai-muted">
              <LineChart className="h-4 w-4 text-ai-accent" />
              Diversification level: <span className="font-semibold text-ai-text">{concentration.level.toUpperCase()}</span>
            </div>
            {concentration.largestPositions.length > 0 ? (
              <div>
                <p className="text-xs uppercase text-ai-muted mb-2">Largest Positions</p>
                <ul className="text-sm space-y-1">
                  {concentration.largestPositions.map((position) => (
                    <li key={position.ticker} className="flex justify-between text-ai-text">
                      <span>{position.ticker}</span>
                      <span>{formatPercent(position.weightPct)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-sm text-ai-muted">Add holdings to surface position sizing insights.</p>
            )}
            {concentration.warnings.length > 0 && (
              <div className="rounded-lg border border-yellow-700 bg-yellow-950/50 p-4 text-sm text-yellow-200 flex gap-2">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                <ul className="space-y-1">
                  {concentration.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Holdings</CardTitle>
          <CardDescription>Tracked positions with current mark-to-market values</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="rounded-md border border-red-600 bg-red-950/40 p-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {holdingsEmpty ? (
            <div className="text-sm text-ai-muted">
              No holdings yet. Use the form below to add your first position.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticker</TableHead>
                  <TableHead>Shares</TableHead>
                  <TableHead>Avg Cost</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Gain / Loss</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allocations.map((allocation) => {
                  const holding = portfolio?.holdings.find(
                    (item) => item.ticker.toUpperCase() === allocation.ticker
                  );
                  return (
                    <TableRow key={allocation.ticker}>
                      <TableCell className="font-semibold">{allocation.ticker}</TableCell>
                      <TableCell>{holding?.shares ?? '—'}</TableCell>
                      <TableCell>{formatCurrency((holding?.averageCostBasis ?? 0) * (holding?.shares ?? 0))}</TableCell>
                      <TableCell>{formatCurrency(allocation.value)}</TableCell>
                      <TableCell
                        className={cn(
                          allocation.gainLoss >= 0 ? 'text-emerald-400' : 'text-red-400'
                        )}
                      >
                        {formatCurrency(allocation.gainLoss)} ({formatPercent(allocation.gainLossPct)})
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveHolding(allocation.ticker)}
                        >
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              <TableCaption>Weights automatically update as market prices change.</TableCaption>
            </Table>
          )}

          <Separator />

          <form onSubmit={handleAddHolding} className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="ticker">Ticker</Label>
              <Input
                id="ticker"
                placeholder="AAPL"
                value={formState.ticker}
                onChange={(event) => handleFormChange('ticker', event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shares">Shares</Label>
              <Input
                id="shares"
                type="number"
                min="0"
                step="0.01"
                value={formState.shares}
                onChange={(event) => handleFormChange('shares', event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="costBasis">Avg Cost</Label>
              <Input
                id="costBasis"
                type="number"
                min="0"
                step="0.01"
                value={formState.costBasis}
                onChange={(event) => handleFormChange('costBasis', event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchaseDate">Purchase Date</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={formState.purchaseDate}
                onChange={(event) => handleFormChange('purchaseDate', event.target.value)}
              />
            </div>
            <div className="md:col-span-4 flex justify-end">
              <Button type="submit" disabled={saving} className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                {saving ? 'Saving...' : 'Add Holding'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {loading && (
        <p className="text-sm text-ai-muted">Loading latest portfolio data…</p>
      )}
    </div>
  );
}
