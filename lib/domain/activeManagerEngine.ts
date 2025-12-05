import type {
  AnalysisResult,
  PortfolioContext,
  UserProfile,
} from './AnalysisTypes';

export type ActiveManagerMandateFit = 'core' | 'satellite' | 'opportunistic';
export type ActiveManagerOversightLevel = 'light' | 'standard' | 'heightened';

export interface ActiveManagerRecommendation {
  suitabilityScore: number;
  mandateFit: ActiveManagerMandateFit;
  oversightLevel: ActiveManagerOversightLevel;
  summary: string;
  rationale: string[];
  actionChecklist: string[];
  monitoringFocus: string[];
  messagingCue: string;
  timeHorizonMonths: number;
}

export interface ActiveManagerRecommendationInput {
  analysis: AnalysisResult;
  profile: UserProfile;
  portfolioContext?: PortfolioContext | null;
}

const clamp = (value: number, min: number, max: number): number => {
  if (!Number.isFinite(value)) {
    return min;
  }
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
};

const sanitizeNumber = (
  value: number | undefined,
  fallback: number,
  min: number,
  max: number
): number => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback;
  }
  return clamp(value, min, max);
};

const profileFocus: Record<UserProfile['riskTolerance'], string> = {
  low: 'capital preservation and smoother ride',
  moderate: 'balanced appreciation with defined guardrails',
  high: 'upside capture while tolerating higher swings',
};

const describeRisk = (score: number): string => {
  if (score <= 3) {
    return 'appears muted relative to typical large-cap ranges';
  }
  if (score <= 6) {
    return 'sits in a balanced middle range';
  }
  return 'is elevated and requires closer oversight';
};

const describeConviction = (conviction: number): string => {
  if (conviction >= 60) {
    return 'signals elevated conviction from the analysis stack';
  }
  if (conviction >= 45) {
    return 'indicates a neutral-to-positive stance';
  }
  return 'suggests keeping exposure more tactical';
};

const summarizeParagraph = (paragraph?: string | null, limit = 220): string | null => {
  if (!paragraph) {
    return null;
  }
  const trimmed = paragraph.trim();
  if (trimmed.length <= limit) {
    return trimmed;
  }
  return `${trimmed.slice(0, limit).trim()}…`;
};

const deriveSuitabilityScore = (
  riskScore: number,
  conviction: number,
  pointEstimate: number,
  profile: UserProfile
): number => {
  const riskComponent = 1 - riskScore / 10;
  const convictionComponent = conviction / 100;
  const returnComponent = (pointEstimate + 25) / 50; // Map roughly -25%..+25% into 0..1

  const riskBias =
    profile.riskTolerance === 'low'
      ? 0.9
      : profile.riskTolerance === 'high'
      ? 1.1
      : 1;

  const objectiveBias =
    profile.objective === 'growth'
      ? 1.05
      : profile.objective === 'income'
      ? 0.95
      : 1;

  const blended =
    riskComponent * 0.35 + convictionComponent * 0.4 + returnComponent * 0.25;

  return clamp(blended * 100 * riskBias * objectiveBias, 0, 100);
};

const deriveMandateFit = (score: number): ActiveManagerMandateFit => {
  if (score >= 70) {
    return 'core';
  }
  if (score >= 50) {
    return 'satellite';
  }
  return 'opportunistic';
};

const deriveOversightLevel = (
  riskScore: number,
  profile: UserProfile
): ActiveManagerOversightLevel => {
  if (riskScore >= 7) {
    return 'heightened';
  }
  if (riskScore <= 3 && profile.riskTolerance === 'high') {
    return 'light';
  }
  if (profile.riskTolerance === 'low' && riskScore >= 4) {
    return 'heightened';
  }
  return 'standard';
};

const buildRationale = ({
  analysis,
  riskScore,
  conviction,
  pointEstimate,
  profile,
  portfolioContext,
}: {
  analysis: AnalysisResult;
  riskScore: number;
  conviction: number;
  pointEstimate: number;
  profile: UserProfile;
  portfolioContext?: PortfolioContext | null;
}): string[] => {
  const rationale: string[] = [];
  rationale.push(
    `Risk score of ${riskScore.toFixed(1)}/10 ${describeRisk(riskScore)}.`
  );
  rationale.push(
    `Conviction at ${conviction.toFixed(0)}% ${describeConviction(conviction)}.`
  );
  if (Number.isFinite(pointEstimate)) {
    rationale.push(
      pointEstimate >= 0
        ? `Weighted scenario shows ~+${pointEstimate.toFixed(
            1
          )}% return potential across the modeled horizon.`
        : `Scenario blend highlights a -${Math.abs(pointEstimate).toFixed(
            1
          )}% downside watchpoint.`
    );
  }
  rationale.push(
    `Profile emphasizes ${profileFocus[profile.riskTolerance]} given the stated objectives.`
  );
  const contextNote = portfolioContext?.reasoning?.[0];
  if (contextNote) {
    rationale.push(`Portfolio desk context: ${contextNote}`);
  } else {
    rationale.push(
      'Portfolio context unavailable; treat this insight as standalone guidance until holdings data syncs.'
    );
  }
  if (analysis.planningGuidance?.riskNotes?.length) {
    rationale.push(analysis.planningGuidance.riskNotes[0]);
  }
  return rationale.slice(0, 5);
};

