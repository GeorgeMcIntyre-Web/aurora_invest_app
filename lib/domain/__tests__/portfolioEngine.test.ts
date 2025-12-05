import {
  Portfolio,
  PortfolioHolding,
  calculateAllocation,
  calculatePortfolioBeta,
  calculatePortfolioMetrics,
  detectConcentrationRisk,
  suggestPortfolioAction,
} from '../portfolioEngine';

const createPortfolio = (holdings: PortfolioHolding[]): Portfolio => ({
  id: 'portfolio-1',
  name: 'Test Portfolio',
  holdings,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
});

describe('calculatePortfolioMetrics', () => {
  it('calculates total value and gain/loss correctly', () => {
    const portfolio = createPortfolio([
      { ticker: 'AAPL', shares: 10, averageCostBasis: 150, purchaseDate: '2024-01-01' },
      { ticker: 'MSFT', shares: 5, averageCostBasis: 300, purchaseDate: '2024-01-01' },
    ]);

    const currentPrices = new Map<string, number>([
      ['AAPL', 180],
      ['MSFT', 350],
    ]);

    const metrics = calculatePortfolioMetrics(portfolio, currentPrices);

    expect(metrics.totalValue).toBe(3550);
    expect(metrics.totalCost).toBe(3000);
    expect(metrics.totalGainLoss).toBe(550);
    expect(metrics.totalGainLossPct).toBeCloseTo(18.33, 1);
  });

  it('handles empty portfolios gracefully', () => {
    const portfolio = createPortfolio([]);
    const metrics = calculatePortfolioMetrics(portfolio, new Map());

    expect(metrics.totalValue).toBe(0);
    expect(metrics.totalCost).toBe(0);
    expect(metrics.totalGainLoss).toBe(0);
    expect(metrics.beta).toBe(0);
  });
});

describe('calculateAllocation', () => {
  it('computes allocations and weights', () => {
    const portfolio = createPortfolio([
      { ticker: 'AAPL', shares: 10, averageCostBasis: 150, purchaseDate: '2024-01-01' },
      { ticker: 'MSFT', shares: 5, averageCostBasis: 300, purchaseDate: '2024-01-01' },
    ]);

    const currentPrices = new Map<string, number>([
      ['AAPL', 180],
      ['MSFT', 360],
    ]);

    const allocations = calculateAllocation(portfolio, currentPrices);

    expect(allocations).toHaveLength(2);
    expect(allocations[0]).toMatchObject({ ticker: 'AAPL', value: 1800 });
    const totalWeight = allocations.reduce((sum, allocation) => sum + allocation.weightPct, 0);
    expect(totalWeight).toBeCloseTo(100, 2);
  });
});

describe('calculatePortfolioBeta', () => {
  it('uses weighted beta inputs', () => {
    const holdings: PortfolioHolding[] = [
      { ticker: 'AAPL', shares: 10, averageCostBasis: 150, purchaseDate: '2024-01-01' },
      { ticker: 'MSFT', shares: 5, averageCostBasis: 300, purchaseDate: '2024-01-01' },
    ];

    const betas = new Map<string, number>([
      ['AAPL', 1.1],
      ['MSFT', 0.9],
    ]);

    const prices = new Map<string, number>([
      ['AAPL', 180],
      ['MSFT', 350],
    ]);

    const beta = calculatePortfolioBeta(holdings, betas, prices);
    expect(beta).toBeGreaterThan(0.9);
    expect(beta).toBeLessThan(1.1);
  });
});

describe('detectConcentrationRisk', () => {
  it('flags high concentration positions', () => {
    const risk = detectConcentrationRisk([
      { ticker: 'AAPL', value: 3000, weightPct: 60, gainLoss: 500, gainLossPct: 20 },
      { ticker: 'MSFT', value: 2000, weightPct: 40, gainLoss: 200, gainLossPct: 11 },
    ]);

    expect(risk.level).toBe('high');
    expect(risk.warnings.some((warning) => warning.includes('AAPL'))).toBe(true);
    expect(risk.largestPositions[0].ticker).toBe('AAPL');
  });

  it('classifies diversified portfolios as low risk', () => {
    const allocations = [
      { ticker: 'AAPL', value: 1000, weightPct: 20, gainLoss: 50, gainLossPct: 5 },
      { ticker: 'MSFT', value: 1000, weightPct: 20, gainLoss: 50, gainLossPct: 5 },
      { ticker: 'GOOGL', value: 1000, weightPct: 20, gainLoss: 50, gainLossPct: 5 },
      { ticker: 'NVDA', value: 1000, weightPct: 20, gainLoss: 50, gainLossPct: 5 },
      { ticker: 'TSLA', value: 1000, weightPct: 20, gainLoss: 50, gainLossPct: 5 },
    ];

    const risk = detectConcentrationRisk(allocations);
    expect(risk.level).toBe('low');
    expect(risk.warnings).toHaveLength(0);
  });
});

describe('suggestPortfolioAction', () => {
  it('suggests trimming oversized positions', () => {
    const portfolio = createPortfolio([
      { ticker: 'AAPL', shares: 100, averageCostBasis: 150, purchaseDate: '2024-01-01' },
    ]);

    const suggestion = suggestPortfolioAction('AAPL', portfolio, 32);
    expect(suggestion.action).toBe('trim');
    expect(suggestion.reasoning.some((reason) => reason.includes('diversified'))).toBe(true);
  });

  it('suggests buying when position is missing', () => {
    const portfolio = createPortfolio([
      { ticker: 'MSFT', shares: 5, averageCostBasis: 300, purchaseDate: '2024-01-01' },
    ]);

    const suggestion = suggestPortfolioAction('AAPL', portfolio, 0);
    expect(suggestion.action).toBe('buy');
    expect(suggestion.reasoning[0]).toContain('not currently held');
  });

  it('suggests holding when within guardrails', () => {
    const portfolio = createPortfolio([
      { ticker: 'AAPL', shares: 10, averageCostBasis: 150, purchaseDate: '2024-01-01' },
      { ticker: 'MSFT', shares: 10, averageCostBasis: 300, purchaseDate: '2024-01-01' },
    ]);

    const suggestion = suggestPortfolioAction('AAPL', portfolio, 18);
    expect(suggestion.action).toBe('hold');
  });
});
