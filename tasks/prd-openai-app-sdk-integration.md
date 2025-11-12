# Product Requirements Document: OpenAI App SDK Integration
## Thai Fund Market Pulse - ChatGPT Widget

**Version:** 1.0
**Date:** 2025-11-12
**Status:** Planning
**Owner:** Product & Engineering
**Target Launch:** 3-4 weeks from approval

---

## 1. Introduction/Overview

### Problem Statement
Thai investors currently lack an easy, conversational way to discover and compare Retirement Mutual Funds (RMF) for tax-advantaged retirement savings. While our Thai Fund Market Pulse web application provides comprehensive RMF data from Thailand's SEC, users must navigate to a separate website and learn our interface to access this information.

### Proposed Solution
Integrate Thai Fund Market Pulse with ChatGPT using OpenAI's Apps SDK, enabling users to discover, compare, and analyze 403+ RMF funds through natural conversation. Users can ask questions like "Show me low-risk RMF funds" or "Compare B-ASEANRMF and KFRMF-FIXED" and receive interactive widgets displaying real-time fund data, performance charts, and detailed analytics—all within ChatGPT.

### Goal
Transform Thai Fund Market Pulse from a standalone web application into a conversational ChatGPT widget that makes RMF fund discovery and analysis as natural as having a conversation with a financial advisor.

---

## 2. Goals

### Primary Goals

1. **Enable Conversational Fund Discovery**
   Users can discover RMF funds through natural language queries without learning specialized interfaces or commands.

2. **Provide Interactive Data Visualization**
   Display fund data, performance metrics, and NAV charts through rich, interactive widgets within ChatGPT.

3. **Achieve High Tool Discovery Accuracy**
   ChatGPT correctly identifies when to invoke our tools with 100% accuracy for direct queries, 80%+ for indirect queries, and 0% false positives.

4. **Deliver Fast, Responsive Experience**
   All tool responses and widget rendering complete in < 2 seconds with < 500ms average API response time.

5. **Support Mobile-First Usage**
   All widgets work seamlessly on iOS and Android ChatGPT mobile apps with touch-optimized interfaces.

6. **Maintain Data Quality**
   All displayed fund data matches authoritative sources (Thailand SEC API) with clear timestamps showing data freshness.

### Secondary Goals

7. **Accessibility Compliance**
   All widgets meet WCAG AA standards for keyboard navigation, screen readers, and color contrast.

8. **Optimize Bundle Performance**
   Each widget bundles to < 100KB (gzipped) for fast loading on mobile networks.

---

## 3. User Stories

### 3.1 Retirement Planner (Conservative Investor)

**As a** 35-year-old professional planning for retirement,
**I want to** discover low-risk RMF funds with stable returns,
**So that** I can start building tax-advantaged retirement savings without excessive volatility.

**Acceptance Criteria:**
- User asks "Show me conservative RMF funds for retirement"
- System displays fund list filtered by risk level 1-3
- Each fund card shows risk level, YTD return, and NAV
- User can tap any fund to see full details

---

### 3.2 Performance-Focused Investor

**As a** experienced investor comfortable with risk,
**I want to** find top-performing RMF funds over the past year,
**So that** I can maximize my tax-deductible investment returns.

**Acceptance Criteria:**
- User asks "What are the best performing RMF funds this year?"
- System displays top 10 funds sorted by YTD return
- Performance comparison vs. benchmark shown for each fund
- User can view NAV history chart for any fund

---

### 3.3 Fund Comparison Shopper

**As a** investor choosing between multiple RMF options,
**I want to** compare 2-3 funds side-by-side across performance, risk, and fees,
**So that** I can make an informed decision about where to invest.

**Acceptance Criteria:**
- User asks "Compare B-ASEANRMF and KFRMF-FIXED"
- System displays fullscreen comparison table
- Comparison includes performance (all periods), risk metrics, fees, and asset allocation
- User can identify which fund better matches their criteria

---

### 3.4 Asset Manager Researcher

**As a** investor loyal to specific asset management companies,
**I want to** see all RMF offerings from my preferred AMC,
**So that** I can choose the best fund within that company's lineup.

**Acceptance Criteria:**
- User asks "Show me all Krungsri RMF funds"
- System filters funds by AMC = "Krungsri Asset Management"
- User can sort by performance or risk level
- Fund list shows diversification across equity/fixed income

---

### 3.5 Historical Performance Analyst

**As a** data-driven investor,
**I want to** view NAV history and volatility charts for specific funds,
**So that** I can understand historical performance trends before investing.

