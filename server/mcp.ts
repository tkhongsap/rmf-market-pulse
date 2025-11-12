import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { rmfDataService } from './services/rmfDataService';
import { z } from 'zod';

export class RMFMCPServer {
  private server: McpServer;

  constructor() {
    this.server = new McpServer({
      name: 'thai-rmf-market-pulse',
      version: '1.0.0',
    });

    this.setupTools();
  }

  private setupTools() {
    this.server.tool(
      'get_rmf_funds',
      'Get a list of Thai Retirement Mutual Funds (RMF) with pagination and sorting',
      {
        page: z.number().optional().default(1).describe('Page number for pagination'),
        pageSize: z.number().optional().default(20).describe('Number of funds per page (max: 50)'),
        sortBy: z.enum(['ytd', '1y', '3y', '5y', 'nav', 'name', 'risk']).optional().describe('Sort by field'),
        sortOrder: z.enum(['asc', 'desc']).optional().describe('Sort order'),
      },
      async (args) => this.handleGetRmfFunds(args)
    );

    this.server.tool(
      'search_rmf_funds',
      'Search and filter Thai RMF funds by multiple criteria',
      {
        search: z.string().optional().describe('Search in fund name or symbol'),
        amc: z.string().optional().describe('Filter by Asset Management Company'),
        minRiskLevel: z.number().min(1).max(8).optional().describe('Minimum risk level'),
        maxRiskLevel: z.number().min(1).max(8).optional().describe('Maximum risk level'),
        category: z.enum(['Equity', 'Fixed Income', 'Mixed', 'International', 'Other']).optional().describe('Filter by category'),
        minYtdReturn: z.number().optional().describe('Minimum YTD return percentage'),
        sortBy: z.enum(['ytd', '1y', '3y', '5y', 'nav', 'name', 'risk']).optional().describe('Sort by field'),
        limit: z.number().optional().default(20).describe('Maximum results'),
      },
      async (args) => this.handleSearchRmfFunds(args)
    );

    this.server.tool(
      'get_rmf_fund_detail',
      'Get detailed information for a specific Thai RMF fund',
      {
        fundCode: z.string().describe('Fund symbol/code (e.g., "ABAPAC-RMF")'),
      },
      async (args) => this.handleGetRmfFundDetail(args)
    );

    this.server.tool(
      'get_rmf_fund_performance',
      'Get top performing Thai RMF funds for a specific period with benchmark comparison',
      {
        period: z.enum(['ytd', '3m', '6m', '1y', '3y', '5y', '10y']).describe('Performance period'),
        sortOrder: z.enum(['asc', 'desc']).optional().default('desc').describe('Sort order (desc = best performers first)'),
        limit: z.number().optional().default(10).describe('Maximum number of funds to return'),
        riskLevel: z.number().min(1).max(8).optional().describe('Filter by risk level'),
      },
      async (args) => this.handleGetRmfFundPerformance(args)
    );

    this.server.tool(
      'get_rmf_fund_nav_history',
      'Get NAV (Net Asset Value) history for a specific Thai RMF fund over time',
      {
        fundCode: z.string().describe('Fund symbol/code (e.g., "ABAPAC-RMF")'),
        days: z.number().optional().default(30).describe('Number of days of history (max: 365)'),
      },
      async (args) => this.handleGetRmfFundNavHistory(args)
    );

    this.server.tool(
      'compare_rmf_funds',
      'Compare multiple Thai RMF funds side by side',
      {
        fundCodes: z.array(z.string()).min(2).max(5).describe('Array of fund symbols to compare (2-5 funds)'),
        compareBy: z.enum(['performance', 'risk', 'fees', 'all']).optional().default('all').describe('Comparison focus'),
      },
      async (args) => this.handleCompareFunds(args)
    );
  }

