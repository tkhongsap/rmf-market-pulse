# MCP Server Implementation Tasks for OpenAI Apps SDK Integration

**Project**: Thai RMF Market Pulse - ChatGPT Integration
**Document**: Implementation Task Breakdown
**Created**: 2025-11-12
**Status**: Planning → Implementation

---

## Executive Summary

This document provides a comprehensive, step-by-step implementation plan to upgrade the current basic MCP endpoint (`/mcp`) to a full OpenAI Apps SDK-compliant MCP server. The implementation will enable Thai Fund Market Pulse to integrate seamlessly with ChatGPT, providing interactive fund data widgets and conversational fund discovery.

**Current State**: Basic MCP endpoint with 2 simple tools
**Target State**: Full MCP server with 5 tools + 3 interactive UI components
**Estimated Timeline**: 3-4 weeks

---

## Table of Contents

1. [Phase 1: MCP Server Foundation](#phase-1-mcp-server-foundation)
2. [Phase 2: Tool Implementation](#phase-2-tool-implementation)
3. [Phase 3: UI Components](#phase-3-ui-components)
4. [Phase 4: Testing & Deployment](#phase-4-testing--deployment)
5. [Success Metrics](#success-metrics)
6. [Reference Materials](#reference-materials)

---

## Phase 1: MCP Server Foundation

**Objective**: Set up the official MCP SDK and create the foundational architecture for the MCP server.

**Duration**: Week 1 (5 days)

### Task 1.1: Install Dependencies

**File**: `package.json`

**Actions**:
```bash
npm install @modelcontextprotocol/sdk zod
npm install --save-dev @types/node
```

**Verification**:
- [ ] Check `package.json` includes `@modelcontextprotocol/sdk`
- [ ] Check `package.json` includes `zod` (if not already present)
- [ ] Run `npm install` successfully

**Estimated Time**: 15 minutes

---

### Task 1.2: Create MCP Server Architecture

**File**: `server/mcp/server.ts` (NEW)

**Purpose**: Create the core MCP server using the official SDK.

**Implementation**:

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { loadHTMLResources } from "./resources.js";
import { toolHandlers } from "./tools.js";

/**
 * Initialize MCP Server for Thai Fund Market Pulse
 */
export function createMCPServer() {
  const server = new Server(
    {
      name: "thai-fund-market-pulse",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    }
  );

  // Register resource handlers (HTML components)
  setupResourceHandlers(server);

  // Register tool handlers
  setupToolHandlers(server);

  return server;
}

/**
 * Setup resource handlers for HTML components
 */
function setupResourceHandlers(server: Server) {
  // List all available HTML resources
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    const resources = await loadHTMLResources();
    return { resources };
  });

  // Read specific resource content
  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const resources = await loadHTMLResources();
    const resource = resources.find((r) => r.uri === request.params.uri);

    if (!resource) {
      throw new Error(`Resource not found: ${request.params.uri}`);
    }

    return {
      contents: [
        {
          uri: resource.uri,
          mimeType: resource.mimeType,
          text: resource.content,
        },
      ],
    };
  });
}

/**
 * Setup tool handlers for fund operations
 */
function setupToolHandlers(server: Server) {
  // List all available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "search_rmf_funds",
          description:
            "Search and filter Thai Retirement Mutual Funds (RMF) by name, AMC, classification, or performance criteria. Returns a carousel of matching funds for comparison.",
          inputSchema: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "Search query for fund name or code",
              },
              filters: {
                type: "object",
                properties: {
                  riskLevel: {
                    type: "number",
                    description: "Filter by risk level (1-8)",
                  },
                  amc: {
                    type: "string",
                    description: "Filter by Asset Management Company",
                  },
                  classification: {
                    type: "string",
                    description: "Filter by fund classification (e.g., 'Equity', 'Fixed Income', 'Mixed')",
                  },
                },
              },
              limit: {
                type: "number",
                description: "Maximum number of funds to return (default: 8)",
                default: 8,
              },
              sortBy: {
                type: "string",
                enum: ["ytd", "1y", "3y", "5y", "nav"],
                description: "Sort results by performance metric",
                default: "ytd",
              },
            },
          },
          _meta: {
            "openai/outputTemplate": "fund://rmf-fund-carousel.html",
            "openai/widgetAccessible": true,
            "openai/readOnlyHint": true,
          },
        },
        {
          name: "get_rmf_fund_detail",
          description:
            "Get comprehensive details for a specific Thai RMF fund including current NAV, performance metrics, asset allocation, holdings, fees, and risk information.",
          inputSchema: {
            type: "object",
            properties: {
              fundCode: {
                type: "string",
                description: "Fund code (e.g., 'SCBRMMONEY', 'ABAPAC-RMF')",
              },
            },
            required: ["fundCode"],
          },
          _meta: {
            "openai/outputTemplate": "fund://rmf-fund-detail.html",
            "openai/widgetAccessible": true,
            "openai/readOnlyHint": true,
          },
        },
        {
          name: "compare_rmf_funds",
          description:
            "Compare multiple Thai RMF funds side-by-side across performance metrics, fees, risk levels, and asset allocation. Supports comparison across multiple timeframes.",
          inputSchema: {
            type: "object",
            properties: {
              fundCodes: {
                type: "array",
                items: { type: "string" },
                description: "Array of fund codes to compare (2-5 funds)",
                minItems: 2,
                maxItems: 5,
              },
              timeframes: {
                type: "array",
                items: {
                  type: "string",
                  enum: ["ytd", "1m", "3m", "6m", "1y", "3y", "5y", "10y"],
                },
                description: "Timeframes for performance comparison",
                default: ["ytd", "1y", "3y", "5y"],
              },
              metrics: {
                type: "array",
                items: {
                  type: "string",
                  enum: ["performance", "fees", "risk", "allocation"],
                },
                description: "Metrics to compare",
                default: ["performance", "fees", "risk"],
              },
            },
            required: ["fundCodes"],
          },
          _meta: {
            "openai/outputTemplate": "fund://rmf-comparison.html",
            "openai/widgetAccessible": true,
            "openai/readOnlyHint": true,
          },
        },
        {
          name: "get_rmf_performance",
          description:
            "Get historical performance data for a specific Thai RMF fund across multiple timeframes with NAV history for charting.",
          inputSchema: {
            type: "object",
            properties: {
              fundCode: {
                type: "string",
                description: "Fund code",
              },
              timeframe: {
                type: "string",
                enum: ["1w", "1m", "3m", "6m", "ytd", "1y", "3y", "5y", "10y", "all"],
                description: "Timeframe for performance data",
                default: "1y",
              },
              includeChart: {
                type: "boolean",
                description: "Include historical NAV data for charting",
                default: true,
              },
            },
            required: ["fundCode"],
          },
          _meta: {
            "openai/outputTemplate": "fund://rmf-fund-detail.html",
            "openai/widgetAccessible": true,
            "openai/readOnlyHint": true,
          },
        },
        {
          name: "manage_watchlist",
          description:
            "Manage user's RMF fund watchlist. Add, remove, or view tracked funds. Requires user authentication.",
          inputSchema: {
            type: "object",
            properties: {
              action: {
                type: "string",
                enum: ["add", "remove", "list"],
                description: "Watchlist action",
              },
              fundCode: {
                type: "string",
                description: "Fund code (required for add/remove actions)",
              },
            },
            required: ["action"],
          },
          _meta: {
            "openai/outputTemplate": "fund://rmf-fund-carousel.html",
            "openai/widgetAccessible": true,
            "openai/readOnlyHint": false, // Write operation
          },
        },
      ],
    };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    // Delegate to tool handlers
    const handler = toolHandlers[name];
    if (!handler) {
      throw new Error(`Unknown tool: ${name}`);
    }

    return await handler(args);
  });
}

