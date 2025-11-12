# MCP Tools Contract Specification
**Project:** Thai RMF Market Pulse - ChatGPT Integration
**Version:** 1.0
**Date:** 2025-11-12
**Status:** FROZEN - Do not modify without team approval

---

## Overview

This document defines the **frozen contract** for all 6 MCP tools. Once approved, these specifications must not change during implementation to ensure consistency between backend, frontend, and testing.

**Contract-First Development:**
1. Define tool schemas here (✅ this document)
2. Get stakeholder approval
3. Implement backend handlers matching these exact schemas
4. Build widgets expecting these exact response formats
5. Test against these specifications

---

## Tool Specifications

### Tool 1: `get_rmf_funds`
**Purpose:** Get paginated list of Thai RMF funds with optional filtering

#### Input Schema
```typescript
{
  page?: number;          // Page number (default: 1, min: 1)
  pageSize?: number;      // Items per page (default: 20, min: 1, max: 50)
  search?: string;        // Search fund name or symbol (case-insensitive)
  fundType?: string;      // Filter by fund type (not used in MVP - all are "RMF")
  sortBy?: string;        // Sort order: "ytd" | "1y" | "3y" | "5y" | "nav" | "name" (default: "ytd")
}
```

#### Output Schema
```typescript
{
  content: [
    {
      type: "text",
      text: "Found {totalCount} RMF funds. Showing page {page} of {totalPages} ({pageSize} per page). {topPerformersDescription}"
    }
  ],
  structuredContent: {
    funds: Array<{
      symbol: string;
      fundName: string;
      amc: string;
      classification: string | null;
      riskLevel: number;              // 0-8
      nav: {
        value: number;
        date: string;                 // YYYY-MM-DD
        change: number;
        changePercent: number;
      };
      performance: {
        ytd: number | null;
        threeMonth: number | null;
        sixMonth: number | null;
        oneYear: number | null;
        threeYear: number | null;
        fiveYear: number | null;
      };
      benchmarkName: string | null;
    }>;
    pagination: {
      page: number;
      pageSize: number;
      totalCount: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  },
  _meta: {
    "openai/outputTemplate": "component://rmf-fund-list",
    timestamp: string,                // ISO 8601
    dataSource: "rmf-funds-consolidated.csv",
    sortedBy: string,
  }
}
```

#### Sample Request/Response

**Request:**
```json
{
  "page": 1,
  "pageSize": 10,
  "sortBy": "ytd"
}
```

**Response (sample with real B-ASEANRMF data):**
```json
{
  "content": [{
    "type": "text",
    "text": "Found 403 RMF funds. Showing page 1 of 41 (10 per page). Top performer: ABAPAC-RMF with 8.8% YTD return."
  }],
  "structuredContent": {
    "funds": [
      {
        "symbol": "ABAPAC-RMF",
        "fundName": "abrdn Asia Pacific Equity Retirement Mutual Fund",
        "amc": "ABERDEEN ASSET MANAGEMENT (THAILAND) LIMITED",
        "classification": "EQASxJP",
        "riskLevel": 6,
        "nav": {
          "value": 15.626,
          "date": "2025-11-07",
          "change": 15.626,
          "changePercent": 0
        },
        "performance": {
          "ytd": 8.8,
          "threeMonth": 10.62,
          "sixMonth": 12.71,
          "oneYear": 6.65,
          "threeYear": null,
          "fiveYear": null
        },
        "benchmarkName": "MSCI AC Asia Pacific ex Japan (USD)"
      },
      {
        "symbol": "B-ASEANRMF",
        "fundName": "Bualuang ASEAN Equity RMF",
        "amc": "BBL ASSET MANAGEMENT COMPANY LIMITED",
        "classification": null,
        "riskLevel": 6,
        "nav": {
          "value": 11.1928,
          "date": "2025-11-10",
          "change": 11.1928,
          "changePercent": 0
        },
        "performance": {
          "ytd": -0.85,
          "threeMonth": 4.42,
          "sixMonth": 4.9,
          "oneYear": -3.13,
          "threeYear": 2.38,
          "fiveYear": 7.59
        },
        "benchmarkName": "ดัชนี Bloomberg ASEAN Large & Mid Net Return USD"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "totalCount": 403,
      "totalPages": 41,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  },
  "_meta": {
    "openai/outputTemplate": "component://rmf-fund-list",
    "timestamp": "2025-11-12T10:30:00.000Z",
    "dataSource": "rmf-funds-consolidated.csv",
    "sortedBy": "ytd"
  }
}
```

