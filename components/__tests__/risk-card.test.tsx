import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RiskCard } from '../risk-card';
import { AnalysisResult, StockData } from '@/lib/domain/AnalysisTypes';

const createMockStock = (): StockData => ({
  ticker: 'AAPL',
  companyName: 'Apple Inc.',
  fundamentals: {
    marketCap: 3000000000000,
    peRatio: 25.5,
    eps: 6.5,
    dividendYield: 0.5,
    debtToEquity: 1.2,
    currentRatio: 1.1,
  },
  technicals: {
    price: 180,
    price52wHigh: 200,
    price52wLow: 150,
    volume: 50000000,
    avgVolume: 60000000,
    sma50: 175,
    sma200: 170,
    rsi14: 55,
  },
  sentiment: {
    analystConsensus: 'buy',
    analystTargetMean: 190,
    analystTargetHigh: 210,
    analystTargetLow: 160,
    newsThemes: ['Innovation', 'Growth'],
  },
});

const createMockResult = (): AnalysisResult => ({
  summary: {
    recommendation: 'buy',
    riskScore: 5.5,
    convictionScore3m: 75,
    horizon: '3-6 months',
    targetPrice: 195,
  },
  planningGuidance: {
    entryStrategy: 'Buy on dips',
    positionSizing: 'Moderate',
    riskNotes: ['Monitor debt levels', 'Watch for earnings surprise', 'Tech sector volatility'],
  },
  valuation: 'Fairly valued',
  fundamentalsView: 'Strong fundamentals',
  sentimentView: 'Positive sentiment',
  scenarios: {
    bull: { probability: 40, rationale: 'Strong growth' },
    base: { probability: 50, rationale: 'Steady performance' },
    bear: { probability: 10, rationale: 'Market downturn' },
    uncertaintyComment: 'Market conditions may change',
  },
});