/**
 * Start the MCP server
 */
export async function startMCPServer() {
  const server = createMCPServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.log("Thai Fund Market Pulse MCP Server started");
}
```

**Checklist**:
- [ ] Create `server/mcp/` directory
- [ ] Create `server/mcp/server.ts` file
- [ ] Implement `createMCPServer()` function
- [ ] Implement `setupResourceHandlers()` function
- [ ] Implement `setupToolHandlers()` function
- [ ] Add error handling
- [ ] Add TypeScript types

**Estimated Time**: 4 hours

---

### Task 1.3: Create Resource Registry

**File**: `server/mcp/resources.ts` (NEW)

**Purpose**: Register and serve HTML component templates.

**Implementation**:

```typescript
import fs from "fs/promises";
import path from "path";

export interface MCPResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
  content?: string;
}

/**
 * Load all HTML component resources
 */
export async function loadHTMLResources(): Promise<MCPResource[]> {
  const publicDir = path.join(process.cwd(), "public");

  const resources: MCPResource[] = [
    {
      uri: "fund://rmf-fund-carousel.html",
      name: "RMF Fund Carousel",
      description: "Interactive carousel for browsing multiple RMF funds",
      mimeType: "text/html+skybridge",
    },
    {
      uri: "fund://rmf-fund-detail.html",
      name: "RMF Fund Detail",
      description: "Detailed view of a single RMF fund with charts and metrics",
      mimeType: "text/html+skybridge",
    },
    {
      uri: "fund://rmf-comparison.html",
      name: "RMF Fund Comparison",
      description: "Side-by-side comparison of multiple RMF funds",
      mimeType: "text/html+skybridge",
    },
  ];

  // Load content for each resource
  for (const resource of resources) {
    const filename = resource.uri.replace("fund://", "");
    const filepath = path.join(publicDir, filename);

    try {
      resource.content = await fs.readFile(filepath, "utf-8");
    } catch (error) {
      console.warn(`Warning: Could not load resource ${filename}:`, error);
      // Provide fallback content
      resource.content = `
        <!DOCTYPE html>
        <html>
          <head><title>${resource.name}</title></head>
          <body>
            <p>Component not yet implemented: ${resource.name}</p>
          </body>
        </html>
      `;
    }
  }

  return resources;
}

/**
 * Get a specific resource by URI
 */
export async function getResourceByURI(uri: string): Promise<MCPResource | null> {
  const resources = await loadHTMLResources();
  return resources.find((r) => r.uri === uri) || null;
}
```

**Checklist**:
- [ ] Create `server/mcp/resources.ts` file
- [ ] Implement `loadHTMLResources()` function
- [ ] Implement `getResourceByURI()` function
- [ ] Add error handling for missing files
- [ ] Add fallback HTML content

**Estimated Time**: 1 hour

---

### Task 1.4: Create Tool Handlers

**File**: `server/mcp/tools.ts` (NEW)

**Purpose**: Implement handlers for each MCP tool that call existing backend services.

**Implementation**:

```typescript
import {
  fetchRMFFunds,
  fetchRMFFundDetail,
  searchRMFFunds,
} from "../services/secApi";

export interface ToolResponse {
  content: Array<{
    type: "text";
    text: string;
  }>;
  structuredContent?: any;
  _meta?: Record<string, any>;
}

/**
 * Tool handlers for all MCP tools
 */
