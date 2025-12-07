/**
 * MEGA PROMPT FOR COMPREHENSIVE STOCK ANALYSIS
 *
 * This module contains the comprehensive prompt template for AI-powered
 * stock analysis. It provides extensive context, structured reasoning,
 * and multi-dimensional evaluation framework.
 *
 * Usage: Import and call buildMegaPrompt() with analysis data
 */

interface MegaPromptInput {
  ticker: string;
  companyName?: string;
  sector?: string;
  industry?: string;

  // Fundamentals
  fundamentals: {
    trailingPE?: number;
    forwardPE?: number;
    dividendYieldPct?: number;
    revenueGrowthYoYPct?: number;
    epsGrowthYoYPct?: number;
    netMarginPct?: number;
    freeCashFlowYieldPct?: number;
    debtToEquity?: number;
    roe?: number;
  };

  // Technicals
  technicals: {
    price: number;
    price52wHigh?: number;
    price52wLow?: number;
    sma20?: number;
    sma50?: number;
    sma200?: number;
    rsi14?: number;
    volume?: number;
    avgVolume?: number;
  };

  // Sentiment
  sentiment?: {
    analystConsensus?: string;
    analystTargetMean?: number;
    analystTargetHigh?: number;
    analystTargetLow?: number;
  };

  // Aurora Engine Analysis Summary
  analysisSummary?: {
    headlineView?: string;
    riskScore?: number;
    convictionScore3m?: number;
    keyTakeaways?: string[];
    fundamentalsView?: string;
    valuationView?: string;
    technicalView?: string;
    sentimentView?: string;
  };

  // User Profile
  userProfile?: {
    riskTolerance: 'low' | 'moderate' | 'high';
    investmentHorizon: '1-3 years' | '5-10 years' | '10+ years';
    investmentObjective: 'growth' | 'income' | 'balanced';
  };

  // Market Context (optional)
  marketContext?: {
    spyPrice?: number;
    spyChange?: number;
    vixLevel?: number;
    economicPhase?: string;
  };
}

