# Next Steps: Building OpenAI App SDK for Thai RMF Market Pulse

## Executive Summary

You have **excellent foundation data** ready for OpenAI App SDK integration:
- ✅ **410+ RMF funds** with comprehensive data in `data/rmf-funds/`
- ✅ **Consolidated CSV** with all fund metrics in `docs/rmf-funds-consolidated.csv`
- ✅ **Working Express API** with endpoints in `server/routes.ts`
- ✅ **React frontend** with components ready for adaptation
- ✅ **Zod schemas** defined in `shared/schema.ts`

**Next: Transform this into a ChatGPT MCP widget** for conversational RMF fund discovery and comparison.

---

## Phase 1: Planning & Design (Week 1)

### 1.1 Define Core Use Cases

**Target User Prompts** (based on your PRD):
```
Direct Prompts:
- "Show me top performing RMF funds this year"
- "Compare SCBRMFIX and KTAM5YRMF for tax planning"
- "Which RMF funds have lowest risk level 3 or below?"
- "Find RMF equity funds with returns above 10% YTD"
- "What are the best RMF funds for retirement in my 30s?"

Indirect Prompts:
- "I need to invest 200,000 THB before Dec 31 for tax deduction"
- "Help me find safe RMF funds for retirement"
- "Show me aggressive growth RMF options"
- "Which retirement funds invest in Thai stocks?"
- "I want to compare RMF fund fees and performance"

Negative Prompts (should NOT trigger):
- "What's the weather in Bangkok?"
- "How do I file taxes?"
- "Show me LTF funds" (different fund type)
```

**Document in**: `docs/openai-app-sdk/USE_CASES.md`

### 1.2 Design MCP Tools

Based on your data structure, define **5-7 core tools**:

#### Tool 1: `search_rmf_funds`
```typescript
{
  name: "search_rmf_funds",
  description: "Search and filter Thai RMF (Retirement Mutual Fund) funds by keywords, risk level, performance, or AMC. Use when user wants to discover or browse RMF options.",
  inputSchema: {
    query?: string,           // Fund name or keyword
    risk_level?: 1-8,         // Risk rating
    amc?: string,             // Asset management company
    min_ytd_return?: number,  // Minimum YTD performance %
    fund_classification?: string, // EQThai, FIXGOV, etc.
    limit?: number            // Default 10, max 50
  },
  outputTemplate: "rmf-fund-list.html"
}
```

#### Tool 2: `get_fund_details`
```typescript
{
  name: "get_fund_details",
  description: "Get comprehensive details for a specific RMF fund including NAV, performance, asset allocation, holdings, and fees. Use when user asks about a specific fund.",
  inputSchema: {
    symbol: string,  // Required: fund symbol like "SCBRMFIX"
  },
  outputTemplate: "rmf-fund-detail.html"
}
```

#### Tool 3: `compare_rmf_funds`
```typescript
{
  name: "compare_rmf_funds",
  description: "Compare 2-5 RMF funds side-by-side on performance, fees, risk, and asset allocation. Use when user wants to decide between multiple funds.",
  inputSchema: {
    symbols: string[],  // Array of 2-5 fund symbols
    metrics?: string[]  // Which metrics to compare (nav, ytd, fees, risk)
  },
  outputTemplate: "rmf-fund-comparison.html"
}
```

#### Tool 4: `get_top_performers`
```typescript
{
  name: "get_top_performers",
  description: "Get top performing RMF funds by time period (YTD, 1Y, 3Y, 5Y). Use when user asks for 'best' or 'top' funds.",
  inputSchema: {
    period: "ytd" | "1y" | "3y" | "5y",
    risk_level?: 1-8,
    limit?: number  // Default 10
  },
  outputTemplate: "rmf-fund-list.html"
}
```

#### Tool 5: `filter_by_category`
```typescript
{
  name: "filter_by_category",
  description: "Filter RMF funds by investment type: equity, fixed income, mixed, international. Use when user specifies asset class preference.",
  inputSchema: {
    category: "equity" | "fixed_income" | "mixed" | "international" | "alternative",
    risk_level?: 1-8,
    limit?: number
  },
  outputTemplate: "rmf-fund-list.html"
}
```