  private async handleGetRmfFunds(args: any) {
    const page = args?.page || 1;
    const pageSize = Math.min(args?.pageSize || 20, 50);
    const sortBy = args?.sortBy;
    const sortOrder = args?.sortOrder || (sortBy ? 'desc' : 'asc');

    const { funds, totalCount } = rmfDataService.search({
      page,
      pageSize,
      sortBy,
      sortOrder,
    });

    const textSummary = `Found ${totalCount} RMF funds. Showing page ${page} (${funds.length} funds).`;

    const fundsData = funds.map(f => ({
      symbol: f.symbol,
      fund_name: f.fund_name,
      amc: f.amc,
      nav_value: f.nav_value,
      nav_change: f.nav_change,
      nav_change_percent: f.nav_change_percent,
      risk_level: f.risk_level,
      perf_ytd: f.perf_ytd,
      perf_1y: f.perf_1y,
      fund_classification: f.fund_classification,
    }));

    return {
      content: [
        {
          type: 'text' as const,
          text: textSummary,
        },
        {
          type: 'text' as const,
          text: JSON.stringify({
            funds: fundsData,
            pagination: {
              page,
              pageSize,
              totalCount,
              totalPages: Math.ceil(totalCount / pageSize),
            },
            timestamp: new Date().toISOString(),
          }, null, 2),
        },
      ],
    };
  }

  private async handleSearchRmfFunds(args: any) {
    const { funds, totalCount } = rmfDataService.search({
      search: args?.search,
      amc: args?.amc,
      minRiskLevel: args?.minRiskLevel,
      maxRiskLevel: args?.maxRiskLevel,
      category: args?.category,
      minYtdReturn: args?.minYtdReturn,
      sortBy: args?.sortBy,
      sortOrder: args?.sortOrder,
      pageSize: args?.limit || 20,
    });

    const filters = [];
    if (args?.search) filters.push(`search: "${args.search}"`);
    if (args?.amc) filters.push(`AMC: "${args.amc}"`);
    if (args?.minRiskLevel) filters.push(`min risk: ${args.minRiskLevel}`);
    if (args?.maxRiskLevel) filters.push(`max risk: ${args.maxRiskLevel}`);
    if (args?.category) filters.push(`category: ${args.category}`);
    if (args?.minYtdReturn) filters.push(`min YTD: ${args.minYtdReturn}%`);

    const textSummary = filters.length > 0
      ? `Found ${totalCount} RMF funds matching filters: ${filters.join(', ')}`
      : `Found ${totalCount} RMF funds.`;

    const fundsData = funds.map(f => ({
      symbol: f.symbol,
      fund_name: f.fund_name,
      amc: f.amc,
      nav_value: f.nav_value,
      nav_change: f.nav_change,
      nav_change_percent: f.nav_change_percent,
      risk_level: f.risk_level,
      perf_ytd: f.perf_ytd,
      perf_1y: f.perf_1y,
      perf_3y: f.perf_3y,
      fund_classification: f.fund_classification,
    }));

    return {
      content: [
        {
          type: 'text' as const,
          text: textSummary,
        },
        {
          type: 'text' as const,
          text: JSON.stringify({
            funds: fundsData,
            totalCount,
            filters: args,
            timestamp: new Date().toISOString(),
          }, null, 2),
        },
      ],
    };
  }

