import { describeDeepVerificationStatus } from '../deep-verification-messages';

describe('describeDeepVerificationStatus', () => {
  it('returns idle copy when no result exists', () => {
    const copy = describeDeepVerificationStatus(null);
    expect(copy.tone).toBe('info');
    expect(copy.title).toContain('Deep Math');
  });

  it('returns success copy with verdict text', () => {
    const copy = describeDeepVerificationStatus({
      status: 'success',
      provider: 'deepseek',
      verdict: 'Framework suggests patience.',
      confidenceLabel: 'medium',
      confidenceScore: 60,
      reasoning: 'Reasoning',
      analysis: 'Analysis',
      bulletPoints: [],
      generatedAt: '2025-12-06T00:00:00.000Z',
    });

    expect(copy.tone).toBe('success');
    expect(copy.message).toContain('Framework');
  });

  it('returns cooling-down copy when cooldown flag set', () => {
    const copy = describeDeepVerificationStatus(
      {
        status: 'success',
        provider: 'deepseek',
        verdict: 'All clear.',
        confidenceLabel: 'high',
        confidenceScore: 85,
        reasoning: 'Reasoning',
        analysis: 'Analysis',
        bulletPoints: [],
        generatedAt: '2025-12-06T00:00:00.000Z',
      },
      { isCoolingDown: true }
    );

    expect(copy.title).toContain('Cooling');
  });

  it('maps upstream errors to warning copy', () => {
    const copy = describeDeepVerificationStatus({
      status: 'upstream_error',
      message: 'Rate limit',
      retryable: true,
    });

    expect(copy.tone).toBe('warning');
    expect(copy.title).toContain('DeepSeek');
  });
});
