# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Thai Fund Market Pulse - A full-stack TypeScript application for tracking Thai mutual funds (RMF, ESG, ESGX) with real-time NAV data from Thailand SEC API. Currently tracking 400+ RMF funds, 52 Thai ESG funds, and 28 Thai ESGX funds. Built with Express backend and React frontend, designed to integrate with ChatGPT as an MCP (Model Context Protocol) widget.

## Commands

### Development
```bash
npm run dev          # Start development server (both frontend and backend on port 5000)
npm run check        # Run TypeScript type checking
```

### Build & Deploy
```bash
npm run build        # Build both client (Vite) and server (esbuild)
npm start            # Run production build
```

### Database
```bash
npm run db:push      # Push database schema changes using Drizzle Kit
```

### Data Extraction
```bash
# 100% API-Based Fund List Generation
npm run data:rmf:generate-list         # Generate RMF fund list from SEC API (no CSV dependency)
npm run data:esg:generate-list         # Generate Thai ESG fund list from SEC API
npm run data:esgx:generate-list        # Generate Thai ESGX fund list from SEC API

# HTML Parsing (Legacy)
npm run data:rmf:parse                 # Parse HTML table to CSV/MD

# RMF Data Pipeline
npm run data:rmf:build-mapping         # Phase 0: Build fund symbol → proj_id mapping
npm run data:rmf:fetch-all             # Phase 1: Fetch all RMF funds with complete data
npm run data:rmf:identify-incomplete   # Identify funds with incomplete data
npm run data:rmf:reprocess             # Re-process incomplete funds
```

## Architecture

### Monorepo Structure

This is a monorepo with three main directories:
- `client/` - React SPA using Vite
- `server/` - Express API server
- `shared/` - Shared TypeScript types and schemas (Zod)

### Path Aliases

The project uses TypeScript path aliases configured in both `tsconfig.json` and `vite.config.ts`:
- `@/*` → `client/src/*` (client-side imports)
- `@shared/*` → `shared/*` (shared schemas/types)
- `@assets/*` → `attached_assets/*` (static assets)

### Backend Architecture (`server/`)

**Entry Point:** `server/index.ts`
- Sets up Express with JSON middleware
- Handles development (Vite dev server) vs production (static files) serving
- All traffic runs through port 5000 (configurable via PORT env var)
- Request logging middleware for API routes

**API Routes:** `server/routes.ts`
- RESTful endpoints for RMF data only
  - `GET /api/rmf` - Get paginated RMF funds (supports `page`, `pageSize`, `fundType`, `search` params)
  - `GET /api/rmf/:fundCode` - Get detailed fund information
  - `GET /api/debug/sec` - Debug endpoint to test SEC API key
- MCP Protocol endpoint at `/mcp` for ChatGPT integration
- Health check at `/healthz`

**Data Layer:**

The backend has multiple SEC API service modules in `server/services/`:

- `secFundDailyInfoApi.ts` - SEC Fund Daily Info API
  - Daily NAV data and historical NAV
  - Dividend history
  - Rate limiting: 3,000 calls per 5 minutes
  - Caching: Fund lists (24h), NAV data (1h)
  - Functions: `fetchFundDailyNav()`, `fetchFundNavHistory()`, `fetchFundDividend()`

- `secFundFactsheetApi.ts` - SEC Fund Factsheet API
  - **Basic Fund Info:**
    - `fetchAMCList()` - Get all Asset Management Companies
    - `fetchFundsByAMC()` - Get funds under specific AMC
    - `fetchFundAssets()` - Asset allocation data
    - `searchFunds()` - Search funds by name
  - **Metadata (NEW):**
    - `fetchFundPolicy(proj_id)` - Fund classification + management style
    - `fetchFundDividendPolicy(proj_id)` - Dividend policy
    - `fetchFundSuitability(proj_id)` - Risk level (parsed from risk_spectrum)
  - **Performance Metrics:**
    - `fetchFundPerformance(proj_id)` - Historical returns (YTD, 3M, 6M, 1Y, 3Y, 5Y, 10Y, Since Inception)
    - `fetchFundBenchmark(proj_id)` - Benchmark name and returns across all time periods
    - `fetchFund5YearLost(proj_id)` - Standard deviation/volatility (risk metrics)
    - `fetchFundTrackingError(proj_id)` - 1-year tracking error vs benchmark
    - `fetchFundCompare(proj_id)` - Fund category/peer group classification
  - **Fee & Compliance:**
    - `fetchFundFees()` - Fee structure information
    - `fetchInvolvedParties()` - Fund managers and involved parties
    - `fetchFundTop5Holdings()` - Top 5 fund holdings
    - `fetchFundRiskFactors()` - Risk factors
    - `fetchFundSuitability()` - Suitability information (enhanced with risk_level parsing)
    - `fetchFundURLs()` - Document URLs
    - `fetchFundInvestmentMinimums()` - Investment minimums
  - Rate limiting: 3,000 calls per 5 minutes
  - Caching: 24 hours for all endpoints
  - Note: Performance endpoint returns array with Thai language descriptors