  private async handleGetRmfFundDetail(args: any) {
    const fundCode = args?.fundCode;
    
    if (!fundCode) {
      throw new Error('fundCode parameter is required');
    }

    const fund = rmfDataService.getBySymbol(fundCode);
    
    if (!fund) {
      throw new Error(`Fund not found: ${fundCode}`);
    }

    const navHistory7d = rmfDataService.getNavHistory(fundCode, 7);

    const textSummary = `${fund.fund_name} (${fund.symbol}) managed by ${fund.amc}. Current NAV: ${fund.nav_value} THB (${fund.nav_change >= 0 ? '+' : ''}${fund.nav_change_percent.toFixed(2)}%). Risk level: ${fund.risk_level}/8.`;

    const fundDetail = {
      symbol: fund.symbol,
      fund_name: fund.fund_name,
      amc: fund.amc,
      fund_classification: fund.fund_classification,
      risk_level: fund.risk_level,
      management_style: fund.management_style,
      dividend_policy: fund.dividend_policy,
      nav_value: fund.nav_value,
      nav_change: fund.nav_change,
      nav_change_percent: fund.nav_change_percent,
      nav_date: fund.nav_date,
      buy_price: fund.buy_price,
      sell_price: fund.sell_price,
      performance: {
        ytd: fund.perf_ytd,
        '3m': fund.perf_3m,
        '6m': fund.perf_6m,
        '1y': fund.perf_1y,
        '3y': fund.perf_3y,
        '5y': fund.perf_5y,
        '10y': fund.perf_10y,
        since_inception: fund.perf_since_inception,
      },
      benchmark: fund.benchmark_name ? {
        name: fund.benchmark_name,
        ytd: fund.benchmark_ytd,
        '3m': fund.benchmark_3m,
        '6m': fund.benchmark_6m,
        '1y': fund.benchmark_1y,
        '3y': fund.benchmark_3y,
        '5y': fund.benchmark_5y,
        '10y': fund.benchmark_10y,
      } : null,
      asset_allocation: fund.asset_allocation_json,
      fees: fund.fees_json,
      parties: fund.parties_json,
      holdings: fund.holdings_json,
      risk_factors: fund.risk_factors_json,
      suitability: fund.suitability_json,
      documents: {
        factsheet_url: fund.factsheet_url,
        annual_report_url: fund.annual_report_url,
        halfyear_report_url: fund.halfyear_report_url,
      },
      investment_minimums: {
        initial: fund.investment_min_initial,
        additional: fund.investment_min_additional,
      },
      navHistory7d,
      timestamp: new Date().toISOString(),
    };

    return {
      content: [
        {
          type: 'text' as const,
          text: textSummary,
        },
        {
          type: 'text' as const,
          text: JSON.stringify(fundDetail, null, 2),
        },
      ],
    };
  }

  private async handleGetRmfFundPerformance(args: any) {
    const period = args?.period || 'ytd';
    const sortOrder = args?.sortOrder || 'desc';
    const limit = args?.limit || 10;
    const riskLevel = args?.riskLevel;

    // Map period to fund property
    const periodMap: Record<string, string> = {
      'ytd': 'perf_ytd',
      '3m': 'perf_3m',
      '6m': 'perf_6m',
      '1y': 'perf_1y',
      '3y': 'perf_3y',
      '5y': 'perf_5y',
      '10y': 'perf_10y',
    };

    // Map period to benchmark field
    const benchmarkMap: Record<string, string> = {
      'ytd': 'benchmark_ytd',
      '3m': 'benchmark_3m',
      '6m': 'benchmark_6m',
      '1y': 'benchmark_1y',
      '3y': 'benchmark_3y',
      '5y': 'benchmark_5y',
      '10y': 'benchmark_10y',
    };

    const perfField = periodMap[period];
    const benchmarkField = benchmarkMap[period];
    
    if (!perfField) {
      throw new Error(`Invalid period: ${period}`);
    }

    // Get all funds and filter
    const { funds: allFunds } = rmfDataService.search({});
    
    let filteredFunds = allFunds.filter(fund => {
      const perfValue = (fund as any)[perfField];
      // Exclude funds with null/undefined performance
      if (perfValue === null || perfValue === undefined) return false;
      
      // Apply risk level filter if specified
      if (riskLevel && fund.risk_level !== riskLevel) return false;
      
      return true;
    });

    // Sort by performance
    filteredFunds.sort((a, b) => {
      const aPerf = (a as any)[perfField] || 0;
      const bPerf = (b as any)[perfField] || 0;
      return sortOrder === 'desc' ? bPerf - aPerf : aPerf - bPerf;
    });

    // Limit results
    const topFunds = filteredFunds.slice(0, limit);

    const periodLabel = {
      'ytd': 'YTD',
      '3m': '3-Month',
      '6m': '6-Month',
      '1y': '1-Year',
      '3y': '3-Year',
      '5y': '5-Year',
      '10y': '10-Year',
    }[period];

    const textSummary = riskLevel
      ? `Top ${topFunds.length} performing RMF funds for ${periodLabel} (Risk Level ${riskLevel})`
      : `Top ${topFunds.length} performing RMF funds for ${periodLabel}`;

    const fundsData = topFunds.map((f, index) => {
      const fundPerf = (f as any)[perfField];
      const benchPerf = (f as any)[benchmarkField];
      
      return {
        rank: index + 1,
        symbol: f.symbol,
        fund_name: f.fund_name,
        amc: f.amc,
        risk_level: f.risk_level,
        performance: fundPerf,
        nav_value: f.nav_value,
        benchmark: f.benchmark_name ? {
          name: f.benchmark_name,
          performance: benchPerf,
          outperformance: fundPerf !== null && fundPerf !== undefined && benchPerf !== null && benchPerf !== undefined
            ? parseFloat((fundPerf - benchPerf).toFixed(2))
            : null,
        } : null,
      };
    });

    return {
      content: [
        {
          type: 'text' as const,
          text: textSummary,
        },
        {
          type: 'text' as const,
          text: JSON.stringify({
            period,
            periodLabel,
            funds: fundsData,
            totalCount: topFunds.length,
            filters: { riskLevel },
            timestamp: new Date().toISOString(),
          }, null, 2),
        },
      ],
    };
  }

