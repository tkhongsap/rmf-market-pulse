import { z } from "zod";

// Asset allocation for RMF funds
export const assetAllocationSchema = z.object({
  assetType: z.string(), // e.g., "Equity", "Bond", "Cash"
  percentage: z.number(),
});

export type AssetAllocation = z.infer<typeof assetAllocationSchema>;

// Fund holding information
export const fundHoldingSchema = z.object({
  securityName: z.string(),
  percentage: z.number(),
  marketValue: z.number().optional(),
});

export type FundHolding = z.infer<typeof fundHoldingSchema>;

// SET SMART API raw response for Unit Trust (Mutual Fund)
export const setSMARTUnitTrustSchema = z.object({
  date: z.string(), // Trading date in YYYY-MM-DD format
  symbol: z.string(), // Fund symbol/code
  securityType: z.string(), // Should be "UT" for Unit Trust
  adjustedPriceFlag: z.string(), // "Y" or "N"
  prior: z.number().nullable(), // Prior NAV
  open: z.number().nullable(),
  high: z.number().nullable(),
  low: z.number().nullable(),
  close: z.number().nullable(), // Current NAV
  average: z.number().nullable(),
  aomVolume: z.number().nullable(),
  aomValue: z.number().nullable(),
  trVolume: z.number().nullable(),
  trValue: z.number().nullable(),
  totalVolume: z.number().nullable(),
  totalValue: z.number().nullable(),
  pe: z.number().nullable(), // Usually null for Unit Trusts
  pbv: z.number().nullable(), // P/NAV for Unit Trusts
  bvps: z.number().nullable(), // NAV for Unit Trusts (Book Value Per Share)
  dividendYield: z.number().nullable(),
  marketCap: z.number().nullable(),
  volumeTurnover: z.number().nullable(),
});

export type SETSMARTUnitTrust = z.infer<typeof setSMARTUnitTrustSchema>;

// RMF (Retirement Mutual Fund) data - mapped from SET SMART API
export const rmfFundSchema = z.object({
  symbol: z.string(), // Fund symbol/code (e.g., "SCBRMMONEY")
  fundName: z.string(), // Display name (derived from symbol or separate lookup)
  securityType: z.string(), // "UT" for Unit Trust
  nav: z.number(), // Net Asset Value (from bvps field)
  navChange: z.number(), // Calculated from close - prior
  navChangePercent: z.number(), // Calculated percentage
  navDate: z.string(), // Date in YYYY-MM-DD format
  priorNav: z.number().nullable(), // Prior NAV
  pnav: z.number().nullable(), // P/NAV ratio (from pbv field)
  totalVolume: z.number().nullable(), // Trading volume
  totalValue: z.number().nullable(), // Trading value in Baht
  dividendYield: z.number().nullable(),
  lastUpdate: z.string(),
});

export type RMFFund = z.infer<typeof rmfFundSchema>;

// API response types for RMF
export const rmfFundsResponseSchema = z.object({
  funds: z.array(rmfFundSchema),
  total: z.number(),
  page: z.number().optional(),
  pageSize: z.number().optional(),
  timestamp: z.string(),
});

export const rmfFundDetailResponseSchema = z.object({
  fund: rmfFundSchema,
  timestamp: z.string(),
});

export type RMFFundsResponse = z.infer<typeof rmfFundsResponseSchema>;
export type RMFundDetailResponse = z.infer<typeof rmfFundDetailResponseSchema>;

// SETSmart API - Stock Quote Response (EOD Price endpoints)
export const setsmartStockQuoteSchema = z.object({
  date: z.string(), // Trading date in YYYY-MM-DD format
  symbol: z.string(), // Stock symbol (e.g., "PTT", "AOT")
  securityType: z.string(), // CS, PS, W, ETF, etc.
  adjustedPriceFlag: z.string(), // "Y" or "N"
  prior: z.number().nullable(), // Previous closing price
  open: z.number().nullable(), // Opening price
  high: z.number().nullable(), // Highest price
  low: z.number().nullable(), // Lowest price
  close: z.number().nullable(), // Closing price
  average: z.number().nullable(), // Average price
  aomVolume: z.number().nullable(), // AOM trading volume
  aomValue: z.number().nullable(), // AOM trading value
  trVolume: z.number().nullable(), // Through trade volume
  trValue: z.number().nullable(), // Through trade value
  totalVolume: z.number().nullable(), // Total trading volume
  totalValue: z.number().nullable(), // Total trading value
  pe: z.number().nullable(), // Price-to-Earnings ratio
  pbv: z.number().nullable(), // Price-to-Book Value ratio
  bvps: z.number().nullable(), // Book Value Per Share
  dividendYield: z.number().nullable(), // Dividend yield percentage
  marketCap: z.number().nullable(), // Market capitalization
  volumeTurnover: z.number().nullable(), // Volume turnover ratio
});

