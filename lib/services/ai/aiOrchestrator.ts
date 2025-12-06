import type {
  AiProviderName,
  AiVerificationRequest,
  AiVerificationResult,
} from '@/lib/domain/AnalysisTypes';
import type { AiProvider } from './aiProviderContracts';
import { DeepSeekProvider } from './DeepSeekProvider';

type ProviderFactory = () => AiProvider;

const providerCache = new Map<AiProviderName, AiProvider>();
const baseFactories: Record<AiProviderName, ProviderFactory> = {
  deepseek: () => new DeepSeekProvider(),
  demo: () => new DemoAiProvider(),
  openai: () => {
    throw new Error('OpenAI provider not yet implemented.');
  },
};

const providerFactories: Partial<Record<AiProviderName, ProviderFactory>> = {
  ...baseFactories,
};

class DemoAiProvider implements AiProvider {
  readonly name = 'demo' as const;

  async verifyAnalysis(request: AiVerificationRequest): Promise<AiVerificationResult> {
    const ticker = request?.ticker?.trim().toUpperCase();
    if (!ticker) {
      throw new Error('Ticker is required for AI verification.');
    }

    const timestampIso = new Date().toISOString();
    return {
      ticker,
      summary: request.analysisSummary ?? 'Demo verification summary.',
      reasoningSteps: [
        'Demo provider does not contact external AI services.',
        'Use this mode for local development without credentials.',
      ],
      strengths: ['Demonstrates UI flow without API calls.'],
      weaknesses: ['No real verification performed.'],
      alignmentWithAuroraView: 'unknown',
      riskFlags: ['Demo mode only'],
      disclaimers: [
        'Educational use only. Connect a real provider for production scenarios.',
      ],
      providerName: 'demo',
      timestampIso,
      confidenceLevel: 'low',
      rawAnalysis: 'Demo provider placeholder output.',
    };
  }
}

export const registerAiProvider = (
  name: AiProviderName,
  factory: ProviderFactory
): void => {
  providerFactories[name] = factory;
  providerCache.delete(name);
};

export const resetAiProviderRegistry = (): void => {
  providerCache.clear();
  Object.keys(providerFactories).forEach((key) => {
    delete providerFactories[key as AiProviderName];
  });
  Object.entries(baseFactories).forEach(([name, factory]) => {
    providerFactories[name as AiProviderName] = factory;
  });
};

const resolveProviderName = (): AiProviderName => {
  const configured = process.env
    .NEXT_PUBLIC_AI_VERIFICATION_PROVIDER as AiProviderName | undefined;
  if (!configured) {
    return 'deepseek';
  }
  if (configured === 'deepseek' || configured === 'openai' || configured === 'demo') {
    return configured;
  }
  throw new Error(`Unsupported AI provider: ${configured}`);
};

const getProvider = (name: AiProviderName): AiProvider => {
  if (providerCache.has(name)) {
    return providerCache.get(name)!;
  }

  const factory = providerFactories[name];
  if (!factory) {
    throw new Error(`Unsupported AI provider: ${name}`);
  }

  const instance = factory();
  providerCache.set(name, instance);
  return instance;
};

export const runAiVerification = async (
  request: AiVerificationRequest
): Promise<AiVerificationResult> => {
  const providerName = resolveProviderName();
  const provider = getProvider(providerName);
  return provider.verifyAnalysis(request);
};
