# AuroraInvest Stock Analyzer MVP

![AuroraInvest](./public/og-image.png)

A production-ready investment analysis tool that provides comprehensive stock analysis with fundamentals, technicals, sentiment, and scenario-based planning guidance.

## 🎯 Features

- **Single-Stock Analysis**: Analyze any stock with comprehensive insights
- **Multi-Dimensional Analysis**:
  - Fundamentals & Valuation (P/E ratios, growth rates, margins)
  - Technical Analysis (trend, momentum, price positioning)
  - Market Sentiment (analyst consensus, price targets, news)
- **Pluggable Data Providers**: Switch between mock demo data and a live Alpha Vantage integration with retries, timeouts, and graceful fallbacks
- **3-Month Scenario Engine**: Bull/Base/Bear projections with probabilities
- **Framework-Based Guidance**: Position sizing, timing, risk considerations
- **Interactive Visualizations**: Charts for scenarios, fundamentals, technicals
- **Export Functionality**: Download JSON or print reports
- **Dark Modern Theme**: Professional AuroraInvest design
- **Active Manager & Portfolio Linking**: Framework recommendations adjust automatically based on holdings, weight, and risk guardrails.
- **Portfolio Dashboard**: Track holdings, view allocation metrics, run bull/base/bear stress tests, and see Active Manager verdicts per position.
- **Deep Math Verification (DeepSeek)**: Cloudflare Pages Function plus typed client service provide AI-backed reasoning with structured success/error states.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and yarn

### Installation

```bash
# Install dependencies
yarn install

# Run development server
yarn dev

# or with npm
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build for Production

```bash
yarn build
yarn start

# npm alternative
npm run build
npm start
```

### Environment Variables

1. Copy the sample file:
   ```bash
   cp .env.example .env.local
   ```
2. Set these keys (all prefixed with `NEXT_PUBLIC` so they can be consumed in the client bundle):

| Variable | Default | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_MARKET_DATA_PROVIDER` | `demo` | Use `demo` for the bundled mock dataset or `alpha_vantage` for the live API |
| `NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY` | _(required for live)_ | Your Alpha Vantage API key |
| `NEXT_PUBLIC_MARKET_DATA_TIMEOUT_MS` | `10000` | Timeout for individual API requests (milliseconds) |
| `NEXT_PUBLIC_MARKET_DATA_MAX_RETRIES` | `2` | Automatic retries after failures |
| `NEXT_PUBLIC_MARKET_DATA_BACKOFF_MS` | `500` | Base delay (ms) used for exponential backoff between retries |
| `NEXT_PUBLIC_ALPHA_VANTAGE_OUTPUT_SIZE` | `compact` | Set to `full` if you need the entire Alpha Vantage time-series history |
| `NEXT_PUBLIC_DEEP_VERIFICATION_URL` | _(optional)_ | Override for the Cloudflare Pages Function URL (falls back to `/api/ai-analysis`) |
| `DEEPSEEK_API_KEY` | _(required for DeepSeek)_ | Server-side key used by the Next.js route and Cloudflare Function |
| `DEEPSEEK_API_BASE` | `https://api.deepseek.com` | Base URL for the DeepSeek API |
| `DEEPSEEK_MODEL` | `deepseek-chat` | Model name used for Deep Math verification |
| `DEEP_VERIFICATION_TIMEOUT_MS` | `20000` | Timeout (ms) applied to DeepSeek requests |

`.env.local` is git-ignored. Never commit real API keys.

### Deep AI Verification

1. Configure the DeepSeek credentials in `.env.local` (for local development) and in your Cloudflare Pages project settings (for production).
2. The typed `functions/api/ai-analysis.js` Cloudflare Function enforces:
   - Guard clauses for missing keys or malformed payloads.
   - Uniform JSON responses (`success`, `config_error`, `bad_request`, `upstream_error`, `timeout`, `ai_unavailable`).
   - Redaction of internal error details from user-facing responses.
3. The frontend calls the function through `lib/services/deepVerificationService.ts`, which handles timeouts, cooldowns, and converts responses into typed UI states.

### Cloudflare Pages Deployment

- GitHub Actions workflow (`.github/workflows/deploy.yml`) installs dependencies via `npm ci`, runs `npm run lint`, `npm test`, and `npm run build` before deploying.
- Set `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`, and `DEEPSEEK_API_KEY` as repository secrets.
- The build step relies on the same DeepSeek variables listed above (with mock market data provider defaults). Update the workflow env block if you change providers.

## 📊 Available Stocks (Mock Data)

The MVP includes mock data for:
- **AAPL** - Apple Inc.
- **MSFT** - Microsoft Corporation
- **TSLA** - Tesla, Inc.
- **GOOGL** - Alphabet Inc.
- **NVDA** - NVIDIA Corporation

## 🏗️ Architecture