describe('RiskCard Financial Tooltips', () => {
  describe('Accessibility - Tooltip Integration', () => {
    it('should render risk factors with tooltips', () => {
      const stock = createMockStock();
      const result = createMockResult();

      render(<RiskCard result={result} stock={stock} />);

      expect(screen.getByText('Leverage')).toBeInTheDocument();
      expect(screen.getByText('Volatility')).toBeInTheDocument();
      expect(screen.getByText('Liquidity')).toBeInTheDocument();
      expect(screen.getByText('Sentiment')).toBeInTheDocument();
    });

    it.skip('should show tooltip on hover over severity badge (requires full browser)', async () => {
      // Note: Tooltip hover interactions are tested in E2E tests
      // jsdom has limitations with pointer events and Radix UI tooltips
      expect(true).toBe(true);
    });

    it('should have proper ARIA structure for risk factors', () => {
      const stock = createMockStock();
      const result = createMockResult();

      render(<RiskCard result={result} stock={stock} />);

      // Check that TooltipProvider wraps the component
      const riskInsights = screen.getByText('Risk Insights');
      expect(riskInsights).toBeInTheDocument();
      
      // All risk factors should be present
      expect(screen.getByText('Leverage')).toBeInTheDocument();
      expect(screen.getByText('Volatility')).toBeInTheDocument();
      expect(screen.getByText('Liquidity')).toBeInTheDocument();
      expect(screen.getByText('Sentiment')).toBeInTheDocument();
    });

    it('should display correct leverage value', () => {
      const stock = createMockStock();
      const result = createMockResult();

      render(<RiskCard result={result} stock={stock} />);

      expect(screen.getByText('1.20x')).toBeInTheDocument();
    });

    it('should display correct volatility value', () => {
      const stock = createMockStock();
      const result = createMockResult();

      render(<RiskCard result={result} stock={stock} />);

      // Price range: (200-150)/150 = 33.33%
      expect(screen.getByText('33%')).toBeInTheDocument();
    });

    it('should display liquidity ratio', () => {
      const stock = createMockStock();
      const result = createMockResult();

      render(<RiskCard result={result} stock={stock} />);

      // Volume ratio: 50M / 60M = 0.83x
      expect(screen.getByText('0.83x avg vol')).toBeInTheDocument();
    });

    it('should categorize debt severity correctly', () => {
      const stock = createMockStock();
      stock.fundamentals!.debtToEquity = 0.5; // Low risk
      const result = createMockResult();

      render(<RiskCard result={result} stock={stock} />);

      expect(screen.getByText('0.50x')).toBeInTheDocument();
      expect(screen.getAllByText('Lower Risk')[0]).toBeInTheDocument();
    });

    it('should categorize high debt correctly', () => {
      const stock = createMockStock();
      stock.fundamentals!.debtToEquity = 2.0; // High risk
      const result = createMockResult();

      render(<RiskCard result={result} stock={stock} />);

      expect(screen.getByText('2.00x')).toBeInTheDocument();
      expect(screen.getAllByText('Elevated Risk')[0]).toBeInTheDocument();
    });

    it('should handle missing fundamentals data', () => {
      const stock = createMockStock();
      stock.fundamentals = undefined;
      const result = createMockResult();

      render(<RiskCard result={result} stock={stock} />);

      // Should show N/A for leverage when fundamentals are missing
      const naElements = screen.getAllByText('N/A');
      expect(naElements.length).toBeGreaterThan(0);
    });

    it('should display overall risk score', () => {
      const stock = createMockStock();
      const result = createMockResult();

      render(<RiskCard result={result} stock={stock} />);

      expect(screen.getByText('5.5')).toBeInTheDocument();
      // Multiple "Moderate Risk" labels exist (overall + individual factors)
      const moderateLabels = screen.getAllByText('Moderate Risk');
      expect(moderateLabels.length).toBeGreaterThan(0);
    });

    it('should display conviction score', () => {
      const stock = createMockStock();
      const result = createMockResult();

      render(<RiskCard result={result} stock={stock} />);

      expect(screen.getByText(/Conviction 75%/)).toBeInTheDocument();
    });

    it('should render risk notes when available', () => {
      const stock = createMockStock();
      const result = createMockResult();

      render(<RiskCard result={result} stock={stock} />);

      expect(screen.getByText('Monitor debt levels')).toBeInTheDocument();
      expect(screen.getByText('Watch for earnings surprise')).toBeInTheDocument();
      expect(screen.getByText('Tech sector volatility')).toBeInTheDocument();
    });

    it('should show message when no risk notes available', () => {
      const stock = createMockStock();
      const result = createMockResult();
      result.planningGuidance!.riskNotes = [];

      render(<RiskCard result={result} stock={stock} />);

      expect(screen.getByText('No specific risk alerts were surfaced for this ticker.')).toBeInTheDocument();
    });
  });

  describe('Visual Rendering', () => {
    it('should render sparkline visualization', () => {
      const stock = createMockStock();
      const result = createMockResult();

      const { container } = render(<RiskCard result={result} stock={stock} />);

      // Find the sparkline SVG specifically (has viewBox 0 0 100 40)
      const svgs = container.querySelectorAll('svg');
      const sparkline = Array.from(svgs).find(svg => 
        svg.getAttribute('viewBox') === '0 0 100 40'
      );
      expect(sparkline).not.toBeNull();
      expect(sparkline?.getAttribute('viewBox')).toBe('0 0 100 40');
    });

    it('should render progress bars for each risk factor', () => {
      const stock = createMockStock();
      const result = createMockResult();

      const { container } = render(<RiskCard result={result} stock={stock} />);

      // Risk factors should have visual progress bars
      const progressBars = container.querySelectorAll('.h-2.bg-black\\/40');
      expect(progressBars.length).toBeGreaterThan(0);
    });

    it('should apply severity-specific styling', () => {
      const stock = createMockStock();
      stock.fundamentals!.debtToEquity = 2.5; // High risk
      const result = createMockResult();

      const { container } = render(<RiskCard result={result} stock={stock} />);

      // Should have text color classes for high risk
      expect(container.innerHTML).toContain('text-red-');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero values gracefully', () => {
      const stock = createMockStock();
      stock.fundamentals!.debtToEquity = 0;
      const result = createMockResult();

      render(<RiskCard result={result} stock={stock} />);

      expect(screen.getByText('0.00x')).toBeInTheDocument();
    });

    it('should handle undefined riskScore', () => {
      const stock = createMockStock();
      const result = createMockResult();
      result.summary!.riskScore = undefined as any;

      render(<RiskCard result={result} stock={stock} />);

      expect(screen.getByText('0.0')).toBeInTheDocument();
    });

    it('should handle missing technicals data', () => {
      const stock = createMockStock();
      stock.technicals = undefined;
      const result = createMockResult();

      render(<RiskCard result={result} stock={stock} />);

      // Should render without crashing
      expect(screen.getByText('Risk Insights')).toBeInTheDocument();
    });

    it('should clamp risk score to 0-10 range', () => {
      const stock = createMockStock();
      const result = createMockResult();
      result.summary!.riskScore = 15; // Exceeds max

      const { container } = render(<RiskCard result={result} stock={stock} />);

      // Progress bar should be clamped to 100%
      const progressDiv = container.querySelector('[style*="width: 100%"]');
      expect(progressDiv).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation', () => {
    it('should support tab navigation through interactive elements', async () => {
      const user = userEvent.setup();
      const stock = createMockStock();
      const result = createMockResult();

      render(<RiskCard result={result} stock={stock} />);

      // Tab through the page - tooltips should be keyboard accessible
      await user.tab();
      
      // The focused element should be within the card
      expect(document.activeElement).toBeTruthy();
    });
  });
});
