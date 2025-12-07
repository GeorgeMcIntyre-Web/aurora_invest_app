# 🤖 Mega Prompt Guide for AI Stock Analysis

## Overview

The Mega Prompt is a comprehensive, structured prompt template designed to get the most thorough and actionable stock analysis from AI models like Claude, GPT-4, or DeepSeek.

---

## 🎯 Purpose

Unlike basic prompts that ask simple questions, the Mega Prompt provides:

1. **Comprehensive Context** - All relevant data in one place
2. **Structured Framework** - Multi-dimensional analysis methodology
3. **Actionable Output** - Specific recommendations, not vague advice
4. **Transparent Reasoning** - Shows assumptions and uncertainty
5. **User-Specific Advice** - Tailored to investor profile

---

## 📋 What's Included in the Mega Prompt

### 1. Analysis Target
- Ticker symbol, company name
- Sector and industry classification
- Current price

### 2. Investor Profile
- Risk tolerance (Conservative / Moderate / Aggressive)
- Investment horizon (Short / Medium / Long term)
- Primary objective (Growth / Income / Balanced)

### 3. Fundamental Data
- Financial metrics (P/E, margins, growth rates, ROE)
- Quality assessment framework
- Business health indicators

### 4. Technical Data
- Price action and 52-week range
- Moving averages (20, 50, 200-day)
- Momentum indicators (RSI)
- Volume analysis

### 5. Analyst Sentiment
- Consensus rating
- Price targets (mean, high, low)
- Implied upside/downside

### 6. Aurora Engine Preliminary Analysis
- Headline view
- Risk score and conviction score
- Key takeaways
- Multi-dimensional perspectives

### 7. Market Context (Optional)
- S&P 500 performance
- VIX (volatility index)
- Economic phase

### 8. Analytical Framework
Detailed instructions for AI to follow:
- Executive summary with BUY/HOLD/SELL
- Deep fundamental analysis with PEG ratio
- Technical posture assessment
- Scenario analysis (Bull/Base/Bear)
- Investor alignment check
- Actionable recommendations
- Transparent reasoning with confidence level

---

## 🚀 How to Use It

### Option 1: Direct Integration (Recommended)

```typescript
import { buildMegaPrompt } from '@/lib/services/ai/megaPrompt';

// Prepare your input data
const input = {
  ticker: 'AAPL',
  companyName: 'Apple Inc.',
  sector: 'Technology',
  industry: 'Consumer Electronics',

  fundamentals: {
    trailingPE: 28.5,
    forwardPE: 26.2,
    dividendYieldPct: 0.52,
    revenueGrowthYoYPct: 8.1,
    epsGrowthYoYPct: 11.3,
    netMarginPct: 25.3,
    freeCashFlowYieldPct: 3.8,
    debtToEquity: 1.73,
    roe: 147.2,
  },

  technicals: {
    price: 185.50,
    price52wHigh: 199.62,
    price52wLow: 164.08,
    sma20: 182.30,
    sma50: 178.45,
    sma200: 175.20,
    rsi14: 58.4,
    volume: 52_340_000,
    avgVolume: 48_230_000,
  },

  sentiment: {
    analystConsensus: 'Buy',
    analystTargetMean: 205.50,
    analystTargetHigh: 250.00,
    analystTargetLow: 170.00,
  },

  analysisSummary: {
    headlineView: 'Strong fundamentals with moderate valuation',
    riskScore: 4,
    convictionScore3m: 72,
    keyTakeaways: [
      'Solid profit margins and cash generation',
      'Technical uptrend with price above key moving averages',
      'Analysts bullish with 11% upside to mean target',
    ],
  },

  userProfile: {
    riskTolerance: 'moderate',
    investmentHorizon: '5-10 years',
    investmentObjective: 'growth',
  },
};

// Generate the mega prompt
const prompt = buildMegaPrompt(input);

// Send to your AI provider
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.ANTHROPIC_API_KEY!,
    'anthropic-version': '2023-06-01',
  },
  body: JSON.stringify({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 4000,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  }),
});

const result = await response.json();
console.log(result.content[0].text);
```

### Option 2: Manual Copy-Paste

1. Open [megaPrompt.ts](lib/services/ai/megaPrompt.ts)
2. Find the `buildMegaPrompt()` function
3. Copy the template string
4. Fill in your stock data
5. Paste into ChatGPT, Claude, or any AI chat

---

## 📊 Expected Output Format

The AI should return a structured JSON response:

