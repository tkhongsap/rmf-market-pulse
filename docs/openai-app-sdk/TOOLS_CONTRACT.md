# MCP Tools Contract Specification

**Version:** 1.0
**Date:** 2025-11-12
**Status:** DRAFT - Awaiting Stakeholder Approval

## Overview

This document defines the contract for 6 MCP (Model Context Protocol) tools that power the Thai RMF Market Pulse ChatGPT integration. These tools enable users to discover, analyze, and compare 403 Thai Retirement Mutual Funds (RMF) with tax benefits.

**Design Principles:**
1. **Read-only:** All tools are read-only (no mutations)
2. **Structured content:** All responses include `content` (for ChatGPT text), `structuredContent` (for widgets), and `_meta` (for additional context)
3. **Graceful degradation:** Handle missing data elegantly (show "N/A", hide sections)
4. **Performance:** Target <500ms average response time
5. **Widget-first:** Responses optimized for visual widget rendering

---

## Tool 1: `get_rmf_funds`

### Purpose
Get a paginated list of Thai RMF funds with basic information, suitable for browsing and initial discovery.

### Input Schema
```typescript
{
  page?: number;           // Page number (default: 1)
  pageSize?: number;       // Items per page, 1-50 (default: 20)
  sortBy?: string;         // Sort field: "ytd" | "1y" | "risk" | "nav" | "name" (default: "ytd")
  sortOrder?: string;      // "asc" | "desc" (default: "desc")
  fundType?: string;       // Reserved for future use (always "RMF" for now)
  search?: string;         // Optional search query for fund name/symbol
}
```

### Output Schema
```typescript
{
  content: [
    {
      type: "text",
      text: "Found {totalCount} RMF funds. Showing page {page} ({funds.length} funds). [Brief summary of top 3 funds with performance highlights]"
    }
  ],
  structuredContent: {
    funds: [
      {
        symbol: string;              // e.g., "ABAPAC-RMF"
        fund_name: string;           // e.g., "abrdn Asia Pacific Equity Retirement Mutual Fund"
        amc: string;                 // e.g., "ABERDEEN ASSET MANAGEMENT (THAILAND) LIMITED"
        nav_value: number;           // e.g., 15.626
        nav_date: string;            // e.g., "2025-11-07"
        nav_change_percent: number | null;  // e.g., 0.5 or null
        risk_level: number;          // 1-8 scale
        perf_ytd: number | null;     // YTD return % (e.g., 8.8 or null)
        perf_1y: number | null;      // 1-year return %
        fund_classification: string | null;  // e.g., "EQASxJP" or null
      }
    ],
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  },
  _meta: {
    "openai/outputTemplate": "component://rmf-fund-list",
    timestamp: string;       // ISO 8601
    filters: {               // Echo back applied filters
      sortBy: string;
      sortOrder: string;
      search?: string;
    }
  }
}
```

### Sample Payloads

**Request:**
```json
{
  "name": "get_rmf_funds",
  "arguments": {
    "page": 1,
    "pageSize": 10,
    "sortBy": "ytd",
    "sortOrder": "desc"
  }
}
```

**Response:**
```json
{
  "content": [{
    "type": "text",
    "text": "Found 403 RMF funds. Showing page 1 (10 funds). Top performers: ES-GOLDRMF-UH (+37.14% YTD), B-ASIARMF (+21.34% YTD), ABAPAC-RMF (+8.8% YTD). These funds offer tax benefits up to 500,000 THB per year."
  }],
  "structuredContent": {
    "funds": [
      {
        "symbol": "ES-GOLDRMF-UH",
        "fund_name": "Eastspring Gold Bullion RMF-Currency Unhedged Fund",
        "amc": "EASTSPRING ASSET MANAGEMENT (THAILAND) LIMITED",
        "nav_value": 23.6534,
        "nav_date": "2025-11-10",
        "nav_change_percent": 0.5,
        "risk_level": 8,
        "perf_ytd": 37.14,
        "perf_1y": 42.61,
        "fund_classification": "COMPM"
      }
    ],
    "totalCount": 403,
    "page": 1,
    "pageSize": 10,
    "totalPages": 41
  },
  "_meta": {
    "openai/outputTemplate": "component://rmf-fund-list",
    "timestamp": "2025-11-12T10:00:00Z",
    "filters": {
      "sortBy": "ytd",
      "sortOrder": "desc"
    }
  }
}
```