export const toolHandlers: Record<string, (args: any) => Promise<ToolResponse>> = {
  /**
   * Search RMF funds
   */
  async search_rmf_funds(args: {
    query?: string;
    filters?: {
      riskLevel?: number;
      amc?: string;
      classification?: string;
    };
    limit?: number;
    sortBy?: string;
  }): Promise<ToolResponse> {
    const { query, filters, limit = 8, sortBy = "ytd" } = args;

    // Use existing search functionality
    let funds;
    if (query) {
      funds = await searchRMFFunds(query);
    } else {
      const result = await fetchRMFFunds({ page: 1, pageSize: limit });
      funds = result.funds;
    }

    // Apply filters if provided
    if (filters) {
      if (filters.riskLevel) {
        funds = funds.filter((f) => f.riskLevel === filters.riskLevel);
      }
      if (filters.amc) {
        funds = funds.filter((f) =>
          f.amc?.toLowerCase().includes(filters.amc!.toLowerCase())
        );
      }
      if (filters.classification) {
        funds = funds.filter((f) =>
          f.classification?.toLowerCase().includes(filters.classification!.toLowerCase())
        );
      }
    }

    // Limit results
    funds = funds.slice(0, limit);

    // Format response
    const summary = `Found ${funds.length} RMF funds${query ? ` matching "${query}"` : ""}. ${
      funds.length > 0
        ? `Top performer: ${funds[0].fundName} with ${funds[0].performance?.ytd || "N/A"}% YTD return.`
        : ""
    }`;

    return {
      content: [
        {
          type: "text",
          text: summary,
        },
      ],
      structuredContent: {
        funds: funds.map((f) => ({
          fundCode: f.symbol,
          fundName: f.fundName,
          amc: f.amc,
          nav: f.nav,
          navChange: f.navChange,
          navChangePercent: f.navChangePercent,
          performance: f.performance,
          riskLevel: f.riskLevel,
          classification: f.classification,
        })),
        total: funds.length,
        query,
        filters,
      },
      _meta: {
        displayMode: "carousel",
        carouselType: "fund-list",
      },
    };
  },

  /**
   * Get fund detail
   */
  async get_rmf_fund_detail(args: { fundCode: string }): Promise<ToolResponse> {
    const { fundCode } = args;

    const fund = await fetchRMFFundDetail(fundCode);

    if (!fund) {
      throw new Error(`Fund not found: ${fundCode}`);
    }

    const summary = `${fund.fundName} (${fundCode}): Current NAV ${fund.nav} THB (${
      fund.navChangePercent > 0 ? "+" : ""
    }${fund.navChangePercent?.toFixed(2)}%). ${
      fund.performance?.ytd
        ? `YTD return: ${fund.performance.ytd > 0 ? "+" : ""}${fund.performance.ytd.toFixed(2)}%.`
        : ""
    } Risk level: ${fund.riskLevel}/8.`;

    return {
      content: [
        {
          type: "text",
          text: summary,
        },
      ],
      structuredContent: {
        fundCode: fund.symbol,
        fundName: fund.fundName,
        amc: fund.amc,
        nav: fund.nav,
        navDate: fund.navDate,
        navChange: fund.navChange,
        navChangePercent: fund.navChangePercent,
        performance: fund.performance,
        riskLevel: fund.riskLevel,
        classification: fund.classification,
        managementStyle: fund.managementStyle,
        dividendPolicy: fund.dividendPolicy,
        assetAllocation: fund.assetAllocation,
        topHoldings: fund.topHoldings,
        fees: fund.fees,
        benchmark: fund.benchmark,
        historicalNAV: fund.historicalNAV,
      },
      _meta: {
        displayMode: "fullscreen",
      },
    };
  },

  /**
   * Compare RMF funds
   */
  async compare_rmf_funds(args: {
    fundCodes: string[];
    timeframes?: string[];
    metrics?: string[];
  }): Promise<ToolResponse> {
    const { fundCodes, timeframes = ["ytd", "1y", "3y", "5y"], metrics = ["performance", "fees", "risk"] } = args;

    // Fetch all funds
    const funds = await Promise.all(fundCodes.map((code) => fetchRMFFundDetail(code)));

    const validFunds = funds.filter((f) => f !== null);

    if (validFunds.length === 0) {
      throw new Error("No valid funds found for comparison");
    }

    const summary = `Comparing ${validFunds.length} RMF funds: ${validFunds
      .map((f) => f.fundName)
      .join(", ")}. Best YTD performer: ${
      validFunds.sort((a, b) => (b.performance?.ytd || 0) - (a.performance?.ytd || 0))[0].fundName
    }.`;

    return {
      content: [
        {
          type: "text",
          text: summary,
        },
      ],
      structuredContent: {
        funds: validFunds.map((f) => ({
          fundCode: f.symbol,
          fundName: f.fundName,
          amc: f.amc,
          nav: f.nav,
          performance: f.performance,
          riskLevel: f.riskLevel,
          fees: f.fees,
          assetAllocation: f.assetAllocation,
        })),
        timeframes,
        metrics,
      },
      _meta: {
        displayMode: "fullscreen",
        comparisonType: "side-by-side",
      },
    };
  },

  /**
   * Get fund performance
   */
  async get_rmf_performance(args: {
    fundCode: string;
    timeframe?: string;
    includeChart?: boolean;
  }): Promise<ToolResponse> {
    const { fundCode, timeframe = "1y", includeChart = true } = args;

    const fund = await fetchRMFFundDetail(fundCode);

    if (!fund) {
      throw new Error(`Fund not found: ${fundCode}`);
    }

    const performanceValue = fund.performance?.[timeframe] || "N/A";
    const summary = `${fund.fundName} performance (${timeframe.toUpperCase()}): ${
      typeof performanceValue === "number" ? `${performanceValue > 0 ? "+" : ""}${performanceValue.toFixed(2)}%` : performanceValue
    }`;

    return {
      content: [
        {
          type: "text",
          text: summary,
        },
      ],
      structuredContent: {
        fundCode: fund.symbol,
        fundName: fund.fundName,
        timeframe,
        performance: fund.performance,
        historicalNAV: includeChart ? fund.historicalNAV : undefined,
      },
      _meta: {
        displayMode: "inline",
        chartEnabled: includeChart,
      },
    };
  },

  /**
   * Manage watchlist (placeholder - requires auth)
   */
  async manage_watchlist(args: { action: string; fundCode?: string }): Promise<ToolResponse> {
    const { action, fundCode } = args;

    // TODO: Implement user authentication and state management
    // For now, return a placeholder response

    return {
      content: [
        {
          type: "text",
          text: `Watchlist feature coming soon. Requested action: ${action}${
            fundCode ? ` for ${fundCode}` : ""
          }`,
        },
      ],
      structuredContent: {
        action,
        fundCode,
        watchlist: [],
      },
      _meta: {
        requiresAuth: true,
        notImplemented: true,
      },
    };
  },
};
```

**Checklist**:
- [ ] Create `server/mcp/tools.ts` file
- [ ] Implement all 5 tool handlers
- [ ] Integrate with existing `secApi` services
- [ ] Format structured responses
- [ ] Add error handling
- [ ] Add TypeScript types
- [ ] Document each tool handler

**Estimated Time**: 6 hours

---

### Task 1.5: Update Express Routes

**File**: `server/routes.ts`

**Purpose**: Integrate the new MCP server with the Express app.

**Actions**:

1. **Replace the existing `/mcp` endpoint** with the new MCP server handler
2. **Add CORS support** for MCP requests
3. **Add HTTP transport** support (since Express uses HTTP, not stdio)

**Implementation**:

```typescript
// Add these imports at the top
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { createMCPServer } from "./mcp/server.js";

