import { DeepVerificationResult } from '@/lib/domain/AnalysisTypes';

export type DeepVerificationBannerTone = 'info' | 'success' | 'warning' | 'danger';

export interface DeepVerificationBannerCopy {
  tone: DeepVerificationBannerTone;
  title: string;
  message: string;
}

const ERROR_COPY: Record<
  Exclude<DeepVerificationResult['status'], 'success'>,
  DeepVerificationBannerCopy
> = {
  config_error: {
    tone: 'danger',
    title: 'Deep Verification Not Configured',
    message:
      'Set the DeepSeek API credentials in Cloudflare Pages before running this check.',
  },
  bad_request: {
    tone: 'warning',
    title: 'Check Your Inputs',
    message: 'Provide a valid ticker and run a fresh Aurora analysis before verifying.',
  },
  upstream_error: {
    tone: 'warning',
    title: 'DeepSeek Returned an Error',
    message:
      'The AI provider rejected this request. Waiting a moment and retrying often resolves the issue.',
  },
  timeout: {
    tone: 'warning',
    title: 'Verification Timed Out',
    message:
      'DeepSeek did not respond before the timeout window. Try again shortly when network conditions are stable.',
  },
  ai_unavailable: {
    tone: 'warning',
    title: 'Deep Verification Is Busy',
    message:
      'The AI endpoint is temporarily unavailable. Aurora will surface the latest analysis once DeepSeek is reachable again.',
  },
};

export const describeDeepVerificationStatus = (
  result: DeepVerificationResult | null,
  options: { isCoolingDown?: boolean } = {}
): DeepVerificationBannerCopy => {
  if (!result) {
    return {
      tone: 'info',
      title: 'Deep Math V2 Verification',
      message:
        'Run the DeepSeek-based verification to audit the Aurora engine output with transparent reasoning.',
    };
  }

  if (result.status === 'success') {
    if (options.isCoolingDown) {
      return {
        tone: 'info',
        title: 'Cooling Down',
        message: 'Deep verification is cooling down to avoid rate limits. Try again in a few seconds.',
      };
    }

    return {
      tone: 'success',
      title: 'Verification Complete',
      message: result.verdict,
    };
  }

  const fallback = {
    tone: 'warning' as DeepVerificationBannerTone,
    title: 'Deep Verification Unavailable',
    message:
      'Aurora could not reach DeepSeek. Verify your configuration and try running the check again.',
  };

  return ERROR_COPY[result.status] ?? fallback;
};
