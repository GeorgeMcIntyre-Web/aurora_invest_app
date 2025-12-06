import { mapDeepSeekCompletionToResult } from '../deepseekServerHelpers';

describe('mapDeepSeekCompletionToResult', () => {
  it('maps structured payload to AiVerificationResult', () => {
    const result = mapDeepSeekCompletionToResult({
      ticker: 'NVDA',
      structured: {
        summary: 'Summary text',
        reasoningSteps: ['a', 'b'],
        strengths: ['Moat'],
        weaknesses: ['Valuation'],
        riskFlags: ['Volatility'],
        alignmentWithAuroraView: 'aligned',
        confidenceLevel: 'high',
        disclaimers: ['Custom disclaimer'],
        rawProviderLabel: 'DeepSeek',
        rawAnalysis: 'Raw analysis',
      },
      fallbackText: 'Fallback text',
    });

    expect(result.ticker).toBe('NVDA');
    expect(result.reasoningSteps).toHaveLength(2);
    expect(result.strengths).toContain('Moat');
    expect(result.alignmentWithAuroraView).toBe('aligned');
    expect(result.confidenceLevel).toBe('high');
  });

  it('fills in defaults when structured data missing', () => {
    const result = mapDeepSeekCompletionToResult({
      ticker: 'TSLA',
      structured: null,
      fallbackText: 'Fallback narrative',
    });

    expect(result.summary).toBe('Fallback narrative');
    expect(result.reasoningSteps.length).toBeGreaterThan(0);
    expect(result.disclaimers.length).toBeGreaterThan(0);
    expect(result.providerName).toBe('deepseek');
  });
});
