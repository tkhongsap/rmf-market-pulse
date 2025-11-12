# GitHub Copilot Instructions for Thai RMF Market Pulse

## Project Overview

This is a **full-stack TypeScript application** for tracking Thai Retirement Mutual Funds (RMF) with real-time NAV data. The app helps Thai investors discover, compare, and track RMF funds, particularly during tax season (November-December). It's designed to integrate with ChatGPT as an MCP (Model Context Protocol) widget.

### Key Features
- Track 410+ Thai RMF funds with real-time NAV data from Thailand SEC API
- Auto-refresh every 5 minutes
- Search, filter, and compare funds
- Multiple view modes (card/table)
- Dark/light theme support
- MCP protocol support for ChatGPT integration

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Wouter** for routing (not React Router)
- **TanStack Query** for server state management
- **Tailwind CSS** with **Radix UI** components
- **Recharts** for data visualization

### Backend
- **Express** server with TypeScript
- **Drizzle ORM** with PostgreSQL
- **Zod** for schema validation
- **Thailand SEC API** integration for fund data

### Database
- **PostgreSQL** with Drizzle ORM
- Schema defined in `shared/schema.ts`

## Code Style Guidelines

### General TypeScript
- Use **TypeScript** for all code files
- Use **ES modules** (`import/export`, not `require`)
- Enable strict mode TypeScript checking
- Prefer `const` over `let`, avoid `var`
- Use explicit return types for functions when not obvious

### Frontend Patterns
- Use functional components with hooks (no class components)
- Use TanStack Query for API calls (`useQuery`, `useMutation`)
- Use Wouter for navigation (`useRoute`, `useLocation`)
- Follow Radix UI patterns for accessible components
- Use `clsx` and `tailwind-merge` for conditional styling

### Backend Patterns
- Use Express request/response types explicitly
- Validate request bodies with Zod schemas
- Use async/await for asynchronous operations
- Handle errors with try/catch and return proper HTTP status codes
- Use environment variables for configuration (accessed via `process.env`)

### API Integration
- SEC API key stored in `SEC_API_KEY` environment variable
- Use header `'Ocp-Apim-Subscription-Key'` for SEC API authentication
- Main SEC API endpoints in `server/services/secApi.ts`

## Project Structure

```
/client                    # Frontend React application
  /src
    /components           # Reusable UI components
    /hooks                # Custom React hooks
    /lib                  # Utility functions
    /pages                # Page components
    App.tsx               # Main app component
    main.tsx              # Entry point

/server                   # Backend Express server
  index.ts                # Server entry point
  routes.ts               # API route definitions
  /services              # Business logic and external API integrations
    secApi.ts             # Thailand SEC API integration

/shared                   # Shared code between client and server
  schema.ts               # Zod schemas and TypeScript types

/scripts                  # Data processing scripts
  /data-extraction        # Scripts for fetching fund data
  /data-parsing           # Scripts for parsing fund data

/data                     # Static and cached fund data
  /rmf-funds              # Individual RMF fund JSON files
  fund-mapping.json       # Fund symbol to SEC ID mapping
  progress.json           # Data fetching progress tracking

/docs                     # Project documentation
  prd_thai_rmf_app.md     # Product requirements
  design_guidelines.md    # Design system
```

## Key Files to Reference

### Schema Definitions
- `shared/schema.ts` - All Zod schemas and TypeScript types for funds, NAV data, asset allocation, etc.

### API Integration
- `server/services/secApi.ts` - SEC API integration functions
- `server/routes.ts` - Express route handlers

### Frontend Components
- `client/src/App.tsx` - Main application component
- `client/src/pages/` - Page components

### Data Processing
- `scripts/data-extraction/rmf/` - RMF fund data fetching scripts
- Uses `data/fund-mapping.json` to map fund symbols to SEC IDs

## Important Domain Knowledge

### Thai RMF Context
- **RMF** = Retirement Mutual Fund (Thai tax-advantaged retirement fund)
- Tax season peak: November-December (before Dec 31 deadline)
- Tax deduction limit: up to 500,000 THB
- 410+ RMF funds from various Asset Management Companies (AMCs)

### Fund Data Fields
- **NAV** (Net Asset Value) - Current fund price
- **Asset Allocation** - Distribution across Equity, Bond, Cash, etc.
- **Holdings** - Top securities held by the fund
- **Performance** - Returns over various time periods (1Y, 3Y, 5Y, etc.)
- **AMC** - Asset Management Company (fund provider)

