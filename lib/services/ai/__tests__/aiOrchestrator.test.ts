import type { AiVerificationResult } from '@/lib/domain/AnalysisTypes';
import { runAiVerification, registerAiProvider, resetAiProviderRegistry } from '../aiOrchestrator';

const verifySpy = vi.fn();

vi.mock('../DeepSeekProvider', () => ({
  DeepSeekProvider: class {
    name = 'deepseek' as const;
    verifyAnalysis = verifySpy;
  },
}));

const demoResult: AiVerificationResult = {
  ticker: 'AAPL',
  summary: 'Demo summary',
  reasoningSteps: ['Reasoning'],
  strengths: ['Strength'],
  weaknesses: ['Weakness'],
  alignmentWithAuroraView: 'aligned',
  riskFlags: ['Risk'],
  disclaimers: ['Disclaimer'],
  providerName: 'deepseek',
  timestampIso: new Date().toISOString(),
  confidenceLevel: 'medium',
  rawAnalysis: 'Raw',
};

describe('aiOrchestrator', () => {
  beforeEach(() => {
    resetAiProviderRegistry();
    verifySpy.mockReset();
    delete process.env.NEXT_PUBLIC_AI_VERIFICATION_PROVIDER;
  });

  it('routes to DeepSeek provider by default', async () => {
    verifySpy.mockResolvedValue(demoResult);

    const result = await runAiVerification({ ticker: 'MSFT' });

    expect(verifySpy).toHaveBeenCalledWith({ ticker: 'MSFT' });
    expect(result.summary).toBe('Demo summary');
  });

  it('uses demo provider when configured via env', async () => {
    process.env.NEXT_PUBLIC_AI_VERIFICATION_PROVIDER = 'demo';

    const result = await runAiVerification({ ticker: 'MSFT' });

    expect(result.providerName).toBe('demo');
    expect(verifySpy).not.toHaveBeenCalled();
  });

  it('supports registering custom providers', async () => {
    const customSpy = vi.fn().mockResolvedValue({
      ...demoResult,
      providerName: 'openai',
      ticker: 'TSLA',
    });
    registerAiProvider('openai', () => ({
      name: 'openai' as const,
      verifyAnalysis: customSpy,
    }));
    process.env.NEXT_PUBLIC_AI_VERIFICATION_PROVIDER = 'openai';

    const result = await runAiVerification({ ticker: 'TSLA' });

    expect(customSpy).toHaveBeenCalledWith({ ticker: 'TSLA' });
    expect(result.providerName).toBe('openai');
  });

  it('throws on unsupported provider', async () => {
    process.env.NEXT_PUBLIC_AI_VERIFICATION_PROVIDER = 'invalid' as 'deepseek';

    await expect(runAiVerification({ ticker: 'AAPL' })).rejects.toThrow('Unsupported AI provider');
  });
});
