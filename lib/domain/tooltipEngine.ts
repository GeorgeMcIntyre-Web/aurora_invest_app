/**
 * Tooltip Engine - Financial Term Definitions
 * 
 * Pure domain function that provides educational content for financial terms.
 * Used throughout the application to explain metrics and concepts to users.
 * 
 * @module tooltipEngine
 */

import { TooltipContent, FinancialTerm } from './AnalysisTypes';

/**
 * Dictionary of all financial term explanations
 * Each entry provides comprehensive educational content for hover tooltips
 */
const TOOLTIP_DICTIONARY: Record<FinancialTerm, Omit<TooltipContent, 'term'>> = {
  // ========== VALUATION METRICS ==========
  pe_ratio: {
    title: 'P/E Ratio (Price-to-Earnings)',
    definition: 'The ratio of a company\'s stock price to its earnings per share. It shows how much investors are willing to pay for each dollar of earnings.',
    interpretation: 'Lower P/E may indicate undervaluation or lower growth expectations. Higher P/E may indicate overvaluation or higher growth expectations. Compare to industry peers for context.',
    formula: 'P/E = Stock Price / Earnings Per Share',
    example: 'A stock trading at $100 with EPS of $5 has a P/E of 20x, meaning investors pay $20 for every $1 of earnings.',
    category: 'valuation',
  },
  
  forward_pe: {
    title: 'Forward P/E Ratio',
    definition: 'Similar to P/E ratio, but uses projected earnings for the next 12 months instead of historical earnings.',
    interpretation: 'Forward P/E reflects market expectations for future earnings growth. A lower forward P/E than trailing P/E suggests expected earnings growth.',
    formula: 'Forward P/E = Stock Price / Projected EPS',
    example: 'If a stock trades at $100 and analysts expect $6 EPS next year, the forward P/E is 16.7x.',
    category: 'valuation',
  },
  
  peg_ratio: {
    title: 'PEG Ratio (Price/Earnings to Growth)',
    definition: 'The P/E ratio divided by the earnings growth rate. It adjusts the P/E ratio to account for expected growth.',
    interpretation: 'PEG < 1 may indicate undervaluation relative to growth. PEG > 1 may indicate overvaluation. PEG around 1 suggests fair valuation. Most useful for growth stocks.',
    formula: 'PEG = (P/E Ratio) / EPS Growth Rate',
    example: 'A stock with P/E of 30x and 30% earnings growth has PEG of 1.0 (fairly valued for its growth rate).',
    category: 'valuation',
  },
  
  earnings_yield: {
    title: 'Earnings Yield',
    definition: 'The inverse of P/E ratio, expressed as a percentage. It shows the earnings generated for each dollar invested.',
    interpretation: 'Higher earnings yield indicates better value. Compare to bond yields to assess relative attractiveness of stocks vs. fixed income.',
    formula: 'Earnings Yield = (EPS / Stock Price) × 100',
    example: 'A stock at $100 with $5 EPS has an earnings yield of 5%, meaning it generates $5 of earnings per $100 invested.',
    category: 'valuation',
  },
  
  price_to_book: {
    title: 'Price-to-Book Ratio (P/B)',
    definition: 'The ratio of a company\'s stock price to its book value per share (assets minus liabilities).',
    interpretation: 'P/B < 1 may indicate undervaluation or fundamental problems. P/B > 1 suggests market values company above its net assets. Most useful for asset-heavy industries.',
    formula: 'P/B = Stock Price / Book Value Per Share',
    example: 'A stock at $50 with book value of $40 per share has P/B of 1.25x.',
    category: 'valuation',
  },
  
  price_to_sales: {
    title: 'Price-to-Sales Ratio (P/S)',
    definition: 'The ratio of a company\'s market cap to its annual revenue.',
    interpretation: 'Lower P/S may indicate better value. Useful for comparing companies in the same industry, especially for unprofitable companies.',
    formula: 'P/S = Market Cap / Annual Revenue',
    example: 'A company with $10B market cap and $2B revenue has P/S of 5x.',
    category: 'valuation',
  },
  
  // ========== GROWTH METRICS ==========
  eps_growth: {
    title: 'EPS Growth (Earnings Per Share Growth)',
    definition: 'The year-over-year percentage change in a company\'s earnings per share.',
    interpretation: 'Positive EPS growth indicates improving profitability. Consistent growth over multiple years suggests a healthy, expanding business. Compare to industry averages.',
    formula: 'EPS Growth = ((Current EPS - Prior EPS) / Prior EPS) × 100',
    example: 'If EPS grew from $4 to $5, the growth rate is 25%.',
    category: 'growth',
  },
  
  revenue_growth: {
    title: 'Revenue Growth (YoY)',
    definition: 'The year-over-year percentage change in a company\'s total revenue or sales.',
    interpretation: 'Positive revenue growth indicates expanding business operations. Accelerating growth rates are typically viewed positively. Should be sustainable and profitable.',
    formula: 'Revenue Growth = ((Current Revenue - Prior Revenue) / Prior Revenue) × 100',
    example: 'Revenue increasing from $100M to $120M represents 20% growth.',
    category: 'growth',
  },
  
  dividend_yield: {
    title: 'Dividend Yield',
    definition: 'The annual dividend per share divided by the stock price, expressed as a percentage.',
    interpretation: 'Higher yield provides more income relative to price. Very high yields may signal dividend sustainability concerns. Compare to historical averages and sector peers.',
    formula: 'Dividend Yield = (Annual Dividend Per Share / Stock Price) × 100',
    example: 'A stock at $100 paying $3 annual dividend has a 3% yield.',
    category: 'growth',
  },
  
  // ========== PROFITABILITY METRICS ==========
  net_margin: {
    title: 'Net Profit Margin',
    definition: 'The percentage of revenue that remains as profit after all expenses, taxes, and costs.',
    interpretation: 'Higher margins indicate better profitability and pricing power. Compare to industry averages. Consistent or improving margins suggest competitive advantages.',
    formula: 'Net Margin = (Net Income / Revenue) × 100',
    example: 'A company with $100M revenue and $15M profit has a 15% net margin.',
    category: 'profitability',
  },
  
  operating_margin: {
    title: 'Operating Margin',
    definition: 'Operating income as a percentage of revenue. Measures profitability from core business operations before interest and taxes.',
    interpretation: 'Higher operating margins indicate efficient operations and strong pricing power. Less affected by one-time items than net margin.',
    formula: 'Operating Margin = (Operating Income / Revenue) × 100',
    example: 'Operating income of $20M on $100M revenue equals 20% operating margin.',
    category: 'profitability',
  },
  
  roe: {
    title: 'ROE (Return on Equity)',
    definition: 'The percentage return generated on shareholders\' equity. Measures how efficiently a company uses shareholder investments.',
    interpretation: 'ROE > 15% is generally considered good. Higher ROE indicates efficient use of equity capital. Compare to industry peers and historical trends.',
    formula: 'ROE = (Net Income / Shareholders\' Equity) × 100',
    example: 'Net income of $10M with $50M equity gives ROE of 20%.',
    category: 'profitability',
  },
  
  roa: {
    title: 'ROA (Return on Assets)',
    definition: 'The percentage return generated on total assets. Measures how efficiently a company uses its assets.',
    interpretation: 'Higher ROA indicates better asset efficiency. Particularly useful for comparing asset-heavy companies like manufacturers or utilities.',
    formula: 'ROA = (Net Income / Total Assets) × 100',
    example: 'Net income of $10M with $100M total assets gives ROA of 10%.',
    category: 'profitability',
  },
  
  roic: {
    title: 'ROIC (Return on Invested Capital)',
    definition: 'The return generated on all capital invested in the business (both debt and equity).',
    interpretation: 'ROIC > WACC (cost of capital) creates value. Higher ROIC indicates competitive advantages and efficient capital allocation. Warren Buffett\'s favorite metric.',
    formula: 'ROIC = (NOPAT / Invested Capital) × 100',
    example: 'A company generating 15% ROIC is creating value if its cost of capital is 8%.',
    category: 'profitability',
  },
  
  // ========== LIQUIDITY & SOLVENCY ==========
  debt_to_equity: {
    title: 'Debt-to-Equity Ratio',
    definition: 'The ratio of a company\'s total debt to shareholders\' equity. Measures financial leverage.',
    interpretation: 'Lower ratios indicate less financial risk. Very high ratios may signal bankruptcy risk. Acceptable levels vary by industry. Capital-intensive industries typically have higher ratios.',
    formula: 'Debt/Equity = Total Debt / Shareholders\' Equity',
    example: 'A company with $50M debt and $100M equity has a debt/equity ratio of 0.5x.',
    category: 'liquidity',
  },
  
  current_ratio: {
    title: 'Current Ratio',
    definition: 'Current assets divided by current liabilities. Measures short-term liquidity.',
    interpretation: 'Ratio > 1 indicates company can cover short-term obligations. Ratio > 2 is generally considered healthy. Too high may indicate inefficient use of assets.',
    formula: 'Current Ratio = Current Assets / Current Liabilities',
    example: 'Current assets of $150M and current liabilities of $100M gives a current ratio of 1.5x.',
    category: 'liquidity',
  },
  
  quick_ratio: {
    title: 'Quick Ratio (Acid Test)',
    definition: 'Similar to current ratio but excludes inventory from current assets. A more conservative liquidity measure.',
    interpretation: 'Ratio > 1 indicates good short-term liquidity without relying on inventory sales. More stringent than current ratio.',
    formula: 'Quick Ratio = (Current Assets - Inventory) / Current Liabilities',
    example: 'A company with $150M current assets, $30M inventory, and $100M current liabilities has quick ratio of 1.2x.',
    category: 'liquidity',
  },
  
  free_cash_flow: {
    title: 'Free Cash Flow (FCF)',
    definition: 'Cash generated by operations minus capital expenditures. Represents cash available for dividends, buybacks, or debt reduction.',
    interpretation: 'Positive and growing FCF indicates financial health. FCF is considered more reliable than earnings. Essential for dividends and growth investments.',
    formula: 'FCF = Operating Cash Flow - Capital Expenditures',
    example: 'Operating cash flow of $100M minus $30M in capex equals $70M free cash flow.',
    category: 'liquidity',
  },
  
  fcf_yield: {
    title: 'Free Cash Flow Yield',
    definition: 'Free cash flow per share divided by stock price. Similar to earnings yield but uses cash flow.',
    interpretation: 'Higher FCF yield may indicate undervaluation. More reliable than earnings yield since cash flow is harder to manipulate than earnings.',
    formula: 'FCF Yield = (Free Cash Flow Per Share / Stock Price) × 100',
    example: 'A stock at $100 with $8 FCF per share has an 8% FCF yield.',
    category: 'liquidity',
  },
  
  // ========== TECHNICAL INDICATORS ==========
  rsi: {
    title: 'RSI (Relative Strength Index)',
    definition: 'A momentum indicator that measures the speed and magnitude of price changes. Ranges from 0 to 100.',
    interpretation: 'RSI > 70 suggests overbought conditions (potential pullback). RSI < 30 suggests oversold conditions (potential bounce). Most useful in ranging markets.',
    formula: 'RSI = 100 - (100 / (1 + RS)), where RS = Average Gain / Average Loss over 14 periods',
    example: 'RSI of 75 suggests the stock may be overbought and due for a correction.',
    category: 'technical',
  },
  
  sma_20: {
    title: '20-Day Simple Moving Average (SMA)',
    definition: 'The average closing price over the last 20 trading days. Used to identify short-term trends.',
    interpretation: 'Price above SMA-20 suggests short-term uptrend. Price below suggests downtrend. SMA-20 acts as dynamic support/resistance.',
    example: 'If the 20-day SMA is $95 and price is $100, the stock is in a short-term uptrend.',
    category: 'technical',
  },
  
  sma_50: {
    title: '50-Day Simple Moving Average (SMA)',
    definition: 'The average closing price over the last 50 trading days. Used to identify intermediate-term trends.',
    interpretation: 'Price above SMA-50 suggests intermediate uptrend. Widely followed by traders. Crossing above/below SMA-50 is considered significant.',
    example: 'A stock breaking above its 50-day SMA after a decline may signal trend reversal.',
    category: 'technical',
  },
  
  sma_200: {
    title: '200-Day Simple Moving Average (SMA)',
    definition: 'The average closing price over the last 200 trading days (~10 months). Defines long-term trend.',
    interpretation: 'Price above SMA-200 indicates bull market. Below indicates bear market. Crossing the 200-day SMA is highly significant ("golden cross" or "death cross").',
    example: 'A stock trading above its 200-day SMA is considered to be in a long-term uptrend.',
    category: 'technical',
  },
  
  volume: {
    title: 'Trading Volume',
    definition: 'The number of shares traded during a given period. Indicates market interest and liquidity.',
    interpretation: 'Higher volume confirms price movements. Low volume price moves may be unreliable. Volume spikes often accompany significant news or reversals.',
    example: 'A stock rallying on 3x average volume shows strong buying conviction.',
    category: 'technical',
  },
  
  beta: {
    title: 'Beta',
    definition: 'Measures a stock\'s volatility relative to the overall market. Market beta is 1.0.',
    interpretation: 'Beta > 1: More volatile than market. Beta < 1: Less volatile. Beta = 1: Moves with market. Negative beta: Moves opposite to market (rare).',
    formula: 'Beta = Covariance(Stock Returns, Market Returns) / Variance(Market Returns)',
    example: 'A stock with beta of 1.5 tends to move 50% more than the market (up or down).',
    category: 'technical',
  },
  
  volatility: {
    title: 'Volatility',
    definition: 'A statistical measure of price fluctuations. Usually expressed as standard deviation of returns.',
    interpretation: 'Higher volatility = higher risk and potential reward. Lower volatility = more stable, predictable price movements. Compare to historical volatility.',
    formula: 'Volatility = Standard Deviation of Returns × √252 (annualized)',
    example: 'A stock with 30% annual volatility has larger daily price swings than one with 15% volatility.',
    category: 'technical',
  },
  
  '52w_high': {
    title: '52-Week High',
    definition: 'The highest price the stock has traded at during the past 52 weeks (one year).',
    interpretation: 'Trading near 52-week high may indicate strong momentum or resistance. Breakout above 52-week high is considered bullish.',
    example: 'A stock at $98 with 52-week high of $100 is approaching resistance.',
    category: 'technical',
  },
  
  '52w_low': {
    title: '52-Week Low',
    definition: 'The lowest price the stock has traded at during the past 52 weeks (one year).',
    interpretation: 'Trading near 52-week low may indicate weakness or potential value. Recovery from 52-week low can signal turnaround.',
    example: 'A stock at $52 with 52-week low of $50 may find support or continue declining.',
    category: 'technical',
  },
  
  // ========== SENTIMENT & ANALYSIS ==========
  analyst_consensus: {
    title: 'Analyst Consensus',
    definition: 'The aggregated recommendation from professional Wall Street analysts covering the stock.',
    interpretation: 'Strong Buy/Buy suggests positive outlook. Hold is neutral. Sell/Strong Sell is bearish. Consider analyst track record and potential conflicts of interest.',
    example: 'If 10 of 15 analysts rate a stock "Buy" or higher, the consensus is positive.',
    category: 'sentiment',
  },
  
  price_target: {
    title: 'Analyst Price Target',
    definition: 'The average projected stock price by analysts, typically for 12 months forward.',
    interpretation: 'Target above current price is bullish. Below is bearish. Large gap between target and price may indicate opportunity or risk. Track record varies by analyst.',
    example: 'Current price of $100 with average price target of $120 suggests 20% upside.',
    category: 'sentiment',
  },
  
  risk_score: {
    title: 'Risk Score',
    definition: 'AuroraInvest proprietary score (1-10) measuring overall investment risk based on fundamental, technical, and market factors.',
    interpretation: 'Lower scores indicate lower risk. Higher scores indicate higher risk and uncertainty. Consider in context of your risk tolerance and time horizon.',
    example: 'A risk score of 3/10 suggests a relatively stable, lower-risk investment.',
    category: 'sentiment',
  },
  
  conviction_score: {
    title: 'Conviction Score',
    definition: 'AuroraInvest proprietary score (0-100) indicating confidence in the 3-month outlook based on multiple factors.',
    interpretation: 'Higher scores indicate stronger conviction in the analysis. Lower scores suggest higher uncertainty. Not a guarantee of returns.',
    example: 'A conviction score of 75/100 indicates relatively high confidence in the projected outlook.',
    category: 'sentiment',
  },
  
  // ========== PORTFOLIO METRICS ==========
  portfolio_allocation: {
    title: 'Portfolio Allocation',
    definition: 'The percentage of your total portfolio value invested in a particular stock or asset.',
    interpretation: 'Higher allocation increases exposure to that specific stock\'s risk and return. Diversification typically involves limiting individual positions to reduce risk.',
    example: 'A $10,000 position in a $100,000 portfolio represents 10% allocation.',
    category: 'portfolio',
  },
  
  concentration_risk: {
    title: 'Concentration Risk',
    definition: 'Risk from having too much portfolio value in a single stock, sector, or asset class.',
    interpretation: 'High concentration increases vulnerability to specific company or sector problems. Generally recommended to limit single positions to 5-10% of portfolio.',
    example: 'Having 40% of portfolio in one tech stock creates high concentration risk.',
    category: 'portfolio',
  },
  
  portfolio_beta: {
    title: 'Portfolio Beta',
    definition: 'The weighted average beta of all holdings, measuring portfolio volatility relative to the market.',
    interpretation: 'Portfolio beta > 1 means higher volatility than market. Beta < 1 means lower volatility. Adjust portfolio beta based on risk tolerance.',
    example: 'A portfolio with beta of 1.2 tends to move 20% more than the overall market.',
    category: 'portfolio',
  },
  
  portfolio_volatility: {
    title: 'Portfolio Volatility',
    definition: 'The standard deviation of your portfolio\'s returns, measuring overall price fluctuation risk.',
    interpretation: 'Higher volatility means larger price swings and uncertainty. Lower volatility indicates more stable returns. Consider relative to your risk tolerance.',
    example: 'A portfolio with 25% annual volatility will have larger value fluctuations than one with 10%.',
    category: 'portfolio',
  },
  
  cost_basis: {
    title: 'Cost Basis',
    definition: 'The original price paid for a stock, including commissions. Used to calculate capital gains or losses.',
    interpretation: 'Cost basis below current price indicates unrealized gain. Above indicates unrealized loss. Important for tax planning and performance tracking.',
    example: 'Buying 100 shares at $50 each creates a cost basis of $5,000.',
    category: 'portfolio',
  },
  
  unrealized_gain: {
    title: 'Unrealized Gain/Loss',
    definition: 'The profit or loss on a position that hasn\'t been sold yet (still held). Also called "paper gain/loss".',
    interpretation: 'Positive unrealized gain represents potential profit if sold. Becomes realized (and taxable) when position is closed. Track to manage tax implications.',
    example: 'Stock bought at $50 now at $75 has $25 unrealized gain per share.',
    category: 'portfolio',
  },
  
  // ========== SCENARIO ANALYSIS ==========
  bull_scenario: {
    title: 'Bull Scenario',
    definition: 'The optimistic projected outcome if favorable conditions materialize (strong earnings, positive catalysts, market tailwinds).',
    interpretation: 'Represents upside potential but lower probability than base case. Not a prediction. Used to understand best-case outcome range.',
    example: 'Bull scenario projects 25-35% return if new product launch exceeds expectations.',
    category: 'scenario',
  },
  
  base_scenario: {
    title: 'Base Scenario',
    definition: 'The most likely projected outcome based on current trends and reasonable assumptions continuing.',
    interpretation: 'Typically assigned highest probability. Represents expected case, not guaranteed. Should reflect consensus or balanced view.',
    example: 'Base scenario projects 8-12% return if company meets current analyst estimates.',
    category: 'scenario',
  },
  
  bear_scenario: {
    title: 'Bear Scenario',
    definition: 'The pessimistic projected outcome if unfavorable conditions occur (weak earnings, negative catalysts, market headwinds).',
    interpretation: 'Represents downside risk. Important for risk management. Consider if you can tolerate this potential outcome.',
    example: 'Bear scenario projects -10% to -20% return if regulatory issues emerge.',
    category: 'scenario',
  },
  
  expected_return: {
    title: 'Expected Return',
    definition: 'The probability-weighted average of all scenarios. Combines bull/base/bear outcomes with their likelihoods.',
    interpretation: 'Represents statistical expectation, not a prediction. Actual results will likely differ. Use for comparing opportunities.',
    formula: 'Expected Return = Σ(Probability × Return) for each scenario',
    example: 'If base case (60% prob, 10% return), bull (25% prob, 30% return), bear (15% prob, -10% return), expected return is ~11%.',
    category: 'scenario',
  },
};

