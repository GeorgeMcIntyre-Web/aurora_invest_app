import type {
  AiProviderName,
  AiVerificationRequest,
  AiVerificationResult,
} from '@/lib/domain/AnalysisTypes';

export interface AiProvider {
  readonly name: AiProviderName;
  verifyAnalysis(request: AiVerificationRequest): Promise<AiVerificationResult>;
}
