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
