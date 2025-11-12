import type { RMFFundCSV, RMFNavHistory } from '@shared/schema';
export interface FundSearchParams {
  search?: string;
  amc?: string;
  minRiskLevel?: number;
  maxRiskLevel?: number;
  category?: string;
  minYtdReturn?: number;
  sortBy?: 'ytd' | '1y' | '3y' | '5y' | 'nav' | 'name' | 'risk';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface RmfDataRepository {
  search(filters: FundSearchParams): { funds: RMFFundCSV[]; totalCount: number };
  getBySymbol(symbol: string): RMFFundCSV | null;
  getNavHistory(symbol: string, days?: number): RMFNavHistory[];
}
