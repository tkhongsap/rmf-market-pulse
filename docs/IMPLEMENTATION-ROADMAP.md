# Thai Fund Market Pulse → OpenAI App: Implementation Roadmap

**Current Status:** We have a working Express/React app with MCP endpoint
**Goal:** Transform into a ChatGPT-native app using OpenAI Apps SDK

---

## 📊 Current Codebase Analysis

### ✅ What We Have
- **Backend:** Express server with `/mcp` endpoint already implemented
- **MCP Tools:** Basic `get_rmf_funds` and `get_rmf_fund_detail` tools
- **Frontend:** React components (RMFFundCard, RMFFundTable, WidgetContainer)
- **Data:** SEC API integration for 400+ RMF funds with comprehensive data
- **API Routes:** REST endpoints at `/api/rmf` and `/api/rmf/:fundCode`

### ❌ What's Missing (for OpenAI Apps SDK)
- **Component Resources:** HTML templates with `text/html+skybridge` MIME type
- **Structured Content:** `structuredContent` field in tool responses
- **Metadata Fields:** `_meta` fields for tool invocation status and widget configuration
- **window.openai API:** Frontend components don't use ChatGPT bridge
- **Output Templates:** Tools don't reference component resources
- **Widget State:** No `setWidgetState()` implementation for persistence

---

## 🎯 Implementation Phases

## Phase 1: Planning & Design (1-2 days)

### 1.1 Define Use Cases
Based on SDK docs `05-plan-use-case.md`, create golden prompt set:

**Direct Prompts (explicit):**
- "Show me the top 10 performing RMF funds"
- "Search for RMF funds with 'SCB' in the name"
- "Get details for fund SCBRMLEQ"
- "Compare RMF equity funds by performance"
- "Show RMF funds with dividend policy"

**Indirect Prompts (implicit goals):**
- "I want to invest in a retirement fund"
- "What are the best tax-saving funds in Thailand?"
- "Help me choose between conservative and aggressive RMF funds"
- "Show me funds with good 5-year returns"

**Negative Prompts (should NOT trigger):**
- "Book a flight to Bangkok"
- "What's the weather today?"
- "Calculate 2+2"

### 1.2 Define Tools (Tool-First Thinking)
Based on SDK docs `06-plan-tools.md`:

**Tool 1: search_rmf_funds**
```typescript
{
  name: "search_rmf_funds",
  title: "Search Thai RMF Funds",
  description: "Use this when the user wants to find, browse, or compare Thai Retirement Mutual Funds (RMF). Returns fund list with NAV, performance, and basic details.",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string", description: "Search by fund name, AMC, or symbol" },
      limit: { type: "number", default: 10, description: "Number of results (1-50)" },
      sortBy: {
        type: "string",
        enum: ["performance_1y", "performance_ytd", "nav", "name"],
        description: "Sort results by field"
      }
    }
  },
  _meta: {
    "openai/outputTemplate": "rmf-fund-list-v1",
    "openai/toolInvocation/invoking": "Searching RMF funds...",
    "openai/toolInvocation/invoked": "Found {count} RMF funds",
    "openai/widgetAccessible": true,
    "readOnlyHint": true
  }
}
```

**Tool 2: get_fund_details**
```typescript
{
  name: "get_fund_details",
  title: "Get RMF Fund Details",
  description: "Use this when the user wants detailed information about a specific RMF fund including holdings, asset allocation, fees, and historical performance.",
  inputSchema: {
    type: "object",
    properties: {
      fundCode: { type: "string", description: "Fund symbol/code (e.g., SCBRMLEQ)" }
    },
    required: ["fundCode"]
  },
  _meta: {
    "openai/outputTemplate": "rmf-fund-detail-v1",
    "openai/toolInvocation/invoking": "Loading fund details...",
    "openai/toolInvocation/invoked": "Loaded {fundName}",
    "openai/widgetAccessible": true,
    "readOnlyHint": true
  }
}
```