  private async handleGetRmfFundNavHistory(args: any) {
    const fundCode = args?.fundCode;
    const days = Math.min(args?.days || 30, 365);

    if (!fundCode) {
      throw new Error('fundCode parameter is required');
    }

    const fund = rmfDataService.getBySymbol(fundCode);
    if (!fund) {
      throw new Error(`Fund not found: ${fundCode}`);
    }

    const navHistory = rmfDataService.getNavHistory(fundCode, days);

    if (!navHistory || navHistory.length === 0) {
      const textSummary = `No NAV history available for ${fund.fund_name} (${fundCode})`;
      return {
        content: [
          {
            type: 'text' as const,
            text: textSummary,
          },
          {
            type: 'text' as const,
            text: JSON.stringify({
              symbol: fundCode,
              fund_name: fund.fund_name,
              message: 'No NAV history available',
              timestamp: new Date().toISOString(),
            }, null, 2),
          },
        ],
      };
    }

    // Calculate statistics using last_val field
    const navValues = navHistory.map(h => h.last_val).filter(v => v !== null && v !== undefined);
    const minNav = navValues.length > 0 ? Math.min(...navValues) : 0;
    const maxNav = navValues.length > 0 ? Math.max(...navValues) : 0;
    const avgNav = navValues.length > 0 ? navValues.reduce((sum, v) => sum + v, 0) / navValues.length : 0;
    
    // Calculate period return
    const firstNav = navHistory[navHistory.length - 1]?.last_val;
    const lastNav = navHistory[0]?.last_val;
    const periodReturn = firstNav && lastNav && firstNav > 0 ? ((lastNav - firstNav) / firstNav * 100).toFixed(2) : null;

    // Calculate volatility (standard deviation of daily returns)
    const dailyReturns = [];
    for (let i = 0; i < navHistory.length - 1; i++) {
      const currentNav = navHistory[i].last_val;
      const prevNav = navHistory[i + 1].last_val;
      if (currentNav && prevNav && prevNav > 0) {
        dailyReturns.push((currentNav - prevNav) / prevNav);
      }
    }
    
    let volatility: string = 'N/A';
    if (dailyReturns.length > 0) {
      const avgReturn = dailyReturns.reduce((sum, r) => sum + r, 0) / dailyReturns.length;
      const variance = dailyReturns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / dailyReturns.length;
      volatility = (Math.sqrt(variance) * 100).toFixed(2);
    }

    const textSummary = `${fund.fund_name} (${fundCode}) NAV history over ${days} days. Period return: ${periodReturn}%. Volatility: ${volatility}%.`;

    return {
      content: [
        {
          type: 'text' as const,
          text: textSummary,
        },
        {
          type: 'text' as const,
          text: JSON.stringify({
            symbol: fundCode,
            fund_name: fund.fund_name,
            days,
            navHistory: navHistory.map(h => ({
              date: h.nav_date,
              nav: h.last_val,
              previous_nav: h.previous_val,
              change: h.last_val && h.previous_val ? h.last_val - h.previous_val : null,
              change_percent: h.last_val && h.previous_val && h.previous_val > 0 
                ? ((h.last_val - h.previous_val) / h.previous_val * 100).toFixed(2)
                : null,
            })),
            statistics: {
              minNav: minNav.toFixed(4),
              maxNav: maxNav.toFixed(4),
              avgNav: avgNav.toFixed(4),
              periodReturn: periodReturn ? `${periodReturn}%` : 'N/A',
              volatility: `${volatility}%`,
            },
            timestamp: new Date().toISOString(),
          }, null, 2),
        },
      ],
    };
  }