#### Tool 6: `get_fund_allocation`
```typescript
{
  name: "get_fund_allocation",
  description: "Get detailed asset allocation breakdown for an RMF fund. Use when user asks about fund holdings or portfolio composition.",
  inputSchema: {
    symbol: string
  },
  outputTemplate: "rmf-allocation-chart.html"
}
```

#### Tool 7: `calculate_tax_benefit`
```typescript
{
  name: "calculate_tax_benefit",
  description: "Calculate potential tax deduction from RMF investment. Use when user asks about tax savings.",
  inputSchema: {
    investment_amount: number,  // THB
    annual_income?: number      // THB (optional for tax bracket estimation)
  },
  outputTemplate: "rmf-tax-calculator.html"
}
```

**Document in**: `docs/openai-app-sdk/TOOLS_SPECIFICATION.md`

### 1.3 Design UI Components

Create **HTML+JavaScript widgets** for each output template:

**Key Components:**
1. `rmf-fund-list.html` - Card grid or table of funds
2. `rmf-fund-detail.html` - Single fund deep dive
3. `rmf-fund-comparison.html` - Side-by-side comparison table
4. `rmf-allocation-chart.html` - Pie/donut chart of asset allocation
5. `rmf-tax-calculator.html` - Interactive tax benefit calculator

**Design Requirements:**
- Mobile-responsive (works in ChatGPT mobile)
- Dark/light theme support
- Minimal dependencies (vanilla JS or small libraries)
- < 100KB per component
- Uses `window.openai` API for tool calls

**Document in**: `docs/openai-app-sdk/COMPONENTS_DESIGN.md`

---

## Phase 2: Data Preparation (Week 1-2)

### 2.1 Create Data Service Layer

**File**: `server/services/rmfDataService.ts`

Build a service that reads from your existing data:

```typescript
// Read from data/rmf-funds/*.json files
// Or from docs/rmf-funds-consolidated.csv
// Return structured data matching your Zod schemas

export async function searchFunds(filters: FundSearchFilters): Promise<RMFFund[]>
export async function getFundBySymbol(symbol: string): Promise<RMFFundDetail | null>
export async function getTopPerformers(period: string, limit: number): Promise<RMFFund[]>
export async function compareFunds(symbols: string[]): Promise<FundComparison>
```

**Why:** Your current `server/services/secApi.ts` fetches from SEC API live. For MCP, you want fast, cached responses from your local data files.

### 2.2 Build Data Loading Utility

**File**: `server/services/dataLoader.ts`

```typescript
// Load all fund data on server startup
// Create in-memory index for fast lookups
// Support filtering by risk_level, amc, category, etc.

class FundDataLoader {
  private funds: Map<string, RMFFundDetail>;
  private index: {
    byAMC: Map<string, string[]>;
    byRisk: Map<number, string[]>;
    byCategory: Map<string, string[]>;
  };
  
  async loadAllFunds(): Promise<void>;
  search(filters: any): RMFFund[];
  getBySymbol(symbol: string): RMFFundDetail | null;
}
```

**Data Sources:**
1. Primary: `data/rmf-funds/*.json` (376 files)
2. Secondary: `docs/rmf-funds-consolidated.csv` (for quick validation)

### 2.3 Enhance Data Quality

**Check for:**
- Missing fields (use `data/incomplete-funds-report.json`)
- NAV data freshness (last_upd_date)
- Performance metrics completeness
- Asset allocation data

**Action Items:**
- Run `npm run data:rmf:identify-incomplete` to audit
- Fill gaps with SEC API where needed
- Add default values for optional fields
- Validate against Zod schemas

---

## Phase 3: MCP Server Implementation (Week 2-3)

### 3.1 Install Dependencies

```bash
npm install @modelcontextprotocol/sdk
npm install cors  # If not already installed
```

### 3.2 Create MCP Server Endpoint

