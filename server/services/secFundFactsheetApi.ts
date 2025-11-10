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