### Error Cases
- **400 Bad Request:** Invalid page/pageSize (e.g., pageSize > 50)
- **500 Internal Server Error:** Data service failure

---

## Tool 2: `search_rmf_funds`

### Purpose
Advanced search with multiple filters for targeted fund discovery.

### Input Schema
```typescript
{
  search?: string;         // Text search on fund name/symbol (case-insensitive, partial match)
  amc?: string;            // Filter by AMC name (partial match)
  minRiskLevel?: number;   // Min risk level 1-8
  maxRiskLevel?: number;   // Max risk level 1-8
  minYtdReturn?: number;   // Min YTD return percentage (e.g., 5.0 for 5%)
  category?: string;       // Fund classification type (e.g., "EQAS", "FIXED")
  sortBy?: string;         // Same as get_rmf_funds
  sortOrder?: string;      // "asc" | "desc"
  limit?: number;          // Max results, 1-100 (default: 20)
}
```

**Validation:** At least one filter parameter must be provided.

### Output Schema
Same as `get_rmf_funds` but without pagination (single result set limited by `limit` parameter).

### Sample Payloads

**Request:**
```json
{
  "name": "search_rmf_funds",
  "arguments": {
    "amc": "Krungsri",
    "maxRiskLevel": 5,
    "sortBy": "ytd",
    "limit": 10
  }
}
```

**Response:**
```json
{
  "content": [{
    "type": "text",
    "text": "Found 8 RMF funds from Krungsri Asset Management with risk level ≤ 5. Top performer: KFRMF-FIXED (+3.2% YTD, Risk 3)."
  }],
  "structuredContent": {
    "funds": [ /* array of fund objects */ ],
    "totalCount": 8,
    "appliedFilters": {
      "amc": "Krungsri",
      "maxRiskLevel": 5
    }
  },
  "_meta": {
    "openai/outputTemplate": "component://rmf-fund-list",
    "timestamp": "2025-11-12T10:00:00Z"
  }
}
```

### Error Cases
- **400 Bad Request:** No filters provided, invalid risk level range
- **404 Not Found:** No funds match criteria (not an error, return empty array)

---

## Tool 3: `get_rmf_fund_detail`

### Purpose
Get comprehensive details for a single fund including performance, holdings, fees, and documents.

### Input Schema
```typescript
{
  fundCode: string;        // Required: Fund symbol (e.g., "ABAPAC-RMF")
}
```

### Output Schema
```typescript
{
  content: [
    {
      type: "text",
      text: "{fund_name} is managed by {amc}. Current NAV: {nav_value} THB (as of {nav_date}). Risk level: {risk_level}/8. YTD return: {perf_ytd}%. [Brief investment thesis and suitability.]"
    }
  ],
  structuredContent: {
    fund: {
      // Core info
      fund_id: string;
      symbol: string;
      fund_name: string;
      amc: string;
      fund_classification: string | null;
      management_style: string | null;
      dividend_policy: string | null;
      risk_level: number;
      fund_type: string;

      // NAV data
      nav_date: string;
      nav_value: number;
      nav_change: number | null;
      nav_change_percent: number | null;
      buy_price: number | null;
      sell_price: number | null;

      // Performance
      perf_ytd: number | null;
      perf_3m: number | null;
      perf_6m: number | null;
      perf_1y: number | null;
      perf_3y: number | null;
      perf_5y: number | null;
      perf_10y: number | null;
      perf_since_inception: number | null;

      // Benchmark
      benchmark_name: string | null;
      benchmark_ytd: number | null;
      benchmark_3m: number | null;
      benchmark_6m: number | null;
      benchmark_1y: number | null;
      benchmark_3y: number | null;
      benchmark_5y: number | null;
      benchmark_10y: number | null;

      // Asset allocation
      asset_allocation: Array<{
        asset_class: string;
        percentage: number;
      }> | null;

      // Fees (may contain "Unknown" values - see DATA_GAPS.md)
      fees: Array<{
        fee_type: string;
        fee_desc: string;
        fee_value: number | null;
        fee_remark: string | null;
      }> | null;

      // Investment minimums
      min_initial: number | null;
      min_additional: number | null;
      min_redemption: number | null;
      min_balance: number | null;

      // Documents
      factsheet_url: string | null;
      annual_report_url: string | null;
      halfyear_report_url: string | null;

      // Suitability (Base64 encoded Thai text)
      suitability_risk_level: string | null;
      suitability_target_investor: string | null;
      suitability_investment_horizon: string | null;
    }
  },
  _meta: {
    "openai/outputTemplate": "component://rmf-fund-card",
    timestamp: string;
    navHistory7d: Array<{     // Last 7 days for mini sparkline
      date: string;
      nav: number;
    }>;
  }
}
```

