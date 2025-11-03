import { z } from "zod";

// User types (for storage layer - currently unused)
export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
});

export const insertUserSchema = userSchema.omit({ id: true });

export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Commodity price data
export const commoditySchema = z.object({
  symbol: z.string(),
  name: z.string(),
  price: z.number(),
  change: z.number(),
  changePercent: z.number(),
  currency: z.string(),
  unit: z.string().optional(),
  lastUpdate: z.string(),
});

export type Commodity = z.infer<typeof commoditySchema>;

// Forex data
export const forexSchema = z.object({
  pair: z.string(),
  name: z.string(),
  rate: z.number(),
  change: z.number(),
  changePercent: z.number(),
  lastUpdate: z.string(),
});

export type Forex = z.infer<typeof forexSchema>;

// API response types
export const commoditiesResponseSchema = z.object({
  commodities: z.array(commoditySchema),
  timestamp: z.string(),
});

export const forexResponseSchema = z.object({
  pairs: z.array(forexSchema),
  timestamp: z.string(),
});

export type CommoditiesResponse = z.infer<typeof commoditiesResponseSchema>;
export type ForexResponse = z.infer<typeof forexResponseSchema>;

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

// RMF (Retirement Mutual Fund) data
export const rmfFundSchema = z.object({
  fundCode: z.string(), // e.g., "SCBRMMONEY"
  fundName: z.string(),
  fundNameEn: z.string().optional(),
  amcName: z.string(), // Asset Management Company
  fundType: z.string(), // e.g., "Equity", "Fixed Income", "Mixed"
  riskLevel: z.number().min(1).max(8), // 1 (lowest) to 8 (highest)
  nav: z.number(), // Net Asset Value
  navChange: z.number(),
  navChangePercent: z.number(),
  navDate: z.string(),
  // Performance metrics
  ytdReturn: z.number().optional(),
  return1Y: z.number().optional(),
  return3Y: z.number().optional(),
  return5Y: z.number().optional(),
  // Holdings data
  assetAllocation: z.array(assetAllocationSchema).optional(),
  topHoldings: z.array(fundHoldingSchema).optional(),
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
