# Commodity & Currency Tracker - ChatGPT App

A real-time financial data application that integrates with ChatGPT using the Model Context Protocol (MCP). Users can ask natural language questions to get live commodity prices and currency exchange rates displayed in an interactive widget.

## Project Overview

### Technology Stack
- **Frontend**: React, TypeScript, TanStack Query, Tailwind CSS, Shadcn UI
- **Backend**: Express.js, TypeScript, Node.js 20
- **Data Source**: Yahoo Finance API (via yahoo-finance2 package)
- **Integration**: MCP (Model Context Protocol) for ChatGPT embedding

### Current Implementation Status

#### Completed
- ✅ Frontend UI with interactive widgets for commodities and forex
- ✅ Dark mode support with theme toggle
- ✅ Card and table view modes for data display
- ✅ Responsive design following OpenAI Apps SDK guidelines  
- ✅ RESTful API endpoints structure (/api/commodities, /api/forex)
- ✅ MCP protocol endpoint for ChatGPT integration (/mcp)
- ✅ Health check endpoint (/healthz)
- ✅ Error handling and loading states
- ✅ TanStack Query integration with default fetch handler

#### Current Data Source
- 📊 Simulated Market Data
  - Backend currently generates realistic simulated commodity and forex prices
  - Simulates price volatility with random variations (±2% for commodities, ±0.5% for forex)
  - Provides consistent realistic baseline prices for demonstration
  - **Ready for Production**: Architecture is designed for easy swap to real Yahoo Finance API

#### Path to Real Yahoo Finance Integration
To replace simulated data with live Yahoo Finance data:
1. Investigate yahoo-finance2 library's actual runtime API (types don't match implementation)
2. Alternative: Use direct HTTP calls to Yahoo Finance public endpoints
3. Replace `generatePriceChange()` calls in `server/services/yahooFinance.ts` with real API calls
4. Add response caching (60s TTL recommended)
5. Implement rate limiting and error retry logic

### API Endpoints

#### REST Endpoints
- `GET /api/commodities` - Fetch all commodity prices
- `GET /api/commodities/:commodity` - Fetch specific commodity (e.g., 'gold', 'oil')
- `GET /api/forex` - Fetch all forex pairs  
- `GET /api/forex/:pair` - Fetch specific pair (e.g., 'EUR/USD')
- `GET /healthz` - Health check

#### MCP Endpoint
- `POST /mcp` - ChatGPT integration endpoint
  - Supports `tools/list` method for tool discovery
  - Supports `tools/call` method for executing queries
  - Tools: `get_commodity_prices`, `get_forex_rates`

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

### Project Structure

```
client/
  src/
    components/      # Reusable UI components
      PriceCard.tsx  # Individual commodity/forex card
      ForexCard.tsx  # Forex-specific card
      PriceTable.tsx # Table view for prices
      WidgetContainer.tsx # Widget wrapper
      LoadingSkeleton.tsx # Loading states
      ErrorMessage.tsx    # Error handling
      ThemeToggle.tsx     # Dark mode toggle
    pages/
      Home.tsx        # Main application page
server/
  services/
    yahooFinance.ts  # Yahoo Finance API integration (in progress)
  routes.ts          # API and MCP endpoints
shared/
  schema.ts          # Shared type definitions
```

### Known Issues

1. **Yahoo Finance API**: The yahoo-finance2 library's TypeScript types don't match the actual runtime API. Need to either:
   - Find the correct method names through trial/error
   - Use a different financial data source
   - Implement direct HTTP calls to Yahoo Finance endpoints

### Next Steps

1. Complete Yahoo Finance API integration or implement alternative data source
2. Add caching layer for API responses (60s TTL recommended)
3. Implement rate limiting protection
4. Add comprehensive error handling for API failures
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