---

### Tool 2: `search_rmf_funds`
**Purpose:** Advanced search with multiple filter criteria

#### Input Schema
```typescript
{
  search?: string;          // Text search on fund name/symbol
  amc?: string;             // Filter by AMC name (partial match, case-insensitive)
  minRiskLevel?: number;    // Min risk level (0-8)
  maxRiskLevel?: number;    // Max risk level (0-8)
  minYtdReturn?: number;    // Minimum YTD return percentage
  category?: string;        // Fund classification code (e.g., "EQGL", "FIXMIDGOV")
  sortBy?: string;          // Same as get_rmf_funds
  limit?: number;           // Max results (default: 20, max: 50)
}
```

#### Output Schema
```typescript
// Same structure as get_rmf_funds, but without pagination
// Instead of pagination object, include:
{
  structuredContent: {
    funds: Array<FundSummary>;  // Same as get_rmf_funds
    searchCriteria: {
      search: string | null;
      amc: string | null;
      riskRange: {min: number, max: number} | null;
      minYtdReturn: number | null;
      category: string | null;
    };
    resultsCount: number;
    truncated: boolean;  // true if results exceed limit
  }
}
```

#### Sample Request/Response

**Request:**
```json
{
  "search": "ASEAN",
  "minRiskLevel": 5,
  "maxRiskLevel": 7,
  "limit": 5
}
```

**Response:**
```json
{
  "content": [{
    "type": "text",
    "text": "Found 3 RMF funds matching your search criteria. All results shown below."
  }],
  "structuredContent": {
    "funds": [
      // Same fund objects as get_rmf_funds
    ],
    "searchCriteria": {
      "search": "ASEAN",
      "amc": null,
      "riskRange": {"min": 5, "max": 7},
      "minYtdReturn": null,
      "category": null
    },
    "resultsCount": 3,
    "truncated": false
  },
  "_meta": {
    "openai/outputTemplate": "component://rmf-fund-list",
    "timestamp": "2025-11-12T10:30:00.000Z",
    "dataSource": "rmf-funds-consolidated.csv"
  }
}
```

---

### Tool 3: `get_rmf_fund_detail`
**Purpose:** Get comprehensive details for a single fund

#### Input Schema
```typescript
{
  fundCode: string;  // Required: Fund symbol (e.g., "B-ASEANRMF")
}
```

#### Output Schema
```typescript
{
  content: [
    {
      type: "text",
      text: "{fundName} (symbol: {fundCode}) is a {riskDescription} fund managed by {amc}. Current NAV is {nav} ({navChange}% change). YTD return: {ytdReturn}%."
    }
  ],
  structuredContent: {
    fund: {
      // Basic Info
      fundId: string;
      symbol: string;
      fundName: string;
      amc: string;

      // Metadata
      metadata: {
        classification: string | null;
        managementStyle: string;
        dividendPolicy: string;
        riskLevel: number;
        fundType: string;  // "RMF"
      };

      // Latest NAV
      latestNav: {
        navDate: string;      // YYYY-MM-DD
        value: number;
        change: number;
        changePercent: number;
        netAsset: number;
        buyPrice: number;
        sellPrice: number;
      };

      // Performance
      performance: {
        ytd: number | null;
        threeMonth: number | null;
        sixMonth: number | null;
        oneYear: number | null;
        threeYear: number | null;
        fiveYear: number | null;
        tenYear: number | null;
        sinceInception: number | null;
      };

      // Benchmark
      benchmark: {
        name: string;
        returns: {
          ytd: number | null;
          threeMonth: number | null;
          sixMonth: number | null;
          oneYear: number | null;
          threeYear: number | null;
          fiveYear: number | null;
          tenYear: number | null;
        };
      } | null;

      // Asset Allocation
      assetAllocation: Array<{
        assetClass: string;  // Thai language
        percentage: number;
      }>;

      // Dividends
      dividends: Array<{
        exDate: string;
        payDate: string;
        amount: number;
      }>;

      // Documents
      documentUrls: {
        factsheetUrl: string | null;
        annualReportUrl: string | null;
        halfyearReportUrl: string | null;
      };

      // Investment Minimums
      investmentMinimums: {
        minimumInitial: string | null;
        minimumAdditional: string | null;
        minimumRedemption: string | null;
        minimumBalance: string | null;
      };

      // Data Quality Flags
      dataQuality: {
        hasFeeDetails: boolean;
        hasPartyDetails: boolean;
        hasTopHoldings: boolean;
        hasRiskMetrics: boolean;
        hasErrors: boolean;
      };

      errors: string[];  // Data collection errors, if any
    }
  },
  _meta: {
    "openai/outputTemplate": "component://rmf-fund-card",
    timestamp: string,
    navHistory7d: Array<{date: string, value: number}>;  // For mini sparkline
    dataSource: string;
  }
}
```

