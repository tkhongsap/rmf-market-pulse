# Product Requirements Document: OpenAI App SDK ChatGPT Integration

**Feature Name:** Thai RMF Market Pulse - ChatGPT MCP Widget  
**Document Version:** 1.0  
**Date:** November 12, 2025  
**Author:** Development Team  
**Status:** Planning Phase  

---

## 1. Introduction/Overview

### Problem Statement
Thai investors currently struggle to discover and compare Retirement Mutual Funds (RMF) for tax-advantaged retirement investing. The existing web interface requires manual filtering and navigation, creating friction during the critical tax season (November-December). Users need a conversational, AI-powered way to explore 410+ RMF funds through natural language queries.

### Solution
Transform Thai RMF Market Pulse into a ChatGPT widget using Model Context Protocol (MCP). Users will ask questions like "Show me safe RMF funds for retirement" or "Compare SCBRMFIX and KTAM5YRMF" and receive interactive, embedded components (carousels, charts, comparison tables) directly within ChatGPT conversations.

### Goal
Enable conversational fund discovery through ChatGPT, reducing time-to-decision from 30+ minutes (web browsing) to < 5 minutes (conversation), while maintaining data accuracy and providing rich visualizations.

---

## 2. Goals

### Primary Goals
1. **Conversational Discovery**: Users can find RMF funds using natural language without learning complex filter interfaces
2. **Rich Visualization**: Display fund data in interactive widgets (cards, charts, tables) embedded in ChatGPT
3. **High Accuracy**: Achieve 95%+ tool discovery accuracy for direct prompts, 80%+ for indirect prompts
4. **Production Ready**: Deploy live ChatGPT connector with 99% uptime and < 500ms response times

### Secondary Goals
5. **Cross-Platform**: Work seamlessly on web and mobile ChatGPT apps
6. **Data Freshness**: Display up-to-date fund data (refreshed daily from SEC API)
7. **User Engagement**: Drive 100+ weekly active users in month 1, 1000+ tool invocations/week

---

## 3. User Stories

### US-1: Fund Discovery (Primary)
**As a** Thai investor planning for retirement  
**I want to** ask ChatGPT for RMF fund recommendations  
**So that** I can quickly find suitable funds without navigating complex interfaces

**Acceptance Criteria:**
- User asks "Show me top RMF funds"
- ChatGPT invokes `get_rmf_funds` tool
- Horizontal carousel of fund cards displays inline
- Each card shows: fund name, NAV, YTD return, risk level
- User can scroll/swipe through funds
- User can click "View Details" to see full fund information

---

### US-2: Advanced Search (Primary)
**As a** conservative investor  
**I want to** filter RMF funds by risk level and asset class  
**So that** I can find low-risk fixed income funds matching my profile

**Acceptance Criteria:**
- User asks "Find low-risk RMF funds with fixed income"
- ChatGPT invokes `search_rmf_funds` with `maxRiskLevel: 3, category: "fixed_income"`
- Filtered results display in carousel
- Results only include funds matching criteria
- Empty state message if no funds match

---

### US-3: Fund Details (Primary)
**As a** user evaluating a specific fund  
**I want to** see comprehensive fund information  
**So that** I can make an informed investment decision

**Acceptance Criteria:**
- User asks "Tell me about B-ASEANRMF"
- ChatGPT invokes `get_rmf_fund_detail` tool
- Fund card displays with tabs: Overview, Performance, Holdings, Fees
- Overview shows NAV, risk level, asset allocation pie chart
- Performance tab shows YTD, 1Y, 3Y, 5Y returns vs benchmark
- User can view NAV history chart from Performance tab

---

### US-4: Performance Comparison (Primary)
**As a** user comparing investment options  
**I want to** see top performing RMF funds  
**So that** I can identify the best returns in my risk category

**Acceptance Criteria:**
- User asks "Show me best performing RMF funds this year"
- ChatGPT invokes `get_rmf_fund_performance` with `period: "ytd", sortBy: "desc"`
- Top 10 funds display ranked by YTD return
- Each card highlights performance metric
- Benchmark comparison shown (fund vs index)

---

### US-5: Historical Analysis (Secondary)
**As a** analytical investor  
**I want to** view NAV history charts  
**So that** I can analyze fund volatility and trends

**Acceptance Criteria:**
- User asks "Show NAV history for B-ASEANRMF over 30 days"
- ChatGPT invokes `get_rmf_fund_nav_history` tool
- Line chart displays with 30 data points
- Tooltip shows exact NAV and date on hover
- Chart includes zoom controls and fullscreen option
- Period return percentage displayed prominently

---

### US-6: Side-by-Side Comparison (Secondary)
**As a** user deciding between multiple funds  
**I want to** compare 2-5 funds side-by-side  
**So that** I can evaluate differences in performance, risk, and fees

**Acceptance Criteria:**
- User asks "Compare SCBRMFIX, KTAM5YRMF, and B-ASEANRMF"
- ChatGPT invokes `compare_rmf_funds` with array of fund codes
- Comparison table displays in fullscreen mode
- Highlights best/worst metrics in each column (green/red)
- Includes: NAV, returns, risk level, fees, benchmark
- Sortable by any metric column

---

### US-7: Tax Planning (Tertiary)
**As a** salaried employee  
**I want to** understand RMF tax benefits  
**So that** I can maximize my 500,000 THB deduction