export type SETSmartStockQuote = z.infer<typeof setsmartStockQuoteSchema>;

// SETSmart API - Financial Data Response
export const setsmartFinancialDataSchema = z.object({
  symbol: z.string(), // Company symbol
  year: z.string(), // Fiscal year (YYYY)
  quarter: z.string(), // Quarter (1-4)
  financialStatementType: z.string(), // C=Consolidated, S=Separate
  dateAsof: z.string(), // Date in YYYY-MM-DD format
  accountPeriod: z.string(), // F=Fiscal Year, C=Calendar Year
  // Balance Sheet (in Thousand Baht)
  totalAssets: z.number().nullable(),
  totalLiabilities: z.number().nullable(),
  paidupShareCapital: z.number().nullable(),
  shareholderEquity: z.number().nullable(),
  totalEquity: z.number().nullable(),
  // Income Statement (in Thousand Baht)
  totalRevenueQuarter: z.number().nullable(), // Revenue for the quarter
  totalRevenueAccum: z.number().nullable(), // Accumulated revenue (YTD)
  ebitQuarter: z.number().nullable(), // EBIT for the quarter
  ebitAccum: z.number().nullable(), // Accumulated EBIT (YTD)
  netProfitQuarter: z.number().nullable(), // Net profit for the quarter
  netProfitAccum: z.number().nullable(), // Accumulated net profit (YTD)
  // Per Share Metrics
  epsQuarter: z.number().nullable(), // Earnings Per Share (quarter)
  epsAccum: z.number().nullable(), // Earnings Per Share (accumulated)
  // Financial Ratios
  roe: z.number().nullable(), // Return on Equity (%)
  roa: z.number().nullable(), // Return on Assets (%)
  de: z.number().nullable(), // Debt to Equity ratio
  fixedAssetTurnover: z.number().nullable(), // Fixed asset turnover
  totalAssetTurnover: z.number().nullable(), // Total asset turnover
});

export type SETSmartFinancialData = z.infer<typeof setsmartFinancialDataSchema>;

// ====================================================================
// FUND PERFORMANCE & BENCHMARK DATA (SEC Fund Factsheet API)
// ====================================================================

/**
 * Fund Performance Schema
 * Returns across different time periods
 */
export const fundPerformanceSchema = z.object({
  ytd: z.number().nullable(), // Year-to-date return %
  threeMonth: z.number().nullable(), // 3-month return %
  sixMonth: z.number().nullable(), // 6-month return %
  oneYear: z.number().nullable(), // 1-year return %
  threeYear: z.number().nullable(), // 3-year annualized return %
  fiveYear: z.number().nullable(), // 5-year annualized return %
  tenYear: z.number().nullable(), // 10-year annualized return %
  sinceInception: z.number().nullable(), // Since inception return %
});

export type FundPerformance = z.infer<typeof fundPerformanceSchema>;

/**
 * Benchmark Data Schema
 * Benchmark information and returns
 */
export const benchmarkDataSchema = z.object({
  name: z.string(), // Benchmark name (e.g., "MSCI AC Asia Pacific ex Japan")
  indexCode: z.string().nullable(), // Index code
  returns: fundPerformanceSchema, // Benchmark returns across time periods
});

export type BenchmarkData = z.infer<typeof benchmarkDataSchema>;

/**
 * Volatility Metrics Schema
 * Risk and volatility measurements
 */
export const volatilityMetricsSchema = z.object({
  standardDeviation: z.number().nullable(), // 5-year standard deviation %
  maxDrawdown: z.number().nullable(), // Maximum loss in 5 years %
  volatility: z.number().nullable(), // Volatility measure
});

export type VolatilityMetrics = z.infer<typeof volatilityMetricsSchema>;

/**
 * Tracking Error Schema
 * Measures how closely fund follows benchmark
 */
export const trackingErrorSchema = z.object({
  oneYear: z.number().nullable(), // 1-year tracking error %
  description: z.string().nullable(), // Explanation
});

export type TrackingError = z.infer<typeof trackingErrorSchema>;

/**
 * Fund Comparison Data Schema
 * Category and peer group classification
 */
export const fundCompareDataSchema = z.object({
  category: z.string().nullable(), // Fund category for comparison
  categoryCode: z.string().nullable(), // Category code
  peerGroup: z.string().nullable(), // Peer group classification
});

export type FundCompareData = z.infer<typeof fundCompareDataSchema>;

/**
 * Extended RMF Fund Detail Schema
 * Includes performance, benchmark, and volatility data
 */