**Acceptance Criteria:**
- User asks "Show me B-ASEANRMF NAV history for the past 6 months"
- System displays interactive line chart with NAV over time
- Chart shows period return, volatility, and min/max NAV
- User can zoom in/out and expand to fullscreen

---

### 3.6 Mobile User (Commuter)

**As a** mobile user researching funds during my commute,
**I want to** browse and compare funds on my phone with minimal data usage,
**So that** I can make investment decisions anywhere.

**Acceptance Criteria:**
- All widgets load and render on iOS/Android ChatGPT apps
- Horizontal swipe gestures work for fund carousels
- Touch targets are appropriately sized (44x44px minimum)
- Widgets load in < 2 seconds on 4G network

---

### 3.7 Tax Planning Researcher

**As a** taxpayer researching year-end deductions,
**I want to** understand RMF tax benefits and find suitable funds,
**So that** I can reduce my tax liability while saving for retirement.

**Acceptance Criteria:**
- User asks "How do RMF funds help with taxes?"
- System explains RMF tax benefits (up to 500,000 THB deduction)
- System suggests funds based on user's risk tolerance (if provided)
- User receives actionable fund recommendations

---

## 4. Functional Requirements

### 4.1 MCP Tool Requirements

#### FR-1: Tool Discovery
The system MUST expose 6 MCP tools via `/mcp` endpoint that ChatGPT can discover:
- `get_rmf_funds` - Fetch paginated RMF fund list
- `get_rmf_fund_detail` - Get single fund details
- `search_rmf_funds` - Advanced search with filters
- `get_rmf_fund_performance` - Performance-ranked fund list
- `get_rmf_fund_nav_history` - Historical NAV data
- `compare_rmf_funds` - Side-by-side comparison of 2-5 funds

#### FR-2: Tool Input Validation
Each tool MUST validate input parameters using Zod schemas and return structured error messages for:
- Missing required parameters
- Invalid parameter types
- Out-of-range values (e.g., page > max pages)
- Invalid fund codes (non-existent funds)

#### FR-3: Structured Content Response
All tools MUST return responses in three-part format:
- **`structuredContent`**: JSON data for widget hydration (fund objects, arrays, metrics)
- **`content`**: Text array for ChatGPT's language model to read and summarize
- **`_meta`**: Metadata including `openai/outputTemplate` (widget URI), timestamp, cache age

#### FR-4: Tool Metadata
Each tool MUST include metadata for optimal discovery:
- Clear, natural language description
- Example queries that trigger the tool
- Input schema with field descriptions
- `readOnlyHint: true` for all tools (no write operations)
- Status strings: `openai/toolInvocation/invoking` and `openai/toolInvocation/invoked`

---

### 4.2 Data Service Requirements

#### FR-5: In-Memory Data Store
The system MUST load all 403 RMF funds from `data/rmf-funds/*.json` at server startup into an in-memory store with indexes:
- By fund symbol (primary key)
- By AMC name (secondary index)
- By risk level (secondary index)
- By fund classification (secondary index)

#### FR-6: Fund Search
The data service MUST support searching/filtering by:
- Fund name or symbol (partial match, case-insensitive)
- Asset management company (exact match)
- Risk level (1-8 scale)
- Fund classification (equity, fixed income, mixed, etc.)
- Performance threshold (e.g., min 1-year return)
- Combination of multiple filters (AND logic)

#### FR-7: Performance Ranking
The data service MUST sort funds by performance for any period:
- YTD, 3-month, 6-month, 1-year, 3-year, 5-year, 10-year, Since Inception
- Ascending or descending order
- Optional risk level filter (e.g., top performers among low-risk funds)
- Handle missing data gracefully (funds without 5Y data excluded from 5Y rankings)

#### FR-8: Fund Comparison
The data service MUST generate side-by-side comparison data for 2-5 funds including:
- Performance metrics (all periods)
- Risk metrics (volatility, max drawdown, Sharpe ratio)
- Fee comparison (front-end, back-end, management fees)
- Benchmark tracking (benchmark name, returns, tracking error)
- Asset allocation breakdown

---

### 4.3 Widget Requirements

#### FR-9: Fund Card Widget (Inline)
The system MUST provide a `fund-card.html` widget that displays:
- Fund name, symbol, AMC
- Latest NAV with change (absolute + percentage)
- Risk level badge (color-coded 1-8 scale)
- YTD and 1-year returns
- Fund classification and dividend policy
- "View Details" button that calls `get_rmf_fund_detail` tool
- Render inline at ~320px max width
- Support light/dark theme

#### FR-10: Fund List Widget (Carousel)
The system MUST provide a `fund-list.html` widget that displays:
- Horizontal carousel of Fund Card components
- Total fund count header
- Swipe/scroll navigation (mobile + desktop)
- "Load More" button for pagination (calls tool with page+1)
- Snap points for smooth scrolling
- Handle 1-50 funds per page
- Render inline at full conversation width