**Acceptance Criteria:**
- User asks "I need to invest 200,000 THB for tax deduction"
- ChatGPT provides RMF fund recommendations
- Tool invocation shows funds suitable for the investment amount
- Context includes tax benefit explanation
- Minimum investment requirements displayed

---

### US-8: Error Recovery (Technical)
**As a** system  
**I want to** handle errors gracefully  
**So that** users receive helpful feedback when issues occur

**Acceptance Criteria:**
- Invalid fund code shows "Fund not found" message
- Network errors show retry button
- Empty search results show "No funds match your criteria"
- Widget rendering failures fall back to text response
- All errors logged for monitoring

---

## 4. Functional Requirements

### FR-1: MCP Server Implementation
**Priority:** P0  
**Description:** Implement Model Context Protocol server with Express.js

**Requirements:**
1. Create `/mcp` endpoint that handles MCP protocol requests
2. Register 6 tools with complete JSON schemas
3. Handle tool discovery via `tools/list` request
4. Handle tool execution via `tools/call` request
5. Register widget resources via `resources/list` request
6. Return proper MCP response format with `content`, `structuredContent`, `_meta`
7. Support CORS for ChatGPT origin
8. Add health check endpoint at `/mcp/health`

**Technical Details:**
- File: `server/mcp.ts`
- Dependencies: `@modelcontextprotocol/sdk`
- Transport: HTTP (Streamable HTTP or SSE)

---

### FR-2: Data Service Layer
**Priority:** P0  
**Description:** Create in-memory data service for fast fund lookups

**Requirements:**
1. Load all 410+ funds from `docs/rmf-funds-consolidated.csv` on server startup
2. Parse CSV and create typed objects matching Zod schemas
3. Build indexes for fast lookup:
   - By fund symbol (primary key)
   - By AMC (asset management company)
   - By risk level (1-8)
   - By category (equity, fixed_income, mixed, international)
   - By performance (pre-sorted by YTD, 1Y, 3Y)
4. Implement search method with filters: `search(filters: FundSearchFilters)`
5. Implement single fund lookup: `getBySymbol(symbol: string)`
6. Implement top performers: `getTopPerformers(period, limit)`
7. Implement comparison: `compareFunds(symbols: string[])`
8. Implement NAV history: `getNavHistory(symbol: string, days: number)`
9. Cache data in memory, refresh daily at midnight (Bangkok time)

**Technical Details:**
- File: `server/services/rmfDataService.ts`
- Data Source: `docs/rmf-funds-consolidated.csv` (410 rows)
- Memory footprint: ~50-100MB estimated
- Refresh: Daily via cron job or scheduled task

---

### FR-3: Tool 1 - Get RMF Funds
**Priority:** P0  
**Description:** List RMF funds with pagination and basic filters

**Input Schema:**
```typescript
{
  page?: number;          // Default: 1
  pageSize?: number;      // Default: 20, Max: 50
  fundType?: string;      // Fund classification filter
  search?: string;        // Search fund name/symbol
  sortBy?: "performance" | "nav" | "name" | "risk";
}
```

**Output Schema:**
```typescript
{
  content: [{ type: "text", text: "Found {count} RMF funds..." }],
  structuredContent: {
    funds: Array<{
      fundCode, fundName, amc, latestNav, navChange, 
      navChangePercent, riskLevel, ytdReturn, return1y
    }>,
    totalCount, page, pageSize
  },
  _meta: {
    "openai/outputTemplate": "component://rmf-fund-list",
    timestamp
  }
}
```

**Business Logic:**
- Default sort by YTD performance descending
- If search provided, ignore pagination and return all matches
- Validate page and pageSize are positive integers
- Return empty array if no funds match

---

### FR-4: Tool 2 - Search RMF Funds
**Priority:** P0  
**Description:** Advanced search with multiple filter criteria

**Input Schema:**
```typescript
{
  search?: string;        // Fund name/symbol search
  amc?: string;           // AMC name filter
  minRiskLevel?: number;  // Min risk (1-8)
  maxRiskLevel?: number;  // Max risk (1-8)
  minYtdReturn?: number;  // Min YTD return %
  category?: "equity" | "fixed_income" | "mixed" | "international";
  sortBy?: "performance" | "risk" | "nav";
  limit?: number;         // Max results, default 20
}
```

**Output Schema:** Same as `get_rmf_funds`

**Business Logic:**
- All filters are AND conditions
- Case-insensitive search on fund name and symbol
- AMC filter uses partial match (e.g., "Krungsri" matches "Krungsri Asset Management")
- If no results, return empty array with helpful message
- Validate risk levels are 1-8 range

---

### FR-5: Tool 3 - Get Fund Detail
**Priority:** P0  
**Description:** Get comprehensive details for a specific fund

**Input Schema:**
```typescript
{
  fundCode: string;  // Required, e.g., "B-ASEANRMF"
}
```

**Output Schema:**
```typescript
{
  structuredContent: {
    fund: {
      // Core: fundCode, fundName, amc
      // NAV: latestNav, navDate, navChange, navChangePercent
      // Metadata: classification, managementStyle, riskLevel, dividendPolicy
      // Performance: ytdReturn, return3m, return1y, return3y, return5y
      // Benchmark: benchmarkName, benchmarkReturn1y
      // Asset Allocation: assetAllocation[]
      // Documents: factsheetUrl, annualReportUrl
    }
  },
  _meta: {
    "openai/outputTemplate": "component://rmf-fund-card",
    navHistory7d: [] // Mini sparkline data
  }
}
```