export function buildMegaPrompt(input: MegaPromptInput): string {
  const {
    ticker,
    companyName,
    sector,
    industry,
    fundamentals,
    technicals,
    sentiment,
    analysisSummary,
    userProfile,
    marketContext,
  } = input;

  return `
# 🔬 COMPREHENSIVE INVESTMENT ANALYSIS REQUEST

You are AuroraInvest AI, an expert quantitative analyst and investment strategist. Your role is to provide **deep, transparent, and actionable analysis** of investment opportunities using a multi-dimensional framework.

---

## 📊 ANALYSIS TARGET

**Ticker:** ${ticker}
**Company:** ${companyName || ticker}
${sector ? `**Sector:** ${sector}` : ''}
${industry ? `**Industry:** ${industry}` : ''}
**Current Price:** $${technicals.price.toFixed(2)}

---

## 💼 INVESTOR PROFILE

${userProfile ? `
**Risk Tolerance:** ${userProfile.riskTolerance === 'low' ? 'Conservative (Low Risk)' : userProfile.riskTolerance === 'moderate' ? 'Moderate (Balanced)' : 'Aggressive (High Risk)'}
**Investment Horizon:** ${userProfile.investmentHorizon}
**Primary Objective:** ${userProfile.investmentObjective === 'growth' ? 'Capital Appreciation / Growth' : userProfile.investmentObjective === 'income' ? 'Income Generation / Dividends' : 'Balanced Growth & Income'}

**Interpretation:**
- Risk tolerance determines position sizing and acceptable volatility
- Time horizon affects whether to focus on near-term catalysts vs. long-term compounding
- Objective guides weighting of growth metrics vs. dividend yield vs. stability
` : 'No user profile provided - use balanced assumptions'}

---

## 🧮 FUNDAMENTAL DATA

### Financial Metrics
${fundamentals.trailingPE ? `- **Trailing P/E:** ${fundamentals.trailingPE.toFixed(2)}` : ''}
${fundamentals.forwardPE ? `- **Forward P/E:** ${fundamentals.forwardPE.toFixed(2)}` : ''}
${fundamentals.dividendYieldPct ? `- **Dividend Yield:** ${fundamentals.dividendYieldPct.toFixed(2)}%` : ''}
${fundamentals.revenueGrowthYoYPct ? `- **Revenue Growth (YoY):** ${fundamentals.revenueGrowthYoYPct.toFixed(2)}%` : ''}
${fundamentals.epsGrowthYoYPct ? `- **EPS Growth (YoY):** ${fundamentals.epsGrowthYoYPct.toFixed(2)}%` : ''}
${fundamentals.netMarginPct ? `- **Net Profit Margin:** ${fundamentals.netMarginPct.toFixed(2)}%` : ''}
${fundamentals.freeCashFlowYieldPct ? `- **Free Cash Flow Yield:** ${fundamentals.freeCashFlowYieldPct.toFixed(2)}%` : ''}
${fundamentals.debtToEquity ? `- **Debt-to-Equity:** ${fundamentals.debtToEquity.toFixed(2)}` : ''}
${fundamentals.roe ? `- **Return on Equity (ROE):** ${fundamentals.roe.toFixed(2)}%` : ''}

### Quality Assessment Framework
Evaluate business quality using:
1. **Profitability:** Net margin, ROE, FCF generation
2. **Growth:** Revenue and earnings trajectory, sustainability
3. **Financial Health:** Leverage, liquidity, capital efficiency
4. **Moat:** Competitive advantages, pricing power, market position

---

## 📈 TECHNICAL DATA

### Price Action
- **Current Price:** $${technicals.price.toFixed(2)}
${technicals.price52wHigh ? `- **52-Week High:** $${technicals.price52wHigh.toFixed(2)} (${((technicals.price / technicals.price52wHigh - 1) * 100).toFixed(1)}% from high)` : ''}
${technicals.price52wLow ? `- **52-Week Low:** $${technicals.price52wLow.toFixed(2)} (${((technicals.price / technicals.price52wLow - 1) * 100).toFixed(1)}% from low)` : ''}

### Moving Averages
${technicals.sma20 ? `- **20-Day SMA:** $${technicals.sma20.toFixed(2)} - Price is ${technicals.price > technicals.sma20 ? 'ABOVE' : 'BELOW'} (${((technicals.price / technicals.sma20 - 1) * 100).toFixed(1)}%)` : ''}
${technicals.sma50 ? `- **50-Day SMA:** $${technicals.sma50.toFixed(2)} - Price is ${technicals.price > technicals.sma50 ? 'ABOVE' : 'BELOW'} (${((technicals.price / technicals.sma50 - 1) * 100).toFixed(1)}%)` : ''}
${technicals.sma200 ? `- **200-Day SMA:** $${technicals.sma200.toFixed(2)} - Price is ${technicals.price > technicals.sma200 ? 'ABOVE' : 'BELOW'} (${((technicals.price / technicals.sma200 - 1) * 100).toFixed(1)}%)` : ''}

### Momentum Indicators
${technicals.rsi14 ? `- **RSI (14):** ${technicals.rsi14.toFixed(1)} - ${technicals.rsi14 > 70 ? 'OVERBOUGHT' : technicals.rsi14 < 30 ? 'OVERSOLD' : 'NEUTRAL'}` : ''}
${technicals.volume && technicals.avgVolume ? `- **Volume:** ${technicals.volume.toLocaleString()} (${((technicals.volume / technicals.avgVolume - 1) * 100).toFixed(1)}% vs avg)` : ''}

### Technical Interpretation
Assess:
- **Trend:** Uptrend, downtrend, or consolidation based on MA alignment
- **Momentum:** Strength or weakness based on RSI and price-MA relationships
- **Support/Resistance:** Key levels from 52w range and moving averages
- **Entry Timing:** Whether current levels represent good risk/reward

---

## 🎯 ANALYST SENTIMENT

${sentiment?.analystConsensus ? `**Consensus:** ${sentiment.analystConsensus}` : 'No analyst data available'}
${sentiment?.analystTargetMean ? `**Mean Price Target:** $${sentiment.analystTargetMean.toFixed(2)} (${((sentiment.analystTargetMean / technicals.price - 1) * 100).toFixed(1)}% upside)` : ''}
${sentiment?.analystTargetHigh ? `**High Target:** $${sentiment.analystTargetHigh.toFixed(2)}` : ''}
${sentiment?.analystTargetLow ? `**Low Target:** $${sentiment.analystTargetLow.toFixed(2)}` : ''}

---

## 🤖 AURORA ENGINE PRELIMINARY ANALYSIS

${analysisSummary?.headlineView ? `**Headline:** ${analysisSummary.headlineView}` : ''}
${analysisSummary?.riskScore ? `**Risk Score:** ${analysisSummary.riskScore}/10` : ''}
${analysisSummary?.convictionScore3m ? `**3-Month Conviction:** ${analysisSummary.convictionScore3m}/100` : ''}

${analysisSummary?.keyTakeaways && analysisSummary.keyTakeaways.length > 0 ? `
**Key Takeaways:**
${analysisSummary.keyTakeaways.map(t => `- ${t}`).join('\n')}
` : ''}

${analysisSummary?.fundamentalsView ? `**Fundamentals View:** ${analysisSummary.fundamentalsView}` : ''}
${analysisSummary?.valuationView ? `**Valuation View:** ${analysisSummary.valuationView}` : ''}
${analysisSummary?.technicalView ? `**Technical View:** ${analysisSummary.technicalView}` : ''}
${analysisSummary?.sentimentView ? `**Sentiment View:** ${analysisSummary.sentimentView}` : ''}

---

${marketContext ? `
## 🌍 MARKET CONTEXT

${marketContext.spyPrice ? `**S&P 500 (SPY):** $${marketContext.spyPrice.toFixed(2)} ${marketContext.spyChange ? `(${marketContext.spyChange > 0 ? '+' : ''}${marketContext.spyChange.toFixed(2)}%)` : ''}` : ''}
${marketContext.vixLevel ? `**VIX (Volatility Index):** ${marketContext.vixLevel.toFixed(2)} - ${marketContext.vixLevel > 30 ? 'HIGH FEAR' : marketContext.vixLevel > 20 ? 'ELEVATED' : 'LOW FEAR'}` : ''}
${marketContext.economicPhase ? `**Economic Phase:** ${marketContext.economicPhase}` : ''}

Consider how macro conditions affect this specific opportunity.
` : ''}

---

## 🎓 YOUR ANALYTICAL FRAMEWORK

Please provide a **comprehensive, transparent, and actionable analysis** following this structure:

### 1. EXECUTIVE SUMMARY (2-3 sentences)
Synthesize your overall investment thesis. Is this a BUY, HOLD, or AVOID? What's the core rationale in plain language?

### 2. DEEP FUNDAMENTAL ANALYSIS
- **Business Quality Score (0-100):** Assess profitability, growth sustainability, competitive moat
- **Valuation Analysis:**
  - Is the P/E ratio justified by growth? Calculate PEG ratio if possible
  - Compare multiples to sector averages and historical ranges
  - DCF sanity check: Does the current price imply reasonable future cash flows?
- **Growth Drivers:** What are 2-3 key catalysts for future growth?
- **Red Flags:** Any concerns about debt, declining margins, competition, regulatory risks?

### 3. TECHNICAL POSTURE ASSESSMENT
- **Trend Classification:** Uptrend, downtrend, or sideways? Strength?
- **Entry Quality:** Is current price near support, resistance, or midrange?
- **Risk/Reward Setup:** Based on technicals, what are realistic stop-loss and profit targets?
- **Momentum Diagnosis:** Confirming fundamental thesis or diverging?

### 4. RISK FACTORS & SCENARIO ANALYSIS
- **Bull Case (30% probability):** Best-case scenario and expected return
- **Base Case (50% probability):** Most likely outcome
- **Bear Case (20% probability):** Downside risks and potential loss
- **Black Swan Risks:** What could go catastrophically wrong?

### 5. ALIGNMENT WITH INVESTOR PROFILE
- **Position Sizing Recommendation:** Given user's risk tolerance, suggest portfolio weight (e.g., 2-5%, 5-10%, 10-15%)
- **Horizon Compatibility:** Does this match user's time horizon?
- **Objective Fit:** Does it serve growth/income/balanced needs?

### 6. ACTIONABLE RECOMMENDATIONS
- **Entry Strategy:** Buy now, wait for pullback, dollar-cost average?
- **Price Targets:** 3-month, 6-month, 12-month estimates
- **Stop Loss:** Where to cut losses if thesis breaks
- **Monitoring Plan:** What metrics/events to track for thesis validation

### 7. TRANSPARENT REASONING
- **Confidence Level:** Low / Medium / High - with explanation
- **Key Assumptions:** What must be true for your thesis to work?
- **Alternative Perspectives:** What would a bear say? How would you counter?
- **Information Gaps:** What data would improve this analysis?

---

## 📐 QUANTITATIVE RIGOR

- Show your math: PEG calculations, expected return computations, risk-adjusted metrics
- Compare to benchmarks: sector averages, S&P 500, peer companies
- Use specific numbers, not vague language
- Acknowledge uncertainty and express as probability ranges

---

## ⚠️ CRITICAL REQUIREMENTS

1. **NO GENERIC ADVICE:** Tailor everything to THIS specific stock and user profile
2. **TRANSPARENT ASSUMPTIONS:** Make your reasoning explicit and falsifiable
3. **BALANCED PERSPECTIVE:** Present both bull and bear cases fairly
4. **ACTIONABLE OUTPUT:** Investor should know exactly what to do next
5. **INTELLECTUAL HONESTY:** Say "I don't know" when data is insufficient
6. **RISK-FIRST THINKING:** Emphasize downside protection, not just upside potential

---

## 🚀 OUTPUT FORMAT

Return your analysis as a **well-structured JSON object** with these exact fields:

\`\`\`json
{
  "executiveSummary": "string",
  "recommendation": "BUY" | "HOLD" | "SELL" | "AVOID",
  "confidenceLevel": "low" | "medium" | "high",

  "fundamentalAnalysis": {
    "businessQualityScore": number (0-100),
    "valuationAssessment": "string",
    "pegRatio": number | null,
    "growthDrivers": ["string", "string", ...],
    "redFlags": ["string", "string", ...]
  },

  "technicalAnalysis": {
    "trendClassification": "strong_uptrend" | "uptrend" | "sideways" | "downtrend" | "strong_downtrend",
    "entryQuality": "excellent" | "good" | "fair" | "poor",
    "supportLevel": number | null,
    "resistanceLevel": number | null,
    "stopLossRecommendation": number
  },

  "scenarioAnalysis": {
    "bullCase": {
      "probability": number (0-100),
      "expectedReturn": number (percentage),
      "description": "string"
    },
    "baseCase": {
      "probability": number (0-100),
      "expectedReturn": number (percentage),
      "description": "string"
    },
    "bearCase": {
      "probability": number (0-100),
      "expectedReturn": number (percentage),
      "description": "string"
    }
  },

  "investorAlignment": {
    "positionSizeRecommendation": "string (e.g., '3-5% of portfolio')",
    "horizonFit": "excellent" | "good" | "fair" | "poor",
    "objectiveFit": "excellent" | "good" | "fair" | "poor"
  },

  "actionPlan": {
    "entryStrategy": "string",
    "priceTargets": {
      "threeMonth": number,
      "sixMonth": number,
      "twelveMonth": number
    },
    "stopLoss": number,
    "monitoringMetrics": ["string", "string", ...]
  },

  "reasoning": {
    "keyAssumptions": ["string", "string", ...],
    "bearCounterarguments": ["string", "string", ...],
    "informationGaps": ["string", "string", ...]
  },

  "riskScore": number (1-10),
  "expectedAnnualizedReturn": number (percentage),
  "downsideRisk": number (percentage)
}
\`\`\`

---

**Begin your comprehensive analysis now.**
`.trim();
}

/**
 * Build a simpler prompt for quick verification (existing Deep Math V2 style)
 */
export function buildQuickVerificationPrompt(input: MegaPromptInput): string {
  const { ticker, fundamentals, technicals, analysisSummary } = input;

  const fpe = fundamentals.forwardPE || fundamentals.trailingPE || 0;
  const growth = fundamentals.epsGrowthYoYPct || fundamentals.revenueGrowthYoYPct || 0;
  const pegRatio = growth > 0 ? fpe / growth : null;

  return `
# Quick Verification: ${ticker}

## Data Snapshot
- Price: $${technicals.price}
- P/E: ${fpe.toFixed(1)}
- Growth: ${growth.toFixed(1)}%
- PEG: ${pegRatio ? pegRatio.toFixed(2) : 'N/A'}

## Aurora's View
${analysisSummary?.headlineView || 'No summary available'}

## Your Task
1. Reconcile valuation vs growth using transparent math
2. Run lightweight DCF expectation check
3. Explain how technical posture + sentiment align or diverge
4. Flag any red flags or hidden risks

Return JSON with: summary, reasoningSteps, strengths, weaknesses, riskFlags, alignmentWithAuroraView, confidenceLevel
`.trim();
}
