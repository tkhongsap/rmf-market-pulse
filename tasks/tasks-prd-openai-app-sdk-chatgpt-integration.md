# Tasks: OpenAI App SDK ChatGPT Integration
## Based on PRD: prd-openai-app-sdk-chatgpt-integration.md

**Project:** Thai RMF Market Pulse - ChatGPT MCP Widget Integration
**Timeline:** 5-6 weeks (22-28 days, includes 3-5 day buffer)
**Status:** Planning Phase - REVISED after technical review

---

## ⚠️ Critical Notes (Read First!)

1. **NAV History Data Source**: NAV history is in `data/rmf-funds/{SYMBOL}.json` files ONLY, NOT in CSV. CSV only has summary stats. See Tasks 2.9 and 4.6 for correct implementation.

2. **Fund Count**: 403 funds (not 410). CSV has 402 data rows + 1 header row.

3. **Data Quality**: Many funds have "Unknown" values in fees_json, parties_json. Phase 0 data quality gate is CRITICAL before proceeding.

4. **Prerequisites Phase**: Complete Phase -1 (environment setup) before starting Phase 0.

5. **Bundle Sizes**: Revised targets are realistic (fund card 100KB, chart 100KB). Original targets were too aggressive.

---

## Current State Assessment

**What Exists:**
- ✅ Basic MCP endpoint at `/mcp` in `server/routes.ts` (2 tools: `get_rmf_funds`, `get_rmf_fund_detail`)
- ✅ Comprehensive SEC API services in `server/services/` (secApi.ts, secFundFactsheetApi.ts, secFundDailyInfoApi.ts)
- ✅ Zod schemas in `shared/schema.ts` (RMFFund, RMFFundDetail, performance metrics)
- ✅ Data files: `docs/rmf-funds-consolidated.csv` (403 funds, 1.5MB) + `data/rmf-funds/*.json` (400+ individual files)
- ✅ Express server setup with JSON middleware
- ✅ React components (RMFFundCard, RMFFundTable) in `client/src/components/`
- ✅ Rate limiting and caching (3,000 calls/5min, 1h-24h cache TTL)

**What Needs to be Built:**
- ❌ In-memory data service (`server/services/rmfDataService.ts`) - Currently calls SEC API directly
- ❌ Enhanced MCP server using `@modelcontextprotocol/sdk` - Currently manual JSON handling
- ❌ 4 additional MCP tools (search, performance, NAV history, compare) - Only 2 exist
- ❌ 4 HTML widgets in `public/mcp-components/` - None exist
- ❌ Structured MCP response format with `structuredContent`, `_meta`, `content`
- ❌ Widget resources registration
- ❌ Production deployment configuration

---

## Relevant Files

### To Be Created
- `server/services/rmfDataService.ts` - In-memory data service with indexes
- `server/services/rmfDataService.test.ts` - Unit tests for data service
- `server/mcp.ts` - MCP SDK server implementation
- `server/services/mcpHandlers.ts` - Tool handler functions
- `server/services/mcpHandlers.test.ts` - Integration tests for tools
- `public/mcp-components/rmf-fund-list.html` - Fund carousel widget
- `public/mcp-components/rmf-fund-card.html` - Fund detail widget
- `public/mcp-components/rmf-fund-comparison.html` - Comparison table widget
- `public/mcp-components/rmf-performance-chart.html` - NAV chart widget
- `public/mcp-components/shared/styles.css` - Shared widget styles
- `public/mcp-components/shared/utils.js` - Shared widget utilities
- `tests/golden-prompts.test.ts` - Golden prompt accuracy tests
- `docs/openai-app-sdk/TOOLS_CONTRACT.md` - Tool specifications
- `docs/openai-app-sdk/DATA_GAPS.md` - Data quality audit

### To Be Modified
- `server/routes.ts` - Add `/mcp` route integration with new MCP server
- `server/index.ts` - Initialize data service on startup
- `shared/schema.ts` - Add MCP-specific schemas (mcpFundSummarySchema, etc.)
- `package.json` - Add `@modelcontextprotocol/sdk` and `chart.js` dependencies
- `.env` - Add MCP configuration variables
- `tsconfig.json` - May need path aliases for widgets

### Notes
- Unit tests use Jest framework (run with `npx jest`)
- Widgets are vanilla JS (no React/Vue to keep bundles small)
- All schemas must validate with Zod before MCP response
- MCP Inspector tool used for manual testing: `npx @modelcontextprotocol/inspector@latest`

---

## Tasks

### Phase -1: Prerequisites & Environment Setup (30 minutes - 1 hour) ✅ COMPLETED

- [x] **0.0 Verify Development Environment**
  - [x] 0.1 Verify Node.js v18+ installed: `node --version`
  - [x] 0.2 Verify npm installed: `npm --version`
  - [x] 0.3 Clone/pull latest repository code
  - [x] 0.4 Install dependencies: `npm install`
  - [x] 0.5 Verify environment variables:
    - [x] 0.5.1 Check `SEC_API_KEY` is set in `.env` file
    - [x] 0.5.2 Check `PORT` is set (default: 5000)
    - [x] 0.5.3 Check `NODE_ENV` (should be 'development' for local work)
  - [x] 0.6 Verify data files exist:
    - [x] 0.6.1 Confirm `docs/rmf-funds-consolidated.csv` exists and is 1.5MB (403 funds)
    - [x] 0.6.2 Confirm `data/rmf-funds/` directory has 400+ JSON files
    - [x] 0.6.3 Run quick count: `ls data/rmf-funds/*.json | wc -l` (should show ~400)
  - [x] 0.7 Test server starts successfully:
    - [x] 0.7.1 Run `npm run dev`
    - [x] 0.7.2 Verify server starts on port 5000
    - [x] 0.7.3 Test health check: `curl http://localhost:5000/healthz`
    - [x] 0.7.4 Stop server (Ctrl+C)
  - [x] 0.8 Run TypeScript type checking: `npm run check` (should have no errors)
  - [x] 0.9 Verify existing MCP endpoint: `curl -X POST http://localhost:5000/mcp -H "Content-Type: application/json" -d '{"method":"tools/list"}'`
  - [x] 0.10 Document any environment issues in `docs/SETUP_ISSUES.md`

