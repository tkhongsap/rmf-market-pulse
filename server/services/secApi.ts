import type { RMFFund, AssetAllocation, FundHolding } from '@shared/schema';

// Thailand SEC API configuration
const SEC_API_BASE_URL = 'https://api.sec.or.th';
const SEC_API_KEY = process.env.SEC_API_KEY;

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
 * Make authenticated request to SEC API
 */
async function secApiRequest<T>(endpoint: string, cacheKey?: string, cacheTTL?: number): Promise<T> {
  // Check cache first
  if (cacheKey && cacheTTL) {
    const cached = getFromCache<T>(cacheKey);
    if (cached) {
      console.log(`[SEC API] Cache hit for ${cacheKey}`);
      return cached;
    }
  }

  // Check if API key is configured
  if (!SEC_API_KEY) {
    throw new Error('SEC_API_KEY environment variable is not configured');
  }

  // Check rate limit
  if (!checkRateLimit()) {
    throw new Error('SEC API rate limit exceeded (3000 calls per 5 minutes)');
  }

  const url = `${SEC_API_BASE_URL}${endpoint}`;
  console.log(`[SEC API] Fetching: ${endpoint}`);

  const response = await fetch(url, {
    headers: {
      'Ocp-Apim-Subscription-Key': SEC_API_KEY,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`SEC API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as T;

  // Cache the result
  if (cacheKey && cacheTTL) {
    setCache(cacheKey, data, cacheTTL);
  }

  return data;
}

/**
 * SEC API response types (based on their actual API structure)
 */
interface SECFundFactSheet {
  proj_id: string;
  proj_abbr_name: string;
  proj_name_th: string;
  proj_name_en?: string;
  management_company: string;
  policy_type?: string;
  risk_spectrum?: number;
}

interface SECFundDailyInfo {
  proj_id: string;
  nav_date: string;
  nav: number;
  prior_nav?: number;
}

interface SECFundPortfolio {
  proj_id: string;
  as_of_date: string;
  asset_type: string;
  asset_percent: number;
}

interface SECFundTopHolding {
  security_name: string;
  market_value: number;
  percent_nav: number;
}

/**
 * Fetch all RMF funds from SEC API
 */
export async function fetchRMFFunds(options?: {
  page?: number;
  pageSize?: number;
  fundType?: string;
}): Promise<{ funds: RMFFund[]; total: number }> {
  const { page = 1, pageSize = 20, fundType } = options || {};

  try {
    // Fetch fund factsheets (cached for 24 hours)
    const factSheets = await secApiRequest<SECFundFactSheet[]>(
      '/FundFactSheet',
      'fund-factsheets',
      24 * 60 * 60 * 1000 // 24 hours
    );

    // Filter for RMF funds only
    const rmfFactSheets = factSheets.filter(fund =>
      fund.proj_id.includes('RMF') ||
      fund.proj_abbr_name.includes('RMF') ||
      fund.proj_name_th.includes('เพื่อการเลี้ยงชีพ')
    );

    // Apply fund type filter if provided
    let filteredFunds = rmfFactSheets;
    if (fundType) {
      filteredFunds = rmfFactSheets.filter(fund =>
        fund.policy_type?.toLowerCase().includes(fundType.toLowerCase())
      );
    }

    const total = filteredFunds.length;

    // Apply pagination
    const startIdx = (page - 1) * pageSize;
    const endIdx = startIdx + pageSize;
    const paginatedFunds = filteredFunds.slice(startIdx, endIdx);

    // Fetch daily NAV data for each fund (cached for 1 hour)
    const funds = await Promise.all(
      paginatedFunds.map(async (factSheet) => {
        try {
          const dailyInfo = await secApiRequest<SECFundDailyInfo[]>(
            `/FundDailyInfo/${factSheet.proj_id}`,
            `fund-daily-${factSheet.proj_id}`,
            60 * 60 * 1000 // 1 hour
          );

          // Get the most recent NAV data
          const latestNav = dailyInfo.sort((a, b) =>
            new Date(b.nav_date).getTime() - new Date(a.nav_date).getTime()
          )[0];

          const priorNav = latestNav.prior_nav || latestNav.nav;
          const navChange = latestNav.nav - priorNav;
          const navChangePercent = (navChange / priorNav) * 100;

          return {
            fundCode: factSheet.proj_abbr_name,
            fundName: factSheet.proj_name_th,
            fundNameEn: factSheet.proj_name_en,
            amcName: factSheet.management_company,
            fundType: factSheet.policy_type || 'Mixed',
            riskLevel: factSheet.risk_spectrum || 4,
            nav: latestNav.nav,
            navChange: Number(navChange.toFixed(4)),
            navChangePercent: Number(navChangePercent.toFixed(2)),
            navDate: latestNav.nav_date,
            lastUpdate: new Date().toISOString(),
          } as RMFFund;
        } catch (error) {
          console.error(`Error fetching daily info for ${factSheet.proj_abbr_name}:`, error);
          // Return fund with basic info if daily data fetch fails
          return {
            fundCode: factSheet.proj_abbr_name,
            fundName: factSheet.proj_name_th,
            fundNameEn: factSheet.proj_name_en,
            amcName: factSheet.management_company,
            fundType: factSheet.policy_type || 'Mixed',
            riskLevel: factSheet.risk_spectrum || 4,
            nav: 0,
            navChange: 0,
            navChangePercent: 0,
            navDate: new Date().toISOString(),
            lastUpdate: new Date().toISOString(),
          } as RMFFund;
        }
      })
    );

    return { funds, total };
  } catch (error) {
    console.error('Error fetching RMF funds from SEC API:', error);
    throw error;
  }
}

/**
 * Fetch detailed information for a specific RMF fund
 */
export async function fetchRMFFundDetail(fundCode: string): Promise<RMFFund | null> {
  try {
    // First, get the proj_id from factsheet
    const factSheets = await secApiRequest<SECFundFactSheet[]>(
      '/FundFactSheet',
      'fund-factsheets',
      24 * 60 * 60 * 1000
    );

    const factSheet = factSheets.find(fund =>
      fund.proj_abbr_name === fundCode || fund.proj_id === fundCode
    );

    if (!factSheet) {
      return null;
    }

    // Fetch daily NAV info
    const dailyInfo = await secApiRequest<SECFundDailyInfo[]>(
      `/FundDailyInfo/${factSheet.proj_id}`,
      `fund-daily-${factSheet.proj_id}`,
      60 * 60 * 1000
    );

    const latestNav = dailyInfo.sort((a, b) =>
      new Date(b.nav_date).getTime() - new Date(a.nav_date).getTime()
    )[0];

    const priorNav = latestNav.prior_nav || latestNav.nav;
    const navChange = latestNav.nav - priorNav;
    const navChangePercent = (navChange / priorNav) * 100;

    // Try to fetch portfolio holdings
    let assetAllocation: AssetAllocation[] | undefined;
    let topHoldings: FundHolding[] | undefined;

    try {
      const portfolio = await secApiRequest<SECFundPortfolio[]>(
        `/FundDailyInfo/${factSheet.proj_id}/portfolio`,
        `fund-portfolio-${factSheet.proj_id}`,
        24 * 60 * 60 * 1000
      );

      assetAllocation = portfolio.map(item => ({
        assetType: item.asset_type,
        percentage: item.asset_percent,
      }));

      // Note: Top holdings might be in a different endpoint
      // This is a placeholder - actual implementation depends on SEC API structure
    } catch (error) {
      console.log(`Portfolio data not available for ${fundCode}`);
    }

    return {
      fundCode: factSheet.proj_abbr_name,
      fundName: factSheet.proj_name_th,
      fundNameEn: factSheet.proj_name_en,
      amcName: factSheet.management_company,
      fundType: factSheet.policy_type || 'Mixed',
      riskLevel: factSheet.risk_spectrum || 4,
      nav: latestNav.nav,
      navChange: Number(navChange.toFixed(4)),
      navChangePercent: Number(navChangePercent.toFixed(2)),
      navDate: latestNav.nav_date,
      assetAllocation,
      topHoldings,
      lastUpdate: new Date().toISOString(),
    } as RMFFund;
  } catch (error) {
    console.error(`Error fetching RMF fund detail for ${fundCode}:`, error);
    throw error;
  }
}

/**
 * Search RMF funds by name or code
 */
export async function searchRMFFunds(query: string): Promise<RMFFund[]> {
  const { funds } = await fetchRMFFunds();

  const searchTerm = query.toLowerCase();
  return funds.filter(fund =>
    fund.fundCode.toLowerCase().includes(searchTerm) ||
    fund.fundName.toLowerCase().includes(searchTerm) ||
    fund.fundNameEn?.toLowerCase().includes(searchTerm) ||
    fund.amcName.toLowerCase().includes(searchTerm)
  );
}

/**
 * Clear the cache (useful for testing or manual refresh)
 */
export function clearCache(): void {
  cache.clear();
  console.log('[SEC API] Cache cleared');
}
