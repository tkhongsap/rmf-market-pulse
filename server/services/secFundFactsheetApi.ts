/**
 * SEC Fund Factsheet API Service
 *
 * Thailand Securities and Exchange Commission (SEC) API for mutual fund factsheet data
 * API Portal: https://api-portal.sec.or.th/
 *
 * This service provides access to:
 * - Fund discovery and search
 * - Fund metadata (name, type, status, registration)
 * - Asset allocation
 * - Investment policies
 * - Fund holdings
 * - Fee structure
 *
 * Rate Limit: 3,000 API calls per 5 minutes
 */

// SEC Fund Factsheet API configuration
const SEC_API_BASE_URL = 'https://api.sec.or.th/FundFactsheet';
const SEC_FUND_FACTSHEET_KEY = process.env.SEC_FUND_FACTSHEET_KEY;

// Rate limiting: 3000 calls per 5 minutes (300 seconds)
const RATE_LIMIT_WINDOW = 300000; // 5 minutes in ms
const RATE_LIMIT_MAX_CALLS = 3000;

interface RateLimitInfo {
  calls: number[];
  lastCleanup: number;
}

const rateLimiter: RateLimitInfo = {
  calls: [],
  lastCleanup: Date.now(),
};

// Simple in-memory cache
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

const cache = new Map<string, CacheEntry<any>>();

/**
 * Check and enforce rate limiting
 */
function checkRateLimit(): boolean {
  const now = Date.now();

  // Clean up old calls outside the window
  if (now - rateLimiter.lastCleanup > 60000) { // Cleanup every minute
    rateLimiter.calls = rateLimiter.calls.filter(
      callTime => now - callTime < RATE_LIMIT_WINDOW
    );
    rateLimiter.lastCleanup = now;
  }

  // Check if we're within rate limit
  const recentCalls = rateLimiter.calls.filter(
    callTime => now - callTime < RATE_LIMIT_WINDOW
  );

  if (recentCalls.length >= RATE_LIMIT_MAX_CALLS) {
    return false; // Rate limit exceeded
  }

  rateLimiter.calls.push(now);
  return true;
}

/**
 * Get data from cache if available and not expired
 */
function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;

  const now = Date.now();
  if (now - entry.timestamp > entry.ttl) {
    cache.delete(key);
    return null;
  }

  return entry.data as T;
}

/**
 * Store data in cache with TTL
 */
function setCache<T>(key: string, data: T, ttl: number): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl,
  });
}

/**
 * Make authenticated request to SEC Fund Factsheet API
 */
