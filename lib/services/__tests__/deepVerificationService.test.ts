import { runDeepVerification, parseDeepVerificationResponse } from '../deepVerificationService';

const mockFetch = vi.spyOn(globalThis, 'fetch');

const createResponse = (payload: unknown, status = 200): Response =>
  ({
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(payload),
  }) as Response;

describe('deepVerificationService', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('returns bad_request when ticker is missing', async () => {
    const result = await runDeepVerification({ ticker: '' });
    expect(result.status).toBe('bad_request');
    expect(result.retryable).toBe(false);
  });

  it('parses a successful payload from the API', async () => {
    const payload = {
      status: 'success',
      verdict: 'Framework suggests patient accumulation.',
      confidenceLabel: 'medium',
      confidenceScore: 62,
      reasoning: 'Step-by-step math...',
      analysis: 'Summary paragraph',
      bulletPoints: ['Point A', 'Point B'],
      generatedAt: '2025-12-06T00:00:00.000Z',
    };

    mockFetch.mockResolvedValue(createResponse(payload));

    const result = await runDeepVerification({
      ticker: 'AAPL',
    });

    expect(result.status).toBe('success');
    if (result.status !== 'success') {
      return;
    }
    expect(result.verdict).toContain('Framework');
    expect(result.bulletPoints).toHaveLength(2);
    expect(result.confidenceLabel).toBe('medium');
  });

  it('maps upstream errors into structured responses', async () => {
    const payload = {
      status: 'upstream_error',
      message: 'DeepSeek rejected the prompt',
      detail: 'Rate limit',
    };

    mockFetch.mockResolvedValue(createResponse(payload, 429));

    const result = await runDeepVerification({
      ticker: 'MSFT',
    });

    expect(result.status).toBe('upstream_error');
    expect(result.retryable).toBe(true);
    expect(result.message).toContain('DeepSeek');
  });

  it('builds timeout errors when the fetch never resolves', async () => {
    mockFetch.mockImplementation((_, init) => {
      const signal = init?.signal as AbortSignal | undefined;
      return new Promise((_resolve, reject) => {
        if (!signal) {
          reject(new Error('Missing abort signal'));
          return;
        }
        signal.addEventListener('abort', () => {
          reject(new DOMException('Aborted', 'AbortError'));
        });
      });
    });

    const result = await runDeepVerification(
      { ticker: 'NVDA' },
      { timeoutMs: 1 }
    );

    expect(result.status).toBe('timeout');
    expect(result.retryable).toBe(true);
  });

  it('exposes parser for raw payloads', () => {
    const parsed = parseDeepVerificationResponse({
      status: 'success',
      verdict: 'Clear verdict',
      reasoning: 'Reasoning',
      analysis: 'Analysis',
      confidenceScore: 80,
      bulletPoints: ['One'],
      generatedAt: '2025-12-06T00:00:00.000Z',
    });

    expect(parsed.status).toBe('success');
    if (parsed.status !== 'success') {
      return;
    }
    expect(parsed.confidenceLabel).toBe('high');
  });
});