```json
{
  "executiveSummary": "Apple presents a balanced risk/reward opportunity for growth-oriented investors with moderate risk tolerance...",
  "recommendation": "BUY",
  "confidenceLevel": "high",

  "fundamentalAnalysis": {
    "businessQualityScore": 92,
    "valuationAssessment": "Fair valuation with PEG of 2.3 suggesting slight premium...",
    "pegRatio": 2.32,
    "growthDrivers": [
      "Services revenue expanding at 15%+ annually",
      "iPhone upgrade cycle driven by AI features",
      "Expansion into spatial computing with Vision Pro"
    ],
    "redFlags": [
      "China revenue exposure (~20% of sales)",
      "Regulatory scrutiny in EU and US"
    ]
  },

  "technicalAnalysis": {
    "trendClassification": "uptrend",
    "entryQuality": "good",
    "supportLevel": 178.45,
    "resistanceLevel": 199.62,
    "stopLossRecommendation": 172.00
  },

  "scenarioAnalysis": {
    "bullCase": {
      "probability": 30,
      "expectedReturn": 25,
      "description": "AI-driven iPhone supercycle, services margin expansion..."
    },
    "baseCase": {
      "probability": 50,
      "expectedReturn": 12,
      "description": "Steady growth in line with historical averages..."
    },
    "bearCase": {
      "probability": 20,
      "expectedReturn": -8,
      "description": "Macro slowdown, China tensions, regulatory headwinds..."
    }
  },

  "investorAlignment": {
    "positionSizeRecommendation": "5-8% of portfolio",
    "horizonFit": "excellent",
    "objectiveFit": "excellent"
  },

  "actionPlan": {
    "entryStrategy": "Dollar-cost average over 4-6 weeks, building position on dips",
    "priceTargets": {
      "threeMonth": 195,
      "sixMonth": 205,
      "twelveMonth": 220
    },
    "stopLoss": 172,
    "monitoringMetrics": [
      "Quarterly services revenue growth",
      "iPhone unit sales and ASP trends",
      "Margin trajectory",
      "China revenue performance"
    ]
  },

  "reasoning": {
    "keyAssumptions": [
      "Services growth continues at 12-15% annually",
      "Operating margins remain above 30%",
      "No major regulatory disruption in next 12 months"
    ],
    "bearCounterarguments": [
      "Valuation premium may compress if growth slows",
      "Hardware dependency remains despite services push",
      "Competition intensifying in India and other emerging markets"
    ],
    "informationGaps": [
      "Vision Pro adoption metrics not yet public",
      "Impact of AI features on upgrade rates unclear",
      "Long-term margin potential of services unknown"
    ]
  },

  "riskScore": 4,
  "expectedAnnualizedReturn": 14.5,
  "downsideRisk": -12
}
```

---

## 🎓 Best Practices

### 1. Use the Full Context

Don't skip fields! The more context you provide, the better the analysis:
- Include sector/industry for peer comparisons
- Provide user profile for personalized advice
- Add market context during volatile periods

### 2. Choose the Right AI Model

**Recommended Models:**

| Model | Best For | Cost |
|-------|----------|------|
| Claude Opus 4.5 | Most comprehensive analysis | High |
| Claude Sonnet 4.5 | Balanced quality & speed | Medium |
| GPT-4 Turbo | Fast, detailed analysis | Medium |
| DeepSeek | Cost-effective option | Low |

### 3. Iterate Based on Output

If the AI's first response lacks depth:
- Ask follow-up questions
- Request clarification on specific points
- Challenge assumptions

### 4. Validate with Multiple Sources

Never rely on AI alone:
- Cross-reference fundamentals with official filings
- Verify technical levels with charts
- Check analyst consensus with Bloomberg/FactSet

---

## 🔧 Customization Tips

### Add Industry-Specific Metrics

For **Banks/Financials:**
```typescript
fundamentals: {
  // Standard metrics...
  netInterestMarginPct: 3.2,
  tier1CapitalRatio: 13.5,
  nonPerformingLoanRatio: 0.8,
}
```

For **REITs:**
```typescript
fundamentals: {
  // Standard metrics...
  ffoPerShare: 2.45,
  ffoYield: 5.8,
  occupancyRate: 95.2,
}
```

### Add ESG Considerations

```typescript
input: {
  // ... existing fields
  esgData: {
    environmentScore: 78,
    socialScore: 82,
    governanceScore: 90,
    controversies: ['Data privacy concerns in EU'],
  }
}
```

Then update the prompt template to include:
```
## ESG Analysis
- Environment score: ${esgData.environmentScore}/100
- Social score: ${esgData.socialScore}/100
- Governance score: ${esgData.governanceScore}/100
- Key controversies: ${esgData.controversies.join(', ')}
```

### Add Macro Context

For cyclical stocks (autos, industrials, materials):
```typescript
marketContext: {
  spyPrice: 480.50,
  spyChange: 0.85,
  vixLevel: 14.2,
  economicPhase: 'Late Expansion',
  federalFundsRate: 5.33,
  yieldCurve: 'Normal',
  leadingEconomicIndex: 'Declining',
}
```