### Phase 0: Data Contract & Schema Setup (2 days)

- [ ] **1.0 Audit Data Quality & Define Tool Contracts**
  - [ ] 1.1 Sample 5+ diverse funds from `docs/rmf-funds-consolidated.csv` (equity, fixed income, Thai-only, global, cancelled)
  - [ ] 1.2 Verify all 60 columns are populated or have predictable nulls
  - [ ] 1.3 Run existing script `npm run data:rmf:identify-incomplete` to check fund completeness
  - [ ] 1.4 Document data gaps in new file `docs/openai-app-sdk/DATA_GAPS.md` (missing fields, null patterns, edge cases)
    - [ ] 1.4.1 Document "Unknown" values in fees_json, parties_json fields
    - [ ] 1.4.2 Document null benchmarks (estimate % of funds affected)
    - [ ] 1.4.3 Document missing 3Y/5Y/10Y performance data
    - [ ] 1.4.4 **PHASE 0 GATE**: Verify at least 90% of funds have non-null NAV data
    - [ ] 1.4.5 **PHASE 0 GATE**: Verify at least 80% of funds have YTD performance data
    - [ ] 1.4.6 Create mitigation plan for each gap (display "N/A", hide section, or skip fund)
  - [ ] 1.5 Create `docs/openai-app-sdk/TOOLS_CONTRACT.md` with specifications for all 6 tools (get_rmf_funds, search_rmf_funds, get_rmf_fund_detail, get_rmf_fund_performance, get_rmf_fund_nav_history, compare_rmf_funds)
  - [ ] 1.6 Define JSON input/output schemas for each tool with sample payloads from real funds
  - [ ] 1.7 Add MCP-specific Zod schemas to `shared/schema.ts`:
    - [ ] 1.7.1 `mcpFundSummarySchema` - For fund list responses
    - [ ] 1.7.2 `mcpFundDetailSchema` - For single fund details
    - [ ] 1.7.3 `mcpNavHistorySchema` - For NAV chart data
    - [ ] 1.7.4 `mcpComparisonSchema` - For fund comparison
    - [ ] 1.7.5 `mcpToolResponseSchema` - Base response wrapper with `content`, `structuredContent`, `_meta`
  - [ ] 1.8 Review and get stakeholder approval on tool contracts

### Phase 1: Backend Infrastructure (3-4 days)

- [ ] **2.0 Build In-Memory Data Service**
  - [ ] 2.1 Create `server/services/rmfDataService.ts` with class `RMFDataService`
  - [ ] 2.2 Implement CSV parser to load `docs/rmf-funds-consolidated.csv` (403 funds)
    - [ ] 2.2.1 Install CSV parser: `npm install csv-parse` (recommended for large files)
    - [ ] 2.2.2 Use `csv-parse/sync` for synchronous parsing on startup
    - [ ] 2.2.3 Wrap CSV parsing in try-catch to handle file not found or parse errors
    - [ ] 2.2.4 Handle JSON field parsing (asset_allocation_json, fees_json, parties_json) with try-catch
    - [ ] 2.2.5 Replace "Unknown" string values with null for cleaner data
    - [ ] 2.2.6 Log successful load: "Loaded 403 RMF funds in X ms"
    - [ ] 2.2.7 If load fails, log error and exit process (critical failure)
  - [ ] 2.3 Build primary index: Map<symbol, RMFFundDetail> for O(1) fund lookup
  - [ ] 2.4 Build secondary indexes:
    - [ ] 2.4.1 `byAMC`: Map<amc_name, symbol[]>
    - [ ] 2.4.2 `byRisk`: Map<risk_level, symbol[]>
    - [ ] 2.4.3 `byCategory`: Map<classification, symbol[]>
    - [ ] 2.4.4 `byPerformance`: Pre-sorted arrays for YTD, 1Y, 3Y, 5Y
  - [ ] 2.5 Implement `search(filters: FundSearchFilters)` method with support for:
    - [ ] 2.5.1 Text search on fund name/symbol (case-insensitive, partial match)
    - [ ] 2.5.2 AMC filter (exact match on AMC name)
    - [ ] 2.5.3 Risk level filter (min/max range)
    - [ ] 2.5.4 Category filter (equity, fixed_income, mixed, international)
    - [ ] 2.5.5 Performance threshold filter (minYtdReturn)
    - [ ] 2.5.6 Pagination support (page, pageSize)
    - [ ] 2.5.7 Sorting (by performance, risk, nav, name)
  - [ ] 2.6 Implement `getBySymbol(symbol: string)` for single fund lookup
  - [ ] 2.7 Implement `getTopPerformers(period: string, limit: number, riskLevel?: number)`
  - [ ] 2.8 Implement `compareFunds(symbols: string[])` for side-by-side comparison (2-5 funds)
  - [ ] 2.9 Implement `getNavHistory(symbol: string, days: number)` - **CRITICAL: Read from JSON files**
    - [ ] 2.9.1 Read from individual fund JSON: `data/rmf-funds/{symbol}.json`
    - [ ] 2.9.2 Access `nav_history` array (not CSV - CSV only has summary stats)
    - [ ] 2.9.3 Filter to last N days based on `days` parameter
    - [ ] 2.9.4 Calculate daily changes and percentages
    - [ ] 2.9.5 Handle missing NAV history gracefully (return empty array if file not found)
    - [ ] 2.9.6 Cache 7-day history in memory for sparkline use (frequently accessed)
  - [ ] 2.10 Add data refresh method `refreshData()` to reload CSV and refresh 7-day cache
    - [ ] 2.10.1 Implement scheduled task using `node-cron` or similar
    - [ ] 2.10.2 Run daily at 6:00 AM Bangkok time (after SEC updates)
    - [ ] 2.10.3 Log refresh start/completion with timestamp
    - [ ] 2.10.4 On error, log but don't crash (keep serving cached data)
  - [ ] 2.11 Create unit tests in `server/services/rmfDataService.test.ts`:
    - [ ] 2.11.1 Test CSV loading (handles 403 rows)
    - [ ] 2.11.2 Test index building (all indexes populated)
    - [ ] 2.11.3 Test search with various filter combinations
    - [ ] 2.11.4 Test Thai text handling in fund names
    - [ ] 2.11.5 Test edge cases (empty results, invalid symbols, null values)
    - [ ] 2.11.6 Test performance sorting accuracy
    - [ ] 2.11.7 Achieve >80% test coverage
  - [ ] 2.12 Integrate data service into `server/index.ts`: Initialize on startup, log load time