/**
 * Get tooltip content for a specific financial term
 * 
 * @param term - The financial term to get tooltip content for
 * @returns Complete tooltip content including title, definition, interpretation, etc.
 * 
 * @example
 * ```typescript
 * const tooltip = getTooltipContent('pe_ratio');
 * console.log(tooltip.title); // "P/E Ratio (Price-to-Earnings)"
 * console.log(tooltip.definition); // "The ratio of a company's stock price..."
 * ```
 */
export function getTooltipContent(term: FinancialTerm): TooltipContent {
  const content = TOOLTIP_DICTIONARY[term];
  if (!content) {
    throw new Error(`Unknown financial term: ${term}`);
  }
  
  return {
    term,
    ...content,
  };
}

/**
 * Get all tooltip contents for a specific category
 * 
 * @param category - The category to filter by
 * @returns Array of tooltip contents in the specified category
 * 
 * @example
 * ```typescript
 * const valuationTooltips = getTooltipsByCategory('valuation');
 * console.log(valuationTooltips.length); // 6
 * ```
 */
export function getTooltipsByCategory(
  category: TooltipContent['category']
): TooltipContent[] {
  return Object.entries(TOOLTIP_DICTIONARY)
    .filter(([_, content]) => content.category === category)
    .map(([term, content]) => ({
      term: term as FinancialTerm,
      ...content,
    }));
}