---

## 💡 Example Use Cases

### Use Case 1: Growth Stock Deep Dive

Perfect for high-growth tech companies:
- Emphasizes PEG ratio and growth sustainability
- Focuses on innovation and market share
- Higher weight on forward-looking metrics

**Example Tickers:** NVDA, TSLA, PLTR, SNOW

### Use Case 2: Value Stock Screening

For mature companies trading below intrinsic value:
- Emphasizes P/E, P/B, dividend yield
- Focuses on cash flow and balance sheet strength
- Higher weight on margin of safety

**Example Tickers:** JPM, JNJ, PG, KO

### Use Case 3: Dividend Income Analysis

For income-focused investors:
- Emphasizes dividend yield, payout ratio, coverage
- Focuses on dividend growth history
- Higher weight on sustainability and stability

**Example Tickers:** T, VZ, O, ABBV

### Use Case 4: Turnaround Situation

For distressed companies with recovery potential:
- Emphasizes debt levels, liquidity, runway
- Focuses on management changes and strategic pivots
- Scenario analysis weighted toward bear/base cases

**Example Tickers:** BA (post-crisis), INTC (restructuring)

---

## 🚨 Common Pitfalls

### 1. Garbage In, Garbage Out

**Problem:** Using stale or incorrect data
**Solution:** Always verify data freshness and accuracy

### 2. Over-Reliance on AI

**Problem:** Treating AI output as gospel
**Solution:** Use as starting point, not final answer

### 3. Ignoring Qualitative Factors

**Problem:** Focusing only on numbers
**Solution:** Include management quality, competitive moat, industry trends

### 4. Not Updating Assumptions

**Problem:** Using same prompt for all conditions
**Solution:** Adjust market context and user profile as situations change

---

## 📈 Advanced Techniques

### Ensemble Analysis

Run the same prompt through multiple AI models and compare:

```typescript
const models = [
  { name: 'Claude Opus', endpoint: '...' },
  { name: 'GPT-4 Turbo', endpoint: '...' },
  { name: 'DeepSeek', endpoint: '...' },
];

const analyses = await Promise.all(
  models.map(model => callAI(model, prompt))
);

// Compare recommendations
const consensus = analyzeConsensus(analyses);
```

### Time-Series Analysis

Track how AI recommendations change over time:

```typescript
const history = [
  { date: '2024-01-01', recommendation: 'BUY', confidence: 'high' },
  { date: '2024-04-01', recommendation: 'BUY', confidence: 'medium' },
  { date: '2024-07-01', recommendation: 'HOLD', confidence: 'medium' },
];

// Detect recommendation changes
const downgrades = detectDowngrades(history);
```

### Portfolio-Level Integration

Analyze how a stock fits into overall portfolio:

```typescript
const portfolioContext = {
  currentHoldings: [/* ... */],
  sectorExposure: { Technology: 35%, Healthcare: 20%, /* ... */ },
  riskMetrics: { sharpeRatio: 1.2, maxDrawdown: -18% },
};

const promptWithPortfolio = buildMegaPrompt({
  ...input,
  portfolioContext,
});
```

---

## 🔗 Integration Examples

### With Existing AI Verification Hook

```typescript
// In your component
const { verification, isVerifying, error } = useAiVerification(ticker, {
  fundamentals,
  technicals,
  analysisSummary,
});

// In useAiVerification hook
const prompt = buildMegaPrompt({
  ticker,
  fundamentals,
  technicals,
  analysisSummary,
  userProfile: getUserProfile(), // Get from context/state
});

const response = await fetch(endpoint, {
  method: 'POST',
  body: JSON.stringify({ prompt }),
});
```

### With API Route

```typescript
// app/api/mega-analysis/route.ts
import { buildMegaPrompt } from '@/lib/services/ai/megaPrompt';

export async function POST(request: Request) {
  const input = await request.json();
  const prompt = buildMegaPrompt(input);

  // Call your AI provider
  const analysis = await callAI(prompt);

  return Response.json({ analysis });
}
```

---

## 📚 Additional Resources

- **Prompt Engineering Guide:** https://www.promptingguide.ai/
- **Claude Best Practices:** https://docs.anthropic.com/claude/docs/
- **OpenAI Prompt Engineering:** https://platform.openai.com/docs/guides/prompt-engineering

---

## 🎯 Quick Reference

### Minimal Required Fields

```typescript
{
  ticker: string,
  technicals: { price: number },
  // Everything else is optional but recommended
}
```

### Full Field Reference

See [megaPrompt.ts](lib/services/ai/megaPrompt.ts) for complete `MegaPromptInput` interface

---

**Pro Tip:** The mega prompt works best when you provide ALL available data. Don't skip optional fields—they significantly improve analysis quality!