#### Sample Response (using B-ASEANRMF real data)
```json
{
  "content": [{
    "type": "text",
    "text": "Bualuang ASEAN Equity RMF (symbol: B-ASEANRMF) is a medium-risk fund (level 6) managed by BBL ASSET MANAGEMENT COMPANY LIMITED. Current NAV is 11.1928 (0% change). YTD return: -0.85%."
  }],
  "structuredContent": {
    "fund": {
      "fundId": "M0148_2560",
      "symbol": "B-ASEANRMF",
      "fundName": "Bualuang ASEAN Equity RMF",
      "amc": "BBL ASSET MANAGEMENT COMPANY LIMITED",
      "metadata": {
        "classification": null,
        "managementStyle": "AM",
        "dividendPolicy": "No",
        "riskLevel": 6,
        "fundType": "RMF"
      },
      "latestNav": {
        "navDate": "2025-11-10",
        "value": 11.1928,
        "change": 11.1928,
        "changePercent": 0,
        "netAsset": 840483264,
        "buyPrice": 11.1928,
        "sellPrice": 11.1929
      },
      "performance": {
        "ytd": -0.85,
        "threeMonth": 4.42,
        "sixMonth": 4.9,
        "oneYear": -3.13,
        "threeYear": 2.38,
        "fiveYear": 7.59,
        "tenYear": null,
        "sinceInception": 1.14
      },
      "benchmark": {
        "name": "ดัชนี Bloomberg ASEAN Large & Mid Net Return USD",
        "returns": {
          "ytd": 6.6,
          "threeMonth": 6.48,
          "sixMonth": 9.85,
          "oneYear": 6.73,
          "threeYear": 6.02,
          "fiveYear": 8.35,
          "tenYear": null
        }
      },
      "assetAllocation": [
        {"assetClass": "หุ้นสามัญต่างประเทศ", "percentage": 61.83},
        {"assetClass": "ทรัพย์สินอื่นและหนี้สินอื่น", "percentage": 16.8},
        {"assetClass": "หุ้นสามัญ", "percentage": 16.11},
        {"assetClass": "หน่วยลงทุนกองทุนรวม", "percentage": 5.25},
        {"assetClass": "เงินฝากธนาคาร", "percentage": 0}
      ],
      "dividends": [],
      "documentUrls": {
        "factsheetUrl": "https://secdocumentstorage.blob.core.windows.net/fundfactsheet/M0148_2560.pdf",
        "annualReportUrl": null,
        "halfyearReportUrl": null
      },
      "investmentMinimums": {
        "minimumInitial": "500",
        "minimumAdditional": "500",
        "minimumRedemption": null,
        "minimumBalance": null
      },
      "dataQuality": {
        "hasFeeDetails": false,
        "hasPartyDetails": false,
        "hasTopHoldings": false,
        "hasRiskMetrics": false,
        "hasErrors": true
      },
      "errors": [
        "No risk metrics available",
        "No category data available",
        "No top holdings data available"
      ]
    }
  },
  "_meta": {
    "openai/outputTemplate": "component://rmf-fund-card",
    "timestamp": "2025-11-12T10:30:00.000Z",
    "navHistory7d": [
      {"date": "2025-11-04", "value": 11.1709},
      {"date": "2025-11-05", "value": 11.169},
      {"date": "2025-11-06", "value": 11.2169},
      {"date": "2025-11-07", "value": 11.1988},
      {"date": "2025-11-10", "value": 11.1928}
    ],
    "dataSource": "data/rmf-funds/B-ASEANRMF.json"
  }
}
```

---

### Tool 4: `get_rmf_fund_performance`
**Purpose:** Get top-performing funds for a specific time period

