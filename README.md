# AuroraInvest Stock Analyzer MVP

![AuroraInvest](./public/og-image.png)

A production-ready investment analysis tool that provides comprehensive stock analysis with fundamentals, technicals, sentiment, and scenario-based planning guidance.

## 🎯 Features

- **Single-Stock Analysis**: Analyze any stock with comprehensive insights
- **Multi-Dimensional Analysis**:
  - Fundamentals & Valuation (P/E ratios, growth rates, margins)
  - Technical Analysis (trend, momentum, price positioning)
  - Market Sentiment (analyst consensus, price targets, news)
- **Pluggable Market Data**: Switch between mock data and a live Finnhub API integration with retries, timeouts, and graceful fallbacks
- **3-Month Scenario Engine**: Bull/Base/Bear projections with probabilities
- **Framework-Based Guidance**: Position sizing, timing, risk considerations
- **Interactive Visualizations**: Charts for scenarios, fundamentals, technicals
- **Export Functionality**: Download JSON or print reports
- **Dark Modern Theme**: Professional AuroraInvest design

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and yarn

### Installation

```bash
# Install dependencies
yarn install

# Run development server
yarn dev

# or, if you prefer npm
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build for Production

```bash
yarn build
yarn start

# or with npm
npm run build
npm start
```

### Environment Variables

1. Copy the sample file and provide your own values:
   ```bash
   cp .env.example .env.local
   ```
2. Update `.env.local` with the following keys:

| Variable | Default | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_MARKET_DATA_PROVIDER` | `demo` | `demo` keeps using mock data, `finnhub` enables the live API |
| `NEXT_PUBLIC_FINNHUB_API_KEY` | _(none)_ | Required when `NEXT_PUBLIC_MARKET_DATA_PROVIDER=finnhub` |
| `NEXT_PUBLIC_MARKET_DATA_TIMEOUT_MS` | `10000` | Client-side timeout for Finnhub requests (in ms) |
| `NEXT_PUBLIC_MARKET_DATA_MAX_RETRIES` | `2` | How many retries the client should attempt after failures |
| `NEXT_PUBLIC_MARKET_DATA_BACKOFF_MS` | `500` | Base delay (ms) used for exponential backoff between retries |

> `.env.local` is ignored by git. Never commit real API keys.

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
│   │   ├── marketDataService.ts    # Data abstraction layer + factory
│   │   └── implementations/
│   │       └── FinnhubMarketDataService.ts
│   └── data/
│       └── mockData.ts             # Mock stock data
└── public/
    └── favicon.svg                 # Brand icon
```

### Market Data Providers

- `lib/services/marketDataService.ts` now acts as a factory that chooses the active data source.
- Demo mode (default) keeps using `MockMarketDataService` and bundled sample data.
- Live mode instantiates `FinnhubMarketDataService`, which provides:
  - Request timeouts (default 10 seconds)
  - Two automatic retries with exponential backoff (configurable)
  - Graceful handling of rate limits, network failures, and missing symbols
  - Mapping of Finnhub fundamentals, technicals, and sentiment data to the app's `StockData` type

To enable Finnhub:

```bash
cp .env.example .env.local
echo "NEXT_PUBLIC_FINNHUB_API_KEY=your_key" >> .env.local
echo "NEXT_PUBLIC_MARKET_DATA_PROVIDER=finnhub" >> .env.local
npm run dev
```

To switch back to the demo data, set `NEXT_PUBLIC_MARKET_DATA_PROVIDER=demo` (or remove the env var) and restart `npm run dev`.

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