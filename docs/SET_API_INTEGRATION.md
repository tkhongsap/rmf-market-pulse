# SET API Integration Guide

## Overview

This document provides guidance for integrating the Stock Exchange of Thailand (SET) SMART Marketplace API into the application. The integration will add real-time stock market data, company information, index tracking, and investor statistics.

## API Access Setup

### 1. Register for API Access

Visit the SET SMART Marketplace portal:
- URL: https://www.set.or.th/app/online-data
- Create an account or login with existing credentials
- Navigate to the developer section to create API keys

### 2. API Key Types

**Test Key**
- For development and testing with sample data
- No subscription required
- Good for prototyping and integration development
- May provide delayed data (15-20 minute delay typical)

**Production Key**
- Requires active subscription to data services
- Provides real-time or near-real-time data
- Subscription fees apply per data category
- Recommended to regenerate every 6-12 months for security

### 3. Required Subscriptions

Subscribe to these data services based on your needs:
- **Market Data API** - Real-time/delayed stock quotes, trading volumes
- **Reference Data API** - Security profiles, corporate actions
- **Index Data API** - SET50, SET100, sector indices
- **Investor Statistics API** - Trading breakdown by investor type

### 4. Environment Configuration

Add to `.env` file:
```bash
SET_API_KEY=your_api_key_here
```

## API Details

### Authentication

Based on similar Thai government APIs (like SEC API), authentication likely uses:
```http
Ocp-Apim-Subscription-Key: YOUR_API_KEY
Content-Type: application/json
```

**Note**: Verify exact header format in SET developer documentation after registration.

### Rate Limits

From public documentation:
- **Reference Data**: Up to 5 requests per day (CSV + JSON combined)
- **Tick Data**: Max 5 downloads per daily file, 2 per monthly file
- **Market Data**: Limits not publicly specified - check developer portal
- **Other endpoints**: Verify in API documentation

**Important**: Rate limits are strict. Implement aggressive caching strategy.

### Data Formats

- Primary: JSON (preferred for API integration)
- Alternative: CSV (requires parsing)

### Base URL

To be confirmed from developer portal. Likely format:
```
https://api.set.or.th/v1/
```

## Available Data Categories

### 1. Market Data (Stock Quotes)

**Use Cases**:
- Display real-time/delayed stock prices
- Show trading volumes and price changes
- Track specific securities

**Data Points**:
- Symbol, last price, change, % change
- Open, high, low, close (OHLC)
- Volume, value, trade count
- Bid/ask prices and volumes
- Market status (open/closed)

**Suggested Cache**: 1-5 minutes (depending on real-time vs delayed subscription)

### 2. Reference Data

**Use Cases**:
- Company profiles and information
- Security details (ISIN, market, sector)
- Corporate actions (dividends, splits, rights offerings)

**Data Points**:
- Company name (Thai & English)
- Industry sector classification
- Market (SET/mai)
- Corporate action calendar
- Trading status (normal, halt, suspension)

**Suggested Cache**: 24 hours (rarely changes)

### 3. Index Information

**Use Cases**:
- Track major indices (SET, SET50, SET100)
- Display sector performance
- Show index constituents and weights

**Data Points**:
- Index value, change, % change
- Constituents list with weights
- Total return index (TRI) values
- Sector indices
- Historical index data

**Suggested Cache**: 5-15 minutes

### 4. Investor Statistics

**Use Cases**:
- Analyze market sentiment
- Track institutional vs retail activity
- Display foreign investor flows

**Data Points**:
- Buy/sell volumes by investor type:
  - Local institutions
  - Foreign investors
  - Local retail
- Net buy/sell by category
- Daily/weekly/monthly aggregations

**Suggested Cache**: 1 hour (updated end-of-day or hourly)

## Implementation Architecture

### Backend Structure

Following existing `server/services/secApi.ts` pattern:

**File**: `server/services/setApi.ts`

```typescript
// Rate limiting configuration
const RATE_LIMITS = {
  MARKET_DATA: { calls: 100, window: 60000 }, // 100/min (adjust based on actual limits)
  REFERENCE_DATA: { calls: 5, window: 86400000 }, // 5/day
  INDEX_DATA: { calls: 60, window: 60000 }, // 60/min (adjust)
  INVESTOR_STATS: { calls: 20, window: 3600000 }, // 20/hour (adjust)
};

// Cache TTL configuration
const CACHE_TTL = {
  MARKET_DATA: 60000, // 1 minute (adjust based on subscription type)
  REFERENCE_DATA: 86400000, // 24 hours
  INDEX_DATA: 300000, // 5 minutes
  INVESTOR_STATS: 3600000, // 1 hour
};

// Core functions to implement:
// - fetchStocks(symbols?: string[])
// - fetchStockDetail(symbol: string)
// - fetchIndices(indices?: string[])
// - fetchInvestorStats(date?: string)
// - searchStocks(query: string)
```

**Key Features**:
- ✅ Rate limiting per endpoint category
- ✅ Multi-tier caching (in-memory + TTL)
- ✅ TypeScript type safety
- ✅ Error handling with fallbacks
- ✅ Request batching where possible
- ✅ Graceful degradation on rate limit