#### Input Schema
```typescript
{
  period: string;        // Required: "ytd" | "3m" | "6m" | "1y" | "3y" | "5y"
  sortBy?: string;       // "asc" | "desc" (default: "desc" for highest returns first)
  limit?: number;        // Max results (default: 10, max: 50)
  riskLevel?: number;    // Optional: Filter by specific risk level (0-8)
}
```

#### Output Schema
```typescript
{
  content: [{
    "type": "text",
    "text": "Top {limit} RMF funds by {period} performance ({sortOrder}): Highest performer: {topFundName} with {topReturn}% return."
  }],
  structuredContent: {
    funds: Array<{
      symbol: string;
      fundName: string;
      amc: string;
      riskLevel: number;
      nav: {value: number, date: string};
      periodReturn: number;  // The performance for requested period
      benchmark: {
        name: string;
        periodReturn: number;
      } | null;
      outperformance: number | null;  // fund return - benchmark return
    }>;
    period: string;
    sortOrder: string;
    resultsCount: number;
  },
  "_meta": {
    "openai/outputTemplate": "component://rmf-fund-list",
    timestamp: string,
    periodDescription: string;  // e.g., "Year-to-Date" for "ytd"
  }
}
```

#### Sample Request/Response

**Request:**
```json
{
  "period": "ytd",
  "sortBy": "desc",
  "limit": 5
}
```

**Response:**
```json
{
  "content": [{
    "type": "text",
    "text": "Top 5 RMF funds by YTD performance (highest first): Highest performer: ABAPAC-RMF with 8.8% return."
  }],
  "structuredContent": {
    "funds": [
      {
        "symbol": "ABAPAC-RMF",
        "fundName": "abrdn Asia Pacific Equity Retirement Mutual Fund",
        "amc": "ABERDEEN ASSET MANAGEMENT (THAILAND) LIMITED",
        "riskLevel": 6,
        "nav": {"value": 15.626, "date": "2025-11-07"},
        "periodReturn": 8.8,
        "benchmark": {
          "name": "MSCI AC Asia Pacific ex Japan (USD)",
          "periodReturn": 7.5
        },
        "outperformance": 1.3
      }
      // ... 4 more funds
    ],
    "period": "ytd",
    "sortOrder": "desc",
    "resultsCount": 5
  },
  "_meta": {
    "openai/outputTemplate": "component://rmf-fund-list",
    "timestamp": "2025-11-12T10:30:00.000Z",
    "periodDescription": "Year-to-Date"
  }
}
```

---

### Tool 5: `get_rmf_fund_nav_history`
**Purpose:** Get NAV history for charting

#### Input Schema
```typescript
{
  fundCode: string;  // Required: Fund symbol
  days?: number;     // Number of days (default: 30, max: 365)
}
```

#### Output Schema
```typescript
{
  content: [{
    "type": "text",
    "text": "{fundName} NAV over the last {days} days: Current NAV {currentNav}, {periodChange}% change from {startDate} to {endDate}."
  }],
  structuredContent: {
    fundCode: string;
    fundName: string;
    navHistory: Array<{
      date: string;          // YYYY-MM-DD
      nav: number;
      change: number;        // Daily change
      changePercent: number; // Daily change %
    }>;
    periodStats: {
      startDate: string;
      endDate: string;
      startNav: number;
      endNav: number;
      periodReturn: number;      // Total return over period
      periodReturnPercent: number;
      volatility: number | null; // Standard deviation
      minNav: number;
      maxNav: number;
      avgNav: number;
    };
  },
  "_meta": {
    "openai/outputTemplate": "component://rmf-performance-chart",
    timestamp: string,
    dataPoints: number;
  }
}
```

#### Sample Request/Response

**Request:**
```json
{
  "fundCode": "B-ASEANRMF",
  "days": 30
}
```