async function secFundFactsheetApiRequest<T>(
  endpoint: string,
  options?: {
    cacheKey?: string;
    cacheTTL?: number;
  }
): Promise<T> {
  const { cacheKey, cacheTTL } = options || {};

  // Check cache first
  if (cacheKey && cacheTTL) {
    const cached = getFromCache<T>(cacheKey);
    if (cached) {
      console.log(`[SEC Fund Factsheet API] Cache hit for ${cacheKey}`);
      return cached;
    }
  }

  // Check if API key is configured
  if (!SEC_FUND_FACTSHEET_KEY) {
    throw new Error('SEC_FUND_FACTSHEET_KEY environment variable is not configured');
  }

  // Check rate limit
  if (!checkRateLimit()) {
    throw new Error('SEC Fund Factsheet API rate limit exceeded (3000 calls per 5 minutes)');
  }

  const url = `${SEC_API_BASE_URL}${endpoint}`;
  console.log(`[SEC Fund Factsheet API] GET ${endpoint}`);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Ocp-Apim-Subscription-Key': SEC_FUND_FACTSHEET_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'cache-control': 'no-cache',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[SEC Fund Factsheet API] Error ${response.status}: ${errorText}`);
    throw new Error(`SEC Fund Factsheet API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as T;
  console.log(`[SEC Fund Factsheet API] Response received`);

  // Cache the result
  if (cacheKey && cacheTTL) {
    setCache(cacheKey, data, cacheTTL);
  }

  return data;
}

/**
 * AMC (Asset Management Company) Data Type
 */
export interface AMCData {
  unique_id: string;        // AMC unique ID (e.g., "C0000000290")
  name_th: string;          // AMC name in Thai
  name_en: string;          // AMC name in English
  [key: string]: any;
}

/**
 * Fund Basic Info Type
 */
export interface FundBasicInfo {
  proj_id: string;          // Fund project ID (e.g., "MABAPAC-RMF")
  unique_id: string;        // AMC unique ID
  regis_id: string;         // Registration ID
  regis_date: string;       // Registration date
  cancel_date: string | null; // Cancellation date (null if active)
  proj_name_th: string;     // Fund name in Thai
  proj_name_en: string;     // Fund name in English
  proj_abbr_name: string;   // Abbreviated name
  fund_status: string;      // Status: "RG" (Registered), "CL" (Closed), etc.
  [key: string]: any;
}

/**
 * Fund Asset Allocation Type
 */
export interface FundAsset {
  asset_seq: number;
  asset_name: string;
  asset_ratio: number;
  [key: string]: any;
}

/**
 * Fetch list of Asset Management Companies
 */
export async function fetchAMCList(): Promise<AMCData[]> {
  try {
    const endpoint = '/fund/amc';

    const amcList = await secFundFactsheetApiRequest<AMCData[]>(
      endpoint,
      {
        cacheKey: 'factsheet-amc-list',
        cacheTTL: 7 * 24 * 60 * 60 * 1000, // 7 days - AMC list doesn't change often
      }
    );

    console.log(`[SEC Fund Factsheet API] Fetched ${amcList.length} AMCs`);
    return amcList;
  } catch (error) {
    console.error('Error fetching AMC list:', error);
    throw error;
  }
}

/**
 * Fetch all funds under a specific AMC
 *
 * @param amc_id AMC unique ID (e.g., "C0000000290" for Aberdeen)
 * @returns Array of fund basic info
 */
export async function fetchFundsByAMC(amc_id: string): Promise<FundBasicInfo[]> {
  try {
    const endpoint = `/fund/amc/${amc_id}`;

    const funds = await secFundFactsheetApiRequest<FundBasicInfo[]>(
      endpoint,
      {
        cacheKey: `factsheet-amc-funds-${amc_id}`,
        cacheTTL: 24 * 60 * 60 * 1000, // 24 hours
      }
    );

    console.log(`[SEC Fund Factsheet API] Fetched ${funds.length} funds for AMC ${amc_id}`);
    return funds;
  } catch (error) {
    console.error(`Error fetching funds for AMC ${amc_id}:`, error);
    throw error;
  }
}

/**
 * Fetch asset allocation for a specific fund
 *
 * @param proj_id Fund project ID
 * @returns Array of asset allocation data
 */
export async function fetchFundAssets(proj_id: string): Promise<FundAsset[]> {
  try {
    const endpoint = `/fund/${proj_id}/asset`;

    const assets = await secFundFactsheetApiRequest<FundAsset[]>(
      endpoint,
      {
        cacheKey: `factsheet-fund-assets-${proj_id}`,
        cacheTTL: 24 * 60 * 60 * 1000, // 24 hours
      }
    );

    console.log(`[SEC Fund Factsheet API] Fetched ${assets.length} asset allocations for ${proj_id}`);
    return assets;
  } catch (error) {
    console.error(`Error fetching assets for fund ${proj_id}:`, error);
    throw error;
  }
}

/**
 * Search for funds by name
 *
 * @param query Search query (fund name, partial name, etc.)
 * @returns Array of matching funds
 */
export async function searchFunds(query: string): Promise<FundBasicInfo[]> {
  try {
    // Get all AMCs
    const amcs = await fetchAMCList();

    const allFunds: FundBasicInfo[] = [];
    const searchTerm = query.toUpperCase();

    // Search through each AMC's funds
    for (const amc of amcs) {
      try {
        const funds = await fetchFundsByAMC(amc.unique_id);

        // Filter funds matching the search query
        const matchingFunds = funds.filter(fund =>
          fund.proj_name_en?.toUpperCase().includes(searchTerm) ||
          fund.proj_name_th?.includes(query) ||
          fund.proj_id?.toUpperCase().includes(searchTerm) ||
          fund.proj_abbr_name?.toUpperCase().includes(searchTerm)
        );

        allFunds.push(...matchingFunds);
      } catch (error) {
        // Continue searching other AMCs even if one fails
        console.warn(`Skipping AMC ${amc.unique_id} due to error`);
      }
    }

    console.log(`[SEC Fund Factsheet API] Search for "${query}" found ${allFunds.length} results`);
    return allFunds;
  } catch (error) {
    console.error(`Error searching for funds with query "${query}":`, error);
    throw error;
  }
}

/**
 * Search for funds by AMC name (faster than searching all funds)
 *
 * @param amcName AMC name or partial name
 * @param fundQuery Optional fund name filter
 * @returns Array of matching funds
 */
export async function searchFundsByAMC(
  amcName: string,
  fundQuery?: string
): Promise<FundBasicInfo[]> {
  try {
    // Get all AMCs and filter by name
    const amcs = await fetchAMCList();
    const searchTerm = amcName.toUpperCase();

    const matchingAMCs = amcs.filter(amc =>
      amc.name_en?.toUpperCase().includes(searchTerm) ||
      amc.name_th?.includes(amcName)
    );

    if (matchingAMCs.length === 0) {
      console.log(`[SEC Fund Factsheet API] No AMCs found matching "${amcName}"`);
      return [];
    }

    const allFunds: FundBasicInfo[] = [];

    // Get funds from matching AMCs
    for (const amc of matchingAMCs) {
      try {
        const funds = await fetchFundsByAMC(amc.unique_id);

        // Apply additional fund filter if provided
        if (fundQuery) {
          const fundSearchTerm = fundQuery.toUpperCase();
          const filteredFunds = funds.filter(fund =>
            fund.proj_name_en?.toUpperCase().includes(fundSearchTerm) ||
            fund.proj_name_th?.includes(fundQuery) ||
            fund.proj_id?.toUpperCase().includes(fundSearchTerm)
          );
          allFunds.push(...filteredFunds);
        } else {
          allFunds.push(...funds);
        }
      } catch (error) {
        console.warn(`Error fetching funds for AMC ${amc.unique_id}`);
      }
    }

    console.log(`[SEC Fund Factsheet API] Found ${allFunds.length} funds for AMC "${amcName}"`);
    return allFunds;
  } catch (error) {
    console.error(`Error searching funds by AMC "${amcName}":`, error);
    throw error;
  }
}

// ====================================================================
// PERFORMANCE & BENCHMARK DATA
// ====================================================================

/**
 * Fund Performance Data Type
 */
export interface FundPerformance {
  ytd: number | null;           // Year-to-date return %
  threeMonth: number | null;    // 3-month return %
  sixMonth: number | null;      // 6-month return %
  oneYear: number | null;       // 1-year return %
  threeYear: number | null;     // 3-year annualized return %
  fiveYear: number | null;      // 5-year annualized return %
  tenYear: number | null;       // 10-year annualized return %
  sinceInception: number | null; // Since inception return %
}

/**
 * Benchmark Data Type
 */
export interface BenchmarkData {
  name: string;                 // Benchmark name
  indexCode: string | null;     // Index code
  returns: FundPerformance;     // Benchmark returns
}

/**
 * Volatility Metrics Type
 */
export interface VolatilityMetrics {
  standardDeviation: number | null;  // 5-year standard deviation %
  maxDrawdown: number | null;        // Maximum loss in 5 years %
  volatility: number | null;         // Volatility measure
}

/**
 * Tracking Error Type
 */
export interface TrackingError {
  oneYear: number | null;       // 1-year tracking error %
  description: string | null;   // Explanation
}

/**
 * Fund Comparison Data Type
 */
export interface FundCompareData {
  category: string | null;      // Fund category for comparison
  categoryCode: string | null;  // Category code
  peerGroup: string | null;     // Peer group classification
}

/**
 * Fetch historical performance data for a fund
 *
 * @param proj_id Fund project ID (e.g., "M0774_2554")
 * @returns Performance metrics across different time periods
 */
export async function fetchFundPerformance(proj_id: string): Promise<FundPerformance | null> {
  try {
    const endpoint = `/fund/${proj_id}/performance`;

    const rawData = await secFundFactsheetApiRequest<any[]>(
      endpoint,
      {
        cacheKey: `factsheet-performance-${proj_id}`,
        cacheTTL: 24 * 60 * 60 * 1000, // 24 hours
      }
    );

    if (!Array.isArray(rawData) || rawData.length === 0) {
      console.log(`[SEC Fund Factsheet API] No performance data for ${proj_id}`);
      return null;
    }

    // Filter for fund returns (ผลตอบแทนกองทุนรวม)
    const fundReturns = rawData.filter(item =>
      item.performance_type_desc === 'ผลตอบแทนกองทุนรวม'
    );

    // Helper function to find value by reference period
    const findValue = (period: string): number | null => {
      const item = fundReturns.find(r => r.reference_period === period);
      return item?.performance_val ? parseFloat(item.performance_val) : null;
    };

    const performance: FundPerformance = {
      ytd: findValue('year to date'),
      threeMonth: findValue('3 months'),
      sixMonth: findValue('6 months'),
      oneYear: findValue('1 year'),
      threeYear: findValue('3 years'),
      fiveYear: findValue('5 years'),
      tenYear: findValue('10 years'),
      sinceInception: findValue('inception date'),
    };

    console.log(`[SEC Fund Factsheet API] Fetched performance data for ${proj_id}`);
    return performance;
  } catch (error) {
    console.error(`Error fetching performance for fund ${proj_id}:`, error);
    return null;
  }
}

/**
 * Fetch benchmark data for a fund
 *
 * @param proj_id Fund project ID
 * @returns Benchmark information and returns
 */
export async function fetchFundBenchmark(proj_id: string): Promise<BenchmarkData | null> {
  try {
    // Fetch benchmark name
    const benchmarkEndpoint = `/fund/${proj_id}/benchmark`;
    const benchmarkData = await secFundFactsheetApiRequest<any[]>(
      benchmarkEndpoint,
      {
        cacheKey: `factsheet-benchmark-name-${proj_id}`,
        cacheTTL: 24 * 60 * 60 * 1000, // 24 hours
      }
    );

    if (!Array.isArray(benchmarkData) || benchmarkData.length === 0) {
      console.log(`[SEC Fund Factsheet API] No benchmark assigned for ${proj_id}`);
      return null;
    }

    const benchmarkName = benchmarkData[0]?.benchmark || 'Unknown';

    // Fetch performance data to get benchmark returns
    const performanceEndpoint = `/fund/${proj_id}/performance`;
    const performanceData = await secFundFactsheetApiRequest<any[]>(
      performanceEndpoint,
      {
        cacheKey: `factsheet-performance-${proj_id}`,
        cacheTTL: 24 * 60 * 60 * 1000, // 24 hours
      }
    );

    // Filter for benchmark returns (ผลตอบแทนตัวชี้วัด)
    const benchmarkReturns = performanceData.filter(item =>
      item.performance_type_desc === 'ผลตอบแทนตัวชี้วัด'
    );

    // Helper function to find value by reference period
    const findValue = (period: string): number | null => {
      const item = benchmarkReturns.find(r => r.reference_period === period);
      return item?.performance_val ? parseFloat(item.performance_val) : null;
    };

    const benchmark: BenchmarkData = {
      name: benchmarkName,
      indexCode: null, // Not provided in API response
      returns: {
        ytd: findValue('year to date'),
        threeMonth: findValue('3 months'),
        sixMonth: findValue('6 months'),
        oneYear: findValue('1 year'),
        threeYear: findValue('3 years'),
        fiveYear: findValue('5 years'),
        tenYear: findValue('10 years'),
        sinceInception: findValue('inception date'),
      },
    };

    console.log(`[SEC Fund Factsheet API] Fetched benchmark data for ${proj_id}`);
    return benchmark;
  } catch (error) {
    console.error(`Error fetching benchmark for fund ${proj_id}:`, error);
    return null;
  }
}

/**
 * Fetch volatility and risk metrics for a fund
 *
 * @param proj_id Fund project ID
 * @returns Standard deviation, max drawdown, and volatility metrics
 */
export async function fetchFund5YearLost(proj_id: string): Promise<VolatilityMetrics | null> {
  try {
    // Get standard deviation from performance endpoint
    const performanceEndpoint = `/fund/${proj_id}/performance`;
    const performanceData = await secFundFactsheetApiRequest<any[]>(
      performanceEndpoint,
      {
        cacheKey: `factsheet-performance-${proj_id}`,
        cacheTTL: 24 * 60 * 60 * 1000, // 24 hours
      }
    );

    if (!Array.isArray(performanceData) || performanceData.length === 0) {
      console.log(`[SEC Fund Factsheet API] No volatility data available for ${proj_id}`);
      return null;
    }

    // Filter for fund volatility (ความผันผวนของกองทุนรวม = Standard Deviation)
    const fundVolatility = performanceData.filter(item =>
      item.performance_type_desc === 'ความผันผวนของกองทุนรวม'
    );

    // Helper function to find value by reference period
    const findValue = (period: string): number | null => {
      const item = fundVolatility.find(r => r.reference_period === period);
      return item?.performance_val ? parseFloat(item.performance_val) : null;
    };

    // Use 1-year standard deviation as the primary metric
    // (5-year, 3-year, and 10-year are also available if needed)
    const oneYearSD = findValue('1 year');
    const threeYearSD = findValue('3 years');
    const fiveYearSD = findValue('5 years');

    // Use whichever is available, preferring 5-year, then 3-year, then 1-year
    const standardDeviation = fiveYearSD ?? threeYearSD ?? oneYearSD;

    if (standardDeviation === null) {
      console.log(`[SEC Fund Factsheet API] No standard deviation data for ${proj_id}`);
      return null;
    }

    const volatility: VolatilityMetrics = {
      standardDeviation,
      maxDrawdown: null, // Not available in API
      volatility: standardDeviation, // Using SD as volatility measure
    };

    console.log(`[SEC Fund Factsheet API] Fetched volatility data for ${proj_id}`);
    return volatility;
  } catch (error) {
    console.error(`Error fetching volatility for fund ${proj_id}:`, error);
    return null;
  }
}

/**
 * Fetch tracking error for a fund
 *
 * @param proj_id Fund project ID
 * @returns Tracking error vs benchmark (1 year)
 */
export async function fetchFundTrackingError(proj_id: string): Promise<TrackingError | null> {
  try {
    const endpoint = `/fund/${proj_id}/FundTrackingError`;

    const rawData = await secFundFactsheetApiRequest<any[]>(
      endpoint,
      {
        cacheKey: `factsheet-tracking-error-${proj_id}`,
        cacheTTL: 24 * 60 * 60 * 1000, // 24 hours
      }
    );

    if (!Array.isArray(rawData) || rawData.length === 0) {
      console.log(`[SEC Fund Factsheet API] No tracking error data for ${proj_id}`);
      return null;
    }

    const trackingErrorPercent = rawData[0]?.tracking_error_percent;

    // Parse tracking error
    const trackingError: TrackingError = {
      oneYear: trackingErrorPercent ? parseFloat(trackingErrorPercent) : null,
      description: null, // Not provided in API response
    };

    console.log(`[SEC Fund Factsheet API] Fetched tracking error for ${proj_id}`);
    return trackingError;
  } catch (error) {
    console.error(`Error fetching tracking error for fund ${proj_id}:`, error);
    return null;
  }
}

/**
 * Fetch fund comparison/category data
 *
 * @param proj_id Fund project ID
 * @returns Fund category and peer group information
 */
export async function fetchFundCompare(proj_id: string): Promise<FundCompareData | null> {
  try {
    const endpoint = `/fund/${proj_id}/fund_compare`;

    const rawData = await secFundFactsheetApiRequest<any>(
      endpoint,
      {
        cacheKey: `factsheet-compare-${proj_id}`,
        cacheTTL: 24 * 60 * 60 * 1000, // 24 hours
      }
    );

    if (!rawData || Object.keys(rawData).length === 0) {
      console.log(`[SEC Fund Factsheet API] No comparison data for ${proj_id}`);
      return null;
    }

    // Parse comparison data
    const compareData: FundCompareData = {
      category: rawData?.fund_compare || null, // e.g., "AEJ" (Asia ex-Japan Equity)
      categoryCode: rawData?.fund_compare || null,
      peerGroup: rawData?.fund_compare || null,
    };

    console.log(`[SEC Fund Factsheet API] Fetched comparison data for ${proj_id}`);
    return compareData;
  } catch (error) {
    console.error(`Error fetching comparison data for fund ${proj_id}:`, error);
    return null;
  }
}

/**
 * Test API connectivity
 */
export async function testApiConnection(): Promise<boolean> {
  try {
    if (!SEC_FUND_FACTSHEET_KEY) {
      console.error('[SEC Fund Factsheet API] API key not configured');
      return false;
    }

    // Try to fetch AMC list as a simple connectivity test
    await fetchAMCList();
    console.log('[SEC Fund Factsheet API] Connection test successful');
    return true;
  } catch (error) {
    console.error('[SEC Fund Factsheet API] Connection test failed:', error);
    return false;
  }
}

/**
 * Clear the cache (useful for testing or manual refresh)
 */
export function clearCache(): void {
  cache.clear();
  console.log('[SEC Fund Factsheet API] Cache cleared');
}