### SEC API Integration
- Base URL: `https://api.sec.or.th/FundFactsheet/`
- Requires subscription key in headers
- Main endpoints:
  - `/fund` (POST) - Search funds
  - `/fund/amc/portfolio` (POST) - Get fund details, holdings, allocation
  - `/fund/amc/nav` (POST) - Get NAV history

## Coding Conventions

### Naming
- **React Components**: PascalCase (`FundCard`, `SearchBar`)
- **Functions/Variables**: camelCase (`fetchFundData`, `fundList`)
- **Types/Interfaces**: PascalCase (`RMFFund`, `AssetAllocation`)
- **Constants**: UPPER_SNAKE_CASE for config (`SEC_API_KEY`)
- **Files**: kebab-case for utilities, PascalCase for components

### File Organization
- One component per file
- Export component as default for page components
- Named exports for utility functions and hooks
- Group related types with their implementation

### Error Handling
- Always handle API errors gracefully
- Provide user-friendly error messages
- Log errors to console in development
- Return proper HTTP status codes (400 for bad request, 500 for server errors)

### Comments
- Use JSDoc for public functions
- Explain "why" not "what" in inline comments
- Document complex business logic
- Add TODO comments for future improvements

## Common Tasks

### Adding a New API Endpoint
1. Define Zod schema in `shared/schema.ts`
2. Create service function in `server/services/`
3. Add route handler in `server/routes.ts`
4. Create frontend hook in `client/src/hooks/`
5. Use TanStack Query in component

### Creating a New Component
1. Create file in `client/src/components/`
2. Import and use Radix UI primitives if needed
3. Style with Tailwind classes
4. Export as named or default export
5. Add to component index if creating component library

### Adding Environment Variables
1. Add to `.env` file (not committed)
2. Add to `.env.example` with placeholder
3. Document in README.md
4. Access via `process.env.VARIABLE_NAME`

### Working with Fund Data
1. Check `data/fund-mapping.json` for symbol-to-ID mapping
2. Use scripts in `scripts/data-extraction/rmf/` to fetch new data
3. Individual fund data stored in `data/rmf-funds/`
4. Follow existing JSON structure for consistency

## Testing Approach

### Manual Testing
- Test all API endpoints with different query parameters
- Verify error handling for invalid inputs
- Check responsive design at different breakpoints
- Test theme switching
- Verify data refresh behavior

### API Testing
- Use `/api/debug/sec` endpoint to verify SEC API connectivity
- Check `data/progress.json` for data fetching status
- Verify fund data completeness with `scripts/data-extraction/rmf/identify-incomplete-funds.ts`

## Performance Considerations

- Use TanStack Query caching for API responses
- Implement pagination for large fund lists (20 funds per page)
- Lazy load images and heavy components
- Debounce search inputs
- Use React.memo for expensive components

## Security & Privacy

- Never commit API keys or secrets
- Validate all user inputs with Zod
- Sanitize data before displaying
- Use environment variables for sensitive config
- Follow CORS best practices

## Documentation

- Update README.md for user-facing changes
- Update docs/ for major features or architectural changes
- Use clear commit messages (conventional commits preferred)
- Document breaking changes

## MCP Integration Notes

- MCP SDK imported from `@modelcontextprotocol/sdk`
- Designed for ChatGPT Shop integration
- Follow MCP protocol standards for widget communication
- See `openai-app-sdk/` for reference documentation

## When Suggesting Code

1. **Prefer existing patterns** - Follow the established code style in the project
2. **Use project dependencies** - Don't suggest new libraries unless necessary
3. **Type safety first** - Always provide proper TypeScript types
4. **Accessibility matters** - Use Radix UI for accessible components
5. **Performance aware** - Consider bundle size and runtime performance
6. **Thai context** - Remember this is for Thai users/market (THB currency, Thai regulations)

## Common Pitfalls to Avoid

- Don't use React Router (we use Wouter)
- Don't use inline styles (use Tailwind)
- Don't forget to validate API responses with Zod
- Don't hardcode API keys in code
- Don't forget error boundaries for React components
- Don't ignore TypeScript errors
- Don't fetch data in components directly (use TanStack Query)

## References

- Product Requirements: `docs/prd_thai_rmf_app.md`
- Design Guidelines: `docs/design_guidelines.md`
- SEC API Documentation: `docs/SEC-API-INTEGRATION-SUMMARY.md`
- Implementation Plans: `docs/IMPLEMENTATION_PLAN_*.md`