#### FR-11: Fund Detail Widget (Fullscreen)
The system MUST provide a `fund-detail.html` widget that displays:
- Tabbed interface: Overview, Performance, Holdings, Fees
- **Overview Tab**: NAV summary, 7-day sparkline, key metrics, asset allocation pie chart, AMC info
- **Performance Tab**: Performance table (all periods), benchmark comparison, risk-adjusted metrics, "View NAV Chart" button
- **Holdings Tab**: Top 5 holdings, asset breakdown, sector exposure
- **Fees Tab**: Fee structure table, investment minimums, document links
- Back button to return to conversation
- Fullscreen mode (takes over ChatGPT window)
- Keyboard navigation between tabs

#### FR-12: Performance Chart Widget (Inline/Expandable)
The system MUST provide a `performance-chart.html` widget that displays:
- Interactive NAV line chart using Recharts library
- X-axis: Date range, Y-axis: NAV value
- Hover tooltip showing exact NAV and date
- Period return displayed above chart (percentage + absolute)
- Zoom controls (+/− buttons)
- Fullscreen toggle button
- Render inline at 300px height, 600px when fullscreen
- Responsive to container width

---

### 4.4 Integration Requirements

#### FR-13: window.openai API Usage
All widgets MUST integrate with `window.openai` API:
- `window.openai.callTool()` - Call tools from widgets (e.g., "View Details" button)
- `window.openai.setWidgetState()` - Persist user state across conversation turns
- `window.openai.getWidgetState()` - Restore saved state on mount
- `window.openai.matchTheme()` - Detect light/dark mode
- Listen to `themechange` event for dynamic theme updates

#### FR-14: State Persistence
Widgets MUST persist the following state across conversation turns:
- Selected fund code (for detail view)
- Active tab in detail widget
- Chart zoom level and date range
- Last viewed funds (for "Go Back" functionality)
- Display preferences (card vs. list view)

#### FR-15: Data Freshness
The system MUST indicate data freshness:
- Display timestamp in `_meta` showing last data update
- Server caches fund lists for 24 hours
- Server caches NAV data for 1 hour
- Widgets always request fresh data via tool calls (no client-side caching)
- "Refresh" button in detail widget to re-fetch data

---

### 4.5 Theme & Accessibility Requirements

#### FR-16: Light/Dark Theme Support
All widgets MUST support both light and dark themes:
- Use CSS custom properties for colors (--color-background, --color-foreground, etc.)
- Automatically detect theme via `window.openai.matchTheme()`
- Update theme in real-time when user switches (listen to `themechange` event)
- Maintain 4.5:1 contrast ratio for text in both modes
- Use semantic colors: green for gains, red for losses, neutral gray for unchanged

#### FR-17: Keyboard Navigation
All widgets MUST be fully keyboard accessible:
- All interactive elements reachable via Tab key
- Visible focus indicators (2px outline)
- Logical tab order (left-to-right, top-to-bottom)
- Arrow keys for carousel navigation
- Escape key closes fullscreen views
- Enter/Space activates buttons

#### FR-18: Screen Reader Support
All widgets MUST support screen readers:
- Use semantic HTML (`<button>`, `<nav>`, `<article>`, `<table>`)
- Add ARIA labels for icon-only buttons
- Announce dynamic content updates (`aria-live="polite"`)
- Provide text summaries of charts for non-visual users
- Label form controls with `<label>` or `aria-label`

#### FR-19: Mobile Touch Support
All widgets MUST work on mobile devices:
- Touch targets ≥ 44x44px (WCAG guideline)
- Horizontal swipe for carousels
- Pinch-to-zoom disabled (use app zoom controls instead)
- Tap to expand cards to fullscreen
- No hover-dependent functionality (all actions work with tap)

---

### 4.6 Performance Requirements

#### FR-20: API Response Time
All MCP tool calls MUST respond within performance targets:
- Average response time: < 500ms
- 95th percentile (p95): < 1000ms
- 99th percentile (p99): < 2000ms
- Use caching to achieve these targets (fund lists: 24h, NAV data: 1h)

#### FR-21: Widget Bundle Size
All widget HTML bundles MUST be optimized:
- Maximum bundle size: 100KB per widget (gzipped)
- Tree-shake unused dependencies
- Inline critical CSS only
- Use shared dependencies where possible
- Minify JavaScript and CSS