// Replace the existing app.post("/mcp", ...) with:

// MCP Protocol endpoint for ChatGPT integration
app.options("/mcp", (_req, res) => {
  // Handle CORS preflight
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.sendStatus(200);
});

app.post("/mcp", async (req, res) => {
  try {
    // Set CORS headers
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");

    // Create MCP server instance
    const mcpServer = createMCPServer();

    // Handle the MCP request
    const { method, params, id } = req.body;

    // Route to appropriate handler based on method
    let result;
    if (method === "tools/list") {
      result = await mcpServer.requestHandler(
        { method: "tools/list", params: params || {} },
        { requestId: id || "1" }
      );
    } else if (method === "tools/call") {
      result = await mcpServer.requestHandler(
        { method: "tools/call", params },
        { requestId: id || "1" }
      );
    } else if (method === "resources/list") {
      result = await mcpServer.requestHandler(
        { method: "resources/list", params: params || {} },
        { requestId: id || "1" }
      );
    } else if (method === "resources/read") {
      result = await mcpServer.requestHandler(
        { method: "resources/read", params },
        { requestId: id || "1" }
      );
    } else {
      return res.status(400).json({
        error: "Invalid MCP method",
        message: `Method '${method}' is not supported`,
      });
    }

    res.json(result);
  } catch (error) {
    console.error("MCP endpoint error:", error);
    res.status(500).json({
      error: "MCP request failed",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
```

**Checklist**:
- [ ] Update imports in `server/routes.ts`
- [ ] Replace existing `/mcp` endpoint
- [ ] Add CORS handling
- [ ] Add HTTP transport support
- [ ] Test endpoint responds correctly

**Estimated Time**: 2 hours

---

### Task 1.6: Update TypeScript Configuration

**File**: `tsconfig.json`

**Purpose**: Ensure TypeScript can resolve MCP SDK imports.

**Actions**:

Check if your `tsconfig.json` has:
```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true
  }
}
```

**Checklist**:
- [ ] Verify TypeScript config supports ESM
- [ ] Test imports compile successfully
- [ ] Run `npm run check` to verify types

**Estimated Time**: 30 minutes

---

## Phase 2: Tool Implementation

**Objective**: Implement all 5 MCP tools with full functionality and structured responses.

**Duration**: Week 2 (5 days)

### Task 2.1: Enhance `search_rmf_funds` Tool

**File**: `server/mcp/tools.ts`

**Current State**: Basic implementation exists
**Target State**: Add advanced filtering, sorting, and pagination

**Enhancements**:

1. **Advanced Filters**:
   - Risk level (1-8)
   - AMC filtering
   - Fund classification
   - Performance thresholds

2. **Sorting Options**:
   - By performance (YTD, 1Y, 3Y, 5Y)
   - By NAV
   - By AUM (if available)
   - By fees

3. **Response Format**:
```typescript
{
  content: [{ type: "text", text: "Found 8 funds..." }],
  structuredContent: {
    funds: [...],
    total: 394,
    filters: {...},
    sortBy: "ytd",
    hasMore: true
  },
  _meta: {
    "openai/outputTemplate": "fund://rmf-fund-carousel.html",
    displayMode: "carousel"
  }
}
```

**Checklist**:
- [ ] Implement advanced filtering logic
- [ ] Add sorting functionality
- [ ] Add pagination support
- [ ] Test with various filter combinations
- [ ] Verify structured response format

**Estimated Time**: 4 hours

---

### Task 2.2: Enhance `get_rmf_fund_detail` Tool

**File**: `server/mcp/tools.ts`

**Current State**: Basic implementation exists
**Target State**: Include all available fund data

**Enhancements**:

1. **Complete Data Fields**:
   - Fund metadata (name, AMC, classification)
   - Current NAV with change
   - Performance metrics (all timeframes)
   - Risk information
   - Asset allocation
   - Top holdings
   - Fee structure
   - Benchmark data
   - Historical NAV for charts

2. **Response Format**:
```typescript
{
  content: [{ type: "text", text: "Fund detail summary..." }],
  structuredContent: {
    // All fund data fields
  },
  _meta: {
    "openai/outputTemplate": "fund://rmf-fund-detail.html",
    displayMode: "fullscreen"
  }
}
```

**Checklist**:
- [ ] Fetch all available data from SEC APIs
- [ ] Include performance calculations
- [ ] Add historical NAV data
- [ ] Format response for UI consumption
- [ ] Add error handling for missing data

**Estimated Time**: 3 hours

---

### Task 2.3: Implement `compare_rmf_funds` Tool

**File**: `server/mcp/tools.ts`

**Current State**: Basic placeholder
**Target State**: Full comparison functionality

**Implementation**:

1. **Fetch Multiple Funds**:
```typescript
const funds = await Promise.all(
  fundCodes.map(code => fetchRMFFundDetail(code))
);
```

2. **Comparison Metrics**:
   - Performance across all timeframes
   - Risk levels
   - Fees comparison
   - Asset allocation
   - NAV trends

3. **Response Format**:
```typescript
{
  content: [{
    type: "text",
    text: "Comparing 3 funds: SCBRMF shows highest 1Y return at 12.5%..."
  }],
  structuredContent: {
    funds: [
      { fundCode: "SCBRMF", ... },
      { fundCode: "KFRMF", ... },
      { fundCode: "ABAPAC-RMF", ... }
    ],
    comparison: {
      performance: { ytd: [...], oneYear: [...] },
      fees: [...],
      risk: [...]
    },
    winner: {
      ytd: "SCBRMF",
      oneYear: "KFRMF"
    }
  },
  _meta: {
    "openai/outputTemplate": "fund://rmf-comparison.html",
    displayMode: "fullscreen"
  }
}
```

**Checklist**:
- [ ] Implement parallel fund fetching
- [ ] Calculate comparison metrics
- [ ] Identify "winners" for each metric
- [ ] Format for comparison UI
- [ ] Handle edge cases (missing funds, incomplete data)

**Estimated Time**: 5 hours

---

### Task 2.4: Implement `get_rmf_performance` Tool

**File**: `server/mcp/tools.ts`

**Current State**: Basic placeholder
**Target State**: Historical performance with charting data

**Implementation**:

1. **Fetch Performance Data**:
   - Use existing `fetchRMFFundDetail()`
   - Extract performance metrics for requested timeframe
   - Include historical NAV if `includeChart: true`

2. **Response Format**:
```typescript
{
  content: [{
    type: "text",
    text: "SCBRMF 1-year performance: +12.5%"
  }],
  structuredContent: {
    fundCode: "SCBRMF",
    fundName: "...",
    timeframe: "1y",
    performance: { value: 12.5, rank: 5, total: 50 },
    historicalNAV: [
      { date: "2024-01-01", nav: 10.5 },
      ...
    ]
  },
  _meta: {
    "openai/outputTemplate": "fund://rmf-fund-detail.html",
    displayMode: "inline",
    chartEnabled: true
  }
}
```

**Checklist**:
- [ ] Implement timeframe filtering
- [ ] Include historical NAV data
- [ ] Add performance context (rank if available)
- [ ] Format for charting
- [ ] Test all timeframes

**Estimated Time**: 3 hours

---

### Task 2.5: Implement `manage_watchlist` Tool (Phase 2A - Basic)

**File**: `server/mcp/tools.ts`

**Current State**: Placeholder
**Target State**: In-memory watchlist (no auth yet)

**Implementation** (Simplified for MVP):

1. **In-Memory Storage** (temporary):
```typescript
// Simple in-memory store (will be replaced with database)
const watchlists = new Map<string, string[]>();

async manage_watchlist(args) {
  const { action, fundCode } = args;
  const userId = "default"; // TODO: Get from auth

  let watchlist = watchlists.get(userId) || [];

  if (action === "add" && fundCode) {
    if (!watchlist.includes(fundCode)) {
      watchlist.push(fundCode);
      watchlists.set(userId, watchlist);
    }
  } else if (action === "remove" && fundCode) {
    watchlist = watchlist.filter(code => code !== fundCode);
    watchlists.set(userId, watchlist);
  }

  // Fetch full details for watchlist funds
  const funds = await Promise.all(
    watchlist.map(code => fetchRMFFundDetail(code))
  );

  return {
    content: [{
      type: "text",
      text: `Your watchlist has ${funds.length} funds.`
    }],
    structuredContent: {
      action,
      watchlist: funds,
      count: funds.length
    }
  };
}
```

**Checklist**:
- [ ] Implement in-memory watchlist
- [ ] Add/remove/list actions
- [ ] Fetch fund details for watchlist
- [ ] Add TODO comments for auth integration
- [ ] Test basic functionality

**Estimated Time**: 2 hours

**Note**: Full authentication will be added in Phase 4 (optional).

---

## Phase 3: UI Components

**Objective**: Create interactive HTML components that render in ChatGPT.

**Duration**: Week 3 (5 days)

### Task 3.1: Create `rmf-fund-carousel.html`

**File**: `public/rmf-fund-carousel.html` (NEW)

**Purpose**: Display multiple funds in a scrollable carousel format.

**Implementation**:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RMF Fund Carousel</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: transparent;
      padding: 16px;
    }

    .carousel-container {
      display: flex;
      gap: 16px;
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
    }

    .fund-card {
      flex: 0 0 280px;
      scroll-snap-align: start;
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 12px;
      padding: 16px;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .fund-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .fund-header {
      margin-bottom: 12px;
    }

    .fund-name {
      font-size: 16px;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 4px;
      line-height: 1.3;
    }

    .fund-amc {
      font-size: 12px;
      color: #666;
    }

    .fund-metrics {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .metric-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .metric-label {
      font-size: 12px;
      color: #666;
    }

    .metric-value {
      font-size: 14px;
      font-weight: 600;
    }

    .positive { color: #16a34a; }
    .negative { color: #dc2626; }
    .neutral { color: #666; }

    .risk-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      background: #f3f4f6;
      color: #374151;
    }

    @media (prefers-color-scheme: dark) {
      body { color: #e0e0e0; }
      .fund-card {
        background: #1e1e1e;
        border-color: #333;
      }
      .fund-name { color: #e0e0e0; }
      .fund-amc { color: #999; }
      .risk-badge {
        background: #2a2a2a;
        color: #e0e0e0;
      }
    }
  </style>
</head>
<body>
  <div class="carousel-container" id="carousel"></div>

  <script>
    // Access data from ChatGPT
    const data = window.openai?.toolOutput?.structuredContent || {};
    const funds = data.funds || [];

    function formatNumber(num) {
      if (num == null) return 'N/A';
      return num.toFixed(2);
    }

    function getColorClass(value) {
      if (value > 0) return 'positive';
      if (value < 0) return 'negative';
      return 'neutral';
    }

    function renderCarousel() {
      const container = document.getElementById('carousel');

      funds.forEach(fund => {
        const card = document.createElement('div');
        card.className = 'fund-card';
        card.onclick = () => viewFundDetail(fund.fundCode);

        const navChange = fund.navChangePercent || 0;
        const ytdReturn = fund.performance?.ytd || null;

        card.innerHTML = `
          <div class="fund-header">
            <div class="fund-name">${fund.fundName}</div>
            <div class="fund-amc">${fund.amc}</div>
          </div>
          <div class="fund-metrics">
            <div class="metric-row">
              <span class="metric-label">NAV</span>
              <span class="metric-value">${formatNumber(fund.nav)} THB</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Change</span>
              <span class="metric-value ${getColorClass(navChange)}">
                ${navChange > 0 ? '+' : ''}${formatNumber(navChange)}%
              </span>
            </div>
            ${ytdReturn != null ? `
              <div class="metric-row">
                <span class="metric-label">YTD</span>
                <span class="metric-value ${getColorClass(ytdReturn)}">
                  ${ytdReturn > 0 ? '+' : ''}${formatNumber(ytdReturn)}%
                </span>
              </div>
            ` : ''}
            <div class="metric-row">
              <span class="metric-label">Risk</span>
              <span class="risk-badge">Level ${fund.riskLevel || 'N/A'}/8</span>
            </div>
          </div>
        `;

        container.appendChild(card);
      });
    }

    async function viewFundDetail(fundCode) {
      // Call MCP tool from component
      await window.openai.callTool('get_rmf_fund_detail', { fundCode });
    }

    // Listen for updates from ChatGPT
    window.addEventListener('openai:set_globals', (event) => {
      const updatedData = event.detail.structuredContent;
      if (updatedData?.funds) {
        document.getElementById('carousel').innerHTML = '';
        funds = updatedData.funds;
        renderCarousel();
      }
    });

    // Initial render
    renderCarousel();
  </script>
</body>
</html>
```

**Checklist**:
- [ ] Create `public/` directory if not exists
- [ ] Create `rmf-fund-carousel.html`
- [ ] Implement responsive carousel layout
- [ ] Add fund card styling
- [ ] Implement `window.openai` integration
- [ ] Add click handler for fund details
- [ ] Test dark mode support
- [ ] Test in browser standalone

**Estimated Time**: 6 hours

---

### Task 3.2: Create `rmf-fund-detail.html`

**File**: `public/rmf-fund-detail.html` (NEW)

**Purpose**: Display comprehensive fund details in fullscreen mode.

**Implementation** (High-Level Structure):

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Meta tags, styles -->
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
  <div class="detail-container">
    <!-- Fund Header -->
    <div class="fund-header">
      <h1 id="fundName"></h1>
      <div class="nav-display">
        <div class="nav-value" id="navValue"></div>
        <div class="nav-change" id="navChange"></div>
      </div>
    </div>

    <!-- Performance Section -->
    <div class="performance-section">
      <h2>Performance</h2>
      <div class="performance-grid" id="performanceGrid"></div>
      <canvas id="performanceChart"></canvas>
    </div>

    <!-- Risk & Classification -->
    <div class="info-section">
      <div class="risk-indicator" id="riskIndicator"></div>
      <div class="classification" id="classification"></div>
    </div>

    <!-- Asset Allocation -->
    <div class="allocation-section">
      <h2>Asset Allocation</h2>
      <canvas id="allocationChart"></canvas>
    </div>

    <!-- Top Holdings -->
    <div class="holdings-section">
      <h2>Top Holdings</h2>
      <div id="holdingsTable"></div>
    </div>

    <!-- Fees -->
    <div class="fees-section">
      <h2>Fees</h2>
      <div id="feesTable"></div>
    </div>
  </div>

  <script>
    const data = window.openai?.toolOutput?.structuredContent || {};

    // Render fund details
    function renderFundDetail() {
      // Populate all sections with data
      document.getElementById('fundName').textContent = data.fundName;
      // ... more rendering logic

      // Create performance chart
      renderPerformanceChart();

      // Create allocation chart
      renderAllocationChart();
    }

    function renderPerformanceChart() {
      const ctx = document.getElementById('performanceChart');
      new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.historicalNAV?.map(d => d.date) || [],
          datasets: [{
            label: 'NAV',
            data: data.historicalNAV?.map(d => d.nav) || [],
            borderColor: '#3b82f6',
            tension: 0.1
          }]
        }
      });
    }

    renderFundDetail();
  </script>
