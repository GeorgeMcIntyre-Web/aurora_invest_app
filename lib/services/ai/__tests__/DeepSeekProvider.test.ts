import { DeepSeekProvider, mapDeepSeekResponseToAiVerificationResult } from '../DeepSeekProvider';

describe('mapDeepSeekResponseToAiVerificationResult', () => {
  it('normalizes fields and preserves arrays', () => {
    const result = mapDeepSeekResponseToAiVerificationResult(
      {
        ticker: 'MSFT',
        summary: 'Aligned with Aurora view.',
        reasoningSteps: ['Step 1', 'Step 2'],
        strengths: ['Strong cash generation'],
        weaknesses: ['Valuation premium'],
        alignmentWithAuroraView: 'aligned',
        riskFlags: ['Macro'],
        disclaimers: ['Demo disclaimer'],
        providerName: 'deepseek',
        rawProviderLabel: 'DeepSeek v2',
        timestampIso: '2024-01-01T00:00:00.000Z',
        confidenceLevel: 'high',
        rawAnalysis: 'Raw content',
      },
      'MSFT'
    );

    expect(result.ticker).toBe('MSFT');
    expect(result.summary).toBe('Aligned with Aurora view.');
    expect(result.reasoningSteps).toHaveLength(2);
    expect(result.strengths).toContain('Strong cash generation');
    expect(result.confidenceLevel).toBe('high');
    expect(result.rawAnalysis).toBe('Raw content');
  });

  it('falls back gracefully when payload is partial', () => {
    const result = mapDeepSeekResponseToAiVerificationResult({}, 'AAPL');

    expect(result.ticker).toBe('AAPL');
    expect(result.summary.length).toBeGreaterThan(0);
    expect(result.reasoningSteps.length).toBeGreaterThan(0);
    expect(result.providerName).toBe('deepseek');
  });
});

describe('DeepSeekProvider', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    globalThis.fetch = originalFetch;
  });

  it('throws when ticker is missing', async () => {
    const provider = new DeepSeekProvider();
    await expect(
      provider.verifyAnalysis({
        // @ts-expect-error Testing guard clause
        ticker: '',
      })
    ).rejects.toThrow('Ticker is required for AI verification.');
  });

  it('calls configured endpoint and returns mapped result', async () => {
    const mockPayload = {
      summary: 'Demo summary',
      reasoningSteps: ['First', 'Second'],
    };
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockPayload),
    });

    const provider = new DeepSeekProvider();
    const result = await provider.verifyAnalysis({ ticker: 'AAPL' });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result.ticker).toBe('AAPL');
    expect(result.summary).toBe('Demo summary');
  });
});
