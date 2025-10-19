import yahooFinance from 'yahoo-finance2';
import type { Commodity, Forex } from '@shared/schema';

// Yahoo Finance symbol mappings for commodities
const COMMODITY_SYMBOLS = {
  gold: 'GC=F',      // Gold Futures
  silver: 'SI=F',    // Silver Futures
  oil: 'CL=F',       // Crude Oil WTI Futures
  brent: 'BZ=F',     // Brent Crude Oil Futures
  natgas: 'NG=F',    // Natural Gas Futures
  copper: 'HG=F',    // Copper Futures
  wheat: 'ZW=F',     // Wheat Futures
  corn: 'ZC=F',      // Corn Futures
  soybeans: 'ZS=F',  // Soybean Futures
  coffee: 'KC=F',    // Coffee Futures
  sugar: 'SB=F',     // Sugar Futures
  cotton: 'CT=F',    // Cotton Futures
  platinum: 'PL=F',  // Platinum Futures
  palladium: 'PA=F', // Palladium Futures
};

// Yahoo Finance symbol mappings for forex
const FOREX_SYMBOLS = {
  'EUR/USD': 'EURUSD=X',
  'GBP/USD': 'GBPUSD=X',
  'USD/JPY': 'JPY=X',
  'USD/CHF': 'CHF=X',
  'AUD/USD': 'AUDUSD=X',
  'USD/CAD': 'CAD=X',
  'EUR/GBP': 'EURGBP=X',
  'EUR/JPY': 'EURJPY=X',
  'GBP/JPY': 'GBPJPY=X',
  'USD/CNY': 'CNY=X',
  'NZD/USD': 'NZDUSD=X',
  'EUR/CHF': 'EURCHF=X',
};

const COMMODITY_METADATA: Record<string, { name: string; unit: string }> = {
  'GC=F': { name: 'Gold', unit: 'oz' },
  'SI=F': { name: 'Silver', unit: 'oz' },
  'CL=F': { name: 'Crude Oil (WTI)', unit: 'barrel' },
  'BZ=F': { name: 'Brent Crude Oil', unit: 'barrel' },
  'NG=F': { name: 'Natural Gas', unit: 'MMBtu' },
  'HG=F': { name: 'Copper', unit: 'lb' },
  'ZW=F': { name: 'Wheat', unit: 'bushel' },
  'ZC=F': { name: 'Corn', unit: 'bushel' },
  'ZS=F': { name: 'Soybeans', unit: 'bushel' },
  'KC=F': { name: 'Coffee', unit: 'lb' },
  'SB=F': { name: 'Sugar', unit: 'lb' },
  'CT=F': { name: 'Cotton', unit: 'lb' },
  'PL=F': { name: 'Platinum', unit: 'oz' },
  'PA=F': { name: 'Palladium', unit: 'oz' },
};

const FOREX_METADATA: Record<string, string> = {
  'EURUSD=X': 'Euro to US Dollar',
  'GBPUSD=X': 'British Pound to US Dollar',
  'JPY=X': 'US Dollar to Japanese Yen',
  'CHF=X': 'US Dollar to Swiss Franc',
  'AUDUSD=X': 'Australian Dollar to US Dollar',
  'CAD=X': 'US Dollar to Canadian Dollar',
  'EURGBP=X': 'Euro to British Pound',
  'EURJPY=X': 'Euro to Japanese Yen',
  'GBPJPY=X': 'British Pound to Japanese Yen',
  'CNY=X': 'US Dollar to Chinese Yuan',
  'NZDUSD=X': 'New Zealand Dollar to US Dollar',
  'EURCHF=X': 'Euro to Swiss Franc',
};

export async function fetchCommodities(symbols?: string[]): Promise<Commodity[]> {
  const symbolsToFetch = symbols || Object.values(COMMODITY_SYMBOLS);
  
  try {
    // @ts-ignore - Yahoo Finance types are complex, using runtime validation instead
    const result = await yahooFinance.quote(symbolsToFetch);
    const quotesArray = Array.isArray(result) ? result : [result];
    
    return quotesArray
      .filter((quote: any) => quote && quote.regularMarketPrice !== undefined)
      .map((quote: any) => {
        const metadata = COMMODITY_METADATA[quote.symbol];
        const price = quote.regularMarketPrice || 0;
        const previousClose = quote.regularMarketPreviousClose || price;
        const change = price - previousClose;
        const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0;

        return {
          symbol: quote.symbol,
          name: metadata?.name || quote.shortName || quote.symbol,
          price,
          change,
          changePercent,
          currency: quote.currency === 'USD' ? '$' : quote.currency || '$',
          unit: metadata?.unit,
          lastUpdate: new Date().toISOString(),
        };
      });
  } catch (error) {
    console.error('Error fetching commodity data:', error);
    throw new Error('Failed to fetch commodity prices from Yahoo Finance');
  }
}

export async function fetchForex(pairs?: string[]): Promise<Forex[]> {
  const symbolsToFetch = pairs 
    ? pairs.map(pair => FOREX_SYMBOLS[pair as keyof typeof FOREX_SYMBOLS]).filter(Boolean)
    : Object.values(FOREX_SYMBOLS);
  
  try {
    // @ts-ignore - Yahoo Finance types are complex, using runtime validation instead
    const result = await yahooFinance.quote(symbolsToFetch);
    const quotesArray = Array.isArray(result) ? result : [result];
    
    return quotesArray
      .filter((quote: any) => quote && quote.regularMarketPrice !== undefined)
      .map((quote: any) => {
        const pairName = Object.keys(FOREX_SYMBOLS).find(
          key => FOREX_SYMBOLS[key as keyof typeof FOREX_SYMBOLS] === quote.symbol
        ) || quote.symbol;
        
        const price = quote.regularMarketPrice || 0;
        const previousClose = quote.regularMarketPreviousClose || price;
        const change = price - previousClose;
        const changePercent = previousClose !== 0 ? (change / previousClose) * 100 : 0;

        return {
          pair: pairName,
          name: FOREX_METADATA[quote.symbol] || quote.shortName || pairName,
          rate: price,
          change,
          changePercent,
          lastUpdate: new Date().toISOString(),
        };
      });
  } catch (error) {
    console.error('Error fetching forex data:', error);
    throw new Error('Failed to fetch forex rates from Yahoo Finance');
  }
}

export async function fetchSpecificCommodity(commodityKey: string): Promise<Commodity | null> {
  const symbol = COMMODITY_SYMBOLS[commodityKey as keyof typeof COMMODITY_SYMBOLS];
  if (!symbol) {
    return null;
  }

  const commodities = await fetchCommodities([symbol]);
  return commodities[0] || null;
}

export async function fetchSpecificForexPair(pair: string): Promise<Forex | null> {
  const symbol = FOREX_SYMBOLS[pair as keyof typeof FOREX_SYMBOLS];
  if (!symbol) {
    return null;
  }

  const forexPairs = await fetchForex([pair]);
  return forexPairs[0] || null;
}