#### FR-22: Widget Render Time
All widgets MUST render quickly:
- Initial render: < 2 seconds from tool response
- Inline widgets (card, list, chart): < 1 second
- Fullscreen widgets (detail): < 2 seconds
- Measure with Lighthouse performance score ≥ 90

---

### 4.7 Error Handling Requirements

#### FR-23: Graceful Error Messages
The system MUST handle errors gracefully:
- Invalid fund code: "Fund '{code}' not found. Try searching by fund name."
- API rate limit exceeded: "Too many requests. Please try again in a moment."
- Network timeout: "Request timed out. Please try again."
- Missing data: "Performance data not available for this fund (launched < {period} ago)."
- General errors: "Something went wrong. Please try again or rephrase your query."

#### FR-24: Error Response Format
All error responses MUST follow standard format:
```json
{
  "error": {
    "code": "FUND_NOT_FOUND",
    "message": "Fund 'INVALID-CODE' not found",
    "actionableHint": "Try searching by fund name or AMC instead"
  }
}
```

#### FR-25: Fallback Behavior
Widgets MUST handle missing/null data:
- Display "N/A" or "—" for missing metrics
- Hide sections with no data (e.g., Top 5 Holdings if unavailable)
- Show placeholder text: "Data not available" with explanation
- Maintain layout structure even with missing data

---

### 4.8 Testing Requirements

#### FR-26: Golden Prompt Testing
The system MUST be tested against 20 golden prompts:
- 5 direct prompts (must trigger tools: 100% accuracy)
- 5 indirect prompts (should trigger tools: 80%+ accuracy)
- 5 negative prompts (must NOT trigger: 0% false positives)
- 5 edge cases (handle gracefully: clarify or error)

#### FR-27: MCP Inspector Validation
All tools MUST be validated using MCP Inspector:
- Tool discovery via `tools/list`
- Tool execution via `tools/call` with sample parameters
- Structured content format validation
- Error handling for invalid inputs
- Response time measurement

#### FR-28: Cross-Platform Testing
All widgets MUST be tested on:
- Desktop: Chrome, Firefox, Safari, Edge (latest versions)
- Mobile: iOS Safari, Android Chrome (latest versions)
- ChatGPT mobile apps: iOS app, Android app
- Screen readers: VoiceOver (iOS), TalkBack (Android), NVDA (Windows)

---

## 5. Non-Goals (Out of Scope for V1)

### 5.1 Out of Scope Features

**NG-1: User Authentication**
V1 will be public with no user accounts. No login, no OAuth, no saved preferences tied to user IDs.

**NG-2: Personalized Recommendations**
No AI-powered fund recommendations based on user profile, risk tolerance questionnaire, or investment history.

**NG-3: Portfolio Tracking**
No ability to add funds to a watchlist, track holdings, or monitor portfolio performance over time.

**NG-4: Buy/Sell Integration**
No direct fund purchase or redemption. Users must go to their brokerage after deciding which fund to buy.

**NG-5: Real-Time Alerts**
No price alerts, performance notifications, or email/SMS updates when NAV changes.

**NG-6: ESG/ESGX Fund Coverage**
V1 focuses exclusively on RMF (Retirement Mutual Funds). Thai ESG and ESGX funds will be added in V2.

**NG-7: Multi-Language Support**
V1 will support English language queries only. Thai language fund names are displayed but UI is English-only.

**NG-8: Historical Data Export**
No CSV/Excel export of NAV history or performance data. Users view data in widgets only.

**NG-9: Advanced Calculators**
No retirement planning calculators, tax deduction estimators, or compound interest projections.

**NG-10: Social Features**
No fund ratings, user reviews, community discussions, or social sharing.

---

### 5.2 Deferred to V2

**NG-11: Compare More Than 5 Funds**
V1 limits comparison to 2-5 funds to keep UI manageable. Bulk comparison deferred to V2.

**NG-12: Custom Performance Periods**
V1 uses standard periods (YTD, 3M, 6M, 1Y, 3Y, 5Y, 10Y). Custom date ranges deferred to V2.

**NG-13: Dividend History Details**
V1 shows dividend policy only. Full dividend payment history deferred to V2.

**NG-14: Fund Manager Profiles**
V1 lists involved parties but no detailed fund manager bios, credentials, or track records.

**NG-15: Benchmark Customization**
V1 uses SEC-provided benchmarks only. No custom benchmark selection or creation.

---

## 6. Design Considerations

### 6.1 Design System

**System Fonts**
Use native system fonts for fast rendering: `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`