const buildActionChecklist = ({
  mandateFit,
  oversightLevel,
  portfolioContext,
}: {
  mandateFit: ActiveManagerMandateFit;
  oversightLevel: ActiveManagerOversightLevel;
  portfolioContext?: PortfolioContext | null;
}): string[] => {
  const checklist: string[] = [];

  if (mandateFit === 'core') {
    checklist.push(
      'Document tracking-error guardrails before onboarding into a core allocation.'
    );
  } else if (mandateFit === 'satellite') {
    checklist.push(
      'Position this as a tactical sleeve with predefined entry/exit triggers.'
    );
  } else {
    checklist.push(
      'Keep sizing modest and link exposure to clearly defined catalysts.'
    );
  }

  if (oversightLevel === 'heightened') {
    checklist.push('Schedule weekly check-ins on key catalysts and drawdowns.');
  } else if (oversightLevel === 'standard') {
    checklist.push('Fold into the standard bi-weekly manager review cadence.');
  } else {
    checklist.push('Monitor during monthly reviews while the thesis holds.');
  }

  if (portfolioContext?.suggestedAction) {
    checklist.push(
      `Portfolio playbook currently leans “${portfolioContext.suggestedAction}”; align manager briefing accordingly.`
    );
  }

  checklist.push(
    'Reiterate that AuroraInvest outputs are educational frameworks, not personalized investment advice.'
  );

  return checklist.slice(0, 5);
};

const buildMonitoringFocus = ({
  analysis,
  oversightLevel,
}: {
  analysis: AnalysisResult;
  oversightLevel: ActiveManagerOversightLevel;
}): string[] => {
  const focus: string[] = [];

  if (analysis.scenarios?.uncertaintyComment) {
    focus.push(analysis.scenarios.uncertaintyComment);
  }

  const sentimentSummary = summarizeParagraph(analysis.sentimentView);
  if (sentimentSummary) {
    focus.push(`Sentiment watch-list: ${sentimentSummary}`);
  }

  const technicalSummary = summarizeParagraph(analysis.technicalView);
  if (technicalSummary) {
    focus.push(`Technical backdrop: ${technicalSummary}`);
  }

  if (oversightLevel === 'heightened') {
    focus.push('Log catalysts and manager notes weekly until volatility cools.');
  } else {
    focus.push('Refresh catalysts alongside scheduled manager reviews.');
  }

  return focus.slice(0, 4);
};

export function buildActiveManagerRecommendation({
  analysis,
  profile,
  portfolioContext = null,
}: ActiveManagerRecommendationInput): ActiveManagerRecommendation {
  if (!analysis) {
    throw new Error('Analysis result is required to build Active Manager guidance.');
  }
  if (!profile) {
    throw new Error('User profile is required to build Active Manager guidance.');
  }

  const riskScore = sanitizeNumber(analysis.summary?.riskScore, 5, 0, 10);
  const conviction = sanitizeNumber(analysis.summary?.convictionScore3m, 50, 0, 100);
  const pointEstimate = sanitizeNumber(
    analysis.scenarios?.pointEstimateReturnPct,
    0,
    -50,
    50
  );
  const timeHorizonMonths = sanitizeNumber(
    analysis.scenarios?.horizonMonths,
    3,
    1,
    24
  );

  const suitabilityScore = deriveSuitabilityScore(
    riskScore,
    conviction,
    pointEstimate,
    profile
  );
  const mandateFit = deriveMandateFit(suitabilityScore);
  const oversightLevel = deriveOversightLevel(riskScore, profile);

  const rationale = buildRationale({
    analysis,
    riskScore,
    conviction,
    pointEstimate,
    profile,
    portfolioContext,
  });
  const actionChecklist = buildActionChecklist({
    mandateFit,
    oversightLevel,
    portfolioContext,
  });
  const monitoringFocus = buildMonitoringFocus({
    analysis,
    oversightLevel,
  });

  const summary =
    mandateFit === 'core'
      ? 'Conditions support a core-style active manager with clearly defined risk parameters.'
      : mandateFit === 'satellite'
      ? 'Treat this idea as a satellite mandate that complements the existing core.'
      : 'Keep this in an opportunistic sleeve until conviction or risk profile improves.';

  const messagingCue = `Frame guidance as a ${mandateFit} allocation with ${oversightLevel} oversight over the next ${timeHorizonMonths}-month window.`;

  return {
    suitabilityScore: Math.round(suitabilityScore),
    mandateFit,
    oversightLevel,
    summary,
    rationale,
    actionChecklist,
    monitoringFocus,
    messagingCue,
    timeHorizonMonths,
  };
}