/**
 * Search tooltip content by keyword
 * 
 * @param keyword - The keyword to search for (case-insensitive)
 * @returns Array of matching tooltip contents
 * 
 * @example
 * ```typescript
 * const results = searchTooltips('earnings');
 * // Returns tooltips for 'pe_ratio', 'earnings_yield', 'eps_growth', etc.
 * ```
 */
export function searchTooltips(keyword: string): TooltipContent[] {
  const lowerKeyword = keyword.toLowerCase();
  
  return Object.entries(TOOLTIP_DICTIONARY)
    .filter(([_, content]) => {
      return (
        content.title.toLowerCase().includes(lowerKeyword) ||
        content.definition.toLowerCase().includes(lowerKeyword) ||
        content.interpretation.toLowerCase().includes(lowerKeyword)
      );
    })
    .map(([term, content]) => ({
      term: term as FinancialTerm,
      ...content,
    }));
}

/**
 * Get all available financial terms
 * 
 * @returns Array of all financial term identifiers
 * 
 * @example
 * ```typescript
 * const allTerms = getAllTerms();
 * console.log(allTerms.length); // 44 (total number of terms)
 * ```
 */
export function getAllTerms(): FinancialTerm[] {
  return Object.keys(TOOLTIP_DICTIONARY) as FinancialTerm[];
}

/**
 * Check if a term exists in the tooltip dictionary
 * 
 * @param term - The term to check
 * @returns True if term exists, false otherwise
 * 
 * @example
 * ```typescript
 * console.log(hasTooltip('pe_ratio')); // true
 * console.log(hasTooltip('invalid_term')); // false
 * ```
 */
export function hasTooltip(term: string): term is FinancialTerm {
  return term in TOOLTIP_DICTIONARY;
}