**Color Palette (CSS Custom Properties)**
```css
/* Light Mode */
--color-background: #ffffff;
--color-foreground: #000000;
--color-border: #e5e5e5;
--color-positive: #10b981;  /* Green for gains */
--color-negative: #ef4444;  /* Red for losses */
--color-neutral: #6b7280;   /* Gray for unchanged */
--color-primary: #3b82f6;   /* Blue for interactive elements */

/* Dark Mode */
--color-background: #1a1a1a;
--color-foreground: #ffffff;
--color-border: #404040;
--color-positive: #10b981;
--color-negative: #ef4444;
--color-neutral: #9ca3af;
--color-primary: #60a5fa;
```

**Spacing Scale**
Use 4px base unit: 4px, 8px, 12px, 16px, 24px, 32px, 48px

**Border Radius**
- Cards: 8px
- Buttons: 6px
- Badges: 12px (pill shape)

---

### 6.2 Component Specifications

**Fund Card (320px × 280px)**
- Compact view for carousel display
- Clear visual hierarchy: Name → NAV → Returns → Metadata
- Color-coded risk badge (1-2: green, 3-5: yellow, 6-8: red)
- Positive changes in green, negative in red
- Hover state: subtle shadow + scale(1.02)

**Fund List Carousel**
- Horizontal scroll with 12px gap between cards
- Snap to card boundaries for smooth navigation
- Show 1.5 cards on mobile (hints at more content)
- Show 3.5 cards on tablet, 4.5 on desktop
- Navigation arrows on hover (desktop only)

**Fund Detail (Fullscreen)**
- Sticky header with back button + fund name
- Tab bar immediately below header
- Tab content area with vertical scroll
- Consistent padding: 24px on desktop, 16px on mobile
- Clear visual separation between sections

**Performance Chart**
- Line chart with grid lines (light gray, 1px)
- Data points on hover/tap with crosshair cursor
- Y-axis shows NAV range with auto-scaling
- X-axis shows dates with intelligent tick spacing
- Legend shows period return with color indicator

---

### 6.3 Mobile-First Approach

**Design for mobile, enhance for desktop:**
- Minimum touch target: 44x44px (WCAG guideline)
- Horizontal carousels for space efficiency
- Fullscreen modals for deep dives (not side panels)
- Bottom-aligned action buttons (thumb-friendly)
- Collapsible sections for long content
- Avoid hover-only interactions

**Responsive Breakpoints**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

---

### 6.4 UI/UX Guidelines

**Data-First Presentation**
- Lead with numbers: NAV, returns, risk level
- Use visual encoding: colors, badges, charts
- Provide context: benchmark comparison, percentile ranks
- Progressive disclosure: summary → details → deep dive

**Minimal Decoration**
- No decorative icons or illustrations
- No branding or marketing content
- Focus on data and functionality
- Clean, scannable layouts

**Clear Call-to-Actions**
- Primary action: "View Details" (blue button)
- Secondary actions: "Compare", "View Chart" (outline buttons)
- Tertiary actions: "Load More", "Refresh" (text links)

---

## 7. Technical Considerations

### 7.1 Architecture

**MCP Server Implementation**
- Use `@modelcontextprotocol/sdk` official package
- Implement `Server` class (not manual JSON-RPC handling)
- Register tools with `server.setRequestHandler(ListToolsRequestSchema, ...)`
- Register resources for widget HTML files
- Handle transport layer (stdio for CLI, SSE for web)

**Data Service Layer**
- Singleton pattern for in-memory fund store
- Load all 403 funds at server startup
- Build indexes on first load, reuse for queries
- Refresh data daily at 6 AM via cron job
- Expose clean API: `search()`, `getBySymbol()`, `topPerformers()`, `compare()`

**Widget Build Pipeline**
- Use esbuild for fast bundling
- TypeScript → JavaScript compilation
- React → static HTML with hydration
- CSS-in-JS inlined into HTML
- Output standalone HTML files to `dist/widgets/`

---

### 7.2 Technology Stack

**Backend**
- Runtime: Node.js 18+ (already in use)
- Framework: Express (existing)
- MCP SDK: `@modelcontextprotocol/sdk` v1.0+
- Schema Validation: Zod (existing)
- Data Source: JSON files + SEC API

**Frontend (Widgets)**
- Framework: React 18+ (for component reuse)
- Bundler: esbuild (fast, lightweight)
- Charts: Recharts (already installed)
- CSS: CSS-in-JS (Emotion or similar)
- No dependencies on external CDNs (fully bundled)

**Development Tools**
- TypeScript 5+ (existing)
- MCP Inspector for testing
- Jest for unit tests
- Lighthouse for performance audits

---

### 7.3 Data Flow