</body>
</html>
```

**Checklist**:
- [ ] Create `rmf-fund-detail.html`
- [ ] Implement fullscreen layout
- [ ] Add performance metrics display
- [ ] Integrate Chart.js for visualizations
- [ ] Display NAV chart
- [ ] Display asset allocation pie chart
- [ ] Show top holdings table
- [ ] Display fees and metadata
- [ ] Test with real fund data

**Estimated Time**: 10 hours

---

### Task 3.3: Create `rmf-comparison.html`

**File**: `public/rmf-comparison.html` (NEW)

**Purpose**: Side-by-side comparison of multiple funds.

**Implementation** (High-Level Structure):

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- Meta tags, styles -->
</head>
<body>
  <div class="comparison-container">
    <h1>Fund Comparison</h1>

    <!-- Comparison Table -->
    <table class="comparison-table">
      <thead>
        <tr>
          <th>Metric</th>
          <th id="fund1Header"></th>
          <th id="fund2Header"></th>
          <th id="fund3Header"></th>
        </tr>
      </thead>
      <tbody id="comparisonBody">
        <!-- Performance rows -->
        <!-- Risk row -->
        <!-- Fees row -->
        <!-- etc. -->
      </tbody>
    </table>

    <!-- Performance Chart Comparison -->
    <canvas id="comparisonChart"></canvas>
  </div>

  <script>
    const data = window.openai?.toolOutput?.structuredContent || {};
    const funds = data.funds || [];

    function renderComparison() {
      // Populate comparison table
      const metrics = [
        { label: 'YTD Return', key: 'performance.ytd' },
        { label: '1 Year Return', key: 'performance.oneYear' },
        { label: 'Risk Level', key: 'riskLevel' },
        { label: 'Management Fee', key: 'fees.management' }
      ];

      // Build table rows
      // Highlight winners
    }

    renderComparison();
  </script>
</body>
</html>
```