### Sample Payloads

**Request:**
```json
{
  "name": "get_rmf_fund_detail",
  "arguments": {
    "fundCode": "ABAPAC-RMF"
  }
}
```

**Response:**
```json
{
  "content": [{
    "type": "text",
    "text": "abrdn Asia Pacific Equity Retirement Mutual Fund is managed by ABERDEEN ASSET MANAGEMENT (THAILAND) LIMITED. Current NAV: 15.626 THB (as of 2025-11-07). Risk level: 6/8 (High risk). YTD return: +8.8%. Suitable for aggressive investors seeking exposure to Asia-Pacific equities excluding Japan."
  }],
  "structuredContent": {
    "fund": {
      "symbol": "ABAPAC-RMF",
      "fund_name": "abrdn Asia Pacific Equity Retirement Mutual Fund",
      "amc": "ABERDEEN ASSET MANAGEMENT (THAILAND) LIMITED",
      "risk_level": 6,
      "nav_value": 15.626,
      "nav_date": "2025-11-07",
      "perf_ytd": 8.8,
      "perf_1y": 6.65,
      "benchmark_name": "ดัชนี MSCI AC Asia-Pacific ex Japan",
      "asset_allocation": [
        {"asset_class": "Unit Trust", "percentage": 98.9},
        {"asset_class": "Cash and Others", "percentage": 1.1}
      ],
      "factsheet_url": "https://secdocumentstorage.blob.core.windows.net/fundfactsheet/M0774_2554.pdf"
      /* ... other fields ... */
    }
  },
  "_meta": {
    "openai/outputTemplate": "component://rmf-fund-card",
    "timestamp": "2025-11-12T10:00:00Z",
    "navHistory7d": [
      {"date": "2025-11-01", "nav": 15.1},
      {"date": "2025-11-04", "nav": 15.3},
      {"date": "2025-11-05", "nav": 15.4},
      {"date": "2025-11-06", "nav": 15.5},
      {"date": "2025-11-07", "nav": 15.626}
    ]
  }
}
```

### Error Cases
- **400 Bad Request:** Missing or invalid fundCode
- **404 Not Found:** Fund code does not exist in database

---

## Tool 4: `get_rmf_fund_performance`

### Purpose
Get top-performing funds for a specific time period, useful for performance leaderboards.

### Input Schema
```typescript
{
  period: string;          // Required: "ytd" | "3m" | "6m" | "1y" | "3y" | "5y"
  sortBy?: string;         // "asc" | "desc" (default: "desc")
  limit?: number;          // Max results, 1-50 (default: 10)
  riskLevel?: number;      // Optional: Filter by specific risk level 1-8
}
```

