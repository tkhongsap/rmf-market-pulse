import { z } from "zod";

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