**Checklist**:
- [ ] Create `rmf-comparison.html`
- [ ] Implement comparison table layout
- [ ] Add column for each fund (up to 5)
- [ ] Highlight best/worst values
- [ ] Add comparison chart
- [ ] Make responsive
- [ ] Test with 2-5 funds

**Estimated Time**: 8 hours

---

### Task 3.4: Test Components Locally

**Purpose**: Verify components work standalone before ChatGPT integration.

**Actions**:

1. **Create Test HTML Page**:

```html
<!-- test-components.html -->
<!DOCTYPE html>
<html>
<head>
  <title>Component Testing</title>
</head>
<body>
  <h1>RMF Component Testing</h1>

  <h2>Carousel Component</h2>
  <iframe src="/rmf-fund-carousel.html" width="100%" height="300"></iframe>

  <h2>Detail Component</h2>
  <iframe src="/rmf-fund-detail.html" width="100%" height="600"></iframe>

  <h2>Comparison Component</h2>
  <iframe src="/rmf-comparison.html" width="100%" height="600"></iframe>

  <script>
    // Mock window.openai API for testing
    window.addEventListener('load', () => {
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach(iframe => {
        iframe.contentWindow.window.openai = {
          toolOutput: {
            structuredContent: {
              funds: [
                // Mock fund data
                {
                  fundCode: 'TEST-RMF',
                  fundName: 'Test Fund',
                  amc: 'Test AMC',
                  nav: 15.5,
                  navChangePercent: 2.3,
                  riskLevel: 5,
                  performance: { ytd: 12.5 }
                }
              ]
            }
          },
          callTool: async (name, args) => {
            console.log('Tool called:', name, args);
          }
        };
      });
    });
  </script>
</body>
</html>
```