### Output Schema
```typescript
{
  content: [
    {
      type: "text",
      text: "Top {limit} RMF funds by {period} performance: [List top 3-5 with names, returns, and risk levels]. {period} average return across all funds: {avg}%."
    }
  ],
  structuredContent: {
    period: string;
    funds: [
      {
        symbol: string;
        fund_name: string;
        amc: string;
        risk_level: number;
        performance: number;        // Return % for the specified period
        benchmark_performance: number | null;  // Benchmark return for same period
        outperformance: number | null;  // performance - benchmark_performance
        nav_value: number;
        nav_date: string;
      }
    ],
    periodStats: {
      average: number;              // Average return across all funds
      median: number;
      min: number;
      max: number;
      fundsCounted: number;         // Funds with non-null data for this period
    }
  },
  _meta: {
    "openai/outputTemplate": "component://rmf-fund-list",
    timestamp: string;
    filters: {
      period: string;
      sortBy: string;
      limit: number;
      riskLevel?: number;
    }
  }
}
```

### Sample Payloads

**Request:**
```json
{
  "name": "get_rmf_fund_performance",
  "arguments": {
    "period": "1y",
    "limit": 10,
    "sortBy": "desc"
  }
}
```

**Response:**
```json
{
  "content": [{
    "type": "text",
    "text": "Top 10 RMF funds by 1-year performance: ES-GOLDRMF-UH (+42.61%, Risk 8), B-ASIARMF (+13.62%, Risk 6), ABAPAC-RMF (+6.65%, Risk 6). 1-year average return across 342 funds: +2.5%."
  }],
  "structuredContent": {
    "period": "1y",
    "funds": [
      {
        "symbol": "ES-GOLDRMF-UH",
        "fund_name": "Eastspring Gold Bullion RMF-Currency Unhedged Fund",
        "amc": "EASTSPRING ASSET MANAGEMENT (THAILAND) LIMITED",
        "risk_level": 8,
        "performance": 42.61,
        "benchmark_performance": 44.39,
        "outperformance": -1.78,
        "nav_value": 23.6534,
        "nav_date": "2025-11-10"
      }
      /* ... 9 more funds ... */
    ],
    "periodStats": {
      "average": 2.5,
      "median": 1.8,
      "min": -19.42,
      "max": 42.61,
      "fundsCounted": 342
    }
  },
  "_meta": {
    "openai/outputTemplate": "component://rmf-fund-list",
    "timestamp": "2025-11-12T10:00:00Z",
    "filters": {
      "period": "1y",
      "sortBy": "desc",
      "limit": 10
    }
  }
}
```

### Error Cases
- **400 Bad Request:** Invalid period value
- **404 Not Found:** No funds have data for requested period (e.g., "10y" when all funds < 10 years old)

---

## Tool 5: `get_rmf_fund_nav_history`

### Purpose
Get historical NAV data for charting and trend analysis.

### Input Schema
```typescript
{
  fundCode: string;        // Required: Fund symbol
  days?: number;           // Number of days of history, 1-365 (default: 30)
}
```

### Output Schema
```typescript
{
  content: [
    {
      type: "text",
      text: "{fund_name} NAV over the last {days} days: {periodReturn}% return ({minNav} to {maxNav} THB range). Current NAV: {currentNav} THB."
    }
  ],
  structuredContent: {
    fundCode: string;
    fundName: string;
    navHistory: [
      {
        date: string;              // ISO 8601 date
        nav: number;
        change: number | null;     // Daily change in THB
        changePercent: number | null;  // Daily change %
      }
    ],
    periodReturn: number;          // Total return % over the period
    volatility: number;            // Standard deviation of daily returns
    minNav: number;
    maxNav: number;
    avgNav: number;
    currentNav: number;
    currentDate: string;
  },
  _meta: {
    "openai/outputTemplate": "component://rmf-performance-chart",
    timestamp: string;
    days: number;
  }
}
```

### Sample Payloads

**Request:**
```json
{
  "name": "get_rmf_fund_nav_history",
  "arguments": {
    "fundCode": "ABAPAC-RMF",
    "days": 30
  }
}
```