**Business Logic:**
- Return 404 error if fund code not found
- Parse asset allocation from JSON column
- Calculate 7-day NAV history for mini chart
- Provide links to factsheet and reports if available

---

### FR-6: Tool 4 - Get Performance
**Priority:** P0  
**Description:** Get top/bottom performers by time period

**Input Schema:**
```typescript
{
  period: "ytd" | "3m" | "6m" | "1y" | "3y" | "5y";
  sortBy: "asc" | "desc";  // asc=worst, desc=best
  limit?: number;          // Default 10
  riskLevel?: number;      // Optional filter
}
```

**Business Logic:**
- Use pre-sorted indexes for fast retrieval
- If riskLevel provided, filter before taking top N
- Exclude funds with null performance for the period
- Include benchmark comparison in results
- Calculate outperformance (fund return - benchmark return)

---

### FR-7: Tool 5 - Get NAV History
**Priority:** P0  
**Description:** Get historical NAV data for charting

**Input Schema:**
```typescript
{
  fundCode: string;
  days?: number;  // Default 30, Max 365
}
```

**Output Schema:**
```typescript
{
  structuredContent: {
    fundCode, fundName,
    navHistory: Array<{ date, nav, change, changePercent }>,
    periodReturn, periodReturnPercent, volatility
  },
  _meta: {
    "openai/outputTemplate": "component://rmf-performance-chart",
    minNav, maxNav, avgNav
  }
}
```

**Business Logic:**
- Read NAV history from `nav_history_30d` field in fund JSON
- If days > 30, fetch from individual fund JSON files
- Calculate daily changes and percentages
- Calculate volatility (standard deviation)
- Calculate total period return

---

### FR-8: Tool 6 - Compare Funds
**Priority:** P0  
**Description:** Side-by-side comparison of 2-5 funds

**Input Schema:**
```typescript
{
  fundCodes: string[];  // Min 2, Max 5
  compareBy?: "performance" | "risk" | "fees" | "all";
}
```

**Output Schema:**
```typescript
{
  structuredContent: {
    funds: Array<{
      fundCode, fundName, amc,
      // Performance: ytdReturn, return1y, return3y
      // Risk: riskLevel, volatility, maxDrawdown
      // Fees: frontEndFee, managementFee
      // Benchmark: benchmarkName, trackingError
    }>
  },
  _meta: {
    "openai/outputTemplate": "component://rmf-fund-comparison"
  }
}
```

**Business Logic:**
- Validate 2-5 fund codes provided
- Return 400 error if any fund not found
- Parse fee information from fees_json column
- Calculate tracking error if benchmark data available
- Highlight best/worst metrics for easy comparison

---

### FR-9: Widget 1 - Fund List Carousel
**Priority:** P0  
**Description:** Horizontal scrolling carousel of fund cards

**Requirements:**
1. Display 3-5 cards visible at once (responsive)
2. Horizontal scroll with snap points
3. Swipe gesture support on mobile
4. Each card shows:
   - Fund name and symbol
   - AMC name
   - Current NAV with change indicator (↑/↓)
   - YTD return with color coding (green/red)
   - Risk level badge (1-8)
5. "View Details" button on each card
6. "Load More" button if pagination available
7. Empty state: "No funds found matching your criteria"
8. Loading state: Skeleton cards
9. Error state: Error message with retry button
10. Responsive: Stack vertically on narrow screens (<400px)

**Technical Details:**
- File: `public/mcp-components/rmf-fund-list.html`
- Bundle size: < 50KB gzipped
- Theme: Support light/dark via CSS variables
- Framework: Vanilla JS (no dependencies)

---

### FR-10: Widget 2 - Fund Detail Card
**Priority:** P0  
**Description:** Detailed fund view with tabbed interface

**Requirements:**
1. Tabbed layout with 4 tabs: Overview, Performance, Holdings, Fees
2. **Overview Tab:**
   - Fund name, symbol, AMC
   - Current NAV with 7-day mini sparkline
   - Risk level badge with description
   - Classification and management style
   - Asset allocation pie chart
3. **Performance Tab:**
   - Performance table: YTD, 3M, 6M, 1Y, 3Y, 5Y
   - Benchmark comparison with color coding
   - "View NAV Chart" button → triggers `get_rmf_fund_nav_history`
4. **Holdings Tab:**
   - Asset allocation breakdown (table)
   - Top 5 holdings if available
   - Sector exposure
5. **Fees Tab:**
   - Fee structure table (front-end, back-end, management)
   - Investment minimums
   - Links to factsheet and annual report (open in new tab)
6. Expandable to fullscreen
7. Close button returns to carousel

**Technical Details:**
- File: `public/mcp-components/rmf-fund-card.html`
- Bundle size: < 80KB gzipped
- Charts: Use lightweight Chart.js
- Theme: Support light/dark

---

### FR-11: Widget 3 - Fund Comparison Table
**Priority:** P0  
**Description:** Side-by-side comparison table

**Requirements:**
1. Comparison table layout:
   - Rows: Metrics (NAV, YTD, 1Y, 3Y, Risk, Fees, etc.)
   - Columns: Funds (2-5 funds)
2. Highlight best value in green, worst in red per row
3. Sortable columns (click header to sort)
4. Responsive: Horizontal scroll on mobile
5. Display in fullscreen mode by default
6. Close button returns to conversation

**Technical Details:**
- File: `public/mcp-components/rmf-fund-comparison.html`
- Bundle size: < 40KB gzipped

---

### FR-12: Widget 4 - Performance Chart
**Priority:** P0  
**Description:** Interactive NAV history line chart