2. **Test Checklist**:
- [ ] Components load without errors
- [ ] Data displays correctly
- [ ] Styles render properly
- [ ] Dark mode works
- [ ] Interactive elements respond
- [ ] Mock `window.openai` works

**Estimated Time**: 2 hours

---

## Phase 4: Testing & Deployment

**Objective**: Test the complete MCP server and deploy for ChatGPT integration.

**Duration**: Week 4 (5 days)

### Task 4.1: Local Testing with MCP Inspector

**Purpose**: Validate MCP server protocol compliance.

**Actions**:

1. **Install MCP Inspector**:
```bash
npx @modelcontextprotocol/inspector@latest http://localhost:5000/mcp
```

2. **Test Checklist**:
- [ ] Server responds to `tools/list`
- [ ] All 5 tools are listed
- [ ] Tool schemas are valid
- [ ] Resources are listed
- [ ] Resources can be read
- [ ] Tool calls execute successfully
- [ ] Structured responses are valid
- [ ] Error handling works

3. **Document Test Results**:
   Create `docs/MCP_INSPECTOR_TEST_RESULTS.md`

**Estimated Time**: 3 hours

---

### Task 4.2: Expose Server via ngrok

**Purpose**: Make local server accessible to ChatGPT for testing.

**Actions**:

1. **Install ngrok**:
```bash
npm install -g ngrok
```

2. **Start tunnel**:
```bash
ngrok http 5000
```

3. **Get public URL**: `https://xxxx.ngrok.io`

4. **Test endpoint**: `https://xxxx.ngrok.io/mcp`

**Checklist**:
- [ ] ngrok tunnel active
- [ ] Public URL accessible
- [ ] `/mcp` endpoint responds
- [ ] CORS headers present

**Estimated Time**: 30 minutes

---

### Task 4.3: ChatGPT Developer Mode Testing

**Purpose**: Test integration in actual ChatGPT environment.

**Actions**:

1. **Enable Developer Mode** in ChatGPT settings