- `secFundApi.ts` - Unified SEC Fund API wrapper (legacy, combines above services)
- `secApi.ts` - General SEC API utilities
- `setsmartApi.ts` - SET Smart API integration (if applicable)

### Frontend Architecture (`client/`)

**Routing:** Uses Wouter (lightweight router), not React Router
- Main route: `/` → `RMF.tsx` (Thai Retirement Mutual Funds - primary and only page)
- 404 handling via `NotFound.tsx`

**State Management:**
- TanStack Query (React Query) for server state
- Query client configured in `client/src/lib/queryClient.ts`
- Auto-refetch interval: 5 minutes for RMF funds (funds change less frequently than stocks)

**UI Components:**
- Radix UI primitives for accessible components (`components/ui/`)
- Tailwind CSS for styling
- Theme switching (light/dark mode) via `next-themes`
- Custom RMF components:
  - `RMFFundCard.tsx` - Card view for individual funds
  - `RMFFundTable.tsx` - Table view for fund lists
  - `LoadingSkeleton.tsx` - Loading states
  - `ErrorMessage.tsx` - Error handling
  - `ThemeToggle.tsx` - Dark/light mode toggle
  - `WidgetContainer.tsx` - Wrapper for fund data widgets

**Design System:**
- Minimal, data-first presentation optimized for ChatGPT integration
- Semantic color usage (green for gains, red for losses)
- System fonts
- No decorative elements or branding
- Focus on accessibility with Radix UI primitives

### Shared Schemas (`shared/`)

**File:** `shared/schema.ts`

Zod schemas for type-safe API contracts, used on both client and server for validation.

**Basic Fund Data:**
- `RMFFund` - Core fund information
- `RMFFundsResponse` - Paginated fund list response
- `AssetAllocation` - Fund asset breakdown
- `FundHolding` - Individual holdings data

**Performance Data:**
- `FundPerformance` - Returns across all time periods (YTD to 10Y)
- `BenchmarkData` - Benchmark name and returns
- `VolatilityMetrics` - Standard deviation and risk measures
- `TrackingError` - Tracking error vs benchmark
- `FundCompareData` - Category/peer group classification
- `RMFFundDetail` - Extended fund schema with performance data

Note: Application is RMF-only (no commodity or forex types)

### Database

**ORM:** Drizzle ORM with PostgreSQL
- Schema: `shared/schema.ts`
- Config: `drizzle.config.ts`
- Requires `DATABASE_URL` environment variable
- Migrations output to `./migrations/`

## Key Integration Points

### MCP Protocol (ChatGPT Integration)

The `/mcp` endpoint implements the Model Context Protocol for ChatGPT apps:
- `tools/list` - Returns available tools:
  - `get_rmf_funds` - Fetch Thai RMF funds (with pagination/search)
  - `get_rmf_fund_detail` - Get detailed RMF fund information
- `tools/call` - Executes tool calls and returns formatted data
- Note: Only RMF tools are available; no commodity or forex tools

### Real-time Data Flow

**RMF Funds:**
1. Client (`pages/RMF.tsx`) fetches data via TanStack Query with pagination params
2. API route (`GET /api/rmf`) in `server/routes.ts` calls appropriate SEC API service
3. Service layer fetches from Thailand SEC API:
   - `secFundDailyInfoApi.ts` - Daily NAV and historical data
   - `secFundFactsheetApi.ts` - Fund details, performance, fees
   - Checks cache first (fund lists: 24h, NAV data: 1h)
   - Makes API call if cache miss or expired
   - Respects rate limiting (3,000 calls per 5 minutes)