### Type Definitions

**File**: `shared/schema.ts`

```typescript
export interface Stock {
  symbol: string;
  securityName: string;
  securityNameEn?: string;
  market: 'SET' | 'mai';
  sector?: string;
  lastPrice: number;
  change: number;
  changePercent: number;
  open: number;
  high: number;
  low: number;
  previousClose: number;
  volume: number;
  value: number;
  tradingStatus: string;
  lastUpdate: string;
}

export interface SetIndex {
  indexName: string;
  indexSymbol: string;
  indexValue: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  constituents?: IndexConstituent[];
  lastUpdate: string;
}

export interface IndexConstituent {
  symbol: string;
  companyName: string;
  weight: number;
}

export interface InvestorStats {
  date: string;
  investorType: 'local_institutional' | 'foreign' | 'local_retail';
  buyVolume: number;
  sellVolume: number;
  buyValue: number;
  sellValue: number;
  netVolume: number;
  netValue: number;
}

export interface SecurityProfile {
  symbol: string;
  securityName: string;
  securityNameEn?: string;
  market: string;
  industry: string;
  sector: string;
  isin?: string;
  listedDate?: string;
  paidUpCapital?: number;
  parValue?: number;
  website?: string;
}
```

### API Routes

**File**: `server/routes.ts`

Add these endpoints:

```typescript
// Stock market data
app.get('/api/set/stocks', async (req, res) => {
  // Query params: symbols (comma-separated), market, sector
  const { symbols, market, sector } = req.query;
  // Return array of Stock objects
});

app.get('/api/set/stocks/:symbol', async (req, res) => {
  // Return detailed Stock object with profile info
});

// Index data
app.get('/api/set/indices', async (req, res) => {
  // Query params: indices (comma-separated)
  // Return array of SetIndex objects
});

app.get('/api/set/indices/:indexSymbol', async (req, res) => {
  // Return detailed SetIndex with constituents
});

// Investor statistics
app.get('/api/set/investor-stats', async (req, res) => {
  // Query params: date (YYYY-MM-DD), startDate, endDate
  // Return array of InvestorStats objects
});

// Search
app.get('/api/set/search', async (req, res) => {
  // Query param: q (search query)
  // Return matching stocks with basic info
});
```

### Frontend Components

**Navigation**: Update `client/src/App.tsx` to add route
```typescript
<Link href="/stocks">Stocks</Link>
```

**Page**: Create `client/src/pages/Stocks.tsx`
- Similar structure to `RMF.tsx`
- Tabs for: Market Overview, Indices, Investor Stats
- Real-time data with TanStack Query
- Auto-refresh every 1-5 minutes

**Components**:
- `StockCard.tsx` - Individual stock display
- `StockTable.tsx` - Sortable table view
- `IndexWidget.tsx` - Major indices dashboard
- `InvestorStatsChart.tsx` - Investor activity visualization

**Queries**: Use TanStack Query with proper refetch intervals
```typescript
const { data: stocks } = useQuery({
  queryKey: ['stocks', symbols],
  queryFn: () => fetch('/api/set/stocks?symbols=' + symbols).then(r => r.json()),
  refetchInterval: 60000, // 1 minute (adjust based on subscription)
  staleTime: 30000,
});
```

### MCP Integration (ChatGPT Widget)

**File**: `server/routes.ts` - Update `/mcp` endpoint

Add tools:
```typescript
{
  name: 'get_set_stocks',
  description: 'Get current stock prices from Stock Exchange of Thailand',
  inputSchema: {
    type: 'object',
    properties: {
      symbols: {
        type: 'array',
        items: { type: 'string' },
        description: 'Stock symbols (e.g., ["PTT", "KBANK", "CPALL"])',
      },
      market: {
        type: 'string',
        enum: ['SET', 'mai'],
        description: 'Filter by market',
      },
    },
  },
},
{
  name: 'get_set_indices',
  description: 'Get Stock Exchange of Thailand index values',
  inputSchema: {
    type: 'object',
    properties: {
      indices: {
        type: 'array',
        items: { type: 'string' },
        description: 'Index symbols (e.g., ["SET", "SET50", "SET100"])',
      },
    },
  },
},
{
  name: 'get_investor_stats',
  description: 'Get investor trading statistics from SET',
  inputSchema: {
    type: 'object',
    properties: {
      date: {
        type: 'string',
        description: 'Date in YYYY-MM-DD format (optional, defaults to latest)',
      },
    },
  },
},
```

## Implementation Checklist

### Phase 1: Setup & Research
- [ ] Register at SET SMART Marketplace portal
- [ ] Create Test API key
- [ ] Access developer documentation
- [ ] Test authentication method
- [ ] Verify actual endpoint URLs
- [ ] Check rate limits for each data category
- [ ] Test sample requests with Postman/curl
- [ ] Document actual API response structures

### Phase 2: Backend Development
- [ ] Create `server/services/setApi.ts`
- [ ] Implement rate limiting per endpoint category
- [ ] Implement caching with appropriate TTLs
- [ ] Add TypeScript interfaces for SET API responses
- [ ] Create data transformation functions
- [ ] Add comprehensive error handling
- [ ] Implement fallback mechanisms for rate limits
- [ ] Add logging and monitoring