- [ ] **3.0 Implement MCP Server with SDK**
  - [ ] 3.1 Install dependencies:
    - [ ] 3.1.1 Verify MCP SDK already installed: `npm list @modelcontextprotocol/sdk` (should show v1.21.1+)
    - [ ] 3.1.2 If not installed: `npm install @modelcontextprotocol/sdk@^1.21.1`
    - [ ] 3.1.3 Install CSV parser: `npm install csv-parse` (for Task 2.2)
    - [ ] 3.1.4 Install Chart.js for widgets: `npm install chart.js@^4.4.0`
    - [ ] 3.1.5 Install node-cron for data refresh: `npm install node-cron @types/node-cron`
  - [ ] 3.2 Create `server/mcp.ts` with MCP Server class initialization
    - [ ] 3.2.1 Review MCP SDK v1.21.1 documentation for API patterns
    - [ ] 3.2.2 Verify `Server`, `ListToolsRequestSchema`, `CallToolRequestSchema` exports
    - [ ] 3.2.3 Initialize Server instance with server info (name, version)
  - [ ] 3.3 Register 6 tools with `server.setRequestHandler(ListToolsRequestSchema, ...)`:
    - [ ] 3.3.1 Tool: `get_rmf_funds` with description, input schema (page, pageSize, fundType, search, sortBy)
    - [ ] 3.3.2 Tool: `search_rmf_funds` with description, input schema (search, amc, minRiskLevel, maxRiskLevel, minYtdReturn, category, sortBy, limit)
    - [ ] 3.3.3 Tool: `get_rmf_fund_detail` with description, input schema (fundCode)
    - [ ] 3.3.4 Tool: `get_rmf_fund_performance` with description, input schema (period, sortBy, limit, riskLevel)
    - [ ] 3.3.5 Tool: `get_rmf_fund_nav_history` with description, input schema (fundCode, days)
    - [ ] 3.3.6 Tool: `compare_rmf_funds` with description, input schema (fundCodes[], compareBy)
  - [ ] 3.4 Add tool metadata for better ChatGPT discovery:
    - [ ] 3.4.1 Include example queries in descriptions
    - [ ] 3.4.2 Add `readOnlyHint: true` for all tools
    - [ ] 3.4.3 Add keywords: "RMF", "retirement", "mutual fund", "Thailand", "tax"
  - [ ] 3.5 Register widget resources with `server.setRequestHandler(ListResourcesRequestSchema, ...)`:
    - [ ] 3.5.1 Resource: `component://rmf-fund-list` → `public/mcp-components/rmf-fund-list.html`
    - [ ] 3.5.2 Resource: `component://rmf-fund-card` → `public/mcp-components/rmf-fund-card.html`
    - [ ] 3.5.3 Resource: `component://rmf-fund-comparison` → `public/mcp-components/rmf-fund-comparison.html`
    - [ ] 3.5.4 Resource: `component://rmf-performance-chart` → `public/mcp-components/rmf-performance-chart.html`
  - [ ] 3.6 Implement tool call handler with `server.setRequestHandler(CallToolRequestSchema, ...)`
  - [ ] 3.7 Set up HTTP transport (SSE or Streamable HTTP) for ChatGPT communication
  - [ ] 3.8 Update `server/routes.ts`: Replace manual MCP implementation with new MCP server
  - [ ] 3.9 Add CORS configuration to allow ChatGPT origin
  - [ ] 3.10 Add health check endpoint `/mcp/health` that returns 200 OK with server status
  - [ ] 3.11 Test with MCP Inspector: `npx @modelcontextprotocol/inspector@latest`
  - [ ] 3.12 Verify all 6 tools appear in tools/list response

### Phase 2: MCP Tool Implementation (3-4 days)