**Tool 3: compare_funds**
```typescript
{
  name: "compare_funds",
  title: "Compare RMF Funds",
  description: "Use this when the user wants to compare multiple RMF funds side-by-side to make investment decisions.",
  inputSchema: {
    type: "object",
    properties: {
      fundCodes: {
        type: "array",
        items: { type: "string" },
        minItems: 2,
        maxItems: 5,
        description: "2-5 fund codes to compare"
      }
    },
    required: ["fundCodes"]
  },
  _meta: {
    "openai/outputTemplate": "rmf-fund-comparison-v1",
    "openai/toolInvocation/invoking": "Comparing funds...",
    "openai/toolInvocation/invoked": "Compared {count} funds",
    "openai/widgetAccessible": true,
    "readOnlyHint": true
  }
}
```

### 1.3 Design Components
Based on SDK docs `07-plan-components.md`:

**Component 1: Fund List (Inline Card)**
- Display: Grid/carousel of fund cards
- Data: Fund name, AMC, NAV, YTD performance, risk level
- Actions: "View Details" button (calls get_fund_details)
- Mode: Inline, responsive

**Component 2: Fund Details (Inline/Fullscreen)**
- Display: Comprehensive fund information
- Data: All fund metadata, charts, holdings, fees
- Actions: "Compare" button, "View on SET" link
- Mode: Inline with fullscreen option

**Component 3: Fund Comparison (Inline)**
- Display: Side-by-side comparison table
- Data: Key metrics across selected funds
- Actions: Add/remove funds from comparison
- Mode: Inline only

---

## Phase 2: Backend Enhancement (2-3 days)

### 2.1 Install Dependencies
```bash
npm install @modelcontextprotocol/sdk zod
```

### 2.2 Enhance MCP Server (`server/routes.ts`)

**Changes needed:**

1. **Add Component Resources** (before tool definitions)
```typescript
// Resource registration for component templates
app.get("/mcp", async (req, res) => {
  if (req.query.method === "resources/list") {
    return res.json({
      resources: [
        {
          uri: "rmf-fund-list-v1",
          name: "RMF Fund List Component",
          mimeType: "text/html+skybridge",
          _meta: {
            "openai/widgetDescription": "Interactive grid of Thai RMF funds with search and filtering",
            "openai/widgetPrefersBorder": true,
            "openai/widgetCSP": {
              "connect_domains": ["api.sec.or.th"],
              "resource_domains": []
            }
          }
        },
        // ... other resources
      ]
    });
  }
});
```

2. **Update Tool Responses with Structured Content**
```typescript
if (name === "search_rmf_funds") {
  const funds = await searchRMFFunds(args.query, args.limit);

  return res.json({
    // Human-readable content for model
    content: [
      {
        type: "text",
        text: `Found ${funds.length} RMF funds matching "${args.query}".
               Top performers: ${funds.slice(0, 3).map(f => f.name).join(", ")}`
      }
    ],
    // Machine-readable data for component (visible to model)
    structuredContent: {
      funds: funds.map(f => ({
        id: f.fundCode,
        name: f.fundName,
        amc: f.amc,
        nav: f.nav,
        performance: {
          ytd: f.ytd,
          oneYear: f.oneYear,
          threeYear: f.threeYear
        },
        riskLevel: f.riskLevel
      })),
      total: funds.length,
      query: args.query
    },
    // Component-only metadata (hidden from model)
    _meta: {
      timestamp: new Date().toISOString(),
      source: "SEC API"
    }
  });
}
```

3. **Add Resource Content Handler**
```typescript
app.get("/mcp/resources/:resourceId", async (req, res) => {
  const { resourceId } = req.params;

  // Serve bundled component HTML
  const componentPath = path.join(__dirname, '../dist/components', `${resourceId}.html`);

  if (!fs.existsSync(componentPath)) {
    return res.status(404).json({ error: "Resource not found" });
  }

  const html = await fs.promises.readFile(componentPath, 'utf-8');
  res.setHeader('Content-Type', 'text/html+skybridge');
  res.send(html);
});
```

