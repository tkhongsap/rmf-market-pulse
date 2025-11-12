/**
 * RMF Data Service
 * In-memory data service for Thai Retirement Mutual Funds
 * Loads data from CSV and builds indexes for fast lookups
 */

import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { MCPFundSummary, MCPFundDetail, MCPNavHistory } from '@shared/schema';

// ESM path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Root project directory
const PROJECT_ROOT = join(__dirname, '../..');

// CSV file path
const CSV_PATH = join(PROJECT_ROOT, 'docs/rmf-funds-consolidated.csv');

// JSON fund data directory
const JSON_DATA_DIR = join(PROJECT_ROOT, 'data/rmf-funds');

/**
 * Fund search filters interface
 */
export interface FundSearchFilters {
  search?: string;          // Text search on fund name/symbol
  amc?: string;             // Filter by AMC (partial match)
  minRiskLevel?: number;    // Min risk level (0-8)
  maxRiskLevel?: number;    // Max risk level (0-8)
  minYtdReturn?: number;    // Minimum YTD return %
  category?: string;        // Fund classification code
  sortBy?: string;          // Sort field
  page?: number;            // Page number
  pageSize?: number;        // Items per page
  limit?: number;           // Max results (for search without pagination)
}

/**
 * Fund data row from CSV (raw format)
 */
interface RawFundData {
  fund_id: string;
  symbol: string;
  fund_name: string;
  amc: string;
  fund_classification: string | null;
  management_style: string;
  dividend_policy: string;
  risk_level: number;
  fund_type: string;
  nav_date: string;
  nav_value: number;
  nav_change: number;
  nav_change_percent: number;
  net_asset: number;
  buy_price: number;
  sell_price: number;
  nav_history_count: number;
  nav_history_first_date: string | null;
  nav_history_last_date: string | null;
  nav_history_min: number | null;
  nav_history_max: number | null;
  perf_ytd: number | null;
  perf_3m: number | null;
  perf_6m: number | null;
  perf_1y: number | null;
  perf_3y: number | null;
  perf_5y: number | null;
  perf_10y: number | null;
  perf_since_inception: number | null;
  benchmark_name: string | null;
  benchmark_ytd: number | null;
  benchmark_3m: number | null;
  benchmark_6m: number | null;
  benchmark_1y: number | null;
  benchmark_3y: number | null;
  benchmark_5y: number | null;
  benchmark_10y: number | null;
  dividends_count: number;
  dividends_total: number | null;
  dividends_last_date: string | null;
  asset_allocation_json: string;
  fees_count: number;
  fees_json: string;
  parties_count: number;
  parties_json: string;
  risk_factors_count: number;
  risk_factors_json: string;
  suitability_investment_horizon: string | null;
  suitability_risk_level: string | null;
  suitability_target_investor: string | null;
  factsheet_url: string | null;
  annual_report_url: string | null;
  halfyear_report_url: string | null;
  min_initial: string | null;
  min_additional: string | null;
  min_redemption: string | null;
  min_balance: string | null;
  data_fetched_at: string;
  errors_count: number;
  errors_json: string;
}

/**
 * RMF Data Service
 * Singleton service for managing RMF fund data
 */
export class RMFDataService {
  private funds: Map<string, RawFundData> = new Map();
  private byAMC: Map<string, string[]> = new Map();
  private byRisk: Map<number, string[]> = new Map();
  private byCategory: Map<string, string[]> = new Map();
  private sortedByYTD: string[] = [];
  private sortedBy1Y: string[] = [];
  private sortedBy3Y: string[] = [];
  private sortedBy5Y: string[] = [];
  private navHistoryCache: Map<string, any> = new Map(); // 7-day history cache
  private initialized: boolean = false;