- [ ] **4.0 Implement 6 MCP Tools with Validation**
  - [ ] 4.1 Create `server/services/mcpHandlers.ts` for tool handler functions
  - [ ] 4.2 Implement handler: `handleGetRmfFunds(params)`
    - [ ] 4.2.1 Validate input with Zod schema (page, pageSize 1-50, optional filters)
    - [ ] 4.2.2 Call `rmfDataService.search()` with pagination
    - [ ] 4.2.3 Return structured response:
      ```typescript
      {
        content: [{ type: "text", text: "Found {count} RMF funds..." }],
        structuredContent: { funds: [...], totalCount, page, pageSize },
        _meta: { "openai/outputTemplate": "component://rmf-fund-list", timestamp }
      }
      ```
    - [ ] 4.2.4 Handle edge case: empty results
    - [ ] 4.2.5 Validate output against mcpFundSummarySchema
  - [ ] 4.3 Implement handler: `handleSearchRmfFunds(params)`
    - [ ] 4.3.1 Validate input (all filter fields optional, but at least one required)
    - [ ] 4.3.2 Call `rmfDataService.search()` with advanced filters
    - [ ] 4.3.3 Return same structure as get_rmf_funds
    - [ ] 4.3.4 Handle case-insensitive search on fund name/symbol
    - [ ] 4.3.5 Handle AMC partial matching (e.g., "Krungsri" matches "Krungsri Asset Management")
  - [ ] 4.4 Implement handler: `handleGetRmfFundDetail(params)`
    - [ ] 4.4.1 Validate input (fundCode required)
    - [ ] 4.4.2 Call `rmfDataService.getBySymbol()`
    - [ ] 4.4.3 Return 404 error if fund not found
    - [ ] 4.4.4 Parse asset_allocation_json field into structured array
    - [ ] 4.4.5 Calculate 7-day NAV history for mini sparkline (_meta.navHistory7d)
    - [ ] 4.4.6 Include factsheet and report URLs if available
    - [ ] 4.4.7 Return structured response:
      ```typescript
      {
        content: [{ type: "text", text: "{fundName} is managed by {amc}..." }],
        structuredContent: { fund: { /* all details */ } },
        _meta: { "openai/outputTemplate": "component://rmf-fund-card", navHistory7d: [...] }
      }
      ```
  - [ ] 4.5 Implement handler: `handleGetRmfFundPerformance(params)`
    - [ ] 4.5.1 Validate input (period: ytd|3m|6m|1y|3y|5y, sortBy: asc|desc, limit default 10)
    - [ ] 4.5.2 Call `rmfDataService.getTopPerformers()`
    - [ ] 4.5.3 Exclude funds with null performance for requested period
    - [ ] 4.5.4 Include benchmark comparison and calculate outperformance
    - [ ] 4.5.5 Return fund list with performance highlighted
  - [ ] 4.6 Implement handler: `handleGetRmfFundNavHistory(params)` - **CORRECTED LOGIC**
    - [ ] 4.6.1 Validate input (fundCode required, days default 30, max 365)
    - [ ] 4.6.2 Call `rmfDataService.getNavHistory()` (reads from JSON files, not CSV)
    - [ ] 4.6.3 Data service reads from `data/rmf-funds/{symbol}.json` nav_history array
    - [ ] 4.6.4 Filter array to last N days (all history comes from JSON files)
    - [ ] 4.6.5 Calculate daily changes and percentages (done in data service)
    - [ ] 4.6.6 Calculate period return and volatility (standard deviation)
    - [ ] 4.6.7 Return structured response:
      ```typescript
      {
        content: [{ type: "text", text: "{fundName} NAV over {days} days..." }],
        structuredContent: { fundCode, fundName, navHistory: [...], periodReturn, volatility },
        _meta: { "openai/outputTemplate": "component://rmf-performance-chart", minNav, maxNav, avgNav }
      }
      ```
  - [ ] 4.7 Implement handler: `handleCompareFunds(params)`
    - [ ] 4.7.1 Validate input (fundCodes array, min 2, max 5)
    - [ ] 4.7.2 Call `rmfDataService.compareFunds()`
    - [ ] 4.7.3 Return 400 error if any fund not found
    - [ ] 4.7.4 Parse fees_json for fee comparison
    - [ ] 4.7.5 Calculate tracking error if benchmark data available
    - [ ] 4.7.6 Return comparison table data with best/worst highlighting hints
  - [ ] 4.8 Add comprehensive error handling for all handlers:
    - [ ] 4.8.1 400 Bad Request: Invalid parameters (return Zod validation errors)
    - [ ] 4.8.2 404 Not Found: Fund code doesn't exist
    - [ ] 4.8.3 500 Internal Server Error: Unexpected errors
    - [ ] 4.8.4 Error response format: `{ error: { code, message, actionableHint } }`
  - [ ] 4.9 Create integration tests in `server/services/mcpHandlers.test.ts`:
    - [ ] 4.9.1 Test each tool with valid inputs
    - [ ] 4.9.2 Test error cases (invalid params, missing funds)
    - [ ] 4.9.3 Test output schema validation (Zod passes)
    - [ ] 4.9.4 Test edge cases (empty search, null performance data)
    - [ ] 4.9.5 Achieve 100% coverage of all 6 tools
  - [ ] 4.10 Wire handlers into MCP server in `server/mcp.ts`
  - [ ] 4.11 Test all tools with MCP Inspector

### Phase 3: Widget Development (5-7 days)