**Requirements:**
1. Line chart with Chart.js
2. X-axis: Dates
3. Y-axis: NAV values
4. Tooltip on hover showing exact NAV and date
5. Zoom controls (+/- buttons)
6. Fullscreen button
7. Period return displayed prominently
8. Responsive: Adjust height on mobile

**Technical Details:**
- File: `public/mcp-components/rmf-performance-chart.html`
- Bundle size: < 60KB gzipped (includes Chart.js)
- Chart library: Chart.js 4.x

---

### FR-13: Theme Support
**Priority:** P0  
**Description:** All widgets must support light and dark themes

**Requirements:**
1. Detect theme via `window.openai.matchTheme()`
2. Apply CSS custom properties:
   ```css
   --color-bg, --color-fg, --color-border,
   --color-positive, --color-negative, --color-neutral
   ```
3. Listen for theme changes via `openai:themechange` event
4. Update theme dynamically without reload
5. Test in both themes before deployment

---

### FR-14: Error Handling
**Priority:** P0  
**Description:** Comprehensive error handling across all components

**Requirements:**
1. **Tool-level errors:**
   - 400 Bad Request: Invalid parameters
   - 404 Not Found: Fund code doesn't exist
   - 500 Internal Server Error: Server/data issues
   - Include error code, message, and actionable hint
2. **Widget-level errors:**
   - Loading state with skeleton UI
   - Error state with message and retry button
   - Empty state with helpful text
   - Fallback to plain text if widget fails to render
3. **Network errors:**
   - Display "Unable to load data" message
   - Provide retry button
   - Log error details for monitoring
4. All errors must be user-friendly (no technical jargon)

---

### FR-15: Data Validation
**Priority:** P0  
**Description:** Validate all inputs and outputs with Zod schemas

**Requirements:**
1. Define Zod schemas in `shared/schema.ts`:
   - `mcpFundSummarySchema`
   - `mcpFundDetailSchema`
   - `mcpNavHistorySchema`
   - `mcpComparisonSchema`
2. Validate tool input parameters before processing
3. Validate tool output before returning to ChatGPT
4. Return 400 error with validation details if input invalid
5. Log validation errors for debugging

---

### FR-16: Performance Optimization
**Priority:** P0  
**Description:** Meet performance targets for production

**Requirements:**
1. Tool response time: < 500ms average (p95)
2. Widget load time: < 2 seconds (p95)
3. Widget bundle size: < 100KB per widget (gzipped)
4. In-memory data lookup: < 10ms
5. CSV parsing on startup: < 5 seconds
6. Enable gzip compression on Express
7. Cache widget HTML in memory
8. Minify JavaScript and CSS
9. Use CDN for Chart.js (optional)

---

### FR-17: Monitoring & Logging
**Priority:** P1  
**Description:** Implement monitoring for production readiness

**Requirements:**
1. Log all tool invocations with parameters and response times
2. Log all errors with stack traces
3. Track metrics:
   - Tool invocation count by tool name
   - Average response time per tool
   - Error rate per tool
   - Widget render success rate
4. Health check endpoint: `/mcp/health` returns 200 OK
5. Expose metrics endpoint: `/mcp/metrics` (optional)
6. Configure log levels: DEBUG, INFO, WARN, ERROR

---

### FR-18: Testing Infrastructure
**Priority:** P1  
**Description:** Comprehensive testing across all layers

**Requirements:**
1. **Unit tests** for data service:
   - Test CSV loading
   - Test search/filter logic
   - Test index building
   - Coverage: > 80%
2. **Integration tests** for MCP handlers:
   - Test each tool with valid inputs
   - Test error cases (invalid inputs, missing data)
   - Test output schema validation
   - Coverage: 100% of tools
3. **Golden prompt tests:**
   - Test all 20 golden prompts
   - Verify tool discovery accuracy
   - Target: 95% direct, 80% indirect, 0% negative
4. **Widget tests:**
   - Test rendering with mock data
   - Test empty/error states
   - Test theme switching
   - Test responsive layouts
5. Use Jest for test framework
6. Use MCP Inspector for manual testing

---

## 5. Non-Goals (Out of Scope)

### NG-1: Real-time Data Updates
We will NOT implement real-time WebSocket updates. Data refreshes daily, displayed timestamp shows data age.

**Rationale:** SEC updates fund data once per day. Real-time updates add complexity without user benefit.

---

### NG-2: User Authentication (MVP)
We will NOT implement user accounts, OAuth, or personalization in the initial release.

**Rationale:** Adds friction to discovery. Can be added later if needed for rate limiting or premium features.

---

### NG-3: Fund Purchase/Transaction
We will NOT enable buying/selling funds directly through the widget.

**Rationale:** Out of scope. Users can visit AMC websites for transactions. Links provided in fund details.

---

### NG-4: Portfolio Tracking
We will NOT implement user portfolio tracking or watchlists in MVP.

**Rationale:** Focus on discovery and comparison. Portfolio features can be Phase 2.

---

### NG-5: Non-RMF Funds
We will NOT support LTF, ESG, or other non-RMF fund types in this implementation.

**Rationale:** Scope is specifically RMF funds. Other types can be separate tools/widgets.

---

### NG-6: Multi-language Support
We will NOT support languages other than English and Thai (data is already in Thai).

**Rationale:** Target audience is Thai investors. Multi-language can be added later.

---

### NG-7: Mobile Native Apps
We will NOT build native iOS/Android apps. Only ChatGPT widget.

