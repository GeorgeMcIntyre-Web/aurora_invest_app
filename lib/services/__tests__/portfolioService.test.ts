import { LocalStoragePortfolioService } from '../portfolioService';
import { Portfolio } from '@/lib/domain/portfolioEngine';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => (key in store ? store[key] : null),
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

global.localStorage = localStorageMock as unknown as Storage;

describe('LocalStoragePortfolioService', () => {
  let service: LocalStoragePortfolioService;

  beforeEach(() => {
    localStorageMock.clear();
    service = new LocalStoragePortfolioService();
  });

  const basePortfolio: Portfolio = {
    id: 'portfolio-1',
    name: 'Sample Portfolio',
    holdings: [],
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  it('creates and retrieves portfolios', async () => {
    const created = await service.createPortfolio('My Test Portfolio');
    const retrieved = await service.getPortfolio(created.id);

    expect(retrieved).not.toBeNull();
    expect(retrieved?.name).toBe('My Test Portfolio');
    expect(retrieved?.holdings).toEqual([]);
  });

  it('saves explicit portfolios and lists them', async () => {
    await service.savePortfolio(basePortfolio);
    const portfolios = await service.getAllPortfolios();
    expect(portfolios).toHaveLength(1);
    expect(portfolios[0].name).toBe('Sample Portfolio');
  });

  it('adds or updates holdings via upsertHolding', async () => {
    await service.savePortfolio(basePortfolio);

    const updated = await service.upsertHolding('portfolio-1', {
      ticker: 'AAPL',
      shares: 10,
      averageCostBasis: 150,
      purchaseDate: '2024-01-01',
    });

    expect(updated.holdings).toHaveLength(1);
    expect(updated.holdings[0].ticker).toBe('AAPL');

    const secondUpdate = await service.upsertHolding('portfolio-1', {
      ticker: 'AAPL',
      shares: 12,
      averageCostBasis: 155,
      purchaseDate: '2024-02-01',
    });

    expect(secondUpdate.holdings[0].shares).toBe(12);
    expect(secondUpdate.holdings[0].averageCostBasis).toBe(155);
  });

  it('removes holdings', async () => {
    await service.savePortfolio({
      ...basePortfolio,
      holdings: [
        { ticker: 'AAPL', shares: 10, averageCostBasis: 150, purchaseDate: '2024-01-01' },
        { ticker: 'MSFT', shares: 5, averageCostBasis: 300, purchaseDate: '2024-01-01' },
      ],
    });

    const updated = await service.removeHolding('portfolio-1', 'MSFT');
    expect(updated.holdings).toHaveLength(1);
    expect(updated.holdings[0].ticker).toBe('AAPL');
  });

  it('deletes portfolios', async () => {
    await service.savePortfolio(basePortfolio);
    await service.deletePortfolio('portfolio-1');

    const retrieved = await service.getPortfolio('portfolio-1');
    expect(retrieved).toBeNull();
  });
});