### Tech Stack
- **Framework**: Next.js 14 with React 18
- **Language**: TypeScript
- **Styling**: CSS Modules with CSS Variables
- **Charts**: Recharts
- **State Management**: React Hooks

### Project Structure

```
aurora_invest_app/
├── app/
│   ├── page.tsx           # Main application entry
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles & theme
├── components/
│   ├── stock-form.tsx              # User input form
│   ├── analysis-dashboard.tsx      # Results display
│   ├── scenario-cards.tsx          # Bull/Base/Bear scenarios
│   ├── fundamentals-card.tsx       # Fundamentals analysis
│   ├── technicals-card.tsx         # Technical analysis
│   ├── sentiment-card.tsx          # Market sentiment
│   └── export-buttons.tsx          # JSON/Print export
├── lib/
│   ├── domain/
│   │   ├── AnalysisTypes.ts        # Core type definitions
│   │   └── auroraEngine.ts         # Pure analysis engine
│   ├── services/
│   │   ├── marketDataService.ts    # Data abstraction + provider factory
│   │   └── implementations/
│   │       └── AlphaVantageService.ts
│   └── data/
│       └── mockData.ts             # Mock stock data
└── public/
    └── favicon.svg                 # Brand icon
```

## 🧠 Analysis Engine

The core analysis engine (`auroraEngine.ts`) is:
- **Pure & Testable**: No side effects, deterministic output
- **Extensible**: Designed for future portfolio analysis
- **Framework-Style**: No personalized advice, emphasizes uncertainty

### Analysis Pipeline

1. **Fundamentals Classification**: Strong/OK/Weak based on metrics
2. **Valuation Analysis**: Cheap/Fair/Rich using PEG ratios
3. **Technical Analysis**: Trend detection (SMAs) + momentum (RSI)
4. **Sentiment Analysis**: Analyst consensus + news themes
5. **Scenario Generation**: 3-month Bull/Base/Bear projections
6. **Planning Guidance**: Position sizing, timing, risk notes

## 💼 Portfolio Experience

- Visit [`/portfolio`](/portfolio) to view holdings, total metrics, concentration warnings, and Active Manager recommendations per ticker.
- The dashboard fetches fresh market data, runs the core analysis engine per holding, and surfaces a bull/base/bear stress test driven by the 3‑month scenario model.
- Quick-add forms on the analysis page allow you to push a ticker directly into the default portfolio; the Active Manager card automatically recalculates with portfolio-aware context.

## 🛡️ Important Guardrails

⚠️ **This tool is for educational purposes only and does NOT constitute financial advice.**

- Uses framework language ("many investors with similar profiles...")
- Emphasizes uncertainty in all projections
- Includes prominent disclaimers
- No personalized "you should buy/sell" guidance
- Always recommends consulting licensed financial professionals

## 🔮 Future Enhancements

The architecture supports future extensions:
- [ ] Real-time market data integration (APIs)
- [ ] Full portfolio analysis (multiple holdings)
- [ ] Historical portfolio tracking
- [ ] Multi-stock comparison mode
- [ ] User accounts & saved analyses
- [ ] Advanced scenario modeling
- [ ] Sector/industry analysis

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

### 📚 Documentation for Contributors

This codebase is designed for multi-agent collaboration. Before contributing, please read:

- **[AGENT_ASSIGNMENTS.md](./AGENT_ASSIGNMENTS.md)** - **⭐ START HERE!** Simple list: Agent number, name, file to read
- **[AGENT_ROLES.md](./AGENT_ROLES.md)** - **⚠️ READ SECOND!** Hard constraints and verification requirements
- **[AGENT_INDEX.md](./AGENT_INDEX.md)** - Quick navigation to all documentation
- **[AGENT_PROMPTS.md](./AGENT_PROMPTS.md)** - **Ready-to-use prompts for specific agent roles** ⭐
- **[AGENT_GUIDE.md](./AGENT_GUIDE.md)** - Comprehensive guide for AI agents with mega prompts for common tasks
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Detailed system architecture and design decisions
- **[MODULE_BOUNDARIES.md](./MODULE_BOUNDARIES.md)** - Clear module boundaries and separation of concerns
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Coding patterns, conventions, and best practices

### 🚀 Quick Start for Agents

1. **Read `AGENT_ASSIGNMENTS.md` first** - Find your agent number and file to read
2. **Read `AGENT_ROLES.md` second** - Understand hard constraints and verification requirements
2. **Read your specific section in `AGENT_PROMPTS.md`** - Get your detailed task instructions
3. Review `ARCHITECTURE.md` to understand system structure
4. Check `MODULE_BOUNDARIES.md` to understand where code should live
5. Follow patterns in `CONTRIBUTING.md` when writing code
6. **Always verify with real commands** - See `AGENT_ROLES.md` for verification requirements

---

**Built with ❤️ by the AuroraInvest Team**