**Response:**
```json
{
  "content": [{
    "type": "text",
    "text": "abrdn Asia Pacific Equity Retirement Mutual Fund NAV over the last 30 days: +4.9% return (14.89 to 16.12 THB range). Current NAV: 15.626 THB. Volatility: 1.2% (standard deviation)."
  }],
  "structuredContent": {
    "fundCode": "ABAPAC-RMF",
    "fundName": "abrdn Asia Pacific Equity Retirement Mutual Fund",
    "navHistory": [
      {"date": "2025-09-26", "nav": 14.8926, "change": null, "changePercent": null},
      {"date": "2025-09-27", "nav": 15.01, "change": 0.1174, "changePercent": 0.79},
      {"date": "2025-09-30", "nav": 15.2, "change": 0.19, "changePercent": 1.27},
      /* ... more days ... */
      {"date": "2025-11-07", "nav": 15.626, "change": 0.05, "changePercent": 0.32}
    ],
    "periodReturn": 4.9,
    "volatility": 1.2,
    "minNav": 14.8926,
    "maxNav": 16.1174,
    "avgNav": 15.4,
    "currentNav": 15.626,
    "currentDate": "2025-11-07"
  },
  "_meta": {
    "openai/outputTemplate": "component://rmf-performance-chart",
    "timestamp": "2025-11-12T10:00:00Z",
    "days": 30
  }
}
```

### Error Cases
- **400 Bad Request:** Invalid fundCode or days parameter
- **404 Not Found:** Fund code does not exist
- **500 Internal Server Error:** NAV history file not found in `data/rmf-funds/{fundCode}.json`

---

## Tool 6: `compare_rmf_funds`

### Purpose
Side-by-side comparison of 2-5 funds across key metrics.

### Input Schema
```typescript
{
  fundCodes: string[];     // Required: Array of 2-5 fund symbols
  compareBy?: string;      // Optional: "performance" | "risk" | "fees" (default: "all")
}
```

### Output Schema
```typescript
{
  content: [
    {
      type: "text",
      text: "Comparing {N} RMF funds: [List fund names]. Key differences: [Highlight 2-3 major differences in risk, returns, or fees]."
    }
  ],
  structuredContent: {
    funds: [
      {
        symbol: string;
        fund_name: string;
        amc: string;
        risk_level: number;

        // Performance comparison
        perf_ytd: number | null;
        perf_1y: number | null;
        perf_3y: number | null;
        perf_5y: number | null;

        // Benchmark comparison
        benchmark_name: string | null;
        benchmark_ytd: number | null;
        benchmark_1y: number | null;

        // Fees
        fees: Array<{
          fee_desc: string;
          fee_value: number | null;
        }> | null;

        // Risk metrics
        volatility_1y: number | null;  // Standard deviation
        tracking_error: number | null;

        // NAV
        nav_value: number;
        nav_date: string;
      }
    ],
    comparisonHighlights: {
      bestYtd: string;       // Symbol of best YTD performer
      worstYtd: string | null;
      lowestRisk: string;
      highestRisk: string;
      lowestFees: string | null;  // May be null if all fees are "Unknown"
    }
  },
  _meta: {
    "openai/outputTemplate": "component://rmf-fund-comparison",
    timestamp: string;
    compareBy: string;
    fundCount: number;
  }
}
```

### Sample Payloads

**Request:**
```json
{
  "name": "compare_rmf_funds",
  "arguments": {
    "fundCodes": ["ABAPAC-RMF", "B-ASIARMF", "ES-GOLDRMF-UH"],
    "compareBy": "performance"
  }
}
```

**Response:**
```json
{
  "content": [{
    "type": "text",
    "text": "Comparing 3 RMF funds: abrdn Asia Pacific Equity RMF (Risk 6, +8.8% YTD), Bualuang Asia Equity RMF (Risk 6, +21.34% YTD), Eastspring Gold Bullion RMF (Risk 8, +37.14% YTD). Key differences: Gold fund has highest returns but also highest risk (8/8). Asian equity funds have similar risk profiles but 12.5% performance gap."
  }],
  "structuredContent": {
    "funds": [
      {
        "symbol": "ABAPAC-RMF",
        "fund_name": "abrdn Asia Pacific Equity Retirement Mutual Fund",
        "amc": "ABERDEEN ASSET MANAGEMENT (THAILAND) LIMITED",
        "risk_level": 6,
        "perf_ytd": 8.8,
        "perf_1y": 6.65,
        "benchmark_name": "ดัชนี MSCI AC Asia-Pacific ex Japan",
        "benchmark_ytd": 18.78,
        "nav_value": 15.626,
        "nav_date": "2025-11-07"
      }
      /* ... 2 more funds ... */
    ],
    "comparisonHighlights": {
      "bestYtd": "ES-GOLDRMF-UH",
      "worstYtd": "ABAPAC-RMF",
      "lowestRisk": "ABAPAC-RMF",
      "highestRisk": "ES-GOLDRMF-UH",
      "lowestFees": null
    }
  },
  "_meta": {
    "openai/outputTemplate": "component://rmf-fund-comparison",
    "timestamp": "2025-11-12T10:00:00Z",
    "compareBy": "performance",
    "fundCount": 3
  }
}
```