export const rmfFundDetailSchema = rmfFundSchema.extend({
  // Performance metrics
  performance: fundPerformanceSchema.nullable().optional(),
  benchmark: benchmarkDataSchema.nullable().optional(),
  volatility: volatilityMetricsSchema.nullable().optional(),
  trackingError: trackingErrorSchema.nullable().optional(),
  compareData: fundCompareDataSchema.nullable().optional(),

  // Additional fund metadata from SEC API
  projId: z.string().optional(), // SEC Project ID (e.g., "M0774_2554")
  amcId: z.string().optional(), // AMC unique ID
  registrationId: z.string().optional(),
  registrationDate: z.string().optional(),
  fundStatus: z.string().optional(), // "RG" (Registered), "CL" (Closed), etc.
  assetAllocation: z.array(assetAllocationSchema).optional(),
  topHoldings: z.array(fundHoldingSchema).optional(),
});

export type RMFFundDetail = z.infer<typeof rmfFundDetailSchema>;

/**
 * API Response for RMF Fund Detail with Performance Data
 */
export const rmfFundDetailWithPerformanceResponseSchema = z.object({
  fund: rmfFundDetailSchema,
  timestamp: z.string(),
});

export type RMFFundDetailWithPerformanceResponse = z.infer<typeof rmfFundDetailWithPerformanceResponseSchema>;

// ====================================================================
// USER SCHEMA (for authentication - not used in RMF MVP)
// ====================================================================

export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
  password: z.string(),
});

export const insertUserSchema = userSchema.omit({ id: true });

export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

// ====================================================================
// MCP-SPECIFIC SCHEMAS (for ChatGPT OpenAI App SDK Integration)
// ====================================================================

/**
 * MCP Fund Summary Schema
 * Lightweight fund data for list views (used by get_rmf_funds, search_rmf_funds, get_rmf_fund_performance)
 */
export const mcpFundSummarySchema = z.object({
  symbol: z.string(),
  fundName: z.string(),
  amc: z.string(),
  classification: z.string().nullable(),
  riskLevel: z.number(), // 0-8
  nav: z.object({
    value: z.number(),
    date: z.string(), // YYYY-MM-DD
    change: z.number(),
    changePercent: z.number(),
  }),
  performance: z.object({
    ytd: z.number().nullable(),
    threeMonth: z.number().nullable(),
    sixMonth: z.number().nullable(),
    oneYear: z.number().nullable(),
    threeYear: z.number().nullable(),
    fiveYear: z.number().nullable(),
  }),
  benchmarkName: z.string().nullable(),
});

export type MCPFundSummary = z.infer<typeof mcpFundSummarySchema>;

/**
 * MCP Fund Detail Schema
 * Complete fund data for detail view (used by get_rmf_fund_detail)
 */
export const mcpFundDetailSchema = z.object({
  // Basic Info
  fundId: z.string(),
  symbol: z.string(),
  fundName: z.string(),
  amc: z.string(),

  // Metadata
  metadata: z.object({
    classification: z.string().nullable(),
    managementStyle: z.string(),
    dividendPolicy: z.string(),
    riskLevel: z.number(),
    fundType: z.string(), // "RMF"
  }),

  // Latest NAV
  latestNav: z.object({
    navDate: z.string(), // YYYY-MM-DD
    value: z.number(),
    change: z.number(),
    changePercent: z.number(),
    netAsset: z.number(),
    buyPrice: z.number(),
    sellPrice: z.number(),
  }),

  // Performance
  performance: z.object({
    ytd: z.number().nullable(),
    threeMonth: z.number().nullable(),
    sixMonth: z.number().nullable(),
    oneYear: z.number().nullable(),
    threeYear: z.number().nullable(),
    fiveYear: z.number().nullable(),
    tenYear: z.number().nullable(),
    sinceInception: z.number().nullable(),
  }),

  // Benchmark
  benchmark: z.object({
    name: z.string(),
    returns: z.object({
      ytd: z.number().nullable(),
      threeMonth: z.number().nullable(),
      sixMonth: z.number().nullable(),
      oneYear: z.number().nullable(),
      threeYear: z.number().nullable(),
      fiveYear: z.number().nullable(),
      tenYear: z.number().nullable(),
    }),
  }).nullable(),

  // Asset Allocation
  assetAllocation: z.array(z.object({
    assetClass: z.string(), // Thai language
    percentage: z.number(),
  })),

  // Dividends
  dividends: z.array(z.object({
    exDate: z.string().nullable(),
    payDate: z.string().nullable(),
    amount: z.number().nullable(),
  })),

  // Documents
  documentUrls: z.object({
    factsheetUrl: z.string().nullable(),
    annualReportUrl: z.string().nullable(),
    halfyearReportUrl: z.string().nullable(),
  }),

  // Investment Minimums
  investmentMinimums: z.object({
    minimumInitial: z.string().nullable(),
    minimumAdditional: z.string().nullable(),
    minimumRedemption: z.string().nullable(),
    minimumBalance: z.string().nullable(),
  }),

  // Data Quality Flags
  dataQuality: z.object({
    hasFeeDetails: z.boolean(),
    hasPartyDetails: z.boolean(),
    hasTopHoldings: z.boolean(),
    hasRiskMetrics: z.boolean(),
    hasErrors: z.boolean(),
  }),

  errors: z.array(z.string()),
});

