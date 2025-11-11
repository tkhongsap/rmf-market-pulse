# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Thai RMF Market Pulse - A full-stack TypeScript application for tracking 410+ Thai Retirement Mutual Funds (RMF) with real-time NAV data from Thailand SEC API. Built with Express backend and React frontend, designed to integrate with ChatGPT as an MCP (Model Context Protocol) widget.

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
- `server/services/secFundDailyInfoApi.ts` - SEC Fund Daily Info API
  - Daily NAV data and historical NAV
  - Dividend history
  - Rate limiting: 3,000 calls per 5 minutes
  - Caching: Fund lists (24h), NAV data (1h)
  - Functions: `fetchFundDailyNav()`, `fetchFundNavHistory()`, `fetchFundDividend()`

- `server/services/secFundFactsheetApi.ts` - SEC Fund Factsheet API ⭐ **NEW**
  - **Basic Fund Info:**
    - `fetchAMCList()` - Get all Asset Management Companies
    - `fetchFundsByAMC()` - Get funds under specific AMC
    - `fetchFundAssets()` - Asset allocation data
    - `searchFunds()` - Search funds by name
  - **Performance Metrics:** ✅ **NEWLY IMPLEMENTED**
    - `fetchFundPerformance(proj_id)` - Historical returns (YTD, 3M, 6M, 1Y, 3Y, 5Y, 10Y, Since Inception)
    - `fetchFundBenchmark(proj_id)` - Benchmark name and returns across all time periods
    - `fetchFund5YearLost(proj_id)` - Standard deviation/volatility (risk metrics)
    - `fetchFundTrackingError(proj_id)` - 1-year tracking error vs benchmark
    - `fetchFundCompare(proj_id)` - Fund category/peer group classification
  - Rate limiting: 3,000 calls per 5 minutes
  - Caching: 24 hours for all endpoints
  - **Note:** Performance endpoint returns array with Thai language descriptors

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
- Zod schemas for type-safe API contracts
- **Basic Fund Data:** `RMFFund`, `RMFFundsResponse`, `AssetAllocation`, `FundHolding`
- **Performance Data:** ✅ **NEW**
  - `FundPerformance` - Returns across all time periods (YTD to 10Y)
  - `BenchmarkData` - Benchmark name and returns
  - `VolatilityMetrics` - Standard deviation and risk measures
  - `TrackingError` - Tracking error vs benchmark
  - `FundCompareData` - Category/peer group classification
  - `RMFFundDetail` - Extended fund schema with performance data
- Used on both client and server for validation
- Note: No commodity or forex types - application is RMF-only

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

**RMF Funds (Only Data Flow):**
1. Client (`RMF.tsx`) fetches data via TanStack Query with pagination params
2. API route (`GET /api/rmf`) calls SEC API service
3. Service layer (`secApi.ts`) fetches from Thailand SEC API:
   - Checks cache first (fund lists: 24h, NAV data: 1h)
   - Makes API call if cache miss or expired
   - Respects rate limiting (3,000 calls per 5 minutes)
4. Data validated against Zod schemas in `shared/schema.ts`
5. Client components render:
   - `RMFFundTable` for table view
   - `RMFFundCard` for card view (grid layout)
6. Auto-refetch every 5 minutes maintains freshness

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

### Data Extraction Scripts

**Parsing Scripts** (in project root):
- `parse_rmf_funds.js` - Node.js script to parse `RMF-Fund-Comparison.md`
- `parse_rmf_funds.py` - Python alternative (same functionality)
- Run: `npm run data:rmf:parse` to regenerate CSV/MD files
- Note: Extracts ~410 of 417 funds (some HTML formatting inconsistencies)

**RMF Data Extraction Pipeline** (in `scripts/data-extraction/rmf/`):
- `phase-0-build-mapping.ts` - Build fund symbol → proj_id mapping
- `phase-1-fetch-all-funds.ts` - Batch fetch all RMF funds with complete data
- `fetch-complete-fund-data.ts` - Core data fetcher module
- `identify-incomplete-funds.ts` - Identify funds with incomplete data
- `reprocess-incomplete-funds.ts` - Re-process incomplete funds

**NPM Scripts:**
- `npm run data:rmf:build-mapping` - Run Phase 0 (build mapping)
- `npm run data:rmf:fetch-all` - Run Phase 1 (fetch all funds)
- `npm run data:rmf:identify-incomplete` - Identify incomplete funds
- `npm run data:rmf:reprocess` - Re-process incomplete funds
- `npm run data:rmf:parse` - Parse HTML to CSV/MD

See `scripts/data-extraction/rmf/README.md` for detailed workflow documentation.