### 2.3 Create Structured Response Schemas (`shared/schema.ts`)
```typescript
export const ToolResponseSchema = z.object({
  content: z.array(z.object({
    type: z.literal("text"),
    text: z.string()
  })).optional(),
  structuredContent: z.record(z.any()),
  _meta: z.record(z.any()).optional()
});
```

---

## Phase 3: Frontend Components (3-4 days)

### 3.1 Create Component Package Structure
```
client/
  components/
    chatgpt/                    # New: ChatGPT-specific components
      hooks/
        useOpenAiGlobal.tsx     # Hook to wrap window.openai
      fund-list/
        FundListWidget.tsx      # Main component
        index.html              # HTML template wrapper
      fund-details/
        FundDetailsWidget.tsx
        index.html
      fund-comparison/
        FundComparisonWidget.tsx
        index.html
```

### 3.2 Implement `useOpenAiGlobal` Hook
```typescript
// client/components/chatgpt/hooks/useOpenAiGlobal.tsx
import { useState, useEffect } from 'react';

interface OpenAIGlobal {
  toolOutput: any;
  widgetState: any;
  theme: 'light' | 'dark';
  locale: string;
  callTool: (name: string, args: any) => Promise<any>;
  setWidgetState: (state: any) => void;
  requestDisplayMode: (mode: 'inline' | 'fullscreen' | 'pip') => void;
  sendFollowUpMessage: (message: string) => void;
}

export function useOpenAiGlobal() {
  const [globals, setGlobals] = useState<OpenAIGlobal | null>(null);

  useEffect(() => {
    // Access window.openai
    const openai = (window as any).openai;

    if (openai) {
      setGlobals(openai);

      // Listen for global updates
      const handleUpdate = (event: CustomEvent) => {
        setGlobals(event.detail);
      };

      window.addEventListener('openai:set_globals', handleUpdate as EventListener);

      return () => {
        window.removeEventListener('openai:set_globals', handleUpdate as EventListener);
      };
    }
  }, []);

  return globals;
}
```

### 3.3 Build Fund List Widget
```typescript
// client/components/chatgpt/fund-list/FundListWidget.tsx
import { useOpenAiGlobal } from '../hooks/useOpenAiGlobal';
import { RMFFundCard } from '../../RMFFundCard';

export function FundListWidget() {
  const openai = useOpenAiGlobal();

  if (!openai) return <div>Loading...</div>;

  const { funds, total } = openai.toolOutput.structuredContent;

  const handleViewDetails = async (fundCode: string) => {
    // Call tool from component
    await openai.callTool('get_fund_details', { fundCode });
  };

  return (
    <div className="fund-list-widget">
      <div className="fund-grid">
        {funds.map((fund: any) => (
          <RMFFundCard
            key={fund.id}
            fund={fund}
            onViewDetails={() => handleViewDetails(fund.id)}
          />
        ))}
      </div>
      <div className="fund-count">
        Showing {funds.length} of {total} funds
      </div>
    </div>
  );
}
```

### 3.4 Bundle Components
```bash
# Add build script to package.json
{
  "scripts": {
    "build:components": "esbuild client/components/chatgpt/**/FundListWidget.tsx --bundle --format=esm --outdir=dist/components"
  }
}
```

---

## Phase 4: Testing (1-2 days)

### 4.1 Local Testing with MCP Inspector
```bash
# Start server
npm run dev

# In another terminal, launch MCP Inspector
npx @modelcontextprotocol/inspector@latest http://localhost:5000/mcp

# Test:
# 1. List tools - verify all 3 tools appear with correct metadata
# 2. Call search_rmf_funds - verify structuredContent format
# 3. Inspect component rendering
```

### 4.2 Test with ngrok
```bash
# Expose local server
ngrok http 5000

# Use ngrok URL in ChatGPT:
# Settings → Connectors → Developer mode → Add connector
# URL: https://your-ngrok-url.ngrok.io/mcp
```

