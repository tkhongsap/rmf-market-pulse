# Financial Data Tracker - ChatGPT App

A real-time financial data application that integrates with ChatGPT using the Model Context Protocol (MCP). Users can access:
- **Commodities**: Simulated prices for gold, silver, oil, and agricultural products
- **Forex**: Simulated currency exchange rates  
- **Thailand RMF/Unit Trusts**: Real data from SET SMART API

## Project Overview

### Technology Stack
- **Frontend**: React, TypeScript, TanStack Query, Tailwind CSS, Shadcn UI
- **Backend**: Express.js, TypeScript, Node.js 20
- **Data Sources**: 
  - SET SMART API for Thailand mutual funds (Unit Trusts)
  - Simulated data for commodities and forex
- **Integration**: MCP (Model Context Protocol) for ChatGPT embedding

### Current Implementation Status

#### Completed
- ✅ Frontend UI with interactive widgets for commodities, forex, and RMF funds
- ✅ Dark mode support with theme toggle
- ✅ Card and table view modes for data display
- ✅ Responsive design following OpenAI Apps SDK guidelines  
- ✅ RESTful API endpoints (/api/commodities, /api/forex, /api/rmf)
- ✅ MCP protocol endpoint for ChatGPT integration (/mcp)
- ✅ Health check endpoint (/healthz)
- ✅ Error handling and loading states
- ✅ TanStack Query integration with default fetch handler
- ✅ **SET SMART API Integration** for Thailand Unit Trusts (mutual funds)
  - Real-time NAV (Net Asset Value) data
  - P/NAV ratios, dividend yields
  - Trading volume and value
  - Intelligent fallback: Searches up to 60 days back for latest available data
  - Rate limiting: 3000 calls per 5 minutes
  - Caching: 1-hour TTL for recent data

#### Data Sources
- 📊 **Commodities & Forex**: Simulated data
  - Realistic baseline prices with volatility simulation
  - Ready for production API integration when needed
  
- 📈 **Thailand RMF/Unit Trusts**: Live data from SET SMART API
  - Real NAV, P/NAV, and performance metrics
  - Fetches latest available data (searches back up to 60 days)
  - Currently showing all Unit Trusts (UT security type)
  - **Limitation**: SET SMART API doesn't distinguish RMF specifically from other mutual funds
  - **Limitation**: Fund names are synthesized as "[Symbol] Unit Trust" because SET SMART EOD endpoints only provide price data, not fund metadata
    - To get real fund names, would need: security master endpoint, separate metadata source, or manual mapping table
  - Users can search/filter by symbol (e.g., "SCBSET", "VAYU1")

### API Endpoints

#### REST Endpoints
- `GET /api/commodities` - Fetch all commodity prices (simulated)
- `GET /api/commodities/:commodity` - Fetch specific commodity (e.g., 'gold', 'oil')
- `GET /api/forex` - Fetch all forex pairs (simulated)
- `GET /api/forex/:pair` - Fetch specific pair (e.g., 'EUR/USD')
- `GET /api/rmf` - Fetch Thailand Unit Trusts (real data from SET SMART API)
  - Query params: `page`, `pageSize`, `search`, `fundType`
- `GET /api/rmf/:symbol` - Fetch specific fund by symbol
- `GET /healthz` - Health check
- `GET /api/debug/sec` - Debug endpoint to test SET SMART API connection

#### MCP Endpoint
- `POST /mcp` - ChatGPT integration endpoint
  - Supports `tools/list` method for tool discovery
  - Supports `tools/call` method for executing queries
  - Tools: `get_commodity_prices`, `get_forex_rates`, `get_rmf_funds`

### Design Guidelines

The application follows OpenAI's Apps SDK design guidelines:
- **Conversational**: Natural extension of ChatGPT interface
- **Simple**: Single clear outcome - viewing market data
- **Responsive**: Fast loading (< 2s total)
- **Accessible**: WCAG 2.1 AA compliant

See `design_guidelines.md` for complete design specifications.

### Data Models

Located in `shared/schema.ts`:
- `Commodity`: Symbol, name, price, change, changePercent, currency, unit
- `Forex`: Pair, name, rate, change, changePercent
- `RMFFund`: Symbol, fundName, securityType, nav, navChange, navChangePercent, navDate, priorNav, pnav, totalVolume, totalValue, dividendYield
- `SETSMARTUnitTrust`: Raw response from SET SMART API (mapped to RMFFund)

### Project Structure

```
client/
  src/
    components/      # Reusable UI components
      PriceCard.tsx  # Individual commodity/forex card
      ForexCard.tsx  # Forex-specific card
      PriceTable.tsx # Table view for prices
      RMFFundCard.tsx # RMF fund card
      RMFFundTable.tsx # RMF fund table
      WidgetContainer.tsx # Widget wrapper
      LoadingSkeleton.tsx # Loading states
      ErrorMessage.tsx    # Error handling
      ThemeToggle.tsx     # Dark mode toggle
    pages/
      Home.tsx        # Main application page
      RMF.tsx         # RMF funds page
server/
  services/
    yahooFinance.ts  # Simulated commodity/forex data
    secApi.ts        # SET SMART API integration
  routes.ts          # API and MCP endpoints
shared/
  schema.ts          # Shared type definitions
```

### Next Steps

1. Integrate real API for commodities and forex (replace simulated data)
2. Add more sophisticated fund filtering (by fund type, risk level, etc.)
3. Implement historical NAV charts for funds
4. Add portfolio tracking functionality
5. Create deployment configuration for production use

### ChatGPT Integration

The MCP endpoint at `/mcp` enables ChatGPT to call two tools:
- `get_commodity_prices`: Returns real-time commodity prices
- `get_forex_rates`: Returns real-time currency exchange rates

Users can ask questions like:
- "What's the current price of gold?"
- "Show me major currency pairs"
- "How is crude oil performing today?"

### Development

```bash
npm run dev  # Starts both frontend and backend on port 5000
```

The workflow "Start application" is configured to run this command automatically.

