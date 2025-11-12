# RMF MCP Server (Standalone Service)

This directory contains a modular version of the Thai RMF Market Pulse Model Context Protocol (MCP) server.  It extracts the MCP tooling logic from the Express monolith and exposes helpers that can be reused inside this repository or copied into a dedicated service.

## What lives here?

- `src/rmfMcpServer.ts` – the `RMFMCPServer` class that registers the six MCP tools.
- `src/httpHandler.ts` – a reusable Express-compatible request handler for the `/mcp` endpoint.
- `src/index.ts` – public exports for consumers that want to embed the server.
- `src/standalone.ts` – a minimal Express bootstrap that runs the MCP server without the rest of the app.

The implementation depends on the shared `rmfDataService` that loads fund data from `docs/rmf-funds-consolidated.csv`.  Any environment that consumes this package must initialise the data service before accepting requests.

## Running as a standalone service (inside this repo)

```bash
npm install
npm run mcp:standalone
```

The script starts an HTTP server on `PORT` (defaults to `7080`) and exposes the MCP endpoint at `POST /mcp`.

## Reusing in another repository

1. Copy the `services/mcp-server` directory together with `shared/` and the `docs/rmf-funds-consolidated.csv` dataset.
2. Install runtime dependencies: `@modelcontextprotocol/sdk`, `express`, `zod`, and `csv-parse` (for the data service).
3. Initialise the data service (`rmfDataService.initialize()`) before wiring the MCP HTTP handler: 
   ```ts
   import express from 'express';
   import { rmfDataService } from './path-to/rmfDataService';
   import { createRmfMcpServer, createMcpHttpHandler } from './services/mcp-server';

   await rmfDataService.initialize();
   const app = express();
   app.use(express.json());
   const server = createRmfMcpServer(rmfDataService);
   app.post('/mcp', createMcpHttpHandler(server));
   ```
4. Deploy the resulting Express app or adapt the request handler for another transport (serverless, workers, etc.).

## Why this structure?

- **Separation of concerns** – the MCP server now only depends on a data repository interface.  The Express transport and data loading can change independently.
- **Portability** – the same class can power the existing monolith, a standalone microservice, or a new repository with minimal glue code.
- **Testability** – consumers can mock the `RmfDataRepository` interface to unit-test tool handlers without touching file I/O.