```
User Query
    ↓
ChatGPT Model
    ↓
Tool Discovery (MCP tools/list)
    ↓
Tool Invocation (MCP tools/call)
    ↓
Express /mcp endpoint
    ↓
Tool Handler (get_rmf_funds, etc.)
    ↓
Data Service (in-memory search/filter)
    ↓
Structured Response (structuredContent + content + _meta)
    ↓
ChatGPT Model (reads content)
    ↓
Widget Renderer (uses structuredContent + _meta)
    ↓
User sees inline widget with data
```

---

### 7.4 Dependencies

**New Dependencies Required**
- `@modelcontextprotocol/sdk` - MCP protocol implementation
- `esbuild` - Widget bundling (may already exist)
- `@emotion/react` or similar - CSS-in-JS for widgets

**Existing Dependencies to Reuse**
- `express` - API server
- `zod` - Schema validation
- `recharts` - Chart library
- React/TypeScript stack

---

### 7.5 Deployment Architecture

**Hosting Options**
1. **Replit** (Easiest, current host)
   - One-click deploy
   - HTTPS by default
   - Good for MVP/testing

2. **Railway/Render** (Recommended for production)
   - Better performance
   - Custom domains
   - More reliable uptime
   - $5-10/month cost

3. **Vercel/Netlify** (Serverless)
   - May need adapter for MCP streaming
   - Good for scalability
   - Free tier available

**Production Requirements**
- HTTPS endpoint (required for ChatGPT)
- Environment variables: `SEC_API_KEY`, `PORT`, `NODE_ENV`
- Error monitoring: Sentry integration
- Uptime monitoring: Pingdom or UptimeRobot
- Log aggregation: LogTail or CloudWatch

---

### 7.6 Caching Strategy

**Server-Side Caching**
- Fund list cache: 24 hours (funds rarely change)
- NAV data cache: 1 hour (updates once daily at market close)
- Performance data cache: 24 hours (updates daily)
- Cache invalidation: Manual flush via admin endpoint

**Client-Side Caching**
- No client-side caching (always fetch fresh via tools)
- Widget state persisted via `window.openai.setWidgetState()`
- Use `_meta.timestamp` to show data age to users

---

### 7.7 Security Considerations

**Input Validation**
- Validate all tool inputs with Zod schemas
- Sanitize search queries (prevent injection)
- Whitelist allowed fund codes (403 known symbols)
- Rate limiting: 100 requests/minute per IP

**Data Privacy**
- No user data collected (anonymous, read-only tools)
- No PII in logs or error messages
- SEC API key stored in environment variables (not in code)
- HTTPS only (no HTTP fallback)

**Error Handling**
- Never expose stack traces to users
- Log errors to Sentry with context
- Return generic error messages, not internal details
- Monitor for suspicious patterns (scraping, abuse)

---

## 8. Success Metrics

### 8.1 Discovery Accuracy (Primary KPI)

**Target: Tool Accuracy by Prompt Type**
- **Direct Prompts**: 100% accuracy (5/5 golden prompts)
  - "Show me top RMF funds" → `get_rmf_funds`
  - "Tell me about B-ASEANRMF" → `get_rmf_fund_detail`
  - "Show NAV history for B-ASEANRMF" → `get_rmf_fund_nav_history`

- **Indirect Prompts**: 80%+ accuracy (4+/5 golden prompts)
  - "I want to save for retirement" → `get_rmf_funds`
  - "Compare Krungsri vs Bangkok Bank funds" → `search_rmf_funds` + `compare_rmf_funds`

- **Negative Prompts**: 0% false positives (0/5 must trigger)
  - "Show me S&P 500 performance" → NONE
  - "Best cryptocurrency for retirement" → NONE

**Measurement Method**
- Test all 20 golden prompts weekly
- Track accuracy trends over time
- Iterate on tool descriptions if accuracy drops

---

### 8.2 Performance Metrics

**API Response Time**
- Target: < 500ms average
- Measurement: p50, p95, p99 from server logs
- Alert threshold: p95 > 1000ms

**Widget Render Time**
- Target: < 2 seconds from tool response to visible widget
- Measurement: Lighthouse performance score ≥ 90
- Test on real mobile devices (iOS/Android)

**Bundle Size**
- Target: < 100KB per widget (gzipped)
- Measurement: Webpack bundle analyzer
- Monitor on every build

**Uptime**
- Target: 99% uptime (< 7.2 hours downtime/month)
- Measurement: Pingdom monitoring
- Alert on > 5 minutes downtime

---

### 8.3 Usage Metrics (First Month)

**Weekly Active Users (WAU)**
- Target: 100+ WAU by end of month 1
- Growth: +20% month-over-month

**Tool Invocations**
- Target: 1,000+ tool calls/week
- Most popular tool: Expected `get_rmf_funds` (40%)
- Least popular: Expected `compare_rmf_funds` (10%)