  /**
   * Initialize the data service (load CSV and build indexes)
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      console.log('[RMFDataService] Already initialized');
      return;
    }

    const startTime = Date.now();
    console.log('[RMFDataService] Loading fund data from CSV...');

    try {
      // Read and parse CSV
      const csvContent = readFileSync(CSV_PATH, 'utf-8');
      const records = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        cast: true,
        cast_date: false,
      }) as RawFundData[];

      console.log(`[RMFDataService] Parsed ${records.length} records from CSV`);

      // Load data and build indexes
      for (const record of records) {
        // Store fund by symbol (primary key)
        this.funds.set(record.symbol, record);

        // Build AMC index
        if (record.amc) {
          if (!this.byAMC.has(record.amc)) {
            this.byAMC.set(record.amc, []);
          }
          this.byAMC.get(record.amc)!.push(record.symbol);
        }

        // Build risk level index
        if (record.risk_level !== null && record.risk_level !== undefined) {
          if (!this.byRisk.has(record.risk_level)) {
            this.byRisk.set(record.risk_level, []);
          }
          this.byRisk.get(record.risk_level)!.push(record.symbol);
        }

        // Build category index (fund_classification)
        if (record.fund_classification) {
          if (!this.byCategory.has(record.fund_classification)) {
            this.byCategory.set(record.fund_classification, []);
          }
          this.byCategory.get(record.fund_classification)!.push(record.symbol);
        }
      }

      // Build performance-sorted arrays
      this.buildPerformanceSortedArrays();

      // Cache 7-day history for sparklines (top 50 funds by YTD)
      await this.cache7DayHistory();

      const endTime = Date.now();
      this.initialized = true;

      console.log(`[RMFDataService] ✅ Loaded ${this.funds.size} RMF funds in ${endTime - startTime}ms`);
      console.log(`[RMFDataService] Indexes: ${this.byAMC.size} AMCs, ${this.byRisk.size} risk levels, ${this.byCategory.size} categories`);
    } catch (error) {
      console.error('[RMFDataService] ❌ Failed to load fund data:', error);
      throw new Error(`Failed to initialize RMF Data Service: ${error}`);
    }
  }

  /**
   * Build sorted arrays for performance queries
   */
  private buildPerformanceSortedArrays(): void {
    const allSymbols = Array.from(this.funds.keys());

    // Sort by YTD (descending)
    this.sortedByYTD = allSymbols
      .filter(symbol => {
        const fund = this.funds.get(symbol);
        return fund && fund.perf_ytd !== null;
      })
      .sort((a, b) => {
        const fundA = this.funds.get(a)!;
        const fundB = this.funds.get(b)!;
        return (fundB.perf_ytd || 0) - (fundA.perf_ytd || 0);
      });

    // Sort by 1Y (descending)
    this.sortedBy1Y = allSymbols
      .filter(symbol => {
        const fund = this.funds.get(symbol);
        return fund && fund.perf_1y !== null;
      })
      .sort((a, b) => {
        const fundA = this.funds.get(a)!;
        const fundB = this.funds.get(b)!;
        return (fundB.perf_1y || 0) - (fundA.perf_1y || 0);
      });

    // Sort by 3Y (descending)
    this.sortedBy3Y = allSymbols
      .filter(symbol => {
        const fund = this.funds.get(symbol);
        return fund && fund.perf_3y !== null;
      })
      .sort((a, b) => {
        const fundA = this.funds.get(a)!;
        const fundB = this.funds.get(b)!;
        return (fundB.perf_3y || 0) - (fundA.perf_3y || 0);
      });

    // Sort by 5Y (descending)
    this.sortedBy5Y = allSymbols
      .filter(symbol => {
        const fund = this.funds.get(symbol);
        return fund && fund.perf_5y !== null;
      })
      .sort((a, b) => {
        const fundA = this.funds.get(a)!;
        const fundB = this.funds.get(b)!;
        return (fundB.perf_5y || 0) - (fundA.perf_5y || 0);
      });

    console.log(`[RMFDataService] Performance indexes: YTD=${this.sortedByYTD.length}, 1Y=${this.sortedBy1Y.length}, 3Y=${this.sortedBy3Y.length}, 5Y=${this.sortedBy5Y.length}`);
  }

  /**
   * Cache 7-day NAV history for top funds (for sparklines)
   */
  private async cache7DayHistory(): Promise<void> {
    // Cache top 50 funds by YTD for frequently accessed sparklines
    const topFunds = this.sortedByYTD.slice(0, 50);

    for (const symbol of topFunds) {
      try {
        const history = await this.getNavHistory(symbol, 7);
        if (history) {
          this.navHistoryCache.set(symbol, history);
        }
      } catch (error) {
        // Silently skip if NAV history not available
      }
    }

    console.log(`[RMFDataService] Cached 7-day history for ${this.navHistoryCache.size} funds`);
  }

  /**
   * Get fund by symbol (O(1) lookup)
   */
  getBySymbol(symbol: string): RawFundData | undefined {
    return this.funds.get(symbol.toUpperCase());
  }