**Rationale:** ChatGPT mobile apps will render our widgets. No separate app needed.

---

### NG-8: Advanced Analytics
We will NOT provide advanced analytics like Monte Carlo simulations, portfolio optimization, or risk modeling.

**Rationale:** Beyond scope of discovery tool. Users can use specialized tools for advanced analysis.

---

## 6. Design Considerations

### UI/UX Requirements

**1. Design System:**
- Follow OpenAI Apps SDK design guidelines (see `docs/openai-app-sdk/concepts/design-guidelines.md`)
- Use system fonts: `system-ui, -apple-system, sans-serif`
- Minimize custom styling, leverage browser defaults where possible

**2. Color Palette:**
```css
/* Light Theme */
--color-bg: #ffffff;
--color-fg: #000000;
--color-border: #e5e5e5;
--color-positive: #10b981; /* Green for gains */
--color-negative: #ef4444; /* Red for losses */
--color-neutral: #6b7280;  /* Gray for neutral */
--color-primary: #3b82f6;  /* Blue for interactive elements */

/* Dark Theme */
--color-bg: #1a1a1a;
--color-fg: #ffffff;
--color-border: #404040;
/* Positive/negative/neutral colors same for both themes */
```

**3. Typography:**
- Base font size: 14px
- Headings: 18px (H3), 16px (H4)
- Line height: 1.5
- Font weight: 400 (normal), 600 (semibold), 700 (bold)

**4. Spacing:**
- Base unit: 4px
- Padding/margin: multiples of 4px (8px, 12px, 16px, 24px)
- Card padding: 16px
- Section gaps: 24px

**5. Components:**
- Border radius: 8px for cards, 4px for buttons
- Card shadows: `0 1px 3px rgba(0,0,0,0.1)`
- Button padding: 8px 16px
- Minimum tap target: 44x44px (mobile)

**6. Responsive Breakpoints:**
```
mobile: < 768px
tablet: 768px - 1024px
desktop: > 1024px
```

**7. Accessibility (WCAG AA):**
- Color contrast: 4.5:1 for text, 3:1 for large text
- Keyboard navigation: All interactive elements focusable
- Screen reader: Semantic HTML, ARIA labels where needed
- Focus indicators: Visible outline on focused elements

**8. Existing Component Reuse:**
Adapt these existing components from `client/src/components/`:
- Fund card layout
- Performance metrics display
- Risk badge component
- Chart configurations

---

## 7. Technical Considerations

### Architecture

**1. Stack:**
- Backend: Express.js + TypeScript + MCP SDK
- Frontend: Vanilla JavaScript (widgets)
- Data: CSV → In-memory indexes
- Validation: Zod schemas
- Testing: Jest + MCP Inspector

**2. Data Flow:**
```
ChatGPT User Prompt
  ↓
ChatGPT invokes MCP tool
  ↓
Express /mcp endpoint
  ↓
MCP Server (server/mcp.ts)
  ↓
Tool Handler (server/services/mcpHandlers.ts)
  ↓
Data Service (server/services/rmfDataService.ts)
  ↓
In-memory fund data
  ↓
Return MCP response with structuredContent + _meta
  ↓
ChatGPT renders widget HTML
  ↓
Widget reads data from window.openai.toolOutput
```

**3. Dependencies:**
```json
{
  "new": [
    "@modelcontextprotocol/sdk": "^1.21.1",
    "chart.js": "^4.4.0"
  ],
  "existing": [
    "express": "^4.21.2",
    "zod": "^3.25.76",
    "typescript": "latest"
  ]
}
```

**4. File Structure:**
```
server/
  mcp.ts                    # MCP server setup
  services/
    rmfDataService.ts       # Data loading and indexing
    mcpHandlers.ts          # Tool handlers
public/
  mcp-components/
    rmf-fund-list.html
    rmf-fund-card.html
    rmf-fund-comparison.html
    rmf-performance-chart.html
    shared/
      styles.css
      utils.js
shared/
  schema.ts                 # Add MCP schemas
tests/
  server/
    rmfDataService.test.ts
    mcpHandlers.test.ts
  golden-prompts.test.ts
```

**5. Environment Variables:**
```
NODE_ENV=production
PORT=5000
MCP_ENDPOINT=/mcp
DATA_REFRESH_CRON=0 0 * * *  # Daily at midnight
LOG_LEVEL=info
```

**6. Security:**
- CORS: Allow ChatGPT origins only
- Rate limiting: 100 requests/minute per IP (optional)
- Input sanitization: All user inputs validated with Zod
- Output sanitization: Escape HTML in fund names/descriptions
- No authentication required for MVP (defer decision)

**7. Performance Strategy:**
- **Data Loading:** Parse CSV once on startup, keep in memory
- **Indexing:** Pre-build indexes (AMC, risk, category, performance)
- **Caching:** Widget HTML cached in memory, served with ETags
- **Compression:** Gzip enabled for all responses
- **Bundle optimization:** Minify JS/CSS, tree-shake unused code

**8. Error Recovery:**
- If data service fails to load: Return 503 Service Unavailable
- If CSV parsing fails: Retry 3 times, then fallback to empty data + alert
- If tool execution fails: Return error response with user-friendly message
- If widget fails to render: ChatGPT shows text-only fallback

---

## 8. Success Metrics

### Discovery Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Direct prompt accuracy | > 95% | Golden prompt tests |
| Indirect prompt accuracy | > 80% | Golden prompt tests |
| False positive rate | < 5% | Negative prompt tests |
| Tool selection time | < 200ms | ChatGPT analytics |

