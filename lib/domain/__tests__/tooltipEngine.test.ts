/**
 * Tests for tooltipEngine.ts
 * 
 * Validates that all financial term tooltips are properly defined
 * and that utility functions work correctly.
 */

import {
  getTooltipContent,
  getTooltipsByCategory,
  searchTooltips,
  getAllTerms,
  hasTooltip,
} from '../tooltipEngine';
import type { FinancialTerm, TooltipContent } from '../AnalysisTypes';

describe('tooltipEngine', () => {
  describe('getTooltipContent', () => {
    it('returns complete tooltip content for pe_ratio', () => {
      const tooltip = getTooltipContent('pe_ratio');
      
      expect(tooltip.term).toBe('pe_ratio');
      expect(tooltip.title).toBe('P/E Ratio (Price-to-Earnings)');
      expect(tooltip.definition).toContain('ratio of a company');
      expect(tooltip.interpretation).toContain('may indicate');
      expect(tooltip.formula).toContain('Stock Price');
      expect(tooltip.example).toBeDefined();
      expect(tooltip.category).toBe('valuation');
    });

    it('returns complete tooltip content for rsi', () => {
      const tooltip = getTooltipContent('rsi');
      
      expect(tooltip.term).toBe('rsi');
      expect(tooltip.title).toBe('RSI (Relative Strength Index)');
      expect(tooltip.definition).toContain('momentum indicator');
      expect(tooltip.interpretation).toContain('overbought');
      expect(tooltip.category).toBe('technical');
    });

    it('returns complete tooltip content for eps_growth', () => {
      const tooltip = getTooltipContent('eps_growth');
      
      expect(tooltip.term).toBe('eps_growth');
      expect(tooltip.title).toContain('EPS Growth');
      expect(tooltip.definition).toContain('earnings per share');
      expect(tooltip.category).toBe('growth');
    });

    it('returns complete tooltip content for debt_to_equity', () => {
      const tooltip = getTooltipContent('debt_to_equity');
      
      expect(tooltip.term).toBe('debt_to_equity');
      expect(tooltip.title).toBe('Debt-to-Equity Ratio');
      expect(tooltip.definition).toContain('debt');
      expect(tooltip.category).toBe('liquidity');
    });

    it('throws error for unknown term', () => {
      expect(() => {
        getTooltipContent('invalid_term' as FinancialTerm);
      }).toThrow('Unknown financial term: invalid_term');
    });
  });

  describe('getTooltipsByCategory', () => {
    it('returns all valuation tooltips', () => {
      const tooltips = getTooltipsByCategory('valuation');
      
      expect(tooltips.length).toBeGreaterThan(0);
      expect(tooltips.every(t => t.category === 'valuation')).toBe(true);
      
      const terms = tooltips.map(t => t.term);
      expect(terms).toContain('pe_ratio');
      expect(terms).toContain('peg_ratio');
      expect(terms).toContain('earnings_yield');
    });

    it('returns all technical tooltips', () => {
      const tooltips = getTooltipsByCategory('technical');
      
      expect(tooltips.length).toBeGreaterThan(0);
      expect(tooltips.every(t => t.category === 'technical')).toBe(true);
      
      const terms = tooltips.map(t => t.term);
      expect(terms).toContain('rsi');
      expect(terms).toContain('sma_50');
      expect(terms).toContain('beta');
    });

    it('returns all growth tooltips', () => {
      const tooltips = getTooltipsByCategory('growth');
      
      expect(tooltips.length).toBeGreaterThan(0);
      expect(tooltips.every(t => t.category === 'growth')).toBe(true);
      
      const terms = tooltips.map(t => t.term);
      expect(terms).toContain('eps_growth');
      expect(terms).toContain('revenue_growth');
      expect(terms).toContain('dividend_yield');
    });

    it('returns all profitability tooltips', () => {
      const tooltips = getTooltipsByCategory('profitability');
      
      expect(tooltips.length).toBeGreaterThan(0);
      expect(tooltips.every(t => t.category === 'profitability')).toBe(true);
      
      const terms = tooltips.map(t => t.term);
      expect(terms).toContain('net_margin');
      expect(terms).toContain('roe');
      expect(terms).toContain('roa');
    });

    it('returns all liquidity tooltips', () => {
      const tooltips = getTooltipsByCategory('liquidity');
      
      expect(tooltips.length).toBeGreaterThan(0);
      expect(tooltips.every(t => t.category === 'liquidity')).toBe(true);
      
      const terms = tooltips.map(t => t.term);
      expect(terms).toContain('debt_to_equity');
      expect(terms).toContain('free_cash_flow');
    });

    it('returns all sentiment tooltips', () => {
      const tooltips = getTooltipsByCategory('sentiment');
      
      expect(tooltips.length).toBeGreaterThan(0);
      expect(tooltips.every(t => t.category === 'sentiment')).toBe(true);
      
      const terms = tooltips.map(t => t.term);
      expect(terms).toContain('analyst_consensus');
      expect(terms).toContain('price_target');
    });

    it('returns all portfolio tooltips', () => {
      const tooltips = getTooltipsByCategory('portfolio');
      
      expect(tooltips.length).toBeGreaterThan(0);
      expect(tooltips.every(t => t.category === 'portfolio')).toBe(true);
      
      const terms = tooltips.map(t => t.term);
      expect(terms).toContain('portfolio_allocation');
      expect(terms).toContain('concentration_risk');
    });

    it('returns all scenario tooltips', () => {
      const tooltips = getTooltipsByCategory('scenario');
      
      expect(tooltips.length).toBeGreaterThan(0);
      expect(tooltips.every(t => t.category === 'scenario')).toBe(true);
      
      const terms = tooltips.map(t => t.term);
      expect(terms).toContain('bull_scenario');
      expect(terms).toContain('base_scenario');
      expect(terms).toContain('bear_scenario');
    });
  });

  describe('searchTooltips', () => {
    it('finds tooltips by keyword "earnings"', () => {
      const results = searchTooltips('earnings');
      
      expect(results.length).toBeGreaterThan(0);
      const terms = results.map(t => t.term);
      expect(terms).toContain('pe_ratio');
      expect(terms).toContain('earnings_yield');
      expect(terms).toContain('eps_growth');
    });

    it('finds tooltips by keyword "ratio"', () => {
      const results = searchTooltips('ratio');
      
      expect(results.length).toBeGreaterThan(0);
      const terms = results.map(t => t.term);
      expect(terms).toContain('pe_ratio');
      expect(terms).toContain('peg_ratio');
      expect(terms).toContain('debt_to_equity');
      expect(terms).toContain('current_ratio');
    });

    it('finds tooltips by keyword "cash flow"', () => {
      const results = searchTooltips('cash flow');
      
      expect(results.length).toBeGreaterThan(0);
      const terms = results.map(t => t.term);
      expect(terms).toContain('free_cash_flow');
      expect(terms).toContain('fcf_yield');
    });

    it('finds tooltips by keyword "margin"', () => {
      const results = searchTooltips('margin');
      
      expect(results.length).toBeGreaterThan(0);
      const terms = results.map(t => t.term);
      expect(terms).toContain('net_margin');
      expect(terms).toContain('operating_margin');
    });

    it('finds tooltips by keyword "volatility"', () => {
      const results = searchTooltips('volatility');
      
      expect(results.length).toBeGreaterThan(0);
      const terms = results.map(t => t.term);
      expect(terms).toContain('volatility');
      expect(terms).toContain('beta');
    });

    it('search is case-insensitive', () => {
      const lowerResults = searchTooltips('earnings');
      const upperResults = searchTooltips('EARNINGS');
      const mixedResults = searchTooltips('EaRnInGs');
      
      expect(lowerResults.length).toBe(upperResults.length);
      expect(lowerResults.length).toBe(mixedResults.length);
    });

    it('returns empty array for no matches', () => {
      const results = searchTooltips('zzzzzzzz');
      expect(results).toEqual([]);
    });

    it('searches in definition and interpretation', () => {
      const results = searchTooltips('overbought');
      
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(t => t.term === 'rsi')).toBe(true);
    });
  });

  describe('getAllTerms', () => {
    it('returns all financial terms', () => {
      const terms = getAllTerms();
      
      expect(Array.isArray(terms)).toBe(true);
      expect(terms.length).toBeGreaterThan(40); // We have 44 terms
      expect(terms).toContain('pe_ratio');
      expect(terms).toContain('rsi');
      expect(terms).toContain('eps_growth');
      expect(terms).toContain('debt_to_equity');
    });

    it('all returned terms are valid', () => {
      const terms = getAllTerms();
      
      terms.forEach(term => {
        expect(() => getTooltipContent(term)).not.toThrow();
      });
    });
  });

  describe('hasTooltip', () => {
    it('returns true for valid terms', () => {
      expect(hasTooltip('pe_ratio')).toBe(true);
      expect(hasTooltip('rsi')).toBe(true);
      expect(hasTooltip('eps_growth')).toBe(true);
      expect(hasTooltip('debt_to_equity')).toBe(true);
      expect(hasTooltip('bull_scenario')).toBe(true);
    });

    it('returns false for invalid terms', () => {
      expect(hasTooltip('invalid_term')).toBe(false);
      expect(hasTooltip('random_string')).toBe(false);
      expect(hasTooltip('')).toBe(false);
      expect(hasTooltip('PE_RATIO')).toBe(false); // Case sensitive
    });
  });

  describe('tooltip content quality', () => {
    it('all tooltips have required fields', () => {
      const terms = getAllTerms();
      
      terms.forEach(term => {
        const tooltip = getTooltipContent(term);
        
        expect(tooltip.term).toBe(term);
        expect(tooltip.title).toBeDefined();
        expect(tooltip.title.length).toBeGreaterThan(0);
        expect(tooltip.definition).toBeDefined();
        expect(tooltip.definition.length).toBeGreaterThan(0);
        expect(tooltip.interpretation).toBeDefined();
        expect(tooltip.interpretation.length).toBeGreaterThan(0);
        expect(tooltip.category).toBeDefined();
      });
    });

    it('all tooltips have meaningful content', () => {
      const terms = getAllTerms();
      
      terms.forEach(term => {
        const tooltip = getTooltipContent(term);
        
        // Title should be at least 3 characters (some abbreviations like RSI, ROE, ROA are valid short titles)
        expect(tooltip.title.length).toBeGreaterThanOrEqual(3);
        
        // Definition should be at least 20 characters
        expect(tooltip.definition.length).toBeGreaterThan(20);
        
        // Interpretation should be at least 20 characters
        expect(tooltip.interpretation.length).toBeGreaterThan(20);
      });
    });

    it('valuation tooltips have examples', () => {
      const valuationTooltips = getTooltipsByCategory('valuation');
      
      valuationTooltips.forEach(tooltip => {
        expect(tooltip.example).toBeDefined();
        expect(tooltip.example!.length).toBeGreaterThan(0);
      });
    });

    it('most tooltips have formulas where appropriate', () => {
      const peTooltip = getTooltipContent('pe_ratio');
      expect(peTooltip.formula).toBeDefined();
      expect(peTooltip.formula).toContain('=');
      
      const roeTooltip = getTooltipContent('roe');
      expect(roeTooltip.formula).toBeDefined();
      expect(roeTooltip.formula).toContain('=');
      
      const rsiTooltip = getTooltipContent('rsi');
      expect(rsiTooltip.formula).toBeDefined();
      expect(rsiTooltip.formula).toContain('=');
    });
  });

  describe('category coverage', () => {
    it('has tooltips for all 8 categories', () => {
      const categories: TooltipContent['category'][] = [
        'valuation',
        'growth',
        'profitability',
        'liquidity',
        'technical',
        'sentiment',
        'portfolio',
        'scenario',
      ];
      
      categories.forEach(category => {
        const tooltips = getTooltipsByCategory(category);
        expect(tooltips.length).toBeGreaterThan(0);
      });
    });

    it('has appropriate number of tooltips per category', () => {
      expect(getTooltipsByCategory('valuation').length).toBeGreaterThanOrEqual(5);
      expect(getTooltipsByCategory('technical').length).toBeGreaterThanOrEqual(8);
      expect(getTooltipsByCategory('growth').length).toBeGreaterThanOrEqual(3);
      expect(getTooltipsByCategory('profitability').length).toBeGreaterThanOrEqual(4);
      expect(getTooltipsByCategory('liquidity').length).toBeGreaterThanOrEqual(5);
      expect(getTooltipsByCategory('sentiment').length).toBeGreaterThanOrEqual(4);
      expect(getTooltipsByCategory('portfolio').length).toBeGreaterThanOrEqual(6);
      expect(getTooltipsByCategory('scenario').length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('specific financial terms', () => {
    it('P/E ratio tooltip has correct information', () => {
      const tooltip = getTooltipContent('pe_ratio');
      
      expect(tooltip.title).toContain('P/E');
      expect(tooltip.definition.toLowerCase()).toContain('price');
      expect(tooltip.definition.toLowerCase()).toContain('earnings');
      expect(tooltip.interpretation.toLowerCase()).toContain('valuation');
      expect(tooltip.category).toBe('valuation');
    });

    it('PEG ratio tooltip explains growth adjustment', () => {
      const tooltip = getTooltipContent('peg_ratio');
      
      expect(tooltip.definition.toLowerCase()).toContain('growth');
      expect(tooltip.interpretation).toContain('1');
      expect(tooltip.category).toBe('valuation');
    });

    it('RSI tooltip explains overbought/oversold', () => {
      const tooltip = getTooltipContent('rsi');
      
      expect(tooltip.interpretation.toLowerCase()).toContain('overbought');
      expect(tooltip.interpretation.toLowerCase()).toContain('oversold');
      expect(tooltip.interpretation).toContain('70');
      expect(tooltip.interpretation).toContain('30');
      expect(tooltip.category).toBe('technical');
    });

    it('Debt-to-Equity tooltip explains leverage', () => {
      const tooltip = getTooltipContent('debt_to_equity');
      
      expect(tooltip.definition.toLowerCase()).toContain('debt');
      expect(tooltip.definition.toLowerCase()).toContain('equity');
      expect(tooltip.interpretation.toLowerCase()).toContain('risk');
      expect(tooltip.category).toBe('liquidity');
    });

    it('Beta tooltip explains market correlation', () => {
      const tooltip = getTooltipContent('beta');
      
      expect(tooltip.definition.toLowerCase()).toContain('volatility');
      expect(tooltip.definition.toLowerCase()).toContain('market');
      expect(tooltip.interpretation).toContain('1');
      expect(tooltip.category).toBe('technical');
    });

    it('Free Cash Flow tooltip explains importance', () => {
      const tooltip = getTooltipContent('free_cash_flow');
      
      expect(tooltip.definition.toLowerCase()).toContain('cash');
      expect(tooltip.definition.toLowerCase()).toContain('operations');
      expect(tooltip.definition.toLowerCase()).toContain('capital expenditures');
      expect(tooltip.category).toBe('liquidity');
    });

    it('scenario tooltips explain probabilities', () => {
      const bullTooltip = getTooltipContent('bull_scenario');
      const baseTooltip = getTooltipContent('base_scenario');
      const bearTooltip = getTooltipContent('bear_scenario');
      
      expect(bullTooltip.definition.toLowerCase()).toContain('optimistic');
      expect(baseTooltip.definition.toLowerCase()).toContain('likely');
      expect(bearTooltip.definition.toLowerCase()).toContain('pessimistic');
      
      expect(bullTooltip.category).toBe('scenario');
      expect(baseTooltip.category).toBe('scenario');
      expect(bearTooltip.category).toBe('scenario');
    });
  });
});