  /**
   * Search funds with filters and pagination
   */
  search(filters: FundSearchFilters = {}): {
    funds: RawFundData[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  } {
    let results = Array.from(this.funds.values());

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      results = results.filter(fund =>
        fund.symbol.toLowerCase().includes(searchLower) ||
        fund.fund_name.toLowerCase().includes(searchLower)
      );
    }

    if (filters.amc) {
      const amcLower = filters.amc.toLowerCase();
      results = results.filter(fund =>
        fund.amc.toLowerCase().includes(amcLower)
      );
    }

    if (filters.minRiskLevel !== undefined) {
      results = results.filter(fund => fund.risk_level >= filters.minRiskLevel!);
    }

    if (filters.maxRiskLevel !== undefined) {
      results = results.filter(fund => fund.risk_level <= filters.maxRiskLevel!);
    }

    if (filters.minYtdReturn !== undefined) {
      results = results.filter(fund =>
        fund.perf_ytd !== null && fund.perf_ytd >= filters.minYtdReturn!
      );
    }

    if (filters.category) {
      results = results.filter(fund => fund.fund_classification === filters.category);
    }

    // Sort results
    const sortBy = filters.sortBy || 'ytd';
    results = this.sortFunds(results, sortBy);

    // Apply pagination or limit
    const total = results.length;

    if (filters.page !== undefined && filters.pageSize !== undefined) {
      // Pagination mode
      const page = Math.max(1, filters.page);
      const pageSize = Math.min(50, Math.max(1, filters.pageSize));
      const totalPages = Math.ceil(total / pageSize);
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;

      return {
        funds: results.slice(startIndex, endIndex),
        total,
        page,
        pageSize,
        totalPages,
      };
    } else if (filters.limit !== undefined) {
      // Limit mode (no pagination)
      const limit = Math.min(50, Math.max(1, filters.limit));
      return {
        funds: results.slice(0, limit),
        total,
        page: 1,
        pageSize: limit,
        totalPages: 1,
      };
    } else {
      // No pagination/limit
      return {
        funds: results,
        total,
        page: 1,
        pageSize: total,
        totalPages: 1,
      };
    }
  }

  /**
   * Sort funds by specified field
   */
  private sortFunds(funds: RawFundData[], sortBy: string): RawFundData[] {
    switch (sortBy) {
      case 'ytd':
        return funds.sort((a, b) => (b.perf_ytd || -Infinity) - (a.perf_ytd || -Infinity));
      case '3m':
        return funds.sort((a, b) => (b.perf_3m || -Infinity) - (a.perf_3m || -Infinity));
      case '6m':
        return funds.sort((a, b) => (b.perf_6m || -Infinity) - (a.perf_6m || -Infinity));
      case '1y':
        return funds.sort((a, b) => (b.perf_1y || -Infinity) - (a.perf_1y || -Infinity));
      case '3y':
        return funds.sort((a, b) => (b.perf_3y || -Infinity) - (a.perf_3y || -Infinity));
      case '5y':
        return funds.sort((a, b) => (b.perf_5y || -Infinity) - (a.perf_5y || -Infinity));
      case 'nav':
        return funds.sort((a, b) => b.nav_value - a.nav_value);
      case 'name':
        return funds.sort((a, b) => a.fund_name.localeCompare(b.fund_name));
      default:
        return funds.sort((a, b) => (b.perf_ytd || -Infinity) - (a.perf_ytd || -Infinity));
    }
  }

  /**
   * Get top performing funds for a specific period
   */
  getTopPerformers(period: string, limit: number = 10, riskLevel?: number): RawFundData[] {
    let sortedSymbols: string[] = [];

    switch (period) {
      case 'ytd':
        sortedSymbols = this.sortedByYTD;
        break;
      case '3m':
        sortedSymbols = Array.from(this.funds.keys())
          .filter(s => this.funds.get(s)!.perf_3m !== null)
          .sort((a, b) => (this.funds.get(b)!.perf_3m || 0) - (this.funds.get(a)!.perf_3m || 0));
        break;
      case '6m':
        sortedSymbols = Array.from(this.funds.keys())
          .filter(s => this.funds.get(s)!.perf_6m !== null)
          .sort((a, b) => (this.funds.get(b)!.perf_6m || 0) - (this.funds.get(a)!.perf_6m || 0));
        break;
      case '1y':
        sortedSymbols = this.sortedBy1Y;
        break;
      case '3y':
        sortedSymbols = this.sortedBy3Y;
        break;
      case '5y':
        sortedSymbols = this.sortedBy5Y;
        break;
      default:
        sortedSymbols = this.sortedByYTD;
    }

    // Apply risk level filter if specified
    if (riskLevel !== undefined) {
      sortedSymbols = sortedSymbols.filter(symbol => {
        const fund = this.funds.get(symbol);
        return fund && fund.risk_level === riskLevel;
      });
    }

    // Take top N and map to fund objects
    return sortedSymbols
      .slice(0, Math.min(limit, 50))
      .map(symbol => this.funds.get(symbol)!)
      .filter(fund => fund !== undefined);
  }

