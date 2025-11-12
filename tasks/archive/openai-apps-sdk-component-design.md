# OpenAI Apps SDK Component Design

This document defines the architecture for Thai Fund Market Pulse OpenAI App SDK widget components, including tool-to-component mappings, data contracts, and state management strategy.

## Architecture Overview

### Component Types

We will implement **4 core widgets** that render in ChatGPT:

1. **Fund Card Widget** (`FundCardWidget`) - Single fund inline display
2. **Fund List Widget** (`FundListWidget`) - Carousel of multiple funds
3. **Fund Detail Widget** (`FundDetailWidget`) - Fullscreen deep-dive
4. **Performance Chart Widget** (`PerformanceChartWidget`) - NAV history visualization

### Component Location

All widgets will be built in a new `web/` directory:
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

### Build Output

Each widget will be bundled into a single HTML file:
```
dist/widgets/
├── fund-card.html              # Standalone bundle with inlined JS/CSS
├── fund-list.html              # Standalone bundle with inlined JS/CSS
├── fund-detail.html            # Standalone bundle with inlined JS/CSS
└── performance-chart.html      # Standalone bundle with inlined JS/CSS
```

## Tool-to-Component Mapping

### 1. `get_rmf_funds` Tool

**Purpose:** Fetch paginated list of RMF funds with optional filters

**Parameters:**
```typescript
{
  page?: number;          // Page number (default: 1)
  pageSize?: number;      // Results per page (default: 20, max: 50)
  fundType?: string;      // Filter by fund classification
  search?: string;        // Search by fund name or symbol
  sortBy?: "performance" | "nav" | "name";  // Sort criteria
}
```

**Returns Component:** `FundListWidget` (carousel)

**Data Contract:**
```typescript
// structuredContent (for component)
{
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
}

// _meta (component-only data)
{
  timestamp: string;
  cacheAge: number;
}

// content (for model)
"Found {count} RMF funds. The top performers include {fund1}, {fund2}, {fund3}..."
```

**Display Mode:** Inline carousel (horizontally scrollable)

---

### 2. `get_rmf_fund_detail` Tool

**Purpose:** Get detailed information for a specific fund

**Parameters:**
```typescript
{
  fundCode: string;  // Fund symbol (e.g., "B-ASEANRMF")
}
```

**Returns Component:** `FundCardWidget` (single fund card)

**Data Contract:**
```typescript
// structuredContent (for component)
{
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
}

// _meta (component-only data)
{
  navHistory7d: Array<{ date: string; nav: number }>;  // For mini sparkline
  fullDataUrl: string;  // Link to fund JSON file
}

// content (for model)
"{fundName} ({fundCode}) is managed by {amc}. Current NAV: {nav} ({changePercent}%). 1-year return: {return1y}%..."
```

**Display Mode:** Inline card with "View Details" button (expands to fullscreen)

---

### 3. `search_rmf_funds` Tool

**Purpose:** Search RMF funds with advanced filters

**Parameters:**
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

**Returns Component:** `FundListWidget` (carousel)

**Data Contract:** Same as `get_rmf_funds` tool

**Display Mode:** Inline carousel with search context displayed

---

### 4. `get_rmf_fund_performance` Tool

**Purpose:** Get funds sorted by performance metrics

**Parameters:**
```typescript
{
  period: "ytd" | "3m" | "6m" | "1y" | "3y" | "5y";
  sortBy: "asc" | "desc";
  limit?: number;  // Max results (default: 10)
  riskLevel?: number;  // Optional risk filter
}
```

**Returns Component:** `FundListWidget` (carousel with performance focus)

**Data Contract:**
```typescript
// structuredContent (for component)
{
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
}

// content (for model)
"Top {limit} RMF funds by {period} performance: 1) {fund1} (+{return}%), 2) {fund2} (+{return}%)..."
```

**Display Mode:** Inline carousel with performance ranking

---

### 5. `get_rmf_fund_nav_history` Tool

**Purpose:** Get historical NAV data for charting

**Parameters:**
```typescript
{
  fundCode: string;
  days?: number;  // Number of days (default: 30, max: 365)
}
```

**Returns Component:** `PerformanceChartWidget` (NAV line chart)

**Data Contract:**
```typescript
// structuredContent (for component)
{
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
}

// _meta (component-only data)
{
  minNav: number;
  maxNav: number;
  avgNav: number;
  dataSource: string;
}

// content (for model)
"{fundName} NAV over {days} days: {periodReturnPercent}% return. Current: {currentNav}, Min: {minNav}, Max: {maxNav}."
```

**Display Mode:** Inline card with zoom/expand to fullscreen

---

### 6. `compare_rmf_funds` Tool

**Purpose:** Side-by-side comparison of multiple funds

**Parameters:**
```typescript
{
  fundCodes: string[];  // Array of 2-5 fund codes
  compareBy?: "performance" | "risk" | "fees" | "all";
}
```

**Returns Component:** `FundDetailWidget` (fullscreen comparison table)

