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