**Response:**
```json
{
  "content": [{
    "type": "text",
    "text": "Bualuang ASEAN Equity RMF NAV over the last 30 days: Current NAV 11.1928, 1.94% change from 2025-09-29 to 2025-11-10."
  }],
  "structuredContent": {
    "fundCode": "B-ASEANRMF",
    "fundName": "Bualuang ASEAN Equity RMF",
    "navHistory": [
      {
        "date": "2025-09-29",
        "nav": 10.9793,
        "change": 0,
        "changePercent": 0
      },
      {
        "date": "2025-09-30",
        "nav": 10.9871,
        "change": 0.0078,
        "changePercent": 0.071
      },
      // ... more data points
      {
        "date": "2025-11-10",
        "nav": 11.1928,
        "change": -0.006,
        "changePercent": -0.054
      }
    ],
    "periodStats": {
      "startDate": "2025-09-29",
      "endDate": "2025-11-10",
      "startNav": 10.9793,
      "endNav": 11.1928,
      "periodReturn": 0.2135,
      "periodReturnPercent": 1.94,
      "volatility": 0.65,
      "minNav": 10.9793,
      "maxNav": 11.2827,
      "avgNav": 11.1456
    }
  },
  "_meta": {
    "openai/outputTemplate": "component://rmf-performance-chart",
    "timestamp": "2025-11-12T10:30:00.000Z",
    "dataPoints": 28
  }
}
```

---

### Tool 6: `compare_rmf_funds`
**Purpose:** Side-by-side comparison of 2-5 funds

#### Input Schema
```typescript
{
  fundCodes: string[];   // Required: Array of 2-5 fund symbols
  compareBy?: string;    // "performance" | "risk" | "fees" | "all" (default: "all")
}
```

#### Output Schema
```typescript
{
  content: [{
    "type": "text",
    "text": "Comparing {count} RMF funds: {fundNames}. {comparisonSummary}"
  }],
  structuredContent: {
    funds: Array<{
      symbol: string;
      fundName: string;
      amc: string;
      riskLevel: number;

      nav: {value: number, date: string, changePercent: number};

      performance: {
        ytd: number | null;
        oneYear: number | null;
        threeYear: number | null;
        fiveYear: number | null;
      };

      benchmark: {
        name: string;
        ytdReturn: number | null;
        oneYearReturn: number | null;
      } | null;

      fees: {
        frontEndFee: string | null;      // Display Thai description
        backEndFee: string | null;
        managementFee: string | null;
        hasFeeDetails: boolean;          // Data quality flag
      };

      minimumInvestment: {
        initial: string | null;
        additional: string | null;
      };

      assetAllocation: Array<{
        assetClass: string;
        percentage: number;
      }>;
    }>;

    comparisonMetrics: {
      bestYtdReturn: {symbol: string, value: number};
      lowestRisk: {symbol: string, value: number};
      lowestMinimumInvestment: {symbol: string, value: string};
    };
  },
  "_meta": {
    "openai/outputTemplate": "component://rmf-fund-comparison",
    timestamp: string,
    fundsCompared: number;
  }
}
```

#### Sample Request/Response

**Request:**
```json
{
  "fundCodes": ["B-ASEANRMF", "ABAPAC-RMF"],
  "compareBy": "all"
}
```

**Response:**
```json
{
  "content": [{
    "type": "text",
    "text": "Comparing 2 RMF funds: Bualuang ASEAN Equity RMF vs abrdn Asia Pacific Equity Retirement Mutual Fund. ABAPAC-RMF has higher YTD return (8.8% vs -0.85%), both have same risk level (6)."
  }],
  "structuredContent": {
    "funds": [
      {
        "symbol": "B-ASEANRMF",
        "fundName": "Bualuang ASEAN Equity RMF",
        "amc": "BBL ASSET MANAGEMENT COMPANY LIMITED",
        "riskLevel": 6,
        "nav": {"value": 11.1928, "date": "2025-11-10", "changePercent": 0},
        "performance": {
          "ytd": -0.85,
          "oneYear": -3.13,
          "threeYear": 2.38,
          "fiveYear": 7.59
        },
        "benchmark": {
          "name": "ดัชนี Bloomberg ASEAN Large & Mid Net Return USD",
          "ytdReturn": 6.6,
          "oneYearReturn": 6.73
        },
        "fees": {
          "frontEndFee": "ค่าธรรมเนียมการขายหน่วยลงทุน (Front-end Fee)",
          "backEndFee": "ค่าธรรมเนียมการรับซื้อคืนหน่วยลงทุน (Back-end Fee)",
          "managementFee": "ค่าธรรมเนียมการจัดการ",
          "hasFeeDetails": false
        },
        "minimumInvestment": {
          "initial": "500",
          "additional": "500"
        },
        "assetAllocation": [
          {"assetClass": "หุ้นสามัญต่างประเทศ", "percentage": 61.83},
          {"assetClass": "ทรัพย์สินอื่นและหนี้สินอื่น", "percentage": 16.8}
        ]
      },
      {
        "symbol": "ABAPAC-RMF",
        // ... similar structure
      }
    ],
    "comparisonMetrics": {
      "bestYtdReturn": {"symbol": "ABAPAC-RMF", "value": 8.8},
      "lowestRisk": {"symbol": "B-ASEANRMF", "value": 6},  // Tied
      "lowestMinimumInvestment": {"symbol": "B-ASEANRMF", "value": "500"}  // Tied
    }
  },
  "_meta": {
    "openai/outputTemplate": "component://rmf-fund-comparison",
    "timestamp": "2025-11-12T10:30:00.000Z",
    "fundsCompared": 2
  }
}
```

