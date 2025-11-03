# Real-Time Financial Data Tracker

A full-stack TypeScript application for tracking real-time commodity prices and forex exchange rates. Built with Express and React, designed to integrate with ChatGPT as an MCP (Model Context Protocol) widget.

## Features

- **Real-time Market Data**: Live tracking of commodity prices (Gold, Silver, Crude Oil, Natural Gas)
- **Forex Exchange Rates**: Current exchange rates for major currency pairs (EUR/USD, GBP/USD, USD/JPY, AUD/USD)
- **Thai RMF Tracker**: Track 200+ Thai Retirement Mutual Funds with real-time NAV data from Thailand SEC
- **Auto-refresh**: Automatic data updates (60 seconds for commodities/forex, 5 minutes for RMF funds)
- **Search & Filter**: Advanced filtering for RMF funds by type, AMC, and search queries
- **Dark/Light Theme**: System-aware theme switching
- **ChatGPT Integration**: MCP protocol support for AI assistant interactions
- **Responsive Design**: Clean, minimal UI optimized for data presentation

## Tech Stack

### Frontend
- **React** - UI framework
- **Vite** - Build tool and dev server
- **Wouter** - Lightweight routing
- **TanStack Query** - Server state management
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible component primitives
- **Recharts** - Data visualization

### Backend
- **Express** - Web server
- **TypeScript** - Type safety
- **Drizzle ORM** - Database toolkit
- **PostgreSQL** - Database
- **Zod** - Schema validation

## Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <project-directory>
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create a .env file with:
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
PORT=5000
NODE_ENV=development
SEC_API_KEY=your_sec_api_key_here
```

**Note:** To use the Thai RMF fund tracker feature, you need to obtain an API key from the Thailand Securities and Exchange Commission (SEC):
- Visit [SEC API Developer Portal](https://api-portal.sec.or.th/)
- Register and subscribe to the **Fund Factsheet API** and **Fund Daily Info API**
- Add your API key to the `.env` file as `SEC_API_KEY`

4. Push database schema:
```bash
npm run db:push
```

## Development

Start the development server:
```bash
npm run dev
```

This will start both the frontend and backend on port 5000. The app will be available at `http://localhost:5000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Run production build
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Push database schema changes

## Project Structure

```
.
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   └── lib/         # Utilities and config
├── server/              # Express backend
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   └── services/        # Business logic
├── shared/              # Shared types and schemas
│   └── schema.ts        # Zod schemas
└── migrations/          # Database migrations
```

## API Endpoints

### Market Data
- `GET /api/commodities` - Get all commodity prices
- `GET /api/commodities/:symbol` - Get specific commodity
- `GET /api/forex` - Get all forex rates
- `GET /api/forex/:pair` - Get specific forex pair

### Thai RMF (Retirement Mutual Fund)
- `GET /api/rmf` - Get all RMF funds (with pagination, search, and filtering)
  - Query params: `page`, `pageSize`, `search`, `fundType`
- `GET /api/rmf/:fundCode` - Get specific RMF fund details

### MCP Protocol (ChatGPT Integration)
- `POST /mcp` - MCP protocol endpoint for tool discovery and execution
  - Tools: `get_commodity_prices`, `get_forex_rates`, `get_rmf_funds`, `get_rmf_fund_detail`

### Health Check
- `GET /healthz` - Server health check

## ChatGPT Integration

This app implements the Model Context Protocol (MCP) for seamless ChatGPT integration:

1. **Tool Discovery**: ChatGPT can discover available tools via `tools/list`
2. **Tool Execution**: Execute tools like `get_commodity_prices` and `get_forex_rates`
3. **Formatted Responses**: Returns structured data optimized for AI consumption

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `PORT` | Server port (default: 5000) | No |
| `NODE_ENV` | Environment mode | No |
| `SEC_API_KEY` | Thailand SEC API key for RMF data | Yes (for RMF feature) |

## Path Aliases

The project uses TypeScript path aliases:
- `@/*` - Client source files (`client/src/*`)
- `@shared/*` - Shared schemas/types
- `@assets/*` - Static assets

## Design Philosophy

This app follows the OpenAI Apps SDK Design System:
- **Minimal, data-first**: Clean presentation without decorative elements
- **Semantic colors**: Green for gains, red for losses
- **System fonts**: Optimized for ChatGPT integration
- **Accessibility**: Built with Radix UI primitives

## Data Sources

### Commodities & Forex
Currently uses simulated market data with realistic price movements. Future versions will integrate with Yahoo Finance API for real-time data.

### Thai RMF Funds
Real-time data from Thailand Securities and Exchange Commission (SEC) API:
- **Fund Factsheet API**: Basic fund information (name, AMC, type, risk level)
- **Fund Daily Info API**: Daily NAV updates and performance metrics
- **Rate Limiting**: 3,000 API calls per 5 minutes
- **Caching**: Fund lists cached for 24 hours, NAV data cached for 1 hour

## License

[Add your license here]

## Contributing

[Add contribution guidelines here]
