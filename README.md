# Thai RMF Market Pulse

A full-stack TypeScript application for tracking Thai Retirement Mutual Funds (RMF) with real-time NAV data. Built with Express and React, designed to integrate with ChatGPT as an MCP (Model Context Protocol) widget.

## Features

- **Thai RMF Tracker**: Track 410+ Thai Retirement Mutual Funds with real-time NAV data from Thailand SEC
- **Auto-refresh**: Automatic data updates every 5 minutes
- **Search & Filter**: Advanced filtering by fund type, AMC, and search queries
- **Multiple Views**: Toggle between card and table views for optimal data visualization
- **Pagination**: Efficient browsing with 20 funds per page
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

### Thai RMF (Retirement Mutual Fund)
- `GET /api/rmf` - Get all RMF funds (with pagination, search, and filtering)
  - Query params: `page`, `pageSize`, `search`, `fundType`
- `GET /api/rmf/:fundCode` - Get specific RMF fund details

### MCP Protocol (ChatGPT Integration)
- `POST /mcp` - MCP protocol endpoint for tool discovery and execution
  - Tools: `get_rmf_funds`, `get_rmf_fund_detail`

### Health Check
- `GET /healthz` - Server health check

## ChatGPT Integration

This app implements the Model Context Protocol (MCP) for seamless ChatGPT integration:

1. **Tool Discovery**: ChatGPT can discover available tools via `tools/list`
2. **Tool Execution**: Execute tools like `get_rmf_funds` and `get_rmf_fund_detail`
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

### Thai RMF Funds
Real-time data from Thailand Securities and Exchange Commission (SEC) API:
- **Fund Factsheet API**: Basic fund information (name, AMC, type, risk level)
- **Fund Daily Info API**: Daily NAV updates and performance metrics
- **Rate Limiting**: 3,000 API calls per 5 minutes
- **Caching**: Fund lists cached for 24 hours, NAV data cached for 1 hour

### Fund Database
Pre-extracted structured data available in:
- `docs/rmf-funds.csv` - 410 funds with 8 data fields (Symbol, Fund Name, AMC, Classification, Management Style, Dividend Policy, Risk, Tax Allowance)
- `docs/rmf-funds.md` - Same data in markdown table format
- Extraction scripts available: `parse_rmf_funds.js` (Node.js) and `parse_rmf_funds.py` (Python)

## License

[Add your license here]

## Contributing

[Add contribution guidelines here]
