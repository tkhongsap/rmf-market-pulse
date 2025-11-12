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

  getServer() {
    return this.server;
  }
}

export const rmfMCPServer = new RMFMCPServer();