**Data Contract:**
```typescript
// structuredContent (for component)
{
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
}

// content (for model)
"Comparing {count} RMF funds: {fund1} vs {fund2} vs {fund3}. Best 1Y return: {bestFund} ({return}%). Lowest risk: {safestFund} (Level {risk})."
```

**Display Mode:** Fullscreen table/card layout

---

## Widget Component Specifications

### 1. Fund Card Widget (`FundCardWidget`)

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

### 2. Fund List Widget (`FundListWidget`)

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

### 3. Fund Detail Widget (`FundDetailWidget`)

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

### 4. Performance Chart Widget (`PerformanceChartWidget`)

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

## State Management Strategy

### Component State (Ephemeral)

Use React `useState` for UI state that doesn't need to persist:
- Active tab in detail view
- Chart zoom level
- Expanded/collapsed sections
- Loading states

### Persistent State

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

### Data Freshness

**Cache Strategy:**
- Server caches fund lists for 24h
- Server caches NAV data for 1h
- Components ALWAYS request fresh data via tools
- Use `_meta.timestamp` to show data age

**Refresh Pattern:**
```typescript
// Components should expose refresh method
const handleRefresh = async () => {
  setLoading(true);
  const result = await window.openai.callTool("get_rmf_fund_detail", {
    fundCode: fund.fundCode,
  });
  setFund(result.structuredContent.fund);
  setLoading(false);
};
```

---

## Theme Integration

### Light/Dark Mode Detection

Use `window.openai.matchTheme()` to detect ChatGPT theme:

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

### Color System

Use CSS custom properties that adapt to theme:

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

---

## Accessibility Guidelines

### WCAG AA Compliance

1. **Color Contrast:**
   - Text: 4.5:1 minimum contrast ratio
   - Large text (18pt+): 3:1 minimum
   - Don't rely on color alone (use icons + text)

2. **Keyboard Navigation:**
   - All interactive elements must be keyboard accessible
   - Visible focus indicators
   - Logical tab order

3. **Screen Readers:**
   - Use semantic HTML (`<button>`, `<nav>`, `<article>`)
   - Add ARIA labels where needed
   - Announce dynamic content updates

4. **Charts:**
   - Provide text summary of chart data
   - Use patterns + colors for data series
   - Keyboard accessible tooltips

### Semantic HTML Example

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

## Error Handling

### Error States

All components must handle:

1. **Loading State:**
```tsx
{loading && (
  <div class="loading-skeleton" aria-busy="true">
    <LoadingSpinner />
    <span>Loading fund data...</span>
  </div>
)}
```

2. **Error State:**
```tsx
{error && (
  <div class="error-message" role="alert">
    <ErrorIcon />
    <h4>Unable to load fund data</h4>
    <p>{error.message}</p>
    <button onClick={handleRetry}>Try Again</button>
  </div>
)}
```

3. **Empty State:**
```tsx
{funds.length === 0 && (
  <div class="empty-state">
    <EmptyIcon />
    <h4>No funds found</h4>
    <p>Try adjusting your search criteria</p>
  </div>
)}
```

### Error Types

```typescript
type WidgetError =
  | { type: "not_found"; fundCode: string }
  | { type: "network_error"; message: string }
  | { type: "invalid_params"; field: string }
  | { type: "rate_limited"; retryAfter: number }
  | { type: "unknown"; message: string };
```

---

## Performance Optimization

### Bundle Size

- Target: < 100KB per widget bundle (gzipped)
- Use tree-shaking to eliminate unused code
- Externalize React/ReactDOM if shared across widgets
- Inline critical CSS only

### Lazy Loading

```tsx
// Lazy load heavy components
const NavChart = lazy(() => import("./NavChart"));

<Suspense fallback={<ChartSkeleton />}>
  <NavChart data={navHistory} />
</Suspense>
```

### Memoization

```tsx
// Memoize expensive calculations
const performanceMetrics = useMemo(() => {
  return calculateMetrics(navHistory);
}, [navHistory]);

// Memoize components with stable props
const FundCard = memo(({ fund }) => {
  // ...
}, (prevProps, nextProps) => {
  return prevProps.fund.fundCode === nextProps.fund.fundCode &&
         prevProps.fund.latestNav === nextProps.fund.latestNav;
});
```

---

## Mobile Considerations

### Responsive Design

- Mobile breakpoint: < 768px
- Use touch-friendly tap targets (min 44x44px)
- Optimize carousel for swipe gestures
- Reduce data density on small screens

### iOS/Android ChatGPT Apps

- Test on both platforms
- Handle safe area insets
- Optimize for different screen sizes
- Test landscape orientation

---

## Testing Strategy

### Component Testing

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

### Integration Testing

Test with MCP Inspector:
1. Call tool with various parameters
2. Verify structuredContent shape
3. Confirm component renders correctly
4. Test state persistence
5. Test error handling

---

## Revision History

- 2025-11-12: Initial version (component architecture defined)
