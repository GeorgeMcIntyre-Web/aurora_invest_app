/**
 * Portfolio Feature Contracts
 *
 * This file defines the interface contracts between layers for the Portfolio feature.
 * All agents working on Portfolio must follow these contracts.
 */

import { Portfolio, PortfolioHolding, PortfolioMetrics, PortfolioAllocation, ConcentrationRisk, PortfolioAction } from '@/lib/domain/portfolioEngine';

/**
 * CONTRACT: Domain Layer (lib/domain/portfolioEngine.ts)
 *
 * These are the ONLY functions that portfolioEngine.ts MUST export.
 * Any code importing from portfolioEngine can ONLY use these functions.
 */
export interface PortfolioEngineContract {
  /**
   * Calculate per-position allocations including value, weights, and gains
   */
  calculateAllocation(
    portfolio: Portfolio,
    currentPrices?: Map<string, number>
  ): PortfolioAllocation[];

  /**
   * Calculate the weighted portfolio beta using stock beta inputs
   */
  calculatePortfolioBeta(
    holdings: PortfolioHolding[],
    stockBetas?: Map<string, number>,
    currentPrices?: Map<string, number>
  ): number;

  /**
   * Calculate aggregate portfolio metrics (value, gain/loss, beta, volatility)
   */
  calculatePortfolioMetrics(
    portfolio: Portfolio,
    currentPrices?: Map<string, number>,
    stockBetas?: Map<string, number>
  ): PortfolioMetrics;

  /**
   * Detect concentration risks in a portfolio
   */
  detectConcentrationRisk(
    allocations: PortfolioAllocation[]
  ): ConcentrationRisk;

  /**
   * Provide a portfolio-aware action suggestion for a holding
   */
  suggestPortfolioAction(
    ticker: string,
    portfolio: Portfolio,
    currentWeight: number
  ): { action: PortfolioAction; reasoning: string[] };
}

/**
 * CONTRACT: Service Layer (lib/services/portfolioService.ts)
 *
 * These are the ONLY methods that portfolioService MUST implement.
 * Any code using portfolioService can ONLY call these methods.
 */
export interface PortfolioServiceContract {
  /**
   * Create a new portfolio
   */
  createPortfolio(name: string): Portfolio;

  /**
   * Get portfolio by ID
   */
  getPortfolio(id: string): Portfolio | null;

  /**
   * Get all portfolios
   */
  getAllPortfolios(): Portfolio[];

  /**
   * Save portfolio to storage
   */
  savePortfolio(portfolio: Portfolio): void;

  /**
   * Delete portfolio
   */
  deletePortfolio(id: string): void;

  /**
   * Add or update a holding in a portfolio
   */
  upsertHolding(portfolioId: string, holding: PortfolioHolding): void;

  /**
   * Remove a holding from a portfolio
   */
  removeHolding(portfolioId: string, ticker: string): void;
}

/**
 * USAGE EXAMPLES:
 *
 * ✅ CORRECT (Agent 4 - Orchestration):
 * ```typescript
 * import { calculatePortfolioMetrics } from '@/lib/domain/portfolioEngine';
 * import { portfolioService } from '@/lib/services/portfolioService';
 *
 * const portfolio = portfolioService.getPortfolio('123');
 * const metrics = calculatePortfolioMetrics(portfolio, currentPrices);
 * ```
 *
 * ❌ INCORRECT (calling non-existent functions):
 * ```typescript
 * import { summarizeHolding } from '@/lib/domain/portfolioEngine'; // Does NOT exist in contract!
 * const summary = portfolioService.getOrCreateDefaultPortfolio(); // Does NOT exist in contract!
 * ```
 *
 * RULE: If a function/method is not listed in this contract, you CANNOT use it.
 * If you need it, update the contract first and implement it in the domain/service layer.
 */
