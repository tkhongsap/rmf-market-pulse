# OpenAI App SDK Implementation: Master Plan
## Thai Fund Market Pulse - Complete Implementation Guide

**Document Version:** 1.0 (Consolidated from 4 source files)
**Last Updated:** 2025-11-12
**Status:** Planning Phase
**Estimated Timeline:** 3-4 weeks (17-24 days)

> This document consolidates:
> - `NEXT_STEPS_OPENAI_APP_SDK_DATA_CONTRACT.md` (Contract-first approach)
> - `NEXT_STEPS_OPENAI_APP_SDK.md` (6-week implementation plan)
> - `openai-apps-sdk-component-design.md` (Technical specifications)
> - `openai-apps-sdk-golden-prompts.md` (Testing prompts)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Development Philosophy](#2-development-philosophy)
3. [Phase Breakdown](#3-phase-breakdown)
4. [Tool Specifications](#4-tool-specifications)
5. [Component Architecture](#5-component-architecture)
6. [State Management & Integrations](#6-state-management--integrations)
7. [Testing Strategy](#7-testing-strategy)
8. [Data Preparation](#8-data-preparation)
9. [Implementation Checklist](#9-implementation-checklist)
10. [Deployment & Operations](#10-deployment--operations)

---

## 1. Executive Summary

### 1.1 Current State

You have **excellent foundation data** ready for OpenAI App SDK integration:

✅ **403 RMF funds** with comprehensive data in `data/rmf-funds/*.json`
✅ **Consolidated CSV** with 60 columns in `docs/rmf-funds-consolidated.csv`
✅ **Working Express API** with endpoints in `server/routes.ts`
✅ **React frontend** with reusable components
✅ **Zod schemas** defined in `shared/schema.ts`
✅ **SEC API integration** with caching and rate limiting
✅ **Basic MCP implementation** at `/mcp` endpoint

### 1.2 What We're Building

Transform this into a **ChatGPT-integrated widget** for conversational RMF fund discovery:

- **6 MCP Tools** for fund search, detail, comparison, performance, and NAV history
- **4 UI Widgets** (Fund Card, Fund List, Fund Detail, Performance Chart)
- **window.openai Integration** for bidirectional tool calls and state persistence
- **Responsive Design** for mobile ChatGPT apps (iOS/Android)
- **20 Golden Prompts** for testing discovery accuracy

### 1.3 Success Criteria

- Tool discovery accuracy: 100% for direct prompts, 80%+ for indirect prompts, 0% for negative prompts
- Component rendering: All widgets render correctly in < 2 seconds
- Data quality: All displayed data matches source JSON files
- Accessibility: WCAG AA compliance
- Mobile support: Works on iOS/Android ChatGPT apps

---

## 2. Development Philosophy

### 2.1 Contract-First Approach

**Core Principle:** Freeze the MCP tool contract and backing schemas BEFORE implementing UI components.

**Why This Matters:**
- Enables parallel development (backend, frontend, documentation teams)
- Prevents churn and schema drift during implementation
- Creates clear acceptance criteria for each component
- Reduces integration bugs

**Process:**
1. Define tool schemas with sample payloads
2. Lock `structuredContent`, `_meta`, and `content` formats
3. Document component mappings via `_meta["openai/outputTemplate"]`
4. Implement backend tools first
5. Validate with MCP Inspector
6. Build UI widgets against frozen contract

### 2.2 Data-Driven Validation

Before any implementation:
- Sample 5+ funds from consolidated CSV (equity, fixed income, Thai-only, global, cancelled)
- Verify every field we plan to expose is populated or has predictable nulls
- Log any systematic gaps in `docs/DATA_GAPS.md`
- This keeps UX honest about data limitations

### 2.3 Iterative Testing

- Test tools with MCP Inspector at each phase
- Validate golden prompts continuously
- Monitor discovery accuracy and adjust tool descriptions
- Mobile-first testing throughout

---

## 3. Phase Breakdown

### Phase 0: Data Validation (1 day)

**Goal:** Confirm data completeness and identify gaps

**Tasks:**
1. Sample 5+ diverse funds from `docs/rmf-funds-consolidated.csv`
   - Equity (e.g., B-ASEANRMF)
   - Fixed income (e.g., KFRMF-FIXED)
   - Thai-only vs. global
   - Active vs. cancelled
2. Verify all 60 columns are populated or have predictable nulls
3. Document gaps in `docs/DATA_GAPS.md`
4. Run `npm run data:rmf:identify-incomplete` for completeness audit

**Deliverable:** Data gap report with mitigation plan

---

### Phase 1: MCP Tool Contract (2-3 days)

**Goal:** Lock down tool specifications before implementation

**Tasks:**
1. Create `docs/TOOLS_CONTRACT.md` with:
   - 6 tool definitions (see Section 4)
   - JSON schemas for input + output
   - Sample payloads from real funds
   - Component mappings via `_meta["openai/outputTemplate"]`
2. Review with stakeholders (backend + UX)
3. Get sign-off before proceeding

**Deliverable:** `docs/TOOLS_CONTRACT.md` (frozen contract)

**Acceptance Criteria:**
- All 6 tools defined with complete schemas
- Sample payloads included for each tool
- Component mappings documented
- Backend + UX teams approve

---

### Phase 2: Shared Types & Data Service (2-3 days)

**Goal:** Update schemas and create data service layer

**Tasks:**
1. **Align Zod Schemas** (`shared/schema.ts`):
   - Update `RMFFund` to cover all CSV fields
   - Add `FundSummary`, `FundDetail`, `FundComparison` exports
   - Ensure schemas match tool contract from Phase 1
2. **Create Data Service** (`server/services/rmfDataService.ts`):
   - Load data from `data/rmf-funds/*.json` or consolidated CSV
   - In-memory store with indexes (by AMC, risk level, category)
   - Helper methods: `search()`, `getBySymbol()`, `topPerformers()`, `compare()`
3. **Add Unit Tests** (`tests/server/rmfDataService.test.ts`):
   - Test Thai text handling
   - Test missing metrics
   - Test extreme NAV swings
   - Test search/filter combinations

**Deliverables:**
- Updated `shared/schema.ts`
- New `server/services/rmfDataService.ts`
- Test suite with 80%+ coverage

**Acceptance Criteria:**
- Zod schemas match tool contract
- Data service returns deterministic results
- All tests pass

---

### Phase 3: MCP Server Implementation (3-4 days)

**Goal:** Implement MCP server with proper SDK usage and all 6 tools

**Tasks:**
1. **Refactor MCP Server** (`server/routes.ts` or new `server/mcp.ts`):
   - Use `@modelcontextprotocol/sdk` `Server` class (not manual JSON-RPC)
   - Implement `tools/list` handler
   - Implement `tools/call` handler
   - Add resource registration for UI widgets
2. **Implement 6 Tools**:
   - `get_rmf_funds` - Paginated list with filters
   - `get_rmf_fund_detail` - Single fund details
   - `search_rmf_funds` - Advanced search
   - `get_rmf_fund_performance` - Performance ranking
   - `get_rmf_fund_nav_history` - Historical NAV data
   - `compare_rmf_funds` - Side-by-side comparison
3. **Add Tool Metadata**:
   - `_meta["openai/outputTemplate"]` - Widget URI
   - `_meta["openai/widgetAccessible"]` - For widget-initiated calls
   - Status strings: `openai/toolInvocation/invoking`, `openai/toolInvocation/invoked`
   - `readOnlyHint` for read-only tools
4. **Structured Content Responses**:
   - Return `structuredContent` (for component hydration)
   - Return `content` (text for model)
   - Return `_meta` (component-only data)
5. **Error Handling**:
   - Standardize error payloads: `{ code, message, actionableHint }`
   - Handle not found, invalid params, rate limits

**Deliverables:**
- Refactored MCP server with proper SDK usage
- All 6 tools implemented
- Error handling framework

**Acceptance Criteria:**
- MCP Inspector discovers all 6 tools
- Each tool returns correct structured content format
- Error cases handled gracefully

---

### Phase 4: Widget Development (5-7 days)

**Goal:** Build 4 UI widgets with window.openai integration

**Tasks:**
1. **Set Up Build Infrastructure**:
   - Create `web/` directory structure
   - Configure esbuild for widget bundling
   - Add `npm run build:widgets` command
   - Create HTML templates
2. **Build Widgets** (in order):
   - **Fund Card Widget** (2 days) - Single fund inline display
   - **Fund List Widget** (2 days) - Carousel of multiple funds
   - **Fund Detail Widget** (2 days) - Fullscreen deep-dive with tabs
   - **Performance Chart Widget** (1 day) - NAV history line chart
3. **Implement window.openai Hooks**:
   - `useOpenAiGlobal` - Access tool output and globals
   - `useWidgetState` - State persistence
   - `useToolCall` - Call tools from widgets
4. **Theme & Accessibility**:
   - Light/dark mode detection via `window.openai.matchTheme()`
   - WCAG AA compliance (4.5:1 contrast, keyboard nav)
   - Semantic HTML with ARIA labels
5. **Bundle Optimization**:
   - Target < 100KB per widget (gzipped)
   - Tree-shake unused code
   - Inline critical CSS only

**Deliverables:**
- 4 working widgets bundled as standalone HTML files
- window.openai integration hooks
- Build pipeline with esbuild

**Acceptance Criteria:**
- All widgets render correctly with sample data
- Theme switching works
- Widgets are keyboard accessible
- Bundle sizes under target

---

### Phase 5: Testing & Validation (2-3 days)

**Goal:** Validate integration with MCP Inspector and ChatGPT

**Tasks:**
1. **Local Testing with MCP Inspector**:
   ```bash
   npx @modelcontextprotocol/inspector@latest
   ```
   - Test each tool with various parameters
   - Verify `structuredContent` format
   - Confirm component rendering
   - Test error cases
2. **ChatGPT Integration Testing**:
   - Set up ngrok tunnel: `ngrok http 5000`
   - Add connector in ChatGPT developer mode
   - Test all 20 golden prompts (see Section 7)
   - Measure discovery accuracy
   - Test on mobile (iOS/Android ChatGPT apps)
3. **Iterate on Tool Descriptions**:
   - Adjust based on discovery accuracy
   - Add examples for better matching
   - Refine keywords
4. **Performance Testing**:
   - Measure response times (target < 500ms)
   - Test with 50+ concurrent requests
   - Monitor memory usage

**Deliverables:**
- Test results report
- Optimized tool descriptions
- Performance benchmarks

**Acceptance Criteria:**
- 100% accuracy on direct prompts
- 80%+ accuracy on indirect prompts
- 0% false positives on negative prompts
- All widgets render in < 2 seconds

---

### Phase 6: Deployment (2-3 days)

**Goal:** Deploy to production and submit to ChatGPT GPT Store

**Tasks:**
1. **Production Deployment**:
   - Deploy to Replit/Railway/Render
   - Configure HTTPS endpoint
   - Set up monitoring (Sentry for errors)
2. **ChatGPT Connector Configuration**:
   - Submit to ChatGPT GPT Store
   - Provide metadata: name, description, icon, category
   - Test production endpoint
3. **Documentation**:
   - Create user guide with prompt examples
   - Write deployment guide
   - Add troubleshooting section
4. **Monitoring Setup**:
   - Track tool invocation frequency
   - Monitor error rates
   - Set up alerts for downtime

**Deliverables:**
- Production deployment
- ChatGPT GPT Store listing
- User documentation

**Acceptance Criteria:**
- App accessible via ChatGPT
- 99% uptime in first week
- User documentation complete

---

## 4. Tool Specifications

### 4.1 Tool 1: `get_rmf_funds`

**Purpose:** Fetch paginated list of RMF funds with optional filters

**Input Schema:**
```typescript
{
  page?: number;          // Page number (default: 1)
  pageSize?: number;      // Results per page (default: 20, max: 50)
  fundType?: string;      // Filter by fund classification
  search?: string;        // Search by fund name or symbol
  sortBy?: "performance" | "nav" | "name";  // Sort criteria
}
```

**Output Data Contract:**
```typescript
{
  // structuredContent (for component)
  structuredContent: {
    funds: Array<{
      fundCode: string;
      fundName: string;
      amc: string;
      latestNav: number;
      navChange: number;
      navChangePercent: number;
      riskLevel: number;
      ytdReturn: number;
    }>;
    totalCount: number;
    page: number;
    pageSize: number;
  },

  // _meta (component-only data)
  _meta: {
    "openai/outputTemplate": "ui://widget/fund-list.html",
    timestamp: string;
    cacheAge: number;
  },

  // content (for model)
  content: [{
    type: "text",
    text: "Found {count} RMF funds. The top performers include {fund1}, {fund2}, {fund3}..."
  }]
}
```

**Component:** `FundListWidget` (carousel)
**Display Mode:** Inline carousel (horizontally scrollable)

---

### 4.2 Tool 2: `get_rmf_fund_detail`

**Purpose:** Get detailed information for a specific fund

**Input Schema:**
```typescript
{
  fundCode: string;  // Fund symbol (e.g., "B-ASEANRMF")
}
```

**Output Data Contract:**
```typescript
{
  structuredContent: {
    fund: {
      // Core Info
      fundCode: string;
      fundName: string;
      amc: string;
      registrationDate: string;

      // NAV Data
      latestNav: number;
      navDate: string;
      navChange: number;
      navChangePercent: number;

      // Metadata
      classification: string;
      managementStyle: string;
      dividendPolicy: string;
      riskLevel: number;

      // Performance
      ytdReturn: number;
      return3m: number;
      return6m: number;
      return1y: number;
      return3y: number;
      return5y: number;

      // Benchmark
      benchmarkName: string;
      benchmarkReturn1y: number;

      // Asset Allocation
      assetAllocation: Array<{
        assetClass: string;
        percentage: number;
      }>;

      // Documents
      factsheetUrl: string;
      annualReportUrl: string;
    };
  },

  _meta: {
    "openai/outputTemplate": "ui://widget/fund-card.html",
    navHistory7d: Array<{ date: string; nav: number }>;  // For mini sparkline
    fullDataUrl: string;  // Link to fund JSON file
  },

  content: [{
    type: "text",
    text: "{fundName} ({fundCode}) is managed by {amc}. Current NAV: {nav} ({changePercent}%). 1-year return: {return1y}%..."
  }]
}
```

**Component:** `FundCardWidget` (single fund card)
**Display Mode:** Inline card with "View Details" button (expands to fullscreen)

---

### 4.3 Tool 3: `search_rmf_funds`

**Purpose:** Search RMF funds with advanced filters

**Input Schema:**
```typescript
{
  search?: string;        // Search term (fund name/symbol)
  amc?: string;           // Filter by asset management company
  riskLevel?: number;     // Filter by risk level (1-8)
  minReturn1y?: number;   // Minimum 1-year return
  classification?: string; // Fund classification type
  sortBy?: "performance" | "risk" | "nav";
  limit?: number;         // Max results (default: 20)
}
```

**Output Data Contract:** Same as `get_rmf_funds` tool

**Component:** `FundListWidget` (carousel)
**Display Mode:** Inline carousel with search context displayed

---

### 4.4 Tool 4: `get_rmf_fund_performance`

**Purpose:** Get funds sorted by performance metrics

**Input Schema:**
```typescript
{
  period: "ytd" | "3m" | "6m" | "1y" | "3y" | "5y";
  sortBy: "asc" | "desc";
  limit?: number;  // Max results (default: 10)
  riskLevel?: number;  // Optional risk filter
}
```

**Output Data Contract:**
```typescript
{
  structuredContent: {
    funds: Array<{
      fundCode: string;
      fundName: string;
      amc: string;
      latestNav: number;
      riskLevel: number;
      performanceValue: number;  // Return for specified period
      performancePeriod: string; // "1y", "3y", etc.
      benchmarkReturn: number;
      outperformance: number;    // Fund return - benchmark return
    }>;
    period: string;
    sortBy: string;
  },

  _meta: {
    "openai/outputTemplate": "ui://widget/fund-list.html"
  },

  content: [{
    type: "text",
    text: "Top {limit} RMF funds by {period} performance: 1) {fund1} (+{return}%), 2) {fund2} (+{return}%)..."
  }]
}
```

**Component:** `FundListWidget` (carousel with performance focus)
**Display Mode:** Inline carousel with performance ranking

---

### 4.5 Tool 5: `get_rmf_fund_nav_history`

**Purpose:** Get historical NAV data for charting

**Input Schema:**
```typescript
{
  fundCode: string;
  days?: number;  // Number of days (default: 30, max: 365)
}
```

**Output Data Contract:**
```typescript
{
  structuredContent: {
    fundCode: string;
    fundName: string;
    navHistory: Array<{
      date: string;      // ISO 8601 format
      nav: number;
      change: number;    // Day-over-day change
      changePercent: number;
    }>;
    periodReturn: number;      // Total return over period
    periodReturnPercent: number;
    volatility: number;        // Standard deviation
  },

  _meta: {
    "openai/outputTemplate": "ui://widget/performance-chart.html",
    minNav: number;
    maxNav: number;
    avgNav: number;
    dataSource: string;
  },

  content: [{
    type: "text",
    text: "{fundName} NAV over {days} days: {periodReturnPercent}% return. Current: {currentNav}, Min: {minNav}, Max: {maxNav}."
  }]
}
```

**Component:** `PerformanceChartWidget` (NAV line chart)
**Display Mode:** Inline card with zoom/expand to fullscreen

---

### 4.6 Tool 6: `compare_rmf_funds`

**Purpose:** Side-by-side comparison of multiple funds

**Input Schema:**
```typescript
{
  fundCodes: string[];  // Array of 2-5 fund codes
  compareBy?: "performance" | "risk" | "fees" | "all";
}
```

**Output Data Contract:**
```typescript
{
  structuredContent: {
    funds: Array<{
      fundCode: string;
      fundName: string;
      amc: string;

      // Comparison metrics
      latestNav: number;
      riskLevel: number;

      // Performance comparison
      ytdReturn: number;
      return1y: number;
      return3y: number;

      // Risk comparison
      volatility: number;
      maxDrawdown: number;
      sharpeRatio: number;

      // Fee comparison
      frontEndFee: number;
      backEndFee: number;
      managementFee: number;

      // Benchmark comparison
      benchmarkName: string;
      trackingError: number;
    }>;
    comparisonType: string;
  },

  _meta: {
    "openai/outputTemplate": "ui://widget/fund-detail.html"  // Fullscreen mode
  },

  content: [{
    type: "text",
    text: "Comparing {count} RMF funds: {fund1} vs {fund2} vs {fund3}. Best 1Y return: {bestFund} ({return}%). Lowest risk: {safestFund} (Level {risk})."
  }]
}
```

**Component:** `FundDetailWidget` (fullscreen comparison table)
**Display Mode:** Fullscreen table/card layout

---

## 5. Component Architecture

### 5.1 Directory Structure

```
web/
├── widgets/
│   ├── FundCardWidget.tsx      # Single fund card
│   ├── FundListWidget.tsx      # Carousel of funds
│   ├── FundDetailWidget.tsx    # Fullscreen detail view
│   └── PerformanceChartWidget.tsx  # NAV chart
├── hooks/
│   ├── useOpenAiGlobal.ts      # window.openai integration
│   ├── useWidgetState.ts       # State persistence
│   └── useToolCall.ts          # Call tools from widget
├── components/
│   ├── FundCard.tsx            # Reusable fund card component
│   ├── PerformanceMetrics.tsx  # Performance display component
│   ├── RiskBadge.tsx           # Risk level indicator
│   └── NavChart.tsx            # Recharts NAV line chart
├── lib/
│   ├── format.ts               # Number/date formatting utilities
│   └── theme.ts                # Theme detection and colors
└── build/
    ├── build-widgets.ts        # esbuild bundler script
    └── templates/              # HTML templates for widgets
```

### 5.2 Build Output

Each widget bundled into standalone HTML:
```
dist/widgets/
├── fund-card.html              # Standalone bundle with inlined JS/CSS
├── fund-list.html              # Standalone bundle with inlined JS/CSS
├── fund-detail.html            # Standalone bundle with inlined JS/CSS
└── performance-chart.html      # Standalone bundle with inlined JS/CSS
```

### 5.3 Widget 1: Fund Card Widget

**Purpose:** Display single fund with key metrics

**Props Interface:**
```typescript
interface FundCardWidgetProps {
  fund: {
    fundCode: string;
    fundName: string;
    amc: string;
    latestNav: number;
    navChange: number;
    navChangePercent: number;
    riskLevel: number;
    ytdReturn: number;
    return1y: number;
    classification: string;
    dividendPolicy: string;
  };
  showActions?: boolean;  // Show "View Details" button
  compact?: boolean;      // Compact mode for carousel
}
```

**Component Structure:**
```tsx
<div class="fund-card">
  <div class="fund-header">
    <h3>{fundName}</h3>
    <span class="fund-code">{fundCode}</span>
  </div>

  <div class="fund-nav">
    <div class="nav-value">{latestNav}</div>
    <div class="nav-change" class:positive={navChange > 0}>
      {navChangePercent}%
    </div>
  </div>

  <div class="fund-metrics">
    <Metric label="YTD Return" value={ytdReturn} />
    <Metric label="1Y Return" value={return1y} />
    <RiskBadge level={riskLevel} />
  </div>

  <div class="fund-info">
    <div>{amc}</div>
    <div>{classification}</div>
  </div>

  {showActions && (
    <button onClick={handleViewDetails}>View Details</button>
  )}
</div>
```

**Styling:**
- System fonts (system-ui, -apple-system, sans-serif)
- System colors (green for positive, red for negative)
- Border radius: 8px
- Padding: 16px
- Max width: 320px (for carousel), 100% (for single card)

**Interactions:**
- "View Details" button calls `window.openai.callTool("get_rmf_fund_detail", {...})`
- Tap/click on card opens fullscreen detail view

---

### 5.4 Widget 2: Fund List Widget

**Purpose:** Horizontal carousel of fund cards

**Props Interface:**
```typescript
interface FundListWidgetProps {
  funds: Array<FundCardData>;
  totalCount: number;
  page: number;
  pageSize: number;
  showPagination?: boolean;
}
```

**Component Structure:**
```tsx
<div class="fund-list-widget">
  <div class="fund-list-header">
    <h2>RMF Funds</h2>
    <span class="count">{totalCount} funds</span>
  </div>

  <div class="fund-carousel">
    {funds.map(fund => (
      <FundCard key={fund.fundCode} fund={fund} compact />
    ))}
  </div>

  {showPagination && (
    <div class="pagination">
      <button onClick={loadMore}>Load More</button>
    </div>
  )}
</div>
```

**Styling:**
- Horizontal scroll with snap points
- Gap: 12px between cards
- Overflow: hidden (show scroll on hover)
- Mobile: Swipe gestures

**Interactions:**
- Horizontal scroll/swipe through funds
- Tap card to expand to detail view
- "Load More" calls tool again with page + 1

---

### 5.5 Widget 3: Fund Detail Widget

**Purpose:** Fullscreen deep-dive with tabs

**Props Interface:**
```typescript
interface FundDetailWidgetProps {
  fund: FundDetailData;
  initialTab?: "overview" | "performance" | "holdings" | "fees";
}
```

**Component Structure:**
```tsx
<div class="fund-detail-widget">
  <div class="detail-header">
    <button class="back-button" onClick={handleClose}>←</button>
    <div class="fund-title">
      <h1>{fundName}</h1>
      <span class="fund-code">{fundCode}</span>
    </div>
  </div>

  <div class="tabs">
    <Tab active={activeTab === "overview"}>Overview</Tab>
    <Tab active={activeTab === "performance"}>Performance</Tab>
    <Tab active={activeTab === "holdings"}>Holdings</Tab>
    <Tab active={activeTab === "fees"}>Fees</Tab>
  </div>

  <div class="tab-content">
    {activeTab === "overview" && <OverviewTab fund={fund} />}
    {activeTab === "performance" && <PerformanceTab fund={fund} />}
    {activeTab === "holdings" && <HoldingsTab fund={fund} />}
    {activeTab === "fees" && <FeesTab fund={fund} />}
  </div>
</div>
```

**Tab Content:**

**Overview Tab:**
- NAV summary with 7-day sparkline
- Key metrics (risk, classification, dividend policy)
- Asset allocation pie chart
- AMC information

**Performance Tab:**
- Performance table (YTD, 3M, 6M, 1Y, 3Y, 5Y, 10Y)
- Benchmark comparison
- Risk-adjusted metrics (Sharpe ratio, volatility)
- "View NAV Chart" button → calls `get_rmf_fund_nav_history`

**Holdings Tab:**
- Top 5 holdings (if available)
- Asset allocation breakdown
- Sector exposure

**Fees Tab:**
- Fee structure table
- Investment minimums
- Document links (factsheet, annual report)

**Display Mode:** Fullscreen (takes over ChatGPT window)

---

### 5.6 Widget 4: Performance Chart Widget

**Purpose:** Interactive NAV history chart

**Props Interface:**
```typescript
interface PerformanceChartWidgetProps {
  fundCode: string;
  fundName: string;
  navHistory: Array<{ date: string; nav: number }>;
  periodReturn: number;
  periodReturnPercent: number;
}
```

**Component Structure:**
```tsx
<div class="performance-chart-widget">
  <div class="chart-header">
    <h3>{fundName} NAV History</h3>
    <div class="period-return" class:positive={periodReturn > 0}>
      {periodReturnPercent}%
    </div>
  </div>

  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={navHistory}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Line type="monotone" dataKey="nav" stroke="var(--color-primary)" />
    </LineChart>
  </ResponsiveContainer>

  <div class="chart-controls">
    <button onClick={handleZoomIn}>+</button>
    <button onClick={handleZoomOut}>−</button>
    <button onClick={handleFullscreen}>⛶</button>
  </div>
</div>
```

**Styling:**
- Chart library: Recharts (already installed)
- Colors: System colors (respect light/dark mode)
- Responsive: 100% width, 300px height (inline), 600px (fullscreen)

**Interactions:**
- Hover/tap on line shows tooltip with exact NAV and date
- Zoom controls adjust date range
- Fullscreen button expands to fullscreen mode

---

## 6. State Management & Integrations

### 6.1 Component State (Ephemeral)

Use React `useState` for UI state that doesn't need to persist:
- Active tab in detail view
- Chart zoom level
- Expanded/collapsed sections
- Loading states

### 6.2 Persistent State

Use `window.openai.setWidgetState()` for state that should persist across conversation turns:

```typescript
// Save state
window.openai.setWidgetState({
  viewMode: "detail",
  selectedFundCode: "B-ASEANRMF",
  activeTab: "performance",
  lastUpdated: Date.now(),
});

// Restore state on mount
const savedState = await window.openai.getWidgetState();
if (savedState) {
  setViewMode(savedState.viewMode);
  setSelectedFund(savedState.selectedFundCode);
}
```

**What to persist:**
- Selected fund code (for detail view)
- Active tab in detail view
- User preferences (chart zoom level, display density)
- Last viewed funds (for "Go Back" functionality)

**What NOT to persist:**
- Fund data (always fetch fresh via tool call)
- NAV history (regenerate from data)
- Loading/error states

### 6.3 Data Freshness

**Cache Strategy:**
- Server caches fund lists for 24h
- Server caches NAV data for 1h
- Components ALWAYS request fresh data via tools
- Use `_meta.timestamp` to show data age

**Refresh Pattern:**
```typescript
const handleRefresh = async () => {
  setLoading(true);
  const result = await window.openai.callTool("get_rmf_fund_detail", {
    fundCode: fund.fundCode,
  });
  setFund(result.structuredContent.fund);
  setLoading(false);
};
```

### 6.4 Theme Integration

**Light/Dark Mode Detection:**
```typescript
const useTheme = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const updateTheme = () => {
      setTheme(window.openai.matchTheme());
    };

    updateTheme();
    window.addEventListener("themechange", updateTheme);

    return () => window.removeEventListener("themechange", updateTheme);
  }, []);

  return theme;
};
```

**Color System (CSS Custom Properties):**
```css
:root {
  /* Light mode */
  --color-background: #ffffff;
  --color-foreground: #000000;
  --color-border: #e5e5e5;
  --color-positive: #10b981;  /* Green */
  --color-negative: #ef4444;  /* Red */
  --color-neutral: #6b7280;   /* Gray */
}

[data-theme="dark"] {
  /* Dark mode */
  --color-background: #1a1a1a;
  --color-foreground: #ffffff;
  --color-border: #404040;
  --color-positive: #10b981;
  --color-negative: #ef4444;
  --color-neutral: #9ca3af;
}
```

### 6.5 Accessibility (WCAG AA Compliance)

**1. Color Contrast:**
- Text: 4.5:1 minimum contrast ratio
- Large text (18pt+): 3:1 minimum
- Don't rely on color alone (use icons + text)

**2. Keyboard Navigation:**
- All interactive elements must be keyboard accessible
- Visible focus indicators
- Logical tab order

**3. Screen Readers:**
- Use semantic HTML (`<button>`, `<nav>`, `<article>`)
- Add ARIA labels where needed
- Announce dynamic content updates

**4. Charts:**
- Provide text summary of chart data
- Use patterns + colors for data series
- Keyboard accessible tooltips

**Example:**
```tsx
<article class="fund-card" role="article" aria-labelledby="fund-name">
  <h3 id="fund-name">{fundName}</h3>

  <div class="nav-change" role="status" aria-live="polite">
    <span class="sr-only">NAV change:</span>
    <span aria-label={`${navChangePercent > 0 ? "up" : "down"} ${Math.abs(navChangePercent)} percent`}>
      {navChangePercent > 0 ? "↑" : "↓"} {navChangePercent}%
    </span>
  </div>

  <button
    aria-label={`View detailed information for ${fundName}`}
    onClick={handleViewDetails}
  >
    View Details
  </button>
</article>
```

---

## 7. Testing Strategy

### 7.1 Golden Prompts (20 Test Cases)

#### Direct Prompts (Must Trigger Tools - 100% Accuracy)

**1. List Query**
```
Show me top RMF funds
```
Expected: `get_rmf_funds` → Fund List Widget

**2. Search Query**
```
Find RMF funds from Krungsri Asset Management
```
Expected: `search_rmf_funds` with `{ "amc": "Krungsri Asset Management" }` → Fund List Widget

**3. Detail Query**
```
Tell me about B-ASEANRMF fund
```
Expected: `get_rmf_fund_detail` with `{ "fundCode": "B-ASEANRMF" }` → Fund Card Widget

**4. Performance Query**
```
Show me RMF funds with the best 1-year performance
```
Expected: `get_rmf_fund_performance` with `{ "period": "1y", "sortBy": "desc", "limit": 10 }` → Fund List Widget

**5. Chart Query**
```
Show me the NAV history for B-ASEANRMF over the last 30 days
```
Expected: `get_rmf_fund_nav_history` with `{ "fundCode": "B-ASEANRMF", "days": 30 }` → Performance Chart Widget

#### Indirect Prompts (Should Trigger Tools - 80%+ Accuracy)

**6. Retirement Planning**
```
I want to save for retirement with tax benefits in Thailand
```
Expected: `get_rmf_funds` → Fund List Widget with tax explanation

**7. Tax Deduction**
```
What are the best tax-deductible investment options in Thailand?
```
Expected: `get_rmf_funds` → Fund List Widget grouped by risk

**8. Risk-Based Query**
```
I'm a conservative investor looking for low-risk retirement funds
```
Expected: `search_rmf_funds` with `{ "riskLevel": "low" }` → Fund List Widget

**9. Asset Manager Query**
```
Which funds does Krungsri offer for retirement?
```
Expected: `search_rmf_funds` with `{ "amc": "Krungsri Asset Management" }` → Fund List Widget

**10. Comparison Query**
```
Compare B-ASEANRMF and KFRMF-FIXED
```
Expected: `compare_rmf_funds` with `{ "fundCodes": ["B-ASEANRMF", "KFRMF-FIXED"] }` → Comparison Widget

#### Negative Prompts (Should NOT Trigger Tools - 0% False Positives)

**11. US Stock Market**
```
Show me S&P 500 index performance
```
Expected: NONE (our tools should not be invoked)

**12. Real Estate**
```
What are good real estate investment trusts in Thailand?
```
Expected: NONE (we don't cover REITs)

**13. Cryptocurrency**
```
Should I invest in Bitcoin for retirement?
```
Expected: NONE (we don't cover cryptocurrency)

**14. Individual Stocks**
```
Show me the top Thai stocks today
```
Expected: NONE (we don't cover individual stocks)

**15. Non-Thailand Markets**
```
What are the best retirement funds in Singapore?
```
Expected: NONE (we only cover Thailand SEC-regulated funds)

#### Edge Cases & Clarification (Handle Gracefully)

**16. Ambiguous Fund Type**
```
Show me ESG funds
```
Expected: ChatGPT asks for clarification or NONE

**17. Invalid Fund Code**
```
Tell me about INVALID-FUND-CODE
```
Expected: `get_rmf_fund_detail` invoked → returns error → graceful error message

**18. Partial Fund Name**
```
Show me funds with "ASEAN" in the name
```
Expected: `search_rmf_funds` with `{ "search": "ASEAN" }` → Fund List Widget

**19. Mixed Query**
```
Compare B-ASEANRMF performance with the S&P 500
```
Expected: `get_rmf_fund_detail` for B-ASEANRMF + general knowledge for S&P 500

**20. Conversational Context**
```
User: "Show me top RMF funds"
Assistant: [Shows carousel]
User: "What about the second one?"
```
Expected: `get_rmf_fund_detail` with fund code from conversation context

### 7.2 Component Testing

```typescript
// Example test for FundCardWidget
describe("FundCardWidget", () => {
  it("renders fund data correctly", () => {
    render(<FundCardWidget fund={mockFund} />);
    expect(screen.getByText(mockFund.fundName)).toBeInTheDocument();
  });

  it("calls tool on View Details click", async () => {
    const mockCallTool = jest.fn();
    window.openai.callTool = mockCallTool;

    render(<FundCardWidget fund={mockFund} showActions />);
    fireEvent.click(screen.getByText("View Details"));

    expect(mockCallTool).toHaveBeenCalledWith("get_rmf_fund_detail", {
      fundCode: mockFund.fundCode,
    });
  });
});
```

### 7.3 MCP Inspector Testing

```bash
# Start your server
npm run dev

# In another terminal
npx @modelcontextprotocol/inspector@latest
```

**Test Each Tool:**
1. Invoke tool with various parameters
2. Check `structuredContent` format
3. Verify component rendering
4. Test error handling
5. Measure response time

### 7.4 Success Metrics

- **Discovery Accuracy**: 100% for direct prompts, 80%+ for indirect prompts, 0% for negative prompts
- **Component Rendering**: All widgets render correctly in < 2 seconds
- **Data Quality**: All displayed data matches source JSON files
- **Accessibility**: WCAG AA compliance for all widgets
- **Mobile Support**: All widgets work on iOS/Android ChatGPT apps
- **Performance**: < 500ms average response time
- **Bundle Size**: < 100KB per widget (gzipped)

---

## 8. Data Preparation

### 8.1 Data Sources

**Primary:** `data/rmf-funds/*.json` (403 files)
- Each file contains 20+ data points per fund
- Generated from SEC API with complete data extraction pipeline

**Secondary:** `docs/rmf-funds-consolidated.csv` (1.5 MB)
- 60 columns with flattened structure
- Optimized for quick validation and export

### 8.2 Data Service Layer

**File:** `server/services/rmfDataService.ts`

```typescript
class FundDataLoader {
  private funds: Map<string, RMFFundDetail>;
  private index: {
    byAMC: Map<string, string[]>;
    byRisk: Map<number, string[]>;
    byCategory: Map<string, string[]>;
  };

  async loadAllFunds(): Promise<void> {
    // Load from data/rmf-funds/*.json
    // Build indexes for fast lookups
  }

  search(filters: FundSearchFilters): RMFFund[] {
    // Filter by search term, AMC, risk, classification, etc.
    // Support sorting and pagination
  }

  getBySymbol(symbol: string): RMFFundDetail | null {
    // Direct lookup by fund symbol
  }

  topPerformers(period: string, limit: number, riskLevel?: number): RMFFund[] {
    // Sort by performance for given period
    // Optional risk filter
  }

  compare(symbols: string[]): FundComparison {
    // Return side-by-side comparison data
  }
}
```

### 8.3 Data Quality Checks

**Before Implementation:**
1. Sample 5+ diverse funds (equity, fixed income, Thai-only, global, cancelled)
2. Verify all fields are populated or have predictable nulls
3. Run `npm run data:rmf:identify-incomplete` for audit
4. Document gaps in `docs/DATA_GAPS.md`

**Known Data Characteristics:**
- All 403 funds have complete NAV data
- 28-29 days of NAV history available
- Performance metrics (YTD, 1Y, 3Y, 5Y, 10Y) present for most funds
- Some newer funds may lack long-term performance data (3Y, 5Y, 10Y)
- Benchmark data available for 95%+ of funds

---

## 9. Implementation Checklist

### 9.1 Pre-Implementation Checklist

Before starting any coding:

- [ ] `docs/TOOLS_CONTRACT.md` reviewed by Backend + UX
- [ ] `shared/schema.ts` exports match the contract
- [ ] Data quality audit completed (5+ fund samples)
- [ ] `docs/DATA_GAPS.md` created with mitigation plan
- [ ] `rmfDataService` returns deterministic results for fixture prompts
- [ ] `/mcp` endpoint returns `_meta["openai/outputTemplate"]` blocks for every tool
- [ ] Component blueprint approved with clear data bindings

### 9.2 Phase Acceptance Criteria

**Phase 0: Data Validation**
- [ ] 5+ diverse funds sampled and validated
- [ ] Data gaps documented in `docs/DATA_GAPS.md`
- [ ] Mitigation plan approved

**Phase 1: MCP Tool Contract**
- [ ] All 6 tools defined in `docs/TOOLS_CONTRACT.md`
- [ ] JSON schemas complete for input + output
- [ ] Sample payloads included from real funds
- [ ] Component mappings documented
- [ ] Contract reviewed and approved by stakeholders

**Phase 2: Shared Types & Data Service**
- [ ] Zod schemas updated to match tool contract
- [ ] `rmfDataService.ts` created with all helper methods
- [ ] Unit tests pass with 80%+ coverage
- [ ] Data service returns consistent results

**Phase 3: MCP Server Implementation**
- [ ] MCP SDK Server class implemented
- [ ] All 6 tools discoverable via `tools/list`
- [ ] All tools executable via `tools/call`
- [ ] Structured content responses validated
- [ ] Error handling works for all error types
- [ ] MCP Inspector can discover and test all tools

**Phase 4: Widget Development**
- [ ] All 4 widgets built and bundled
- [ ] window.openai hooks implemented
- [ ] Theme switching works (light/dark)
- [ ] Widgets are keyboard accessible
- [ ] Bundle sizes < 100KB (gzipped)
- [ ] All widgets render correctly with sample data

**Phase 5: Testing & Validation**
- [ ] All 20 golden prompts tested
- [ ] Discovery accuracy meets targets (100%/80%/0%)
- [ ] Component rendering < 2 seconds
- [ ] Tested on mobile (iOS/Android)
- [ ] Performance benchmarks meet targets

**Phase 6: Deployment**
- [ ] Production deployment complete
- [ ] HTTPS endpoint configured
- [ ] ChatGPT connector created
- [ ] User documentation written
- [ ] Monitoring set up

### 9.3 Risk Mitigation

**Schema Drift:**
- Treat `docs/TOOLS_CONTRACT.md` as canonical source
- No route or UI change merges without updating contract
- Run contract validation tests on every PR

**Data Freshness:**
- Document SEC API refresh cadence in contract
- Set up automated data refresh job (daily at 6 AM)
- Monitor data age and alert if stale (> 48 hours)

**Tool Bloat:**
- Keep initial scope to 6 tools
- Defer niche calculators until V1 metrics justify them
- Track tool usage and prioritize most-used features

---

## 10. Deployment & Operations

### 10.1 Deployment Options

**Option 1: Replit Deployment** (Easiest)
- ✅ Already on Replit
- ✅ One-click deployment
- ✅ HTTPS by default
- MCP endpoint: `https://your-app.replit.app/mcp`

**Option 2: Railway/Render** (Recommended)
- ✅ Full Node.js support
- ✅ Better performance
- ✅ Custom domains
- Cost: ~$5-10/month

**Option 3: Vercel/Netlify** (Serverless)
- ⚠️ May need adapter for MCP streaming
- ✅ Auto-scaling
- Cost: Free tier available

### 10.2 Environment Variables

```env
# Required
SEC_API_KEY=your_sec_api_key_here
PORT=5000
NODE_ENV=production

# Optional
DATABASE_URL=postgresql://...  # If using database
SENTRY_DSN=https://...          # Error tracking
```

### 10.3 ChatGPT GPT Store Submission

**Required Metadata:**
```json
{
  "name": "Thai RMF Market Pulse",
  "description": "Discover and compare 403+ Thai Retirement Mutual Funds (RMF) with real-time NAV data, performance analytics, and personalized recommendations",
  "category": "Finance",
  "icon": "path/to/icon.png",
  "mcpEndpoint": "https://your-app.com/mcp",
  "privacyPolicy": "https://your-app.com/privacy",
  "termsOfService": "https://your-app.com/terms"
}
```

**App Icon Requirements:**
- 512x512 PNG
- Transparent background
- Simple, recognizable design
- Represents RMF/retirement/Thailand theme

### 10.4 Monitoring & Analytics

**Error Tracking:**
- Sentry for error monitoring
- Alert on > 1% error rate
- Track tool invocation failures

**Usage Metrics:**
- Tool invocation frequency (which tools are most popular)
- Average tools per session
- Discovery accuracy over time
- Response times (p50, p95, p99)

**Performance Monitoring:**
- Uptime monitoring (target: 99%)
- API response times (target: < 500ms)
- Widget load times (target: < 2 seconds)

### 10.5 Resource Requirements

**Time Estimate:**
- Phase 0: 1 day
- Phase 1: 2-3 days
- Phase 2: 2-3 days
- Phase 3: 3-4 days
- Phase 4: 5-7 days
- Phase 5: 2-3 days
- Phase 6: 2-3 days
- **Total: 17-24 days (3-4 weeks)**

**Team Needs:**
- 1 Full-stack TypeScript developer
- Design support for UI components (optional, reuse existing designs)
- Testing/QA for prompt validation

**Infrastructure:**
- Existing Express server ✅
- Public HTTPS endpoint
- ~500MB storage for fund data
- Minimal compute (current setup sufficient)

### 10.6 Success Metrics

**Discovery:**
- Tool selection accuracy > 90% for golden prompts
- < 5% false positive rate on negative prompts

**Performance:**
- < 500ms average response time
- < 100KB average component size
- 99% uptime

**Engagement (First Month):**
- 100+ weekly active users
- 1000+ tool invocations/week
- 4+ tools/session average

---

## Appendix A: Key Decision Points

### A.1 Data Source Strategy

**Option A: Static Files (Recommended for MVP)**
- ✅ Fast, no API rate limits
- ✅ Predictable costs
- ✅ Works offline
- ❌ Need periodic refresh

**Option B: Live SEC API**
- ✅ Always fresh data
- ❌ Slower responses
- ❌ API rate limits
- ❌ Dependent on SEC uptime

**Decision:** Start with static files, add SEC API background refresh every 24 hours

### A.2 Component Complexity

**Option A: Simple HTML + Vanilla JS**
- ✅ Fast, lightweight
- ✅ No build step
- ❌ Limited interactivity

**Option B: React Microfrontend**
- ✅ Reuse existing components
- ✅ Rich interactivity
- ❌ Larger bundle size
- ❌ Build complexity

**Decision:** React with esbuild (bundle size optimized)

### A.3 Authentication

**Option A: Public, No Auth**
- ✅ Easiest setup
- ✅ Better discovery
- ❌ No usage limits
- ❌ No personalization

**Option B: OAuth + User Accounts**
- ✅ Rate limiting
- ✅ Save favorites, watchlists
- ❌ Friction for users
- ❌ More complex

**Decision:** Start public, add auth if abuse occurs

---

## Appendix B: External Resources

### OpenAI Documentation
- Apps SDK Overview: `openai-app-sdk/00-index.md`
- MCP Server Guide: `openai-app-sdk/build/`
- Tool Planning: `openai-app-sdk/plan/`

### Project Documentation
- Product Requirements: `docs/prd_thai_rmf_app.md`
- Design Guidelines: `docs/design_guidelines.md`
- SEC API Integration: `docs/SEC-API-INTEGRATION-SUMMARY.md`

### External Links
- [MCP Specification](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [ChatGPT Connectors](https://platform.openai.com/docs/chatgpt/connectors)

---

## Revision History

- **2025-11-12:** Initial consolidated version (merged 4 task files)
  - NEXT_STEPS_OPENAI_APP_SDK_DATA_CONTRACT.md (Contract-first approach)
  - NEXT_STEPS_OPENAI_APP_SDK.md (6-week implementation plan)
  - openai-apps-sdk-component-design.md (Technical specifications)
  - openai-apps-sdk-golden-prompts.md (Testing prompts)

---

**This is the single source of truth for OpenAI App SDK implementation. All team members should reference this document for specifications, timelines, and acceptance criteria.**