2. **Create Connector**:
   - Name: "Thai Fund Market Pulse"
   - URL: `https://xxxx.ngrok.io/mcp`
   - Description: "Thai RMF fund data and comparison"

3. **Test User Queries**:
```
- "Show me RMF funds"
- "What's the performance of SCBRMF?"
- "Compare SCBRMF and KFRMF"
- "Show ABAPAC-RMF details"
- "Find low-risk RMF funds"
```

4. **Verify**:
- [ ] Tools are discovered
- [ ] Components render in iframe
- [ ] Data displays correctly
- [ ] Interactive elements work
- [ ] Tool calls from components work

**Estimated Time**: 4 hours

---

### Task 4.4: Create Production Deployment Plan

**File**: `docs/DEPLOYMENT_PLAN.md` (NEW)

**Contents**:

1. **Hosting Options**:
   - Vercel (recommended for Node.js)
   - Railway
   - Heroku
   - AWS/GCP

2. **Environment Variables**:
   - `SEC_API_KEY`
   - `NODE_ENV=production`
   - `PORT`

3. **Build Process**:
```bash
npm run build
npm start
```

4. **Monitoring**:
   - Uptime monitoring
   - Error tracking
   - Usage analytics

5. **Scaling Considerations**:
   - Rate limiting
   - Caching strategy
   - CDN for static assets

**Estimated Time**: 2 hours

---

### Task 4.5: Production Deployment

**Purpose**: Deploy to production hosting.

**Actions** (Example: Vercel):

1. **Connect Git Repository**:
```bash
vercel
```

2. **Configure Environment**:
   - Add `SEC_API_KEY`
   - Set `NODE_ENV=production`

3. **Deploy**:
```bash
vercel --prod
```

4. **Get Production URL**: `https://rmf-market-pulse.vercel.app`

5. **Update ChatGPT Connector** with production URL

**Checklist**:
- [ ] Production deployment successful
- [ ] Environment variables set
- [ ] HTTPS enabled
- [ ] /mcp endpoint accessible
- [ ] Health check passes
- [ ] ChatGPT connector updated
- [ ] End-to-end testing complete

**Estimated Time**: 3 hours

---

### Task 4.6: Documentation & Handoff

**Purpose**: Create comprehensive documentation for maintenance.

**Files to Create**:

1. **`docs/MCP_SERVER_GUIDE.md`**:
   - Architecture overview
   - Tool descriptions
   - Component documentation
   - Deployment guide

2. **`docs/TROUBLESHOOTING.md`**:
   - Common issues
   - Debugging steps
   - Error messages

3. **Update `README.md`**:
   - Add MCP server section
   - Add deployment instructions
   - Add ChatGPT integration guide

**Estimated Time**: 3 hours

---

## Success Metrics

### Functional Requirements

- [ ] All 5 MCP tools implemented and working
- [ ] 3 UI components created and rendering
- [ ] MCP Inspector validation passes
- [ ] ChatGPT integration successful
- [ ] Production deployment complete

### Performance Requirements

- [ ] Tool response time < 2 seconds
- [ ] Component load time < 1 second
- [ ] Server uptime > 99%
- [ ] API rate limits respected

### Quality Requirements

- [ ] TypeScript type safety (0 errors)
- [ ] Error handling for all edge cases
- [ ] CORS properly configured
- [ ] Responsive design for all components
- [ ] Dark mode support

---

## Timeline Summary

| Phase | Duration | Tasks | Status |
|-------|----------|-------|--------|
| Phase 1: Foundation | Week 1 | 6 tasks | ⏳ Pending |
| Phase 2: Tools | Week 2 | 5 tasks | ⏳ Pending |
| Phase 3: Components | Week 3 | 4 tasks | ⏳ Pending |
| Phase 4: Deploy | Week 4 | 6 tasks | ⏳ Pending |
| **Total** | **4 weeks** | **21 tasks** | **Not Started** |

---

## Risk Mitigation

### Risk 1: MCP SDK Compatibility Issues
**Mitigation**: Test SDK early, use official examples, follow documentation exactly

### Risk 2: Component Rendering in ChatGPT
**Mitigation**: Test locally first, use MCP Inspector, follow design guidelines

### Risk 3: API Rate Limiting
**Mitigation**: Implement caching, batch requests, monitor usage

### Risk 4: Data Availability
**Mitigation**: Handle missing data gracefully, provide fallbacks, clear error messages

### Risk 5: ChatGPT Shop Approval
**Mitigation**: Follow all guidelines, test thoroughly, provide clear documentation

---

## Reference Materials

### OpenAI Apps SDK Documentation
- Overview: `/docs/openai-app-sdk/00-overview.md`
- Quickstart: `/docs/openai-app-sdk/01-quickstart.md`
- MCP Server: `/docs/openai-app-sdk/08-build-mcp-server.md`
- Custom UX: `/docs/openai-app-sdk/09-build-custom-ux.md`

### Product Requirements
- PRD: `/docs/prd_thai_rmf_app.md`
- CLAUDE.md: `/CLAUDE.md`

### External Resources
- MCP Specification: https://modelcontextprotocol.io/
- MCP SDK: https://github.com/modelcontextprotocol/sdk
- OpenAI Apps SDK: https://developers.openai.com/apps-sdk
- Examples Repo: https://github.com/openai/openai-apps-sdk-examples

---

## Next Steps

1. **Review this document** with the team
2. **Set up development branch**: `feature/mcp-server-implementation`
3. **Start Phase 1, Task 1.1**: Install dependencies
4. **Create tracking board** for all 21 tasks
5. **Schedule weekly check-ins** to review progress

---

**Document Version**: 1.0
**Created**: 2025-11-12
**Status**: Ready for Implementation
**Owner**: Development Team