### Performance Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Tool response time (avg) | < 500ms | Server logs |
| Tool response time (p95) | < 1000ms | Server logs |
| Widget load time (avg) | < 2s | Client metrics |
| Widget bundle size | < 100KB | Build output |
| Server uptime | > 99% | Uptime monitoring |

### Engagement Metrics
| Metric | Month 1 | Month 3 | Measurement |
|--------|---------|---------|-------------|
| Weekly active users | 100+ | 500+ | ChatGPT analytics |
| Tool invocations/week | 1000+ | 5000+ | Server logs |
| Tools per session | 3+ | 4+ | Session tracking |
| Completion rate | > 70% | > 75% | Funnel analysis |

### Quality Metrics
| Metric | Target | Measurement |
|--------|--------|-------------|
| Error rate | < 1% | Error logs |
| Data accuracy | 100% | Data validation tests |
| WCAG AA compliance | 100% | Accessibility audit |
| Mobile compatibility | 100% | Device testing |

### Business Metrics (Optional)
| Metric | Target | Timeline |
|--------|--------|----------|
| ChatGPT GPT Store rating | > 4.5/5 | Post-launch |
| User retention (7-day) | > 30% | Month 2+ |
| Support tickets | < 10/week | Ongoing |

---

## 9. Open Questions

### OQ-1: Deployment Hosting
**Question:** Which platform should we use for production deployment?

**Options:**
- A) Replit (current environment, easy deploy)
- B) Railway (better performance, costs ~$5-10/month)
- C) Render (free tier available, auto-scaling)
- D) Vercel (serverless, may need MCP adapter)

**Decision needed by:** Phase 5 (Deployment)

**Impact:** Affects deployment process, costs, scalability

---

### OQ-2: Data Refresh Strategy
**Question:** How should we refresh fund data daily?

**Options:**
- A) Cron job hits `/api/data/refresh` endpoint
- B) Server-side scheduled task (node-cron)
- C) External scheduler (GitHub Actions, etc.)
- D) Manual refresh for MVP

**Decision needed by:** Phase 1 (Backend Foundation)

**Impact:** Data freshness, operational complexity

---

### OQ-3: Authentication Decision
**Question:** Do we need rate limiting or authentication for MVP?

**Current decision:** Defer to post-launch based on usage patterns

**Reconsider if:**
- Abuse detected (excessive requests)
- Need to track user preferences
- Premium features planned

---

### OQ-4: Bundle Strategy for Widgets
**Question:** Should we bundle Chart.js with each widget or load from CDN?

**Options:**
- A) Bundle with each widget (self-contained, larger size)
- B) Load from CDN (smaller bundles, external dependency)
- C) Bundle only for chart widget, exclude from others

**Decision needed by:** Phase 3 (Widget Development)

**Impact:** Bundle size, reliability, load time

---

### OQ-5: NAV History Data Source
**Question:** For NAV history > 30 days, should we read from individual JSON files or extend CSV?

**Options:**
- A) Read from `data/rmf-funds/*.json` files (more data, slower)
- B) Extend consolidated CSV with more history (faster, larger CSV)
- C) Limit to 30 days only for MVP

**Decision needed by:** Phase 2 (Tool Implementation)

**Impact:** Performance, feature completeness

---

### OQ-6: Error Monitoring Service
**Question:** Should we integrate error monitoring (Sentry, etc.) for MVP?

**Current plan:** Console logging + file logging for MVP

**Reconsider if:**
- Production error rate > 1%
- Need better debugging for production issues
- Budget allows for monitoring service

---

### OQ-7: Analytics Integration
**Question:** Should we track tool usage analytics beyond basic server logs?

**Options:**
- A) No additional analytics for MVP
- B) Add simple in-memory analytics (counts, timing)
- C) Integrate Google Analytics or similar
- D) Build custom analytics dashboard

**Decision needed by:** Phase 5 (Deployment)

**Impact:** Product insights, feature prioritization

---

## 10. Implementation Phases

### Phase 0: Data Contract Freeze (2 days)
**Owner:** Backend Team  
**Dependencies:** None

**Tasks:**
1. Audit `docs/rmf-funds-consolidated.csv` for completeness
2. Document any data gaps in `docs/openai-app-sdk/DATA_GAPS.md`
3. Finalize Zod schemas in `shared/schema.ts`
4. Create sample JSON payloads for each tool
5. Write `docs/openai-app-sdk/TOOLS_CONTRACT.md`

**Acceptance Criteria:**
- All 410 funds have required fields (name, NAV, risk level)
- Data gaps documented with mitigation plan
- Zod schemas validate sample data successfully
- Tools contract document reviewed and approved

---

### Phase 1: Backend Foundation (3-4 days)
**Owner:** Backend Team  
**Dependencies:** Phase 0 complete

**Tasks:**

**Day 1-2: Data Service**
1. Create `server/services/rmfDataService.ts`
2. Implement CSV parser (use csv-parse or similar)
3. Build in-memory Map for fund lookup by symbol
4. Build indexes: byAMC, byRisk, byCategory
5. Implement search/filter methods
6. Write unit tests (Jest)
7. Test with real CSV data

**Day 3-4: MCP Server**
1. Create `server/mcp.ts`
2. Initialize MCP Server with SDK
3. Register 6 tools with schemas
4. Create stub handlers (return mock data)
5. Register resources for 4 widgets
6. Add `/mcp` route to Express
7. Test with MCP Inspector