---

## Error Handling

All tools must return standardized error responses:

```typescript
{
  error: {
    code: string;           // "BAD_REQUEST" | "NOT_FOUND" | "INTERNAL_ERROR"
    message: string;        // User-friendly error message
    actionableHint: string; // What the user can do to fix it
    details?: any;          // Additional error details (optional)
  }
}
```

### Error Examples

**400 Bad Request:**
```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid page size: 100. Maximum is 50.",
    "actionableHint": "Please use a pageSize between 1 and 50."
  }
}
```

**404 Not Found:**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Fund code 'INVALID-CODE' not found.",
    "actionableHint": "Please check the fund symbol and try again. Use get_rmf_funds or search_rmf_funds to find valid fund codes."
  }
}
```

**500 Internal Server Error:**
```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Failed to load fund data.",
    "actionableHint": "Please try again in a few moments. If the issue persists, contact support."
  }
}
```

---

## Validation Rules

### Common Validations

1. **Fund Code (symbol)**
   - Required for detail/history/comparison tools
   - Must exist in fund database
   - Case-insensitive matching

2. **Pagination**
   - `page`: Min 1, default 1
   - `pageSize`: Min 1, max 50, default 20
   - `limit`: Min 1, max 50, default varies by tool

3. **Risk Level**
   - Range: 0-8
   - Allow null/undefined for "any risk"

4. **Period**
   - Enum: "ytd", "3m", "6m", "1y", "3y", "5y", "10y"
   - Must be one of allowed values

5. **Sort Order**
   - Enum: "asc", "desc"
   - Default: "desc" for performance, "asc" for name

---

## Data Quality Flags

All responses include data quality metadata to inform widgets:

```typescript
dataQuality: {
  hasFeeDetails: boolean;      // Always false in MVP
  hasPartyDetails: boolean;    // Always false in MVP
  hasTopHoldings: boolean;     // Always false in MVP
  hasRiskMetrics: boolean;     // Always false in MVP
  hasErrors: boolean;          // True if errors array is non-empty
}
```

Widgets must use these flags to:
- Hide sections with unavailable data
- Show "View Factsheet PDF" fallback links
- Display appropriate "N/A" messages

---

## Performance Targets

| Tool | Target Response Time | p95 Response Time |
|------|---------------------|-------------------|
| `get_rmf_funds` | < 100ms | < 300ms |
| `search_rmf_funds` | < 150ms | < 400ms |
| `get_rmf_fund_detail` | < 50ms | < 150ms |
| `get_rmf_fund_performance` | < 100ms | < 300ms |
| `get_rmf_fund_nav_history` | < 200ms | < 500ms |
| `compare_rmf_funds` | < 150ms | < 400ms |

*(Based on in-memory data service with pre-built indexes)*

---

## Testing Requirements

Each tool must be tested with:

1. **Valid inputs** - Happy path scenarios
2. **Invalid inputs** - Zod validation errors
3. **Edge cases**:
   - Empty results
   - Null performance data
   - Missing benchmarks
   - Single fund vs multiple funds
4. **Performance** - Response time within targets
5. **Output schema** - Zod validation passes

---

## Approval & Version Control

**Version:** 1.0
**Status:** ⚠️ DRAFT - Awaiting stakeholder approval
**Approved by:** [Pending]
**Date Frozen:** [Pending]

**Change Process:**
1. Propose change with justification
2. Review impact on backend, widgets, tests
3. Get stakeholder approval
4. Increment version number
5. Update all dependent code

---

**Next Steps:**
1. Review this contract with team
2. Get formal approval
3. Mark as FROZEN
4. Proceed to implementation (Phase 1)

