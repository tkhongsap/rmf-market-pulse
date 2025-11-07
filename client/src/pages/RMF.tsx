import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import WidgetContainer from "@/components/WidgetContainer";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import ErrorMessage from "@/components/ErrorMessage";
import ThemeToggle from "@/components/ThemeToggle";
import type { RMFFundsResponse } from "@shared/schema";

// Import RMF components (to be created)
import RMFFundCard from "@/components/RMFFundCard";
import RMFFundTable from "@/components/RMFFundTable";

export default function RMF() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");
  const [fundType, setFundType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');

  // Fetch RMF funds data
  const {
    data: rmfData,
    isLoading,
    error,
    refetch,
  } = useQuery<RMFFundsResponse>({
    queryKey: ['/api/rmf', { page, pageSize, fundType, search: searchQuery }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      if (fundType && fundType !== 'all') params.append('fundType', fundType);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/rmf?${params}`);
      if (!response.ok) throw new Error('Failed to fetch RMF funds');
      return response.json();
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes (less frequent for fund data)
  });

  const funds = rmfData?.funds || [];
  const total = rmfData?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  const handleSearch = () => {
    setPage(1); // Reset to first page on search
    refetch();
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setFundType("all");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            <h1 className="text-lg font-semibold text-foreground">
              Thai RMF Fund Tracker
            </h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <p className="text-sm text-muted-foreground max-w-2xl">
            Track Thai Retirement Mutual Funds (RMF) with real-time NAV data from Thailand SEC.
            Monitor performance, holdings, and fund details across all asset management companies.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search by fund name or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full"
                data-testid="input-search-funds"
              />
            </div>
            <Select value={fundType} onValueChange={setFundType}>
              <SelectTrigger className="w-full sm:w-[200px]" data-testid="select-fund-type">
                <SelectValue placeholder="Fund Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Equity">Equity</SelectItem>
                <SelectItem value="Fixed Income">Fixed Income</SelectItem>
                <SelectItem value="Mixed">Mixed</SelectItem>
                <SelectItem value="Property">Property</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} variant="default" data-testid="button-search">
              Search
            </Button>
            <Button onClick={handleClearFilters} variant="outline" data-testid="button-clear-filters">
              Clear
            </Button>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              RMF Funds
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Showing {funds.length} of {total} funds
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                viewMode === 'cards'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
              data-testid="button-view-cards"
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
              data-testid="button-view-table"
            >
              Table
            </button>
          </div>
        </div>

        {/* Data Display */}
        {isLoading ? (
          <LoadingSkeleton count={10} type={viewMode === 'cards' ? 'card' : 'table'} />
        ) : error ? (
          <ErrorMessage
            message="Unable to fetch RMF funds data. Please check your SEC API key configuration and try again."
            onRetry={() => refetch()}
          />
        ) : funds.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No funds found matching your criteria.</p>
            <Button onClick={handleClearFilters} variant="outline" className="mt-4" data-testid="button-clear-filters-empty">
              Clear Filters
            </Button>
          </div>
        ) : (
          <WidgetContainer timestamp={rmfData?.timestamp}>
            {viewMode === 'cards' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {funds.map((fund) => (
                  <RMFFundCard key={fund.symbol} fund={fund} />
                ))}
              </div>
            ) : (
              <RMFFundTable funds={funds} />
            )}
          </WidgetContainer>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              variant="outline"
              size="sm"
              data-testid="button-previous-page"
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground px-4" data-testid="text-page-info">
              Page {page} of {totalPages}
            </span>
            <Button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              variant="outline"
              size="sm"
              data-testid="button-next-page"
            >
              Next
            </Button>
          </div>
        )}
      </main>

      <footer className="border-t border-border mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <p className="text-xs text-muted-foreground text-center">
            Fund data provided by Thailand Securities and Exchange Commission (SEC). Data is for informational purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
}