**Acceptance Criteria:**
- Data service loads 410+ funds in < 5 seconds
- Search/filter methods return correct results
- Unit tests pass with > 80% coverage
- MCP server responds to `tools/list` request
- MCP Inspector shows all 6 tools

---

### Phase 2: Tool Implementation (3-4 days)
**Owner:** Backend Team  
**Dependencies:** Phase 1 complete

**Tasks:**
1. Implement `get_rmf_funds` handler
2. Implement `search_rmf_funds` handler
3. Implement `get_rmf_fund_detail` handler
4. Implement `get_rmf_fund_performance` handler
5. Implement `get_rmf_fund_nav_history` handler
6. Implement `compare_rmf_funds` handler
7. Add input validation (Zod)
8. Add output validation (Zod)
9. Add error handling for each tool
10. Write integration tests
11. Test each tool with MCP Inspector

**Acceptance Criteria:**
- All 6 tools return correct data structure
- Input validation rejects invalid parameters
- Error handling returns user-friendly messages
- Integration tests pass for all tools
- MCP Inspector can execute all tools successfully

---

### Phase 3: Widget Development (5-7 days)
**Owner:** Frontend Team  
**Dependencies:** Phase 2 complete (can start earlier with mock data)

**Tasks:**

**Day 1-2: Fund List Widget**
1. Create `public/mcp-components/rmf-fund-list.html`
2. Implement carousel layout (CSS Grid/Flexbox)
3. Add fund card rendering
4. Implement horizontal scroll with snap
5. Add "View Details" button interaction
6. Add "Load More" pagination
7. Add loading/error/empty states
8. Implement theme detection and switching
9. Test responsive layouts
10. Test with mock and real data

**Day 3-4: Fund Card Widget**
1. Create `public/mcp-components/rmf-fund-card.html`
2. Implement tab navigation
3. Build Overview tab (NAV, risk, allocation chart)
4. Build Performance tab (table, benchmark comparison)
5. Build Holdings tab (allocation breakdown)
6. Build Fees tab (fee table, documents)
7. Add mini sparkline (7-day NAV)
8. Add fullscreen mode
9. Test all tabs with real data

**Day 5-6: Comparison & Chart Widgets**
1. Create `public/mcp-components/rmf-fund-comparison.html`
2. Implement comparison table layout
3. Add metric highlighting (best/worst)
4. Create `public/mcp-components/rmf-performance-chart.html`
5. Integrate Chart.js
6. Add zoom controls
7. Add fullscreen mode
8. Test with various data sets

**Day 7: Polish & Optimization**
1. Minify all JavaScript and CSS
2. Test bundle sizes (< 100KB each)
3. Test theme switching in all widgets
4. Test responsive layouts on mobile
5. Fix accessibility issues (WCAG AA)
6. Add loading animations

**Acceptance Criteria:**
- All 4 widgets render correctly with real data
- Bundle sizes < 100KB gzipped
- Theme switching works without reload
- Responsive on mobile (iOS/Android ChatGPT apps)
- WCAG AA compliant (contrast, keyboard nav)
- Loading/error states function properly

---

### Phase 4: Testing & Iteration (3-5 days)
**Owner:** QA Team + Development Team  
**Dependencies:** Phase 3 complete

**Tasks:**

**Day 1: Local Testing**
1. Test all tools with MCP Inspector
2. Run unit tests and integration tests
3. Validate all 20 golden prompts locally
4. Check widget rendering in different browsers
5. Test theme switching
6. Performance testing (response times)

**Day 2-3: ChatGPT Testing**
1. Set up ngrok tunnel for public access
2. Add connector to ChatGPT (developer mode)
3. Test all 8 direct prompts (target 100% accuracy)
4. Test all 6 indirect prompts (target 80% accuracy)
5. Test all 6 negative prompts (target 0% false positives)
6. Test tool chaining (search → detail → chart)
7. Test error scenarios (invalid fund codes, etc.)

**Day 4-5: Bug Fixes & Optimization**
1. Fix bugs discovered in testing
2. Optimize tool descriptions for better discovery
3. Improve error messages
4. Polish widget UX based on feedback
5. Re-test golden prompts
6. Performance optimization if needed

**Acceptance Criteria:**
- Golden prompt accuracy: 95% direct, 80% indirect, 0% negative
- No critical bugs remaining
- All widgets render correctly in ChatGPT
- Tool response times < 500ms
- Widget load times < 2s

---

### Phase 5: Production Deployment (2-3 days)
**Owner:** DevOps Team  
**Dependencies:** Phase 4 complete, OQ-1 decided

**Tasks:**
1. Choose hosting platform (Replit/Railway/Render)
2. Set up production environment
3. Configure environment variables
4. Deploy Express server
5. Verify `/mcp` endpoint is publicly accessible
6. Set up monitoring and logging
7. Configure error tracking (if decided)
8. Submit to ChatGPT GPT Store:
   - Create app icon (512x512 PNG)
   - Write app description
   - Provide MCP endpoint URL
   - Submit privacy policy and terms (if required)
9. Test live connector in ChatGPT
10. Monitor initial usage and errors

**Acceptance Criteria:**
- Server deployed and accessible via HTTPS
- Health check endpoint returns 200 OK
- ChatGPT connector added successfully
- All golden prompts work in production
- Monitoring and logging configured
- No production errors in first 24 hours

---

## 11. Risks & Mitigation