### Phase 3: Type Definitions
- [ ] Add Stock, SetIndex, InvestorStats types to `shared/schema.ts`
- [ ] Create Zod schemas for validation
- [ ] Export types for client use

### Phase 4: API Routes
- [ ] Add routes to `server/routes.ts`
- [ ] Implement query parameter handling
- [ ] Add request validation
- [ ] Test endpoints with various parameters

### Phase 5: Frontend
- [ ] Create `client/src/pages/Stocks.tsx`
- [ ] Add routing in `client/src/App.tsx`
- [ ] Create stock display components
- [ ] Set up TanStack Query hooks
- [ ] Implement auto-refresh logic
- [ ] Add loading/error states
- [ ] Style components following design guidelines

### Phase 6: MCP Integration
- [ ] Add new tools to `/mcp` endpoint
- [ ] Test with ChatGPT MCP client
- [ ] Verify data formatting for AI consumption

### Phase 7: Testing & Optimization
- [ ] Test rate limiting behavior
- [ ] Verify cache effectiveness
- [ ] Monitor API usage vs limits
- [ ] Optimize refetch intervals
- [ ] Performance testing
- [ ] Error scenario testing

## Technical Considerations

### Rate Limit Management

**Strategy**:
1. **Aggressive Caching**: Cache all responses with appropriate TTLs
2. **Request Batching**: Combine multiple symbol requests where API supports it
3. **Graceful Degradation**: Show cached data when rate limited
4. **User Feedback**: Inform users when displaying cached/stale data

**Implementation**:
```typescript
// Example rate limit error handling
try {
  const data = await setApiRequest('/market-data');
  return data;
} catch (error) {
  if (error.message.includes('rate limit')) {
    // Try to return cached data even if expired
    const staleCache = cache.get(cacheKey);
    if (staleCache) {
      console.log('[SET API] Serving stale cache due to rate limit');
      return staleCache.data;
    }
  }
  throw error;
}
```

### Data Freshness

**Real-time vs Delayed**:
- Test key likely provides delayed data (15-20 min delay)
- Production subscription may offer real-time or 1-2 min delayed
- Adjust frontend refetch intervals based on subscription type
- Display data timestamp to show freshness

**Cache Strategy**:
- Short TTL for market data during trading hours
- Longer TTL outside trading hours (9:30 AM - 4:30 PM ICT)
- Consider time-aware caching logic

### Error Handling

**Common Scenarios**:
1. **Rate Limit Exceeded**: Serve cached data, show staleness indicator
2. **API Down**: Fallback to cached data, show error banner
3. **Invalid Symbol**: Return 404 with helpful message
4. **Authentication Failure**: Log error, check API key configuration
5. **Network Timeout**: Retry with exponential backoff

### Performance Optimization

1. **Lazy Loading**: Load detailed data only when needed
2. **Pagination**: Paginate large stock lists
3. **Debouncing**: Debounce search queries
4. **Parallel Requests**: Fetch multiple data types concurrently
5. **Conditional Fetching**: Only refetch when tab is active

## Testing Strategy

### Manual Testing

1. **API Exploration**:
   - Use Postman/curl to test actual endpoints
   - Document request/response formats
   - Test rate limiting behavior
   - Verify authentication

2. **Integration Testing**:
   - Test with Test API key first
   - Verify data accuracy against SET website
   - Test during and outside trading hours
   - Monitor cache hit rates

### Monitoring

Add logging for:
- API request counts per endpoint
- Cache hit/miss rates
- Rate limit encounters
- Error frequencies
- Response times

## Security Considerations

1. **API Key Protection**:
   - Never commit API keys to repository
   - Use environment variables only
   - Rotate keys every 6-12 months
   - Use separate keys for dev/staging/production

2. **Rate Limit Compliance**:
   - Respect SET's rate limits
   - Don't attempt to circumvent limits
   - Monitor usage proactively

3. **Data Usage**:
   - Review SET's terms of service
   - Ensure compliance with data redistribution policies
   - Check if MCP/ChatGPT integration requires special permission

## Cost Considerations

- Test key: Free (limited data/features)
- Production subscriptions: Paid (verify pricing in portal)
- Consider data usage vs API call costs
- Monitor usage to stay within plan limits

## Next Steps

1. **Immediate**: Register for SET API access and obtain Test key
2. **Week 1**: Test API endpoints, document actual structure
3. **Week 2**: Implement backend service and routes
4. **Week 3**: Build frontend components
5. **Week 4**: Testing, optimization, and MCP integration

## Resources

- SET SMART Marketplace: https://www.set.or.th/app/online-data
- Developer Guide: Available after registration
- API Reference: Available in developer portal
- Support: Check portal for support contact

## Notes

- This document is based on publicly available information and similar Thai government APIs
- Actual implementation details may differ - verify with official SET API documentation
- Update this document as you discover actual API specifications
- Consider creating a separate `SET_API_CHANGELOG.md` to track API updates
