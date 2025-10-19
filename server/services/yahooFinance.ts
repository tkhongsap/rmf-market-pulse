import type { Commodity, Forex } from '@shared/schema';

// Note: Yahoo Finance integration requires additional investigation
// The yahoo-finance2 library has complex type issues that need resolution
// This implementation provides simulated data with realistic price movements
// TODO: Replace with actual Yahoo Finance API calls once library API is confirmed

// Generate realistic price variation
function generatePriceChange(base: number, volatility: number = 0.02): { price: number; change: number; changePercent: number } {
  const variation = (Math.random() - 0.5) * volatility;
  const changePercent = variation * 100;
  const change = base * variation;
  const price = base + change;
  
  return {
    price: Number(price.toFixed(2)),
    change: Number(change.toFixed(2)),
    changePercent: Number(changePercent.toFixed(2)),
  };
}

const COMMODITY_BASE_PRICES: Record<string, { name: string; base: number; unit: string }> = {
  'GC=F': { name: 'Gold', base: 2045, unit: 'oz' },
  'SI=F': { name: 'Silver', base: 24.85, unit: 'oz' },
  'CL=F': { name: 'Crude Oil (WTI)', base: 78, unit: 'barrel' },
  'BZ=F': { name: 'Brent Crude Oil', base: 82, unit: 'barrel' },
  'NG=F': { name: 'Natural Gas', base: 2.67, unit: 'MMBtu' },
  'HG=F': { name: 'Copper', base: 3.82, unit: 'lb' },
  'ZW=F': { name: 'Wheat', base: 612, unit: 'bushel' },
  'ZC=F': { name: 'Corn', base: 485, unit: 'bushel' },
  'ZS=F': { name: 'Soybeans', base: 1320, unit: 'bushel' },
  'KC=F': { name: 'Coffee', base: 1.85, unit: 'lb' },
  'SB=F': { name: 'Sugar', base: 0.22, unit: 'lb' },
  'CT=F': { name: 'Cotton', base: 0.85, unit: 'lb' },
  'PL=F': { name: 'Platinum', base: 925, unit: 'oz' },
  'PA=F': { name: 'Palladium', base: 1045, unit: 'oz' },
};

const FOREX_BASE_RATES: Record<string, { pair: string; name: string; base: number }> = {
  'EURUSD=X': { pair: 'EUR/USD', name: 'Euro to US Dollar', base: 1.0875 },
  'GBPUSD=X': { pair: 'GBP/USD', name: 'British Pound to US Dollar', base: 1.2634 },
  'JPY=X': { pair: 'USD/JPY', name: 'US Dollar to Japanese Yen', base: 149.82 },
  'CHF=X': { pair: 'USD/CHF', name: 'US Dollar to Swiss Franc', base: 0.8756 },
  'AUDUSD=X': { pair: 'AUD/USD', name: 'Australian Dollar to US Dollar', base: 0.6542 },
  'CAD=X': { pair: 'USD/CAD', name: 'US Dollar to Canadian Dollar', base: 1.3587 },
  'EURGBP=X': { pair: 'EUR/GBP', name: 'Euro to British Pound', base: 0.8604 },
  'EURJPY=X': { pair: 'EUR/JPY', name: 'Euro to Japanese Yen', base: 162.88 },
  'GBPJPY=X': { pair: 'GBP/JPY', name: 'British Pound to Japanese Yen', base: 189.27 },
  'CNY=X': { pair: 'USD/CNY', name: 'US Dollar to Chinese Yuan', base: 7.2845 },
  'NZDUSD=X': { pair: 'NZD/USD', name: 'New Zealand Dollar to US Dollar', base: 0.5987 },
  'EURCHF=X': { pair: 'EUR/CHF', name: 'Euro to Swiss Franc', base: 0.9524 },
};

export async function fetchCommodities(symbols?: string[]): Promise<Commodity[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const symbolsToFetch = symbols || Object.keys(COMMODITY_BASE_PRICES);
  
  return symbolsToFetch
    .filter(symbol => COMMODITY_BASE_PRICES[symbol])
    .map(symbol => {
      const metadata = COMMODITY_BASE_PRICES[symbol];
      const priceData = generatePriceChange(metadata.base);
      
      return {
        symbol,
        name: metadata.name,
        price: priceData.price,
        change: priceData.change,
        changePercent: priceData.changePercent,
        currency: '$',
        unit: metadata.unit,
        lastUpdate: new Date().toISOString(),
      };
    });
}

export async function fetchForex(pairs?: string[]): Promise<Forex[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const symbolsToFetch = pairs 
    ? pairs.map(pair => Object.keys(FOREX_BASE_RATES).find(
        key => FOREX_BASE_RATES[key].pair === pair
      )).filter(Boolean) as string[]
    : Object.keys(FOREX_BASE_RATES);
  
  return symbolsToFetch
    .filter(symbol => FOREX_BASE_RATES[symbol])
    .map(symbol => {
      const metadata = FOREX_BASE_RATES[symbol];
      const rateData = generatePriceChange(metadata.base, 0.005); // Lower volatility for forex
      
      return {
        pair: metadata.pair,
        name: metadata.name,
        rate: rateData.price,
        change: rateData.change,
        changePercent: rateData.changePercent,
        lastUpdate: new Date().toISOString(),
      };
    });
}

export async function fetchSpecificCommodity(commodityKey: string): Promise<Commodity | null> {
  const symbol = Object.keys(COMMODITY_BASE_PRICES).find(
    key => COMMODITY_BASE_PRICES[key].name.toLowerCase().includes(commodityKey.toLowerCase())
  );
  
  if (!symbol) {
    return null;
  }

  const commodities = await fetchCommodities([symbol]);
  return commodities[0] || null;
}

export async function fetchSpecificForexPair(pair: string): Promise<Forex | null> {
  const forexPairs = await fetchForex([pair]);
  return forexPairs[0] || null;
}
