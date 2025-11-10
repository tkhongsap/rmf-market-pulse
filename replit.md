# Thai RMF Market Pulse - ChatGPT App

A real-time financial data application for tracking Thai Retirement Mutual Funds (RMF) that integrates with ChatGPT using the Model Context Protocol (MCP). Users can access:
- **Thailand RMF**: 410+ Thai Retirement Mutual Funds with real data from Thailand SEC API

## Project Overview

### Technology Stack
- **Frontend**: React, TypeScript, TanStack Query, Tailwind CSS, Radix UI
- **Backend**: Express.js, TypeScript, Node.js 20
- **Data Sources**:
  - Thailand SEC API for Retirement Mutual Funds (RMF)
  - Pre-extracted fund database (410 funds in CSV/Markdown)
- **Integration**: MCP (Model Context Protocol) for ChatGPT embedding

### Current Implementation Status

#### Completed
- ✅ Frontend UI with interactive widgets for RMF funds
- ✅ Dark mode support with theme toggle
- ✅ Card and table view modes for fund display
- ✅ Responsive design following OpenAI Apps SDK guidelines
- ✅ RESTful API endpoint (/api/rmf)
- ✅ MCP protocol endpoint for ChatGPT integration (/mcp)
- ✅ Health check endpoint (/healthz)
- ✅ Error handling and loading states
- ✅ TanStack Query integration with default fetch handler
- ✅ **Thailand SEC API Integration** for RMF (Retirement Mutual Funds)
  - Real-time NAV (Net Asset Value) data
  - Fund details (AMC, classification, risk level)
  - Asset allocation and holdings
  - Rate limiting: 3000 calls per 5 minutes
  - Caching: Fund lists (24h TTL), NAV data (1h TTL)
- ✅ **Structured Fund Database**
  - 410 funds extracted to CSV and Markdown formats
  - 8 data fields per fund (Symbol, Fund Name, AMC, Classification, Management Style, Dividend Policy, Risk, Tax Allowance)
  - Extraction scripts for reproducibility (Node.js and Python)

#### Data Sources
- 📈 **Thailand RMF**: Live data from Thailand SEC API
  - Real NAV and performance metrics
  - Fund details including AMC, classification, risk level
  - Asset allocation and top holdings
  - Dividend policy and tax allowance information
  - Users can search/filter by fund name, symbol, type, or AMC
- 📊 **Fund Database**: Pre-extracted structured data
  - CSV format: `docs/rmf-funds.csv`
  - Markdown format: `docs/rmf-funds.md`
  - Extraction scripts: `parse_rmf_funds.js` (Node.js), `parse_rmf_funds.py` (Python)

### API Endpoints

#### REST Endpoints
- `GET /api/rmf` - Fetch Thai RMF funds (real data from Thailand SEC API)
  - Query params: `page`, `pageSize`, `search`, `fundType`
- `GET /api/rmf/:fundCode` - Fetch specific fund details by fund code
- `GET /healthz` - Health check

#### MCP Endpoint
- `POST /mcp` - ChatGPT integration endpoint
  - Supports `tools/list` method for tool discovery
  - Supports `tools/call` method for executing queries
  - Tools: `get_rmf_funds`, `get_rmf_fund_detail`

### Design Guidelines

The application follows OpenAI's Apps SDK design guidelines:
- **Conversational**: Natural extension of ChatGPT interface
- **Simple**: Single clear outcome - viewing market data
- **Responsive**: Fast loading (< 2s total)
- **Accessible**: WCAG 2.1 AA compliant

See `design_guidelines.md` for complete design specifications.

### Data Models

Located in `shared/schema.ts`:
- `RMFFund`: Symbol, fundName, amc, fundType, riskLevel, nav, navChange, navChangePercent, navDate
- `RMFFundDetail`: Extended fund information including asset allocation, top holdings, dividend policy
- `AssetAllocation`: Asset type, percentage allocation
- `FundHolding`: Security symbol, name, percentage of portfolio

### Project Structure

```
client/
  src/
    components/      # Reusable UI components
      RMFFundCard.tsx    # RMF fund card
      RMFFundTable.tsx   # RMF fund table
      LoadingSkeleton.tsx # Loading states
      ErrorMessage.tsx    # Error handling
      ThemeToggle.tsx     # Dark mode toggle
      ui/                 # Radix UI primitives
    pages/
      RMF.tsx         # Main RMF application page
server/
  services/
    secApi.ts        # Thailand SEC API integration
  routes.ts          # API and MCP endpoints
shared/
  schema.ts          # Shared type definitions
docs/
  rmf-funds.csv      # 410 funds database (CSV)
  rmf-funds.md       # 410 funds database (Markdown)
parse_rmf_funds.js   # Node.js extraction script
parse_rmf_funds.py   # Python extraction script
```

### Next Steps

1. Add more sophisticated fund filtering (by risk level, dividend policy, etc.)
2. Implement historical NAV charts for funds
3. Add portfolio tracking functionality
4. Implement fund comparison features
5. Create deployment configuration for production use

### ChatGPT Integration

The MCP endpoint at `/mcp` enables ChatGPT to call RMF-related tools:
- `get_rmf_funds`: Returns paginated list of Thai RMF funds with filtering
- `get_rmf_fund_detail`: Returns detailed information about a specific fund

Users can ask questions like:
- "Show me Thai retirement mutual funds"
- "What are the top equity RMF funds?"
- "Tell me about SCBRMGIF fund"
- "Which RMF funds have low risk?"

### Development

```bash
npm run dev  # Starts both frontend and backend on port 5000
```

The workflow "Start application" is configured to run this command automatically.