### Error Cases
- **400 Bad Request:** fundCodes array has <2 or >5 items, invalid fundCode format
- **404 Not Found:** One or more fund codes do not exist (return error with list of invalid codes)

---

## Common Response Format

All tools follow this structure:

```typescript
{
  content: Array<{
    type: "text" | "image" | "resource";
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  structuredContent?: object;  // Tool-specific data for widgets
  _meta?: {
    "openai/outputTemplate"?: string;  // Widget component URI
    timestamp: string;                 // ISO 8601
    // ... other metadata
  };
}
```

**Notes:**
- `content` is REQUIRED - ChatGPT uses this for text responses
- `structuredContent` is REQUIRED for widget rendering
- `_meta["openai/outputTemplate"]` tells ChatGPT which widget to render
- All timestamps are ISO 8601 format (e.g., "2025-11-12T10:00:00Z")

---

## Error Response Format

```typescript
{
  error: {
    code: string;           // "BAD_REQUEST" | "NOT_FOUND" | "INTERNAL_ERROR"
    message: string;        // User-friendly error message
    actionableHint: string; // What the user can do to fix it
    details?: object;       // Optional: Additional error context
  }
}
```

**Example:**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Fund code 'INVALID-CODE' does not exist",
    "actionableHint": "Try searching for funds with 'search_rmf_funds' tool to find valid fund codes."
  }
}
```

---

## Tool Discovery Metadata

To improve ChatGPT's ability to discover and use these tools, each tool includes:

1. **Keywords:** "RMF", "retirement", "mutual fund", "Thailand", "tax", "NAV", "performance"
2. **Example queries:**
   - `get_rmf_funds`: "Show me top RMF funds", "List retirement funds with best returns"
   - `search_rmf_funds`: "Find low-risk RMF funds from Krungsri", "Show me equity RMF funds"
   - `get_rmf_fund_detail`: "Tell me about ABAPAC-RMF", "Show details for B-ASIARMF"
   - `get_rmf_fund_performance`: "Top performing RMF funds this year", "Best 1-year returns"
   - `get_rmf_fund_nav_history`: "Show NAV chart for ABAPAC-RMF", "NAV trends over 90 days"
   - `compare_rmf_funds`: "Compare ABAPAC-RMF and B-ASIARMF", "Which fund is better?"
3. **readOnlyHint:** true (all tools are read-only)

---

## Data Quality Notes

See `DATA_GAPS.md` for detailed analysis. Key points:

- **NAV data:** 100% coverage, excellent quality ✅
- **Performance data:** 94% have YTD, good coverage for recent periods ✅
- **Benchmark data:** 95% coverage ✅
- **Fees data:** Poor quality, many "Unknown" values ⚠️
- **Parties data:** Poor quality, many "Unknown" values ⚠️
- **Long-term performance:** Lower coverage for 3Y/5Y/10Y periods 🟡

Tools must handle these gaps gracefully.

---

## Version History

**v1.0 (2025-11-12):**
- Initial contract definition
- 6 tools specified with complete input/output schemas
- Sample payloads added
- Error handling documented
- Data quality notes added

---

## Next Steps

1. ✅ Get stakeholder approval on this contract
2. ⬜ Implement Zod schemas in `shared/schema.ts`
3. ⬜ Implement data service with these contracts in mind
4. ⬜ Build MCP SDK server with these tool definitions
5. ⬜ Create unit tests for all 6 tools