- [ ] **5.0 Build Interactive HTML Widgets**
  - [ ] 5.1 Set up widget directory structure:
    - [ ] 5.1.1 Create `public/mcp-components/` directory
    - [ ] 5.1.2 Create `public/mcp-components/shared/` for common files
  - [ ] 5.2 Create shared styles in `public/mcp-components/shared/styles.css`:
    - [ ] 5.2.1 Define CSS custom properties for light/dark themes
    - [ ] 5.2.2 Base typography (system fonts, 14px base, 1.5 line height)
    - [ ] 5.2.3 Color system (--color-bg, --color-fg, --color-positive, --color-negative, --color-border)
    - [ ] 5.2.4 Component styles (cards, buttons, badges, tables)
    - [ ] 5.2.5 Responsive utilities (mobile < 768px, tablet 768-1024px, desktop > 1024px)
  - [ ] 5.3 Create shared utilities in `public/mcp-components/shared/utils.js`:
    - [ ] 5.3.1 `formatNumber(value, decimals)` - Format currency/percentages
    - [ ] 5.3.2 `formatDate(dateString)` - Format ISO dates to readable format
    - [ ] 5.3.3 `getTheme()` - Detect current theme via window.openai.matchTheme()
    - [ ] 5.3.4 `applyTheme(theme)` - Apply theme CSS variables
    - [ ] 5.3.5 `getRiskColor(riskLevel)` - Map risk 1-8 to color (green/yellow/red)
    - [ ] 5.3.6 `getChangeColor(value)` - Return positive/negative color
  - [ ] 5.4 Build Widget 1: Fund List Carousel (`public/mcp-components/rmf-fund-list.html`)
    - [ ] 5.4.1 Create HTML structure: Header (title + count), carousel container, pagination controls
    - [ ] 5.4.2 Read data from `window.openai.toolOutput.structuredContent.funds`
    - [ ] 5.4.3 Render fund cards in horizontal carousel:
      - [ ] 5.4.3.1 Fund name + symbol
      - [ ] 5.4.3.2 AMC name
      - [ ] 5.4.3.3 Current NAV with change indicator (↑/↓ + percentage)
      - [ ] 5.4.3.4 YTD return with color coding
      - [ ] 5.4.3.5 Risk level badge (1-8 with color)
      - [ ] 5.4.3.6 "View Details" button
    - [ ] 5.4.4 Implement horizontal scroll with CSS snap points
    - [ ] 5.4.5 Add swipe gesture support for mobile (touch events)
    - [ ] 5.4.6 Add "Load More" button if more pages available (check totalCount vs displayed)
    - [ ] 5.4.7 Implement "View Details" button: Call `window.openai.callTool("get_rmf_fund_detail", { fundCode })`
    - [ ] 5.4.8 Add loading state (skeleton cards)
    - [ ] 5.4.9 Add empty state ("No funds found matching your criteria")
    - [ ] 5.4.10 Add error state with retry button
    - [ ] 5.4.11 Apply theme detection and listening to themechange event
    - [ ] 5.4.12 Test responsive layout (stack vertically on mobile < 400px)
    - [ ] 5.4.13 Minify JS/CSS, ensure bundle < 50KB gzipped (realistic target)
  - [ ] 5.5 Build Widget 2: Fund Detail Card (`public/mcp-components/rmf-fund-card.html`)
    - [ ] 5.5.1 Create HTML structure: Header (name + back button), tab bar, tab content areas
    - [ ] 5.5.2 Read data from `window.openai.toolOutput.structuredContent.fund`
    - [ ] 5.5.3 Implement tab navigation (Overview, Performance, Holdings, Fees)
    - [ ] 5.5.4 Build Overview tab:
      - [ ] 5.5.4.1 Current NAV with 7-day mini sparkline (use _meta.navHistory7d)
      - [ ] 5.5.4.2 Risk level badge with description text
      - [ ] 5.5.4.3 Classification and management style
      - [ ] 5.5.4.4 Asset allocation pie chart (use Chart.js or lightweight alternative)
      - [ ] 5.5.4.5 AMC information
    - [ ] 5.5.5 Build Performance tab:
      - [ ] 5.5.5.1 Performance table (YTD, 3M, 6M, 1Y, 3Y, 5Y with benchmark comparison)
      - [ ] 5.5.5.2 Color-code outperformance (green) vs underperformance (red)
      - [ ] 5.5.5.3 "View NAV Chart" button → Call `window.openai.callTool("get_rmf_fund_nav_history", { fundCode, days: 30 })`
    - [ ] 5.5.6 Build Holdings tab:
      - [ ] 5.5.6.1 Asset allocation breakdown table (asset class, percentage)
      - [ ] 5.5.6.2 Top 5 holdings if available (parse from holdings data)
      - [ ] 5.5.6.3 Sector exposure if available
    - [ ] 5.5.7 Build Fees tab:
      - [ ] 5.5.7.1 Fee structure table (front-end, back-end, management fees)
      - [ ] 5.5.7.2 Investment minimums (initial, additional, redemption)
      - [ ] 5.5.7.3 Document links (factsheet, annual report) - open in new tab
    - [ ] 5.5.8 Implement fullscreen mode toggle
    - [ ] 5.5.9 Add close button that returns to conversation
    - [ ] 5.5.10 Implement keyboard navigation (Tab through tabs, Arrow keys to switch tabs, Escape to close)
    - [ ] 5.5.11 Apply theme detection
    - [ ] 5.5.12 Test all tabs with real fund data
    - [ ] 5.5.13 Minify, ensure bundle < 100KB gzipped (revised target - includes tabs + mini chart)
  - [ ] 5.6 Build Widget 3: Fund Comparison Table (`public/mcp-components/rmf-fund-comparison.html`)
    - [ ] 5.6.1 Create HTML table structure: Metric rows × Fund columns (2-5 funds)
    - [ ] 5.6.2 Read data from `window.openai.toolOutput.structuredContent.funds`
    - [ ] 5.6.3 Render comparison rows:
      - [ ] 5.6.3.1 Fund names as column headers
      - [ ] 5.6.3.2 NAV row
      - [ ] 5.6.3.3 Performance rows (YTD, 1Y, 3Y, 5Y)
      - [ ] 5.6.3.4 Risk level row
      - [ ] 5.6.3.5 Fee rows (front-end, management)
      - [ ] 5.6.3.6 Benchmark row
    - [ ] 5.6.4 Highlight best value in green, worst in red per row
    - [ ] 5.6.5 Implement sortable columns (click header to sort by that fund)
    - [ ] 5.6.6 Make table horizontally scrollable on mobile
    - [ ] 5.6.7 Display in fullscreen mode by default
    - [ ] 5.6.8 Add close button to return to conversation
    - [ ] 5.6.9 Apply theme detection
    - [ ] 5.6.10 Test with 2, 3, 4, and 5 fund comparisons
    - [ ] 5.6.11 Minify, ensure bundle < 40KB gzipped
  - [ ] 5.7 Build Widget 4: Performance Chart (`public/mcp-components/rmf-performance-chart.html`)
    - [ ] 5.7.1 Install Chart.js: Include from CDN or bundle locally
    - [ ] 5.7.2 Create HTML structure: Header (fund name + period return), canvas element, controls
    - [ ] 5.7.3 Read data from `window.openai.toolOutput.structuredContent.navHistory`
    - [ ] 5.7.4 Render line chart with Chart.js:
      - [ ] 5.7.4.1 X-axis: Dates from navHistory
      - [ ] 5.7.4.2 Y-axis: NAV values
      - [ ] 5.7.4.3 Line color based on theme
      - [ ] 5.7.4.4 Grid lines with theme-aware colors
    - [ ] 5.7.5 Add tooltip on hover: Show exact NAV and date
    - [ ] 5.7.6 Display period return prominently above chart (percentage + color)
    - [ ] 5.7.7 Add zoom controls (+/- buttons to adjust date range)
    - [ ] 5.7.8 Add fullscreen toggle button
    - [ ] 5.7.9 Responsive sizing: 300px height inline, 600px height fullscreen
    - [ ] 5.7.10 Apply theme detection (update chart colors on theme change)
    - [ ] 5.7.11 Test with various date ranges (7d, 30d, 90d, 365d)
    - [ ] 5.7.12 Minify, ensure bundle < 100KB gzipped (revised - Chart.js alone is ~60KB)
  - [ ] 5.8 Test all widgets:
    - [ ] 5.8.1 Theme switching works without page reload
    - [ ] 5.8.2 Responsive layouts on mobile (test on iOS/Android simulators)
    - [ ] 5.8.3 Accessibility: Keyboard navigation, screen reader labels (add aria-label attributes)
    - [ ] 5.8.4 Test with mock data (create test HTML files)
    - [ ] 5.8.5 Verify WCAG AA contrast ratios (use browser dev tools)

