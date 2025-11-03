# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A real-time financial data tracking application that displays commodity prices, forex exchange rates, and Thai Retirement Mutual Funds (RMF). Built as a full-stack TypeScript application with Express backend and React frontend, designed to integrate with ChatGPT as an MCP (Model Context Protocol) widget.

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
- RESTful endpoints for commodities, forex, and RMF data
- MCP Protocol endpoint at `/mcp` for ChatGPT integration
- Health check at `/healthz`

**Data Layer:**
- `server/services/yahooFinance.ts` - Commodities & Forex
  - Currently uses simulated market data with realistic price movements
  - TODO: Replace with actual Yahoo Finance API integration (yahoo-finance2 library has type issues)
  - Functions: `fetchCommodities()`, `fetchForex()`, `fetchSpecificCommodity()`, `fetchSpecificForexPair()`

- `server/services/secApi.ts` - Thai RMF Funds
  - Integrates with Thailand SEC API for real-time fund data
  - Rate limiting: 3,000 calls per 5 minutes
  - Caching: Fund lists (24h), NAV data (1h)
  - Functions: `fetchRMFFunds()`, `fetchRMFFundDetail()`, `searchRMFFunds()`

### Frontend Architecture (`client/`)

**Routing:** Uses Wouter (lightweight router), not React Router
- Main route: `/` → `Home.tsx` (Commodities & Forex)
- RMF route: `/rmf` → `RMF.tsx` (Thai Retirement Mutual Funds)
- 404 handling via `NotFound.tsx`

**State Management:**
- TanStack Query (React Query) for server state
- Query client configured in `client/src/lib/queryClient.ts`
- Auto-refetch intervals:
  - 60 seconds for commodities/forex
  - 5 minutes for RMF funds (less volatile data)

**UI Components:**
- Radix UI primitives for accessible components (`components/ui/`)
- Tailwind CSS for styling
- Theme switching (light/dark mode) via `next-themes`
- Custom components in `client/src/components/` for financial widgets

**Design System:**
Follow the design guidelines in `design_guidelines.md`:
- OpenAI Apps SDK Design System approach
- Minimal, data-first presentation
- Semantic color usage (green for gains, red for losses)
- System fonts for ChatGPT integration
- No decorative elements or branding

### Shared Schemas (`shared/`)

**File:** `shared/schema.ts`
- Zod schemas for type-safe API contracts
- Data types: `Commodity`, `Forex`, `RMFFund`, `AssetAllocation`, `FundHolding`
- Used on both client and server for validation

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
  - `get_commodity_prices` - Fetch commodity prices
  - `get_forex_rates` - Fetch forex exchange rates
  - `get_rmf_funds` - Fetch Thai RMF funds (with pagination/search)
  - `get_rmf_fund_detail` - Get detailed RMF fund information
- `tools/call` - Executes tool calls and returns formatted data

### Real-time Data Flow

**Commodities & Forex:**
1. Client fetches data via TanStack Query
2. API routes (`/api/commodities`, `/api/forex`) call service functions
3. Service layer returns simulated data matching Zod schemas
4. Client components render with type-safe data
5. Auto-refetch every 60 seconds maintains freshness

**RMF Funds:**
1. Client fetches data via TanStack Query with pagination params
2. API route (`/api/rmf`) calls SEC API service
3. Service layer fetches from Thailand SEC API (with caching & rate limiting)
4. Client components (RMFFundCard, RMFFundTable) render fund data
5. Auto-refetch every 5 minutes (funds change less frequently)

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

- `DATABASE_URL` - PostgreSQL connection string (required for database operations)
- `PORT` - Server port (defaults to 5000)
- `NODE_ENV` - Environment mode (development/production)
- `SEC_API_KEY` - Thailand SEC API key (required for RMF fund data)
  - Get API key from: https://api-portal.sec.or.th/
  - Subscribe to: Fund Factsheet API and Fund Daily Info API
  - Rate limit: 3,000 calls per 5 minutes
