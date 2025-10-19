import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PriceCard from "@/components/PriceCard";
import ForexCard from "@/components/ForexCard";
import PriceTable from "@/components/PriceTable";
import WidgetContainer from "@/components/WidgetContainer";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import ThemeToggle from "@/components/ThemeToggle";
import { TrendingUp, DollarSign } from "lucide-react";

//todo: remove mock functionality - this is sample data for the prototype
const mockCommodities = [
  { name: 'Gold', symbol: 'XAU', price: 2045.50, change: 23.40, changePercent: 1.16, currency: '$', unit: 'oz' },
  { name: 'Silver', symbol: 'XAG', price: 24.85, change: 0.32, changePercent: 1.30, currency: '$', unit: 'oz' },
  { name: 'Crude Oil (WTI)', symbol: 'CL', price: 78.25, change: -1.85, changePercent: -2.31, currency: '$', unit: 'barrel' },
  { name: 'Natural Gas', symbol: 'NG', price: 2.67, change: 0.05, changePercent: 1.91, currency: '$', unit: 'MMBtu' },
  { name: 'Copper', symbol: 'HG', price: 3.82, change: -0.04, changePercent: -1.04, currency: '$', unit: 'lb' },
  { name: 'Wheat', symbol: 'ZW', price: 612.50, change: 8.25, changePercent: 1.37, currency: '$', unit: 'bushel' },
];

//todo: remove mock functionality - this is sample data for the prototype
const mockForex = [
  { name: 'EUR/USD', pair: 'Euro to US Dollar', price: 1.0875, change: 0.0042, changePercent: 0.39, currency: '' },
  { name: 'GBP/USD', pair: 'British Pound to US Dollar', price: 1.2634, change: -0.0018, changePercent: -0.14, currency: '' },
  { name: 'USD/JPY', pair: 'US Dollar to Japanese Yen', price: 149.82, change: 0.45, changePercent: 0.30, currency: '' },
  { name: 'USD/CHF', pair: 'US Dollar to Swiss Franc', price: 0.8756, change: 0.0012, changePercent: 0.14, currency: '' },
  { name: 'AUD/USD', pair: 'Australian Dollar to US Dollar', price: 0.6542, change: -0.0023, changePercent: -0.35, currency: '' },
  { name: 'USD/CAD', pair: 'US Dollar to Canadian Dollar', price: 1.3587, change: 0.0015, changePercent: 0.11, currency: '' },
];

//todo: remove mock functionality - forex card data
const mockForexCards = [
  { pair: 'EUR/USD', name: 'Euro to US Dollar', rate: 1.0875, change: 0.0042, changePercent: 0.39 },
  { pair: 'GBP/USD', name: 'British Pound to US Dollar', rate: 1.2634, change: -0.0018, changePercent: -0.14 },
  { pair: 'USD/JPY', name: 'US Dollar to Japanese Yen', rate: 149.82, change: 0.45, changePercent: 0.30 },
  { pair: 'USD/CHF', name: 'US Dollar to Swiss Franc', rate: 0.8756, change: 0.0012, changePercent: 0.14 },
  { pair: 'AUD/USD', name: 'Australian Dollar to US Dollar', rate: 0.6542, change: -0.0023, changePercent: -0.35 },
  { pair: 'USD/CAD', name: 'US Dollar to Canadian Dollar', rate: 1.3587, change: 0.0015, changePercent: 0.11 },
];

export default function Home() {
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [isLoading] = useState(false); //todo: remove mock functionality - connect to real API

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

            {isLoading ? (
              <LoadingSkeleton count={6} type={viewMode === 'cards' ? 'card' : 'table'} />
            ) : (
              <WidgetContainer timestamp={new Date().toISOString()}>
                {viewMode === 'cards' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mockCommodities.map((commodity) => (
                      <PriceCard
                        key={commodity.symbol}
                        name={commodity.name}
                        symbol={commodity.symbol}
                        price={commodity.price}
                        change={commodity.change}
                        changePercent={commodity.changePercent}
                        currency={commodity.currency}
                        unit={commodity.unit}
                        lastUpdate={new Date().toISOString()}
                      />
                    ))}
                  </div>
                ) : (
                  <PriceTable data={mockCommodities} type="commodity" />
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

            {isLoading ? (
              <LoadingSkeleton count={6} type={viewMode === 'cards' ? 'card' : 'table'} />
            ) : (
              <WidgetContainer timestamp={new Date().toISOString()}>
                {viewMode === 'cards' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mockForexCards.map((forex) => (
                      <ForexCard
                        key={forex.pair}
                        pair={forex.pair}
                        name={forex.name}
                        rate={forex.rate}
                        change={forex.change}
                        changePercent={forex.changePercent}
                        lastUpdate={new Date().toISOString()}
                      />
                    ))}
                  </div>
                ) : (
                  <PriceTable data={mockForex} type="forex" />
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