  /**
   * Compare multiple funds (2-5 funds)
   */
  compareFunds(symbols: string[]): RawFundData[] {
    return symbols
      .map(symbol => this.funds.get(symbol.toUpperCase()))
      .filter(fund => fund !== undefined) as RawFundData[];
  }

  /**
   * Get NAV history for a fund (reads from JSON files)
   */
  async getNavHistory(symbol: string, days: number = 30): Promise<MCPNavHistory | null> {
    try {
      // Check cache for 7-day history
      if (days === 7 && this.navHistoryCache.has(symbol)) {
        return this.navHistoryCache.get(symbol);
      }

      // Read from JSON file
      const jsonPath = join(JSON_DATA_DIR, `${symbol}.json`);
      const jsonContent = readFileSync(jsonPath, 'utf-8');
      const fundData = JSON.parse(jsonContent);

      // Get NAV history array
      const navHistory = fundData.nav_history_30d || [];
      if (navHistory.length === 0) {
        return null;
      }

      // Filter to last N days
      const limitedHistory = navHistory.slice(-days);

      // Calculate daily changes and percentages
      const historyPoints = limitedHistory.map((point: any, index: number) => {
        const prevNav = index > 0 ? limitedHistory[index - 1].last_val : point.previous_val || point.last_val;
        const change = point.last_val - prevNav;
        const changePercent = prevNav > 0 ? (change / prevNav) * 100 : 0;

        return {
          date: point.nav_date,
          nav: point.last_val,
          change: change,
          changePercent: parseFloat(changePercent.toFixed(2)),
        };
      });

      // Calculate period statistics
      const startNav = historyPoints[0].nav;
      const endNav = historyPoints[historyPoints.length - 1].nav;
      const periodReturn = endNav - startNav;
      const periodReturnPercent = startNav > 0 ? (periodReturn / startNav) * 100 : 0;

      // Calculate volatility (standard deviation)
      const returns = historyPoints.slice(1).map((p: any) => p.changePercent);
      const avgReturn = returns.reduce((sum: number, r: number) => sum + r, 0) / returns.length;
      const variance = returns.reduce((sum: number, r: number) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
      const volatility = Math.sqrt(variance);

      const navValues = historyPoints.map((p: any) => p.nav);
      const minNav = Math.min(...navValues);
      const maxNav = Math.max(...navValues);
      const avgNav = navValues.reduce((sum: number, v: number) => sum + v, 0) / navValues.length;

      const result: MCPNavHistory = {
        fundCode: symbol,
        fundName: fundData.fund_name || symbol,
        navHistory: historyPoints,
        periodStats: {
          startDate: historyPoints[0].date,
          endDate: historyPoints[historyPoints.length - 1].date,
          startNav,
          endNav,
          periodReturn: parseFloat(periodReturn.toFixed(4)),
          periodReturnPercent: parseFloat(periodReturnPercent.toFixed(2)),
          volatility: returns.length > 1 ? parseFloat(volatility.toFixed(2)) : null,
          minNav: parseFloat(minNav.toFixed(4)),
          maxNav: parseFloat(maxNav.toFixed(4)),
          avgNav: parseFloat(avgNav.toFixed(4)),
        },
      };

      // Cache 7-day history
      if (days === 7) {
        this.navHistoryCache.set(symbol, result);
      }

      return result;
    } catch (error) {
      console.error(`[RMFDataService] Failed to load NAV history for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Refresh data (reload CSV and rebuild indexes)
   */
  async refreshData(): Promise<void> {
    console.log('[RMFDataService] Refreshing fund data...');
    this.initialized = false;
    this.funds.clear();
    this.byAMC.clear();
    this.byRisk.clear();
    this.byCategory.clear();
    this.sortedByYTD = [];
    this.sortedBy1Y = [];
    this.sortedBy3Y = [];
    this.sortedBy5Y = [];
    this.navHistoryCache.clear();
    await this.initialize();
  }

  /**
   * Get total fund count
   */
  getTotalCount(): number {
    return this.funds.size;
  }

  /**
   * Check if service is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

// Export singleton instance
export const rmfDataService = new RMFDataService();