4. Data validated against Zod schemas in `shared/schema.ts`
5. Client components render:
   - `RMFFundTable.tsx` for table view
   - `RMFFundCard.tsx` for card view (grid layout)
6. Auto-refetch every 5 minutes maintains freshness

## OpenAI App SDK Integration

**Master Plan:** See `tasks/OPENAI_APP_SDK_MASTER_PLAN.md` for comprehensive implementation guide.

The project is being enhanced to support OpenAI Apps SDK widgets for ChatGPT integration:

**Planned Features:**
- 6 MCP tools with structured content responses (`get_rmf_funds`, `get_rmf_fund_detail`, `search_rmf_funds`, `get_rmf_fund_performance`, `get_rmf_fund_nav_history`, `compare_rmf_funds`)
- 4 interactive widgets (Fund Card, Fund List, Fund Detail, Performance Chart)
- `window.openai` API integration for state persistence and theme matching
- Structured response format with `structuredContent`, `_meta`, and `content` fields
- Widget resources served from `/mcp/resources/{widget-id}`

**Implementation Approach:**
- Contract-first development: Tool schemas frozen before UI implementation
- Data service layer with in-memory indexes for fast lookups
- Standalone HTML widgets (< 100KB gzipped, bundled with esbuild)
- WCAG AA accessibility compliance
- Testing with 20 golden prompts (direct, indirect, negative, edge cases)

**Timeline:** 6 phases over 17-24 days (see master plan for detailed breakdown)

## Development Notes

### Vite Configuration
- Client root: `client/`
- Build output: `dist/public/`
- Dev server proxies API requests to Express backend
- Replit-specific plugins only load in development when `REPL_ID` is set

### TypeScript Setup
- ESNext modules with bundler resolution
- Strict mode enabled
- No emit (build handled by Vite/esbuild)
- Preserves JSX for Vite to transform

### Styling
- Tailwind CSS v4 with PostCSS
- `@tailwindcss/typography` for rich text
- Custom theme in `tailwind.config.ts`
- Global styles in `client/src/index.css`

## Environment Variables

- `SEC_API_KEY` - **REQUIRED** Thailand SEC API key for RMF fund data
  - Get API key from: https://api-portal.sec.or.th/
  - Subscribe to: Fund Factsheet API and Fund Daily Info API
  - Rate limit: 3,000 calls per 5 minutes
  - Test with: `GET /api/debug/sec` endpoint
- `PORT` - Server port (defaults to 5000)
- `NODE_ENV` - Environment mode (development/production)
- `DATABASE_URL` - PostgreSQL connection string (currently unused but configured)

## Data Files

### Pre-extracted Fund Database
The repository includes pre-extracted structured data for all RMF funds:

- `docs/rmf-funds.csv` - 410 funds in CSV format
  - Columns: Symbol, Fund Name, AMC, Fund Classification (AIMC), Management Style, Dividend Policy, Risk, Fund for tax allowance
- `docs/rmf-funds.md` - Same data in markdown table format
- `docs/RMF-Fund-Comparison.md` - Source HTML table (6,766 lines) scraped from SET website

### Consolidated Fund Data (Market Pulse Data Source)
- `docs/rmf-funds-consolidated.csv` - **403 RMF funds** with comprehensive data (1.5MB)
  - Flattened structure optimized for chatbot/LLM querying
  - 60 columns including all fund data points
  - Core: fund_id, symbol, fund_name, amc
  - Metadata: classification, style, dividend policy, risk level
  - NAV: latest values + 30-day history summary (count, first/last dates, min/max)
  - Performance: YTD, 3M, 6M, 1Y, 3Y, 5Y, 10Y, since inception
  - Benchmark: name and returns for all time periods
  - Dividends: count, total, last date
  - Asset allocation: JSON breakdown
  - Fees: count and details (JSON)
  - Parties: count and list (JSON)
  - Risk factors: count and descriptions (JSON)
  - Documents: factsheet, annual/halfyear report URLs
  - Investment minimums: initial, additional, redemption, balance
  - Generated from: `data/rmf-funds/{SYMBOL}.json` files
  - Command: `npm run data:rmf:consolidate-csv`

### API-Generated Fund Lists

The repository includes 100% API-generated fund lists (no manual CSV dependency):

**RMF Funds** (`docs/rmf-funds-api.*`):
- 400 funds (394 active, 6 cancelled)
- Generated by: `npm run data:rmf:generate-list`