  private async handleCompareFunds(args: any) {
    const fundCodes = args?.fundCodes || [];
    const compareBy = args?.compareBy || 'all';

    if (!fundCodes || fundCodes.length < 2) {
      throw new Error('At least 2 fund codes are required for comparison');
    }

    if (fundCodes.length > 5) {
      throw new Error('Maximum 5 funds can be compared at once');
    }

    // Fetch all funds
    const funds = fundCodes.map((code: string) => {
      const fund = rmfDataService.getBySymbol(code);
      if (!fund) {
        throw new Error(`Fund not found: ${code}`);
      }
      return fund;
    });

    const textSummary = `Comparing ${funds.length} RMF funds: ${funds.map(f => f.symbol).join(', ')}`;

    // Build comparison data
    const comparison = funds.map(fund => {
      const data: any = {
        symbol: fund.symbol,
        fund_name: fund.fund_name,
        amc: fund.amc,
      };

      // Include data based on compareBy
      if (compareBy === 'all' || compareBy === 'performance') {
        data.nav_value = fund.nav_value;
        data.performance = {
          ytd: fund.perf_ytd,
          '3m': fund.perf_3m,
          '6m': fund.perf_6m,
          '1y': fund.perf_1y,
          '3y': fund.perf_3y,
          '5y': fund.perf_5y,
          '10y': fund.perf_10y,
        };
        data.benchmark = fund.benchmark_name ? {
          name: fund.benchmark_name,
          ytd: fund.benchmark_ytd,
          '1y': fund.benchmark_1y,
          '3y': fund.benchmark_3y,
          '5y': fund.benchmark_5y,
        } : null;
      }

      if (compareBy === 'all' || compareBy === 'risk') {
        data.risk_level = fund.risk_level;
        data.fund_classification = fund.fund_classification;
        data.management_style = fund.management_style;
      }

      if (compareBy === 'all' || compareBy === 'fees') {
        data.fees = fund.fees_json;
        data.investment_minimums = {
          initial: fund.investment_min_initial,
          additional: fund.investment_min_additional,
        };
      }

      return data;
    });

    return {
      content: [
        {
          type: 'text' as const,
          text: textSummary,
        },
        {
          type: 'text' as const,
          text: JSON.stringify({
            compareBy,
            fundCount: funds.length,
            funds: comparison,
            timestamp: new Date().toISOString(),
          }, null, 2),
        },
      ],
    };
  }

  getServer() {
    return this.server;
  }
}

export const rmfMCPServer = new RMFMCPServer();
