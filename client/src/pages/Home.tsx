import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PriceCard from "@/components/PriceCard";
import ForexCard from "@/components/ForexCard";
import PriceTable from "@/components/PriceTable";
import WidgetContainer from "@/components/WidgetContainer";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import ErrorMessage from "@/components/ErrorMessage";
import ThemeToggle from "@/components/ThemeToggle";
import { TrendingUp, DollarSign } from "lucide-react";
import type { CommoditiesResponse, ForexResponse } from "@shared/schema";

export default function Home() {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Fetch commodities data
  const {
    data: commoditiesData,
    isLoading: commoditiesLoading,
    error: commoditiesError,
    refetch: refetchCommodities,
  } = useQuery<CommoditiesResponse>({
    queryKey: ['/api/commodities'],
    refetchInterval: 60000, // Refetch every 60 seconds
  });

  // Fetch forex data
  const {
    data: forexData,
    isLoading: forexLoading,
    error: forexError,
    refetch: refetchForex,
  } = useQuery<ForexResponse>({
    queryKey: ['/api/forex'],
    refetchInterval: 60000, // Refetch every 60 seconds
  });

  const commodities = commoditiesData?.commodities || [];
  const forexPairs = forexData?.pairs || [];

  // Convert forex data to table format
  const forexTableData = forexPairs.map(forex => ({
    name: forex.pair,
    symbol: forex.name,
    price: forex.rate,
    change: forex.change,
    changePercent: forex.changePercent,
    currency: '',
  }));

  // Convert commodity data to table format
  const commodityTableData = commodities.map(commodity => ({
    name: commodity.name,
    symbol: commodity.symbol,
    price: commodity.price,
    change: commodity.change,
    changePercent: commodity.changePercent,
    currency: commodity.currency,
    unit: commodity.unit,
  }));

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary" />
              <h1 className="text-lg font-semibold text-foreground">
                Commodity & Forex Tracker
              </h1>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <p className="text-sm text-muted-foreground max-w-2xl">
            Real-time commodity prices and currency exchange rates powered by Yahoo Finance. 
            Track gold, silver, oil, and major currency pairs with live market data.
          </p>
        </div>

        <Tabs defaultValue="commodities" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="commodities" data-testid="tab-commodities">
              <TrendingUp className="w-4 h-4 mr-2" />
              Commodities
            </TabsTrigger>
            <TabsTrigger value="forex" data-testid="tab-forex">
              <DollarSign className="w-4 h-4 mr-2" />
              Forex
            </TabsTrigger>
          </TabsList>

          <TabsContent value="commodities" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">
                Commodity Prices
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    viewMode === 'cards'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover-elevate'
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
                      : 'bg-secondary text-secondary-foreground hover-elevate'
                  }`}
                  data-testid="button-view-table"
                >
                  Table
                </button>
              </div>
            </div>

            {commoditiesLoading ? (
              <LoadingSkeleton count={6} type={viewMode === 'cards' ? 'card' : 'table'} />
            ) : commoditiesError ? (
              <ErrorMessage 
                message="Unable to fetch commodity prices. Please check your connection and try again."
                onRetry={() => refetchCommodities()}
              />
            ) : (
              <WidgetContainer timestamp={commoditiesData?.timestamp}>
                {viewMode === 'cards' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {commodities.map((commodity) => (
                      <PriceCard
                        key={commodity.symbol}
                        name={commodity.name}
                        symbol={commodity.symbol}
                        price={commodity.price}
                        change={commodity.change}
                        changePercent={commodity.changePercent}
                        currency={commodity.currency}
                        unit={commodity.unit}
                        lastUpdate={commodity.lastUpdate}
                      />
                    ))}
                  </div>
                ) : (
                  <PriceTable data={commodityTableData} type="commodity" />
                )}
              </WidgetContainer>
            )}
          </TabsContent>

          <TabsContent value="forex" className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-foreground">
                Currency Exchange Rates
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    viewMode === 'cards'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover-elevate'
                  }`}
                  data-testid="button-view-cards-forex"
                >
                  Cards
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    viewMode === 'table'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover-elevate'
                  }`}
                  data-testid="button-view-table-forex"
                >
                  Table
                </button>
              </div>
            </div>

            {forexLoading ? (
              <LoadingSkeleton count={6} type={viewMode === 'cards' ? 'card' : 'table'} />
            ) : forexError ? (
              <ErrorMessage 
                message="Unable to fetch forex rates. Please check your connection and try again."
                onRetry={() => refetchForex()}
              />
            ) : (
              <WidgetContainer timestamp={forexData?.timestamp}>
                {viewMode === 'cards' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {forexPairs.map((forex) => (
                      <ForexCard
                        key={forex.pair}
                        pair={forex.pair}
                        name={forex.name}
                        rate={forex.rate}
                        change={forex.change}
                        changePercent={forex.changePercent}
                        lastUpdate={forex.lastUpdate}
                      />
                    ))}
                  </div>
                ) : (
                  <PriceTable data={forexTableData} type="forex" />
                )}
              </WidgetContainer>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-border mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <p className="text-xs text-muted-foreground text-center">
            Market data provided by Yahoo Finance. Data is for informational purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
}