**Thai ESG Funds** (`docs/thai-esg-funds-api.*`):
- 52 funds (51 active, 1 cancelled)
- Tax benefit: Up to THB 300,000/year
- Investment period: 2024-2026, 5-year holding
- Generated by: `npm run data:esg:generate-list`

**Thai ESGX Funds** (`docs/thai-esgx-funds-api.*`):
- 28 funds (all active, launched May 2025)
- Tax benefit: 30% of assessable income (max THB 300,000)
- 5-year holding period
- Generated by: `npm run data:esgx:generate-list`

All fund lists include: Symbol, Fund Name, AMC, Project ID, Status, Registration Date

### Data Extraction Scripts

**100% API-Based Fund List Generation**:

- `scripts/data-extraction/rmf/generate-rmf-fund-list.ts` - RMF fund list generator
  - Filters funds with "RMF" in proj_id/name/abbr
  - Command: `npm run data:rmf:generate-list`

- `scripts/data-extraction/esg/generate-thai-esg-fund-list.ts` - Thai ESG fund list generator
  - Filters funds with "ESG", "TESG", "ความยั่งยืน", "SUSTAINABILITY"
  - Excludes ESGX and RMF funds
  - Command: `npm run data:esg:generate-list`

- `scripts/data-extraction/esgx/generate-thai-esgx-fund-list.ts` - Thai ESGX fund list generator
  - Filters funds with "ESGX", "ESG X", "ESG EXTRA", "THAIESGX"
  - Command: `npm run data:esgx:generate-list`

All generators use pattern matching on SEC Fund Factsheet API data (fetches from all 29 AMCs)

**HTML Parsing** (in `scripts/data-parsing/rmf/` - Legacy):
- `parse-rmf-funds.js` - Node.js script to parse `docs/RMF-Fund-Comparison.md` HTML table
- `parse-rmf-funds.py` - Python alternative (same functionality)
- Outputs: `docs/rmf-funds.csv` and `docs/rmf-funds.md`
- Extracts ~410 of 417 funds (some HTML formatting inconsistencies)
- Run: `npm run data:rmf:parse`

**RMF Data Extraction Pipeline** (in `scripts/data-extraction/rmf/`):

Two-phase extraction process for fetching complete fund data from SEC APIs:

**Phase 0: Build Mapping**
- Script: `phase-0-build-mapping.ts`
- Builds mapping of fund symbols → `proj_id` by fetching all funds from all AMCs
- Output: `data/fund-mapping.json`
- Run once to generate mapping, then reuse for batch processing
- Command: `npm run data:rmf:build-mapping`

**Phase 1: Fetch All Funds**
- Script: `phase-1-fetch-all-funds.ts`
- Processes all RMF funds from CSV, fetching complete data for each
- Features: Concurrent batch processing (4 funds at a time), progress tracking with resume capability
- Output: Individual JSON files at `data/rmf-funds/{SYMBOL}.json` + `data/progress.json`
- Rate limiting: 4 funds/batch × 14 endpoints = 56 API calls/batch with 15-second delays
- Throughput: ~3.7 API calls/second (well under 3,000/5min limit)
- Estimated time: ~86 minutes for all 410 funds
- Command: `npm run data:rmf:fetch-all`

**Utility Scripts:**
- `fetch-complete-fund-data.ts` - Core module that fetches all 14 data points per fund (NAV, performance, risk, fees, holdings, etc.)
- `identify-incomplete-funds.ts` - Scans JSON files to find funds with incomplete data (all NULL due to rate limiting)
  - Output: `data/incomplete-funds-report.json` and `data/incomplete-funds-symbols.txt`
  - Command: `npm run data:rmf:identify-incomplete`
- `reprocess-incomplete-funds.ts` - Re-processes only incomplete funds with same rate limiting
  - Command: `npm run data:rmf:reprocess`

**Workflow:**
1. Parse fund list: `npm run data:rmf:parse`
2. Build mapping: `npm run data:rmf:build-mapping`
3. Fetch all funds: `npm run data:rmf:fetch-all`
4. Identify incomplete: `npm run data:rmf:identify-incomplete` (if needed)
5. Re-process: `npm run data:rmf:reprocess` (if needed)

See `scripts/data-extraction/rmf/README.md` for detailed documentation.