### Risk 1: Low Tool Discovery Rate
**Likelihood:** Medium  
**Impact:** High  
**Mitigation:**
- Optimize tool descriptions with keywords: "RMF", "retirement", "mutual fund", "Thailand"
- Add examples in tool descriptions
- Test with various prompt phrasings
- A/B test different descriptions
- Monitor prompt → tool mapping accuracy

**Contingency:** If discovery < 80%, revise tool descriptions and re-submit to ChatGPT

---

### Risk 2: Data Staleness
**Likelihood:** Low  
**Impact:** Medium  
**Mitigation:**
- Automated daily refresh from CSV
- Display data timestamp in widgets
- Alert if data > 48 hours old
- Manual refresh capability

**Contingency:** If automation fails, manual refresh process documented

---

### Risk 3: Widget Rendering Failures
**Likelihood:** Medium  
**Impact:** Medium  
**Mitigation:**
- Extensive testing across browsers and devices
- Fallback to text-only response if widget fails
- Error boundaries in widget code
- Test on iOS/Android ChatGPT apps before launch

**Contingency:** If widgets fail > 5%, disable widgets and use text-only mode

---

### Risk 4: Performance Issues
**Likelihood:** Low  
**Impact:** High  
**Mitigation:**
- In-memory data for fast lookup
- Pre-built indexes for common queries
- Response time monitoring
- Load testing before deployment

**Contingency:** If response time > 1s, optimize queries or increase server resources

---

### Risk 5: CSV Data Quality Issues
**Likelihood:** Medium  
**Impact:** Medium  
**Mitigation:**
- Data validation during CSV parsing
- Log data quality issues
- Handle missing fields gracefully
- Display "N/A" for missing metrics

**Contingency:** If critical fields missing (> 10% of funds), block deployment until fixed

---

## 12. Timeline & Milestones

### Week 1 (Nov 12-18)
- **Day 1-2:** Phase 0 complete (Data contract freeze)
- **Day 3-5:** Phase 1 in progress (Data service + MCP server)
- **Day 6-7:** Phase 1 complete, Phase 2 started

**Milestone:** MCP server responding to tool requests

---

### Week 2 (Nov 19-25)
- **Day 1-3:** Phase 2 complete (All 6 tools implemented)
- **Day 4-7:** Phase 3 in progress (Fund List and Card widgets)

**Milestone:** All tools tested with MCP Inspector

---

### Week 3 (Nov 26-Dec 2)
- **Day 1-3:** Phase 3 complete (All 4 widgets built)
- **Day 4-7:** Phase 4 in progress (Testing with ChatGPT)

**Milestone:** All widgets rendering in ChatGPT

---

### Week 4 (Dec 3-9)
- **Day 1-3:** Phase 4 complete (90%+ golden prompt accuracy)
- **Day 4-6:** Phase 5 in progress (Production deployment)
- **Day 7:** Launch! 🚀

**Milestone:** Live in ChatGPT GPT Store

---

## 13. Appendix

### A. Data Schema Reference

**CSV Columns (docs/rmf-funds-consolidated.csv):**
```
fund_id, symbol, fund_name, amc, fund_classification, 
management_style, dividend_policy, risk_level, fund_type,
nav_date, nav_value, nav_change, nav_change_percent,
perf_ytd, perf_3m, perf_6m, perf_1y, perf_3y, perf_5y,
benchmark_name, benchmark_ytd, benchmark_1y, benchmark_3y,
asset_allocation_json, fees_json, parties_json,
factsheet_url, annual_report_url
```

### B. Tool Description Templates

**Best practices for tool descriptions:**
```
"Use this tool when the user {specific action}. 
For example: {example prompt 1}, {example prompt 2}.
Returns {what data} for {use case}."
```

**Example:**
```
"Use this tool when the user wants to search or filter RMF funds.
For example: 'Find low-risk RMF funds', 'Show me equity funds from Krungsri'.
Returns a list of funds matching the specified criteria."
```

### C. Testing Checklist

**Before Deployment:**
- [ ] All unit tests pass (> 80% coverage)
- [ ] All integration tests pass (100% tools covered)
- [ ] All 20 golden prompts tested
- [ ] Widget rendering tested in ChatGPT web
- [ ] Widget rendering tested in ChatGPT mobile (iOS + Android)
- [ ] Theme switching works (light/dark)
- [ ] Responsive layouts work on mobile
- [ ] WCAG AA compliance verified
- [ ] Performance targets met (< 500ms, < 2s)
- [ ] Error handling verified (all error paths tested)
- [ ] Production environment configured
- [ ] Monitoring and logging working

### D. Launch Checklist

**ChatGPT GPT Store Submission:**
- [ ] App icon created (512x512 PNG)
- [ ] App name: "Thai RMF Market Pulse"
- [ ] App description written (< 200 chars)
- [ ] Category: Finance
- [ ] MCP endpoint URL: `https://{your-domain}/mcp`
- [ ] Privacy policy URL (if required)
- [ ] Terms of service URL (if required)
- [ ] Screenshots/demo video (optional)
- [ ] Contact email for support
- [ ] Submit for review

**Post-Launch:**
- [ ] Monitor error logs (first 24h)
- [ ] Track usage metrics (tool invocations)
- [ ] Gather user feedback
- [ ] Fix critical bugs within 48h
- [ ] Plan iteration based on usage data

---

**END OF PRD**

**Document Status:** Ready for Review  
**Next Steps:** 
1. Review and approve PRD
2. Set up project tracking (GitHub Projects/Issues)
3. Begin Phase 0: Data Contract Freeze