### 4.3 Validation Checklist (from `12-deploy-testing.md`)
- [ ] Tools list matches documentation
- [ ] Structured content aligns with outputSchema
- [ ] Components render without console errors
- [ ] Dark/light theme switching works
- [ ] State persists across widget instances
- [ ] Mobile layout tested on iOS/Android
- [ ] Golden prompts trigger correct tools
- [ ] Negative prompts don't trigger tools

---

## Phase 5: Deployment (1 day)

### 5.1 Choose Hosting Platform
Based on `13-deploy-production.md`:

**Recommended: Fly.io (easiest)**
```bash
# Install flyctl
curl -L https://fly.io/install.sh | sh

# Deploy
flyctl launch
flyctl deploy

# Get HTTPS URL automatically
```

**Alternative: Railway, Render, or Google Cloud Run**

### 5.2 Environment Variables
```bash
# Set in hosting platform
SEC_API_KEY=your_sec_api_key_here
NODE_ENV=production
```

### 5.3 Connect to ChatGPT
1. Settings → Connectors → Add connector
2. Enter your production HTTPS URL
3. Test with golden prompts
4. Share with testers

---

## 📝 Implementation Checklist

### Phase 1: Planning ✅
- [ ] Define 5+ direct prompts
- [ ] Define 5+ indirect prompts
- [ ] Define 3+ negative prompts
- [ ] Design 3 tool specifications
- [ ] Sketch 3 component layouts
- [ ] Review with stakeholders

### Phase 2: Backend
- [ ] Install MCP SDK dependencies
- [ ] Add component resource registration
- [ ] Update tool responses with structuredContent
- [ ] Add _meta fields to tools
- [ ] Create resource content handler
- [ ] Add Zod schemas for validation

### Phase 3: Frontend
- [ ] Create component package structure
- [ ] Implement useOpenAiGlobal hook
- [ ] Build FundListWidget component
- [ ] Build FundDetailsWidget component
- [ ] Build FundComparisonWidget component
- [ ] Add esbuild bundling script
- [ ] Bundle all components

### Phase 4: Testing
- [ ] Test with MCP Inspector locally
- [ ] Fix any schema/rendering errors
- [ ] Test with ngrok + ChatGPT
- [ ] Validate all golden prompts
- [ ] Test mobile layouts
- [ ] Verify state persistence

### Phase 5: Deployment
- [ ] Choose hosting platform
- [ ] Configure environment variables
- [ ] Deploy to production
- [ ] Get HTTPS endpoint
- [ ] Connect to ChatGPT
- [ ] Beta test with users

---

## 🎓 Learning Resources

Refer to these docs during implementation:
- `06-plan-tools.md` - Tool design patterns
- `08-build-mcp-server.md` - Server setup and configuration
- `09-build-custom-ux.md` - Component development with window.openai
- `14-api-reference.md` - Complete field reference

---

## ⏱️ Estimated Timeline

- **Phase 1 (Planning):** 1-2 days
- **Phase 2 (Backend):** 2-3 days
- **Phase 3 (Frontend):** 3-4 days
- **Phase 4 (Testing):** 1-2 days
- **Phase 5 (Deployment):** 1 day

**Total: 8-12 days** (1.5-2.5 weeks)

---

## 🚀 Quick Start

To begin immediately:

1. **Start with Phase 1 Planning**
   ```bash
   # Create planning document
   touch docs/openai-app-implementation-plan.md
   # Document golden prompts and tool designs
   ```

2. **Review Examples**
   ```bash
   # Clone OpenAI examples
   git clone https://github.com/openai/openai-apps-sdk-examples.git
   cd openai-apps-sdk-examples
   # Study Pizzaz demo app structure
   ```

3. **Test Current MCP Endpoint**
   ```bash
   # Start server
   npm run dev

   # Test MCP in another terminal
   npx @modelcontextprotocol/inspector@latest http://localhost:5000/mcp
   ```

Ready to start? Let me know which phase you'd like to begin with!