**Session Depth**
- Target: 4+ tools per session on average
- Indicates users explore multiple funds

**Mobile vs. Desktop**
- Track percentage on mobile (expect 60%+)
- Ensure mobile experience is optimized

---

### 8.4 Quality Metrics

**Data Accuracy**
- Target: 100% of displayed data matches SEC source
- Measurement: Automated daily comparison script
- Alert on any mismatch

**Error Rate**
- Target: < 1% of tool calls result in errors
- Measurement: Error logs in Sentry
- Categorize by error type (not found, timeout, rate limit)

**Accessibility Score**
- Target: WCAG AA compliance (all criteria)
- Measurement: Automated accessibility tests (axe-core)
- Manual testing with screen readers

---

### 8.5 Engagement Metrics

**Widget Interaction Rate**
- Target: 80%+ of tool responses show widget (not just text)
- Indicates structured content is rendering correctly

**Detail View Click-Through Rate**
- Target: 30%+ of fund card views lead to detail view
- Indicates users want deeper information

**Comparison Usage**
- Target: 15%+ of sessions use `compare_rmf_funds`
- Indicates users are evaluating options

**Return User Rate**
- Target: 40%+ of users return within 7 days
- Indicates product provides ongoing value

---

## 9. Open Questions

### 9.1 Authentication & Personalization

**Q1: Should we add user authentication in V1.5?**
- Pro: Enables saved favorites, watchlists, personalized recommendations
- Con: Adds friction, requires OAuth setup, privacy considerations
- Decision needed: Based on user feedback in first month

**Q2: How do we prevent abuse without authentication?**
- Options: IP-based rate limiting, CAPTCHA for suspicious patterns, monitor usage
- Decision needed: Set rate limits (100 req/min per IP reasonable?)

---

### 9.2 Data Refresh Strategy

**Q3: How often should we refresh fund data from SEC API?**
- Current plan: Daily at 6 AM Thailand time
- Alternative: Refresh on-demand when cache expires
- Decision needed: Balance freshness vs. API rate limits

**Q4: How do we handle stale data during SEC API outages?**
- Options: Show cached data with age warning, disable tools, show generic error
- Decision needed: What's acceptable user experience during downtime?

---

### 9.3 Deployment & Operations

**Q5: Which hosting platform should we use for production?**
- Options: Replit (easy), Railway (better performance), Vercel (serverless)
- Trade-offs: Cost, reliability, ease of deployment
- Decision needed: After V1 load testing

**Q6: Do we need a staging environment?**
- Pro: Test changes before production, safer deployments
- Con: Doubles hosting costs, more complex CI/CD
- Decision needed: Based on release frequency and team size

---

### 9.4 Feature Prioritization

**Q7: Should we add ESG/ESGX funds in V1 or defer to V2?**
- RMF coverage: 403 funds (ready)
- ESG coverage: 52 funds (data ready but no widget design)
- ESGX coverage: 28 funds (data ready)
- Decision needed: Scope V1 tightly or expand coverage?

**Q8: Should we support Thai language queries in V1?**
- ChatGPT can handle Thai input, but our tool descriptions are English-only
- Would require Thai tool descriptions and test prompts
- Decision needed: Based on target user demographics

---

### 9.5 Monetization (Future)

**Q9: How do we monetize this integration?**
- Options: Freemium (basic free, premium paid), referral fees from AMCs, sponsored placements
- Current plan: Public and free for V1
- Decision needed: If engagement metrics justify V2 investment

**Q10: Should we track which funds users are most interested in?**
- Pro: Valuable analytics for AMC partnerships
- Con: Privacy concerns, additional data storage
- Decision needed: Legal/ethics review needed

---

## 10. Implementation Timeline

### Phase Breakdown (17-24 Days Total)

**Phase 0: Data Validation (1 day)**
- Sample 5+ diverse funds from consolidated CSV
- Verify all 60 columns populated or predictable nulls
- Document gaps in `docs/DATA_GAPS.md`
- Run completeness audit

**Phase 1: MCP Tool Contract (2-3 days)**
- Create `docs/TOOLS_CONTRACT.md` with 6 tool specs
- Define JSON schemas for input/output
- Include sample payloads from real funds
- Get stakeholder sign-off

**Phase 2: Shared Types & Data Service (2-3 days)**
- Update Zod schemas in `shared/schema.ts`
- Create `server/services/rmfDataService.ts`
- Build in-memory indexes
- Add unit tests (80%+ coverage)