export type MCPFundDetail = z.infer<typeof mcpFundDetailSchema>;

/**
 * MCP NAV History Schema
 * NAV data points for charting (used by get_rmf_fund_nav_history)
 */
export const mcpNavHistoryPointSchema = z.object({
  date: z.string(), // YYYY-MM-DD
  nav: z.number(),
  change: z.number(), // Daily change
  changePercent: z.number(), // Daily change %
});

export const mcpNavHistorySchema = z.object({
  fundCode: z.string(),
  fundName: z.string(),
  navHistory: z.array(mcpNavHistoryPointSchema),
  periodStats: z.object({
    startDate: z.string(),
    endDate: z.string(),
    startNav: z.number(),
    endNav: z.number(),
    periodReturn: z.number(), // Total return over period
    periodReturnPercent: z.number(),
    volatility: z.number().nullable(), // Standard deviation
    minNav: z.number(),
    maxNav: z.number(),
    avgNav: z.number(),
  }),
});

export type MCPNavHistory = z.infer<typeof mcpNavHistorySchema>;
export type MCPNavHistoryPoint = z.infer<typeof mcpNavHistoryPointSchema>;

/**
 * MCP Comparison Schema
 * Data for side-by-side fund comparison (used by compare_rmf_funds)
 */
export const mcpComparisonFundSchema = z.object({
  symbol: z.string(),
  fundName: z.string(),
  amc: z.string(),
  riskLevel: z.number(),

  nav: z.object({
    value: z.number(),
    date: z.string(),
    changePercent: z.number(),
  }),

  performance: z.object({
    ytd: z.number().nullable(),
    oneYear: z.number().nullable(),
    threeYear: z.number().nullable(),
    fiveYear: z.number().nullable(),
  }),

  benchmark: z.object({
    name: z.string(),
    ytdReturn: z.number().nullable(),
    oneYearReturn: z.number().nullable(),
  }).nullable(),

  fees: z.object({
    frontEndFee: z.string().nullable(), // Thai description
    backEndFee: z.string().nullable(),
    managementFee: z.string().nullable(),
    hasFeeDetails: z.boolean(),
  }),

  minimumInvestment: z.object({
    initial: z.string().nullable(),
    additional: z.string().nullable(),
  }),

  assetAllocation: z.array(z.object({
    assetClass: z.string(),
    percentage: z.number(),
  })),
});

export const mcpComparisonSchema = z.object({
  funds: z.array(mcpComparisonFundSchema).min(2).max(5),
  comparisonMetrics: z.object({
    bestYtdReturn: z.object({symbol: z.string(), value: z.number()}),
    lowestRisk: z.object({symbol: z.string(), value: z.number()}),
    lowestMinimumInvestment: z.object({symbol: z.string(), value: z.string()}),
  }),
});

export type MCPComparisonFund = z.infer<typeof mcpComparisonFundSchema>;
export type MCPComparison = z.infer<typeof mcpComparisonSchema>;

/**
 * MCP Tool Response Base Schema
 * Standard wrapper for all MCP tool responses
 */
export const mcpToolResponseSchema = z.object({
  content: z.array(z.object({
    type: z.literal("text"),
    text: z.string(),
  })),
  structuredContent: z.any(), // Varies by tool - validated by specific schemas
  _meta: z.object({
    "openai/outputTemplate": z.string().optional(), // Widget component URL
    timestamp: z.string(), // ISO 8601
  }).passthrough(), // Allow additional meta fields
});

export type MCPToolResponse = z.infer<typeof mcpToolResponseSchema>;

/**
 * MCP Error Response Schema
 * Standard error format for all MCP tools
 */
export const mcpErrorResponseSchema = z.object({
  error: z.object({
    code: z.enum(["BAD_REQUEST", "NOT_FOUND", "INTERNAL_ERROR"]),
    message: z.string(),
    actionableHint: z.string(),
    details: z.any().optional(),
  }),
});

export type MCPErrorResponse = z.infer<typeof mcpErrorResponseSchema>;
