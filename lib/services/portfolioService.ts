import { Portfolio, PortfolioHolding } from '@/lib/domain/portfolioEngine';

export interface PortfolioService {
  createPortfolio(name: string): Promise<Portfolio>;
  getPortfolio(id: string): Promise<Portfolio | null>;
  getAllPortfolios(): Promise<Portfolio[]>;
  savePortfolio(portfolio: Portfolio): Promise<void>;
  deletePortfolio(id: string): Promise<void>;
  upsertHolding(portfolioId: string, holding: PortfolioHolding): Promise<Portfolio>;
  removeHolding(portfolioId: string, ticker: string): Promise<Portfolio>;
}

const DEFAULT_PORTFOLIO_NAME = 'My Portfolio';

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));

const generateId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `portfolio-${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
};

export class LocalStoragePortfolioService implements PortfolioService {
  private readonly STORAGE_KEY = 'aurora_portfolios';

  private memoryStore: Portfolio[] = [];

  async createPortfolio(name: string): Promise<Portfolio> {
    const now = new Date().toISOString();
    const portfolio: Portfolio = {
      id: generateId(),
      name: name?.trim?.() || DEFAULT_PORTFOLIO_NAME,
      holdings: [],
      createdAt: now,
      updatedAt: now,
    };

    const portfolios = this.readPortfolios();
    portfolios.push(portfolio);
    this.writePortfolios(portfolios);
    return clone(portfolio);
  }

  async getPortfolio(id: string): Promise<Portfolio | null> {
    const portfolios = this.readPortfolios();
    const found = portfolios.find((portfolio) => portfolio.id === id);
    return found ? clone(found) : null;
  }

  async getAllPortfolios(): Promise<Portfolio[]> {
    return clone(this.readPortfolios());
  }

  async savePortfolio(portfolio: Portfolio): Promise<void> {
    const portfolios = this.readPortfolios();
    const next = portfolio.updatedAt
      ? { ...portfolio }
      : { ...portfolio, updatedAt: new Date().toISOString() };

    const index = portfolios.findIndex((item) => item.id === next.id);
    if (index >= 0) {
      portfolios[index] = next;
    } else {
      portfolios.push(next);
    }

    this.writePortfolios(portfolios);
  }

  async deletePortfolio(id: string): Promise<void> {
    const portfolios = this.readPortfolios();
    const filtered = portfolios.filter((portfolio) => portfolio.id !== id);
    this.writePortfolios(filtered);
  }

  async upsertHolding(portfolioId: string, holding: PortfolioHolding): Promise<Portfolio> {
    const portfolios = this.readPortfolios();
    const index = portfolios.findIndex((portfolio) => portfolio.id === portfolioId);

    if (index === -1) {
      throw new Error(`Portfolio not found: ${portfolioId}`);
    }

    const normalizedTicker = holding.ticker.toUpperCase();
    const portfolio = portfolios[index];
    const existingIndex = portfolio.holdings.findIndex(
      (item) => item.ticker.toUpperCase() === normalizedTicker
    );

    let holdings: PortfolioHolding[];
    if (existingIndex >= 0) {
      holdings = [...portfolio.holdings];
      holdings[existingIndex] = { ...portfolio.holdings[existingIndex], ...holding, ticker: normalizedTicker };
    } else {
      holdings = [...portfolio.holdings, { ...holding, ticker: normalizedTicker }];
    }

    const updated: Portfolio = {
      ...portfolio,
      holdings,
      updatedAt: new Date().toISOString(),
    };

    portfolios[index] = updated;
    this.writePortfolios(portfolios);
    return clone(updated);
  }

  async removeHolding(portfolioId: string, ticker: string): Promise<Portfolio> {
    const portfolios = this.readPortfolios();
    const index = portfolios.findIndex((portfolio) => portfolio.id === portfolioId);

    if (index === -1) {
      throw new Error(`Portfolio not found: ${portfolioId}`);
    }

    const normalizedTicker = ticker.toUpperCase();
    const portfolio = portfolios[index];
    const holdings = portfolio.holdings.filter(
      (holding) => holding.ticker.toUpperCase() !== normalizedTicker
    );

    const updated: Portfolio = {
      ...portfolio,
      holdings,
      updatedAt: new Date().toISOString(),
    };

    portfolios[index] = updated;
    this.writePortfolios(portfolios);
    return clone(updated);
  }

  private readPortfolios(): Portfolio[] {
    if (typeof localStorage === 'undefined') {
      return [...this.memoryStore];
    }

    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) {
        return [];
      }
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.warn('[portfolioService] Failed to parse stored portfolios', error);
      return [];
    }
  }

  private writePortfolios(portfolios: Portfolio[]): void {
    if (typeof localStorage === 'undefined') {
      this.memoryStore = [...portfolios];
      return;
    }

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(portfolios));
  }
}

export const portfolioService = new LocalStoragePortfolioService();