**File**: `server/mcp.ts`

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new Server(
  {
    name: "thai-rmf-market-pulse",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// Register tools
server.setRequestHandler("tools/list", async () => ({
  tools: [
    {
      name: "search_rmf_funds",
      description: "Search Thai RMF funds...",
      inputSchema: { /* Zod schema */ }
    },
    // ... more tools
  ]
}));

// Handle tool calls
server.setRequestHandler("tools/call", async (request) => {
  const { name, arguments: args } = request.params;
  
  switch (name) {
    case "search_rmf_funds":
      return await handleSearchFunds(args);
    // ... more handlers
  }
});

// Register HTML components as resources
server.setRequestHandler("resources/list", async () => ({
  resources: [
    {
      uri: "component://rmf-fund-list",
      name: "RMF Fund List Component",
      mimeType: "text/html+skybridge"
    },
    // ... more resources
  ]
}));
```

### 3.3 Add MCP Route to Express

**File**: `server/routes.ts`

```typescript
import { setupMCPEndpoint } from './mcp';

export async function registerRoutes(app: Express): Promise<Server> {
  // Existing routes...
  
  // MCP endpoint for ChatGPT
  app.post("/mcp", setupMCPEndpoint());
  
  // CORS preflight
  app.options("/mcp", cors());
  
  // ... rest of routes
}
```

### 3.4 Implement Tool Handlers

**File**: `server/services/mcpHandlers.ts`

```typescript
export async function handleSearchFunds(args: SearchFundsArgs) {
  const funds = await fundDataLoader.search(args);
  
  return {
    content: [
      {
        type: "text",
        text: `Found ${funds.length} RMF funds matching your criteria.`
      }
    ],
    structuredContent: {
      funds: funds.map(f => ({
        symbol: f.symbol,
        name: f.fund_name,
        amc: f.amc,
        nav: f.latest_nav.last_val,
        ytd: f.performance?.perf_ytd,
        risk_level: f.metadata.risk_level
      }))
    },
    _meta: {
      "openai/outputTemplate": "component://rmf-fund-list"
    }
  };
}
```

---

## Phase 4: Build UI Components (Week 3-4)

### 4.1 Create Component Directory

```
public/
  mcp-components/
    rmf-fund-list.html
    rmf-fund-detail.html
    rmf-fund-comparison.html
    rmf-allocation-chart.html
    rmf-tax-calculator.html
    shared/
      styles.css
      utils.js
```

### 4.2 Fund List Component Example

**File**: `public/mcp-components/rmf-fund-list.html`

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    /* Minimal, responsive styles */
    body { font-family: system-ui; margin: 0; padding: 16px; }
    .fund-card { border: 1px solid #ddd; padding: 12px; margin-bottom: 12px; }
    .fund-name { font-weight: 600; }
    .fund-perf { color: green; }
    .fund-perf.negative { color: red; }
  </style>
</head>
<body>
  <div id="fund-list"></div>
  
  <script>
    // Get initial data from ChatGPT
    const initialData = window.openai?.toolOutput?.structuredContent;
    
    // Render fund cards
    function renderFunds(funds) {
      const container = document.getElementById('fund-list');
      container.innerHTML = funds.map(fund => `
        <div class="fund-card">
          <div class="fund-name">${fund.name}</div>
          <div class="fund-symbol">${fund.symbol}</div>
          <div class="fund-amc">${fund.amc}</div>
          <div class="fund-nav">NAV: ${fund.nav?.toFixed(4)} THB</div>
          <div class="fund-perf ${fund.ytd < 0 ? 'negative' : ''}">
            YTD: ${fund.ytd?.toFixed(2)}%
          </div>
          <button onclick="viewDetails('${fund.symbol}')">View Details</button>
        </div>
      `).join('');
    }
    
    // Call tool to get fund details
    async function viewDetails(symbol) {
      const result = await window.openai.callTool('get_fund_details', { symbol });
      // ChatGPT will render the response automatically
    }
    
    // Listen for updates
    window.addEventListener('openai:set_globals', (event) => {
      if (event.detail?.structuredContent?.funds) {
        renderFunds(event.detail.structuredContent.funds);
      }
    });
    
    // Initial render
    if (initialData?.funds) {
      renderFunds(initialData.funds);
    }
  </script>
</body>
</html>
```

### 4.3 Reuse Existing React Components

**Adapt from**:
- `client/src/components/` - Your existing fund cards, tables, charts
- Extract core rendering logic
- Convert to vanilla JS or use lightweight framework
- Bundle with Vite/Rollup if needed

**Component Checklist:**
- [ ] Fund list/grid view
- [ ] Fund detail page
- [ ] Comparison table
- [ ] Asset allocation chart (use Chart.js or Recharts)
- [ ] Performance chart
- [ ] Tax calculator form

---

## Phase 5: Testing & Iteration (Week 4-5)

### 5.1 Local Testing with MCP Inspector

```bash
# Start your server
npm run dev

# In another terminal
npx @modelcontextprotocol/inspector http://localhost:5000/mcp
```

**Test Each Tool:**
- Invoke `search_rmf_funds` with various filters
- Check `structuredContent` format
- Verify component rendering
- Test error handling

### 5.2 Expose with ngrok

```bash
ngrok http 5000
# Get public URL like https://abc123.ngrok.io
```

### 5.3 Test in ChatGPT

1. Go to ChatGPT Settings → Connectors
2. Enable Developer Mode
3. Add connector: `https://abc123.ngrok.io/mcp`
4. Test with your golden prompts

**Validation:**
- Tool discovery works (ChatGPT finds your tools)
- Tool selection accuracy (right tool for each prompt)
- Component rendering (HTML displays correctly)
- Tool chaining (compare funds after searching)
- Error messages (graceful failures)

### 5.4 Iterate on Metadata

**Optimize tool descriptions** based on selection accuracy:
- Add more examples in descriptions
- Refine keywords for better matching
- Adjust parameter defaults
- Add aliases for common terms

---

## Phase 6: Production Deployment (Week 5-6)

### 6.1 Deploy to Production

**Options:**
1. **Replit Deployment** (easiest, you're already here)
   - Deploy current Express server
   - MCP endpoint at `https://your-app.replit.app/mcp`
   
2. **Vercel/Netlify** (serverless)
   - May need adapter for MCP streaming
   
3. **Railway/Render** (VPS-like)
   - Full Node.js support

### 6.2 Configure ChatGPT Connector

1. Submit to ChatGPT GPT Store
2. Provide public MCP endpoint URL
3. Add app metadata:
   - Name: "Thai RMF Market Pulse"
   - Description: "Discover and compare 410+ Thai Retirement Mutual Funds (RMF)"
   - Icon: Upload logo
   - Category: Finance

### 6.3 Add Authentication (Optional)

**If needed for rate limiting or premium features:**

```typescript
// server/mcp.ts
server.setRequestHandler("auth/oauth", async (request) => {
  // OAuth 2.1 flow
  return {
    authorizationUrl: "https://your-app.com/oauth/authorize",
    tokenUrl: "https://your-app.com/oauth/token"
  };
});
```

### 6.4 Monitor Usage

**Track:**
- Tool invocation frequency
- Error rates
- Response times
- Popular use cases
- User feedback

**Tools:**
- Application Insights / Datadog for metrics
- Sentry for error tracking
- Custom analytics in MCP responses

---

## Quick Start Checklist

### Week 1: Planning ✅
- [ ] Define 10+ golden prompts (direct + indirect)
- [ ] Specify 5-7 MCP tools with schemas
- [ ] Design 5 UI components (wireframes)
- [ ] Audit data completeness

### Week 2: Backend Foundation ✅
- [ ] Create `server/services/rmfDataService.ts`
- [ ] Build data loader from `data/rmf-funds/`
- [ ] Set up MCP server in `server/mcp.ts`
- [ ] Add `/mcp` endpoint to Express

### Week 3: Tool Implementation ✅
- [ ] Implement `search_rmf_funds` handler
- [ ] Implement `get_fund_details` handler
- [ ] Implement `compare_rmf_funds` handler
- [ ] Add resource registration for components

### Week 4: UI Components ✅
- [ ] Create `rmf-fund-list.html`
- [ ] Create `rmf-fund-detail.html`
- [ ] Create `rmf-fund-comparison.html`
- [ ] Test with MCP Inspector

### Week 5: Testing & Polish ✅
- [ ] ngrok tunnel for external testing
- [ ] Test in ChatGPT with connectors
- [ ] Iterate on tool descriptions
- [ ] Fix bugs and edge cases

### Week 6: Launch 🚀
- [ ] Deploy to production
- [ ] Submit to ChatGPT GPT Store
- [ ] Monitor initial usage
- [ ] Gather user feedback

---

## Key Decision Points

### 1. Data Source Strategy

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

**Recommendation**: Start with static files, add SEC API refresh every 5 minutes in background.

### 2. Component Complexity

**Option A: Simple HTML + Vanilla JS**
- ✅ Fast, lightweight
- ✅ No build step
- ❌ Limited interactivity

**Option B: React Microfrontend**
- ✅ Reuse existing components
- ✅ Rich interactivity
- ❌ Larger bundle size
- ❌ Build complexity

**Recommendation**: Start simple, upgrade if needed.

### 3. Authentication

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

**Recommendation**: Start public, add auth if abuse occurs.

---

## Resource Requirements

### Time Estimate
- **Planning**: 1 week
- **Backend**: 1-2 weeks  
- **Frontend**: 1-2 weeks
- **Testing**: 1 week
- **Deployment**: 3-5 days
- **Total**: 5-7 weeks for MVP

### Team Needs
- 1 Full-stack TypeScript developer
- Design support for UI components
- Testing/QA for prompt validation

### Infrastructure
- Existing Express server ✅
- Public HTTPS endpoint (Replit, ngrok, or cloud)
- ~500MB storage for fund data
- Minimal compute (current setup sufficient)

---

## Success Metrics

### Discovery
- Tool selection accuracy > 90% for golden prompts
- < 5% false positive rate on negative prompts

### Performance
- < 500ms average response time
- < 50KB average component size
- 99% uptime

### Engagement
- 100+ weekly active users (1st month)
- 1000+ tool invocations/week
- 4+ tools/session average

---

## Next Immediate Actions

**Today:**
1. ✅ Review this document
2. Create `docs/openai-app-sdk/USE_CASES.md` with golden prompts
3. Audit data quality: Run `npm run data:rmf:identify-incomplete`

**This Week:**
1. Write tool specifications with input/output schemas
2. Create `server/services/rmfDataService.ts` skeleton
3. Design UI component wireframes

**Week 2:**
1. Build MCP server endpoint
2. Implement first tool: `search_rmf_funds`
3. Create first component: `rmf-fund-list.html`

**Week 3:**
1. Complete all 5-7 tools
2. Test with MCP Inspector
3. Set up ngrok tunnel

---

## Additional Resources

### OpenAI Documentation
- [Apps SDK Overview](docs/openai-app-sdk/00-overview.md)
- [MCP Server Guide](docs/openai-app-sdk/08-build-mcp-server.md)
- [Tool Planning](docs/openai-app-sdk/06-plan-tools.md)

### Your Project Docs
- [Product Requirements](docs/prd_thai_rmf_app.md)
- [Design Guidelines](docs/design_guidelines.md)
- [SEC API Integration](docs/SEC-API-INTEGRATION-SUMMARY.md)

### External
- [MCP Specification](https://modelcontextprotocol.io/)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [ChatGPT Connectors](https://platform.openai.com/docs/chatgpt/connectors)

---

## Questions to Answer

1. **Which tools are P0 vs nice-to-have?** (Start with search + details)
2. **What data refresh cadence do you need?** (Daily? Hourly?)
3. **Do you need user authentication?** (For personalization)
4. **Will you monetize this?** (Free tier + premium?)
5. **What's your target launch date?** (Plan backwards from there)

---

**Ready to start?** Begin with Phase 1: Define your golden prompts and tool specifications. This foundation will guide all implementation decisions.