### Phase 4: Testing & Quality Assurance (5-7 days, revised timeline)

- [ ] **6.0 Comprehensive Testing & Validation**
  - [ ] 6.1 Unit test verification:
    - [ ] 6.1.1 Run all unit tests: `npx jest`
    - [ ] 6.1.2 Verify >80% coverage for rmfDataService
    - [ ] 6.1.3 Verify 100% coverage for mcpHandlers
    - [ ] 6.1.4 Fix any failing tests
  - [ ] 6.2 MCP Inspector local testing:
    - [ ] 6.2.1 Start server: `npm run dev`
    - [ ] 6.2.2 Run MCP Inspector: `npx @modelcontextprotocol/inspector@latest`
    - [ ] 6.2.3 Test tool discovery: Verify all 6 tools appear
    - [ ] 6.2.4 Test `get_rmf_funds`: Try with different page/pageSize/filters
    - [ ] 6.2.5 Test `search_rmf_funds`: Try text search, AMC filter, risk filter, category filter
    - [ ] 6.2.6 Test `get_rmf_fund_detail`: Try valid and invalid fund codes
    - [ ] 6.2.7 Test `get_rmf_fund_performance`: Try different periods and sort orders
    - [ ] 6.2.8 Test `get_rmf_fund_nav_history`: Try 7d, 30d, 90d, 365d
    - [ ] 6.2.9 Test `compare_rmf_funds`: Try 2, 3, 4, 5 fund comparisons
    - [ ] 6.2.10 Verify structured response format for all tools (content + structuredContent + _meta)
    - [ ] 6.2.11 Verify error handling (invalid params, not found, etc.)
    - [ ] 6.2.12 Measure response times (target < 500ms average)
  - [ ] 6.3 Create golden prompt test suite in `tests/golden-prompts.test.ts`:
    - [ ] 6.3.0 **Implementation approach**: Create automated Jest tests that use MCP Inspector API programmatically
    - [ ] 6.3.0.1 Each test sends a prompt and verifies which tool is triggered (if any)
    - [ ] 6.3.0.2 Calculate accuracy metrics: direct (target 95%), indirect (target 80%), negative (target 0%)
    - [ ] 6.3.0.3 Output test report showing pass/fail for each prompt category
    - [ ] 6.3.1 Direct prompts (must trigger tools - 100% accuracy):
      - [ ] "Show me top RMF funds" → get_rmf_funds
      - [ ] "Find RMF funds from Krungsri Asset Management" → search_rmf_funds
      - [ ] "Tell me about B-ASEANRMF fund" → get_rmf_fund_detail
      - [ ] "Show me RMF funds with the best 1-year performance" → get_rmf_fund_performance
      - [ ] "Show me the NAV history for B-ASEANRMF over the last 30 days" → get_rmf_fund_nav_history
    - [ ] 6.3.2 Indirect prompts (should trigger tools - 80%+ accuracy):
      - [ ] "I want to save for retirement with tax benefits in Thailand" → get_rmf_funds
      - [ ] "What are the best tax-deductible investment options in Thailand?" → get_rmf_funds
      - [ ] "I'm a conservative investor looking for low-risk retirement funds" → search_rmf_funds (maxRiskLevel: 3)
      - [ ] "Which funds does Krungsri offer for retirement?" → search_rmf_funds (amc: Krungsri)
      - [ ] "Compare B-ASEANRMF and KFRMF-FIXED" → compare_rmf_funds
    - [ ] 6.3.3 Negative prompts (should NOT trigger - 0% false positives):
      - [ ] "Show me S&P 500 index performance" → NONE
      - [ ] "What are good real estate investment trusts in Thailand?" → NONE
      - [ ] "Should I invest in Bitcoin for retirement?" → NONE
      - [ ] "Show me the top Thai stocks today" → NONE
      - [ ] "What are the best retirement funds in Singapore?" → NONE
    - [ ] 6.3.4 Edge cases:
      - [ ] "Show me ESG funds" → Should clarify or return no results
      - [ ] "Tell me about INVALID-FUND-CODE" → Should return error gracefully
      - [ ] "Show me funds with 'ASEAN' in the name" → search_rmf_funds (search: ASEAN)
      - [ ] "Compare B-ASEANRMF performance with the S&P 500" → Partial tool call + general knowledge
      - [ ] Conversational context: "Show me top RMF funds" → "What about the second one?" → get_rmf_fund_detail with context
  - [ ] 6.4 ChatGPT integration testing:
    - [ ] 6.4.1 Set up ngrok tunnel: `ngrok http 5000`
    - [ ] 6.4.2 Add connector to ChatGPT (developer mode or GPT Store draft)
    - [ ] 6.4.3 Test all 20 golden prompts in ChatGPT
    - [ ] 6.4.4 Measure accuracy: Direct (target 95%), Indirect (target 80%), Negative (target 0%)
    - [ ] 6.4.5 Test widget rendering in ChatGPT web interface
    - [ ] 6.4.6 Test tool chaining (search → detail → chart)
    - [ ] 6.4.7 Test on mobile ChatGPT apps (iOS and Android)
    - [ ] 6.4.8 Document any discovery issues (prompts that don't trigger correct tool)
  - [ ] 6.5 Iterate on tool descriptions:
    - [ ] 6.5.1 If discovery accuracy < 80%, revise tool descriptions
    - [ ] 6.5.2 Add more example queries
    - [ ] 6.5.3 Adjust keywords and phrasing
    - [ ] 6.5.4 Re-test golden prompts after changes
  - [ ] 6.6 Performance testing:
    - [ ] 6.6.1 Measure average response time for each tool (target < 500ms)
    - [ ] 6.6.2 Measure p95 response time (target < 1000ms)
    - [ ] 6.6.3 Test with 50+ concurrent requests (use load testing tool like k6 or artillery)
    - [ ] 6.6.4 Monitor memory usage during load test (should not exceed 500MB)
    - [ ] 6.6.5 Verify widget load times < 2s on 4G network (use Chrome DevTools throttling)
  - [ ] 6.7 Cross-browser testing:
    - [ ] 6.7.1 Test widgets in Chrome (latest)
    - [ ] 6.7.2 Test widgets in Firefox (latest)
    - [ ] 6.7.3 Test widgets in Safari (latest)
    - [ ] 6.7.4 Test widgets in Edge (latest)
    - [ ] 6.7.5 Test widgets in iOS Safari (mobile)
    - [ ] 6.7.6 Test widgets in Android Chrome (mobile)
  - [ ] 6.8 Accessibility audit:
    - [ ] 6.8.1 Run automated accessibility tests (axe-core or Lighthouse)
    - [ ] 6.8.2 Test keyboard navigation in all widgets
    - [ ] 6.8.3 Test with screen reader (VoiceOver on Mac, NVDA on Windows, TalkBack on Android)
    - [ ] 6.8.4 Verify color contrast ratios (WCAG AA: 4.5:1 for text)
    - [ ] 6.8.5 Verify all interactive elements have focus indicators
    - [ ] 6.8.6 Fix any accessibility issues found
  - [ ] 6.9 Bug fixes and polish:
    - [ ] 6.9.1 Create bug list from all testing phases
    - [ ] 6.9.2 Prioritize: P0 (blocking), P1 (high), P2 (medium), P3 (low)
    - [ ] 6.9.3 Fix all P0 and P1 bugs
    - [ ] 6.9.4 Re-test after fixes
    - [ ] 6.9.5 Update documentation with known issues (P2/P3) if not fixed

### Phase 5: Production Deployment (2-3 days)

- [ ] **7.0 Deploy to Production & Submit to ChatGPT GPT Store**
  - [ ] 7.1 Choose hosting platform:
    - [ ] 7.1.1 Evaluate options: Replit (current), Railway, Render, Vercel
    - [ ] 7.1.2 Consider factors: Cost, performance, ease of deployment, HTTPS support
    - [ ] 7.1.3 Make decision and document choice
  - [ ] 7.2 Set up production environment:
    - [ ] 7.2.1 Create production account on chosen platform
    - [ ] 7.2.2 Configure environment variables:
      - [ ] NODE_ENV=production
      - [ ] PORT=5000 (or platform default)
      - [ ] SEC_API_KEY={your_key}
      - [ ] MCP_ENDPOINT=/mcp
      - [ ] LOG_LEVEL=info
      - [ ] DATABASE_URL={postgres_url} (optional for MVP, already in codebase)
      - [ ] ENABLE_MCP_SDK=true (feature flag for gradual rollout)
    - [ ] 7.2.3 Configure build command: `npm run build`
    - [ ] 7.2.4 Configure start command: `npm start`
    - [ ] 7.2.5 Verify HTTPS is enabled by default
  - [ ] 7.3 Deploy application:
    - [ ] 7.3.1 Push code to GitHub (if not already)
    - [ ] 7.3.2 Connect platform to GitHub repository
    - [ ] 7.3.3 Trigger initial deployment
    - [ ] 7.3.4 Wait for build to complete
    - [ ] 7.3.5 Verify deployment success (check logs)
  - [ ] 7.4 Verify production endpoint:
    - [ ] 7.4.1 Test health check: `https://{your-domain}/mcp/health` returns 200 OK
    - [ ] 7.4.2 Test MCP endpoint: POST to `https://{your-domain}/mcp` with tools/list
    - [ ] 7.4.3 Verify all 6 tools appear
    - [ ] 7.4.4 Test sample tool call (get_rmf_funds with basic params)
    - [ ] 7.4.5 Verify widgets load correctly
    - [ ] 7.4.6 **IMPORTANT**: Verify gzip compression enabled in Express (add compression middleware if missing)
    - [ ] 7.4.7 Test response sizes with `curl -I` and check `Content-Encoding: gzip` header
  - [ ] 7.5 Set up monitoring and logging:
    - [ ] 7.5.1 Configure error tracking (Sentry or platform built-in)
    - [ ] 7.5.2 Set up uptime monitoring (Pingdom, UptimeRobot, or platform monitoring)
    - [ ] 7.5.3 Configure alerts for:
      - [ ] Server downtime (> 5 minutes)
      - [ ] Error rate > 1%
      - [ ] Response time p95 > 1000ms
    - [ ] 7.5.4 Set up log aggregation if needed (CloudWatch, LogTail)
    - [ ] 7.5.5 Create dashboard to monitor key metrics (tool invocations, errors, response times)
  - [ ] 7.6 Prepare ChatGPT GPT Store submission assets:
    - [ ] 7.6.1 Create app icon (512x512 PNG, transparent background)
    - [ ] 7.6.2 Write app name: "Thai RMF Market Pulse"
    - [ ] 7.6.3 Write app description (< 200 chars): "Discover and compare 403+ Thai Retirement Mutual Funds (RMF) with real-time data, performance analytics, and tax benefit information"
    - [ ] 7.6.4 Select category: Finance
    - [ ] 7.6.5 Prepare MCP endpoint URL: `https://{your-domain}/mcp`
    - [ ] 7.6.6 Write privacy policy (or link to existing)
    - [ ] 7.6.7 Write terms of service (or link to existing)
    - [ ] 7.6.8 (Optional) Record demo video or create screenshots
    - [ ] 7.6.9 Provide support email
  - [ ] 7.7 Submit to ChatGPT GPT Store:
    - [ ] 7.7.1 Access ChatGPT GPT Store submission portal
    - [ ] 7.7.2 Fill in all metadata (name, description, category, icon)
    - [ ] 7.7.3 Provide MCP endpoint URL
    - [ ] 7.7.4 Add privacy policy and terms URLs
    - [ ] 7.7.5 Upload demo assets if available
    - [ ] 7.7.6 Submit for review
    - [ ] 7.7.7 Note submission date and expected review timeline
  - [ ] 7.8 Test production connector in ChatGPT:
    - [ ] 7.8.1 Add connector using production MCP endpoint
    - [ ] 7.8.2 Run all 20 golden prompts in production
    - [ ] 7.8.3 Verify tool discovery accuracy matches testing
    - [ ] 7.8.4 Verify widgets render correctly
    - [ ] 7.8.5 Test on mobile ChatGPT apps (iOS and Android)
  - [ ] 7.9 Create user documentation:
    - [ ] 7.9.1 Write `docs/USER_GUIDE.md` with:
      - [ ] Overview of features
      - [ ] Example prompts to try
      - [ ] How to interpret results
      - [ ] FAQs
    - [ ] 7.9.2 Write `docs/DEPLOYMENT_GUIDE.md` with:
      - [ ] Deployment steps
      - [ ] Environment variables
      - [ ] Monitoring setup
      - [ ] Troubleshooting
    - [ ] 7.9.3 Update `CLAUDE.md` with new MCP integration section
  - [ ] 7.10 Post-launch monitoring & rollback strategy:
    - [ ] 7.10.1 Monitor error logs for first 24 hours
    - [ ] 7.10.2 Track tool invocation counts by tool name
    - [ ] 7.10.3 Track error rate (target < 1%)
    - [ ] 7.10.4 Gather user feedback from ChatGPT ratings/reviews
    - [ ] 7.10.5 Create incident response plan for critical bugs
    - [ ] 7.10.6 **Rollback Strategy**: Keep old `/mcp` endpoint as `/mcp-legacy` for emergency fallback
    - [ ] 7.10.7 Document rollback procedure: Switch feature flag `ENABLE_MCP_SDK=false` to revert
    - [ ] 7.10.8 Test rollback procedure in staging before launch
    - [ ] 7.10.9 Schedule weekly reviews of usage metrics for first month

---

## Completion Checklist

Before marking the project as complete:

- [ ] All 7 parent tasks completed
- [ ] All unit tests passing (>80% coverage)
- [ ] All integration tests passing (100% of tools)
- [ ] Golden prompt accuracy: >95% direct, >80% indirect, <5% negative
- [ ] Performance targets met: <500ms avg response, <2s widget load, <100KB bundles
- [ ] Accessibility: WCAG AA compliant
- [ ] Production deployed and accessible via HTTPS
- [ ] ChatGPT GPT Store submission complete
- [ ] Monitoring and alerting configured
- [ ] User documentation complete
- [ ] No P0 or P1 bugs remaining

---

**Total Estimated Tasks:** ~170 sub-tasks across 8 parent tasks (including Phase -1 Prerequisites)
**Timeline:** 22-28 days (5-6 weeks, includes 3-5 day buffer for unexpected issues)
**Team:** 1 full-stack developer + optional QA support

## Revision History

**v1.1 (2025-11-12)**: Technical review fixes applied
- ✅ Fixed fund count: 403 funds (was incorrectly 410 in some places)
- ✅ **CRITICAL FIX**: NAV history now correctly reads from JSON files (not CSV)
- ✅ Added Prerequisites Phase (-1) for environment setup
- ✅ Specified CSV parser library (csv-parse)
- ✅ Added comprehensive error handling for JSON parsing
- ✅ Revised widget bundle size targets (more realistic)
- ✅ Updated Phase 4 timeline: 5-7 days (was 3-5)
- ✅ Clarified golden prompt testing implementation (automated Jest tests)
- ✅ Added data refresh strategy (node-cron, daily at 6 AM)
- ✅ Added gzip compression verification
- ✅ Added rollback strategy (feature flag + legacy endpoint)
- ✅ Added Phase 0 data quality gates
- ✅ Total timeline revised: 22-28 days (was 17-24 days)

**v1.0 (2025-11-12)**: Initial version based on PRD