**Phase 3: MCP Server Implementation (3-4 days)**
- Refactor `/mcp` endpoint with MCP SDK
- Implement all 6 tools
- Add structured content responses
- Test with MCP Inspector

**Phase 4: Widget Development (5-7 days)**
- Set up esbuild widget bundler
- Build 4 widgets (Card, List, Detail, Chart)
- Implement `window.openai` hooks
- Optimize bundle sizes

**Phase 5: Testing & Validation (2-3 days)**
- Test 20 golden prompts
- MCP Inspector validation
- Cross-platform testing (mobile/desktop)
- Performance benchmarking

**Phase 6: Deployment (2-3 days)**
- Deploy to production hosting
- Submit to ChatGPT GPT Store
- Set up monitoring and alerts
- Write user documentation

---

## 11. Dependencies & Risks

### 11.1 Dependencies

**Internal Dependencies**
- Existing SEC API integration must remain stable
- Current data extraction pipeline (403 funds complete)
- Zod schemas in `shared/schema.ts`

**External Dependencies**
- OpenAI Apps SDK stability (beta → GA)
- ChatGPT GPT Store approval process
- SEC API uptime and rate limits
- MCP protocol specification stability

---

### 11.2 Risks & Mitigation

**Risk 1: Schema Drift**
- Impact: Tools and widgets become incompatible
- Mitigation: Treat `docs/TOOLS_CONTRACT.md` as canonical source, no changes without contract update, run contract validation tests on every PR

**Risk 2: Tool Discovery Accuracy < Target**
- Impact: Users get frustrated if ChatGPT doesn't invoke correct tools
- Mitigation: Iterate on tool descriptions using golden prompt results, add more example queries, use natural language in descriptions

**Risk 3: SEC API Changes Breaking Integration**
- Impact: Data freshness breaks, stale data displayed
- Mitigation: Monitor API health daily, implement fallback to cached data, document SEC API refresh cadence, set up alerts for stale data

**Risk 4: Widget Performance on Low-End Mobile**
- Impact: Poor user experience on slower devices
- Mitigation: Test on real mid-range Android devices (not just high-end), optimize bundles aggressively, use code splitting, lazy load charts

**Risk 5: ChatGPT GPT Store Rejection**
- Impact: Launch delayed, can't reach users
- Mitigation: Review GPT Store guidelines early, ensure privacy policy and ToS are in place, test with reviewer checklist before submitting

---

## 12. Approval & Sign-Off

### Required Approvals

- [ ] **Product Manager** - Goals, user stories, success metrics approved
- [ ] **Engineering Lead** - Technical architecture and timeline feasible
- [ ] **Design Review** - UI/UX specifications approved (if design team exists)
- [ ] **Legal/Compliance** - No regulatory issues with RMF fund display
- [ ] **QA Lead** - Testing strategy and acceptance criteria clear

### Next Steps After Approval

1. Create detailed implementation plan in project management tool
2. Set up development environment with MCP Inspector
3. Begin Phase 0: Data validation
4. Schedule weekly progress reviews
5. Prepare demo for stakeholders at Phase 3 completion

---

## Appendix A: Glossary

**AMC** - Asset Management Company (e.g., Krungsri Asset Management)
**ChatGPT** - OpenAI's conversational AI interface
**MCP** - Model Context Protocol (for ChatGPT integrations)
**NAV** - Net Asset Value (price per fund unit)
**RMF** - Retirement Mutual Fund (Thai tax-advantaged retirement fund)
**SEC** - Securities and Exchange Commission (Thailand)
**WCAG** - Web Content Accessibility Guidelines
**YTD** - Year-to-Date (performance since January 1)

---

## Appendix B: Reference Documents

**Project Documentation**
- Master Plan: `tasks/OPENAI_APP_SDK_MASTER_PLAN.md`
- Product Requirements (Legacy): `docs/prd_thai_rmf_app.md`
- SEC API Integration: `docs/SEC-API-INTEGRATION-SUMMARY.md`
- Codebase Guide: `CLAUDE.md`

**OpenAI Documentation**
- Apps SDK Overview: `openai-app-sdk/00-index.md`
- MCP Server Build Guide: `openai-app-sdk/build/`
- Tool Planning Guide: `openai-app-sdk/plan/`
- Design Guidelines: `openai-app-sdk/concepts/design-guidelines.md`

**External Resources**
- [MCP Specification](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [ChatGPT Apps Documentation](https://platform.openai.com/docs/chatgpt)
- [Thailand SEC API Portal](https://api-portal.sec.or.th/)

---

**Document Status:** DRAFT - Awaiting Approval
**Last Updated:** 2025-11-12
**Version:** 1.0
**Total Pages:** ~35 (estimated print length)
