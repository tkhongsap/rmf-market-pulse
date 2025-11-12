# Plan: Standalone MCP Server for Thai Fund Market Pulse

## Overview

Create a standalone MCP server that can be installed and used with Claude Desktop, VS Code, and other MCP clients via stdio transport. This will complement the existing HTTP-based MCP endpoint (used for ChatGPT integration) without replacing it.

## Current State

**What We Have:**
- HTTP-based MCP endpoint at `POST /mcp` (server/mcp.ts)
- `RMFMCPServer` class with 6 tools implemented
- `StreamableHTTPServerTransport` for web-based integration
- `rmfDataService` with in-memory fund data
- Dependency: `@modelcontextprotocol/sdk` v1.21.1

**What We're Missing:**
- Standalone executable that runs via stdio
- Configuration for Claude Desktop integration
- Separate entry point independent of Express server

## Architecture

### Two MCP Modes (Side-by-Side)

```
┌─────────────────────────────────────────────┐
│         Existing HTTP MCP Endpoint          │
│   (ChatGPT, OpenAI Apps SDK Integration)    │
│                                             │
│   POST /mcp → StreamableHTTPServerTransport │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│        New Standalone MCP Server            │
│  (Claude Desktop, VS Code, MCP Clients)     │
│                                             │
│   npx tsx server/mcp-server.ts              │
│   → StdioServerTransport                    │
└─────────────────────────────────────────────┘

           Both use same core:
        ┌──────────────────────┐
        │   RMFMCPServer       │
        │   (server/mcp.ts)    │
        └──────────────────────┘
                  ↓
        ┌──────────────────────┐
        │  rmfDataService      │
        └──────────────────────┘
```

### Design Principles

1. **Shared Core Logic**: Reuse `RMFMCPServer` class for both HTTP and stdio transports
2. **No Duplication**: Tools, data service, and schemas remain unchanged
3. **Independent Execution**: Standalone server doesn't require Express/web server
4. **Same API**: Both modes expose identical tools with same functionality

## Implementation Steps

### Phase 1: Create Standalone MCP Server Entry Point

**File:** `server/mcp-server.ts`

**Tasks:**
- Import `StdioServerTransport` from MCP SDK
- Import existing `RMFMCPServer` class
- Initialize data service (load fund data)
- Connect MCP server to stdio transport
- Add error handling and logging
- Handle graceful shutdown

**Key Considerations:**
- Must initialize `rmfDataService` before accepting connections
- Need to handle process signals (SIGINT, SIGTERM)
- Should log to stderr (stdout is used for MCP protocol)

### Phase 2: Add NPM Scripts

**File:** `package.json`

**Scripts to Add:**
```json
{
  "mcp:server": "tsx server/mcp-server.ts",
  "mcp:inspect": "npx @modelcontextprotocol/inspector tsx server/mcp-server.ts"
}
```

**Purpose:**
- `mcp:server`: Run standalone server directly
- `mcp:inspect`: Test server using MCP Inspector tool

### Phase 3: Data Service Initialization

**File:** `server/services/rmfDataService.ts` (review)

**Check:**
- Can data service initialize without HTTP server running?
- Does it load CSV/JSON data from disk correctly?
- Are all indexes built properly?

**Potential Issues:**
- File path resolution (relative vs absolute)
- Data loading timing (async initialization)
- Memory usage (403 funds with full data)

### Phase 4: Create Configuration Guide

**File:** `docs/mcp-server-setup.md`

**Content:**
- Installation instructions
- Claude Desktop configuration example
- VS Code configuration example (if applicable)
- Testing instructions
- Troubleshooting guide

### Phase 5: Test MCP Server

**Testing Approach:**

1. **Unit Test**: Run `npm run mcp:server` and verify it starts
2. **MCP Inspector**: Use `npm run mcp:inspect` to test tools interactively
3. **Claude Desktop**: Install in config and test from Claude Desktop
4. **Tool Coverage**: Test all 6 tools with various parameters

**Test Cases:**
- `get_rmf_funds`: Pagination, sorting
- `search_rmf_funds`: Search by name, AMC, risk level, category
- `get_rmf_fund_detail`: Valid fund, invalid fund
- `get_rmf_fund_performance`: All periods (ytd, 3m, 6m, 1y, 3y, 5y, 10y)
- `get_rmf_fund_nav_history`: Various day ranges
- `compare_rmf_funds`: 2-5 funds comparison

### Phase 6: Update Documentation

**Files to Update:**
- `README.md`: Add MCP server section
- `CLAUDE.md`: Document standalone MCP server usage
- `docs/ARCHITECTURE.md`: Add MCP server architecture diagram

## Claude Desktop Configuration

**File Location (macOS):**
```
~/Library/Application Support/Claude/claude_desktop_config.json
```

**File Location (Windows):**
```
%APPDATA%\Claude\claude_desktop_config.json
```

**Configuration Example:**
```json
{
  "mcpServers": {
    "thai-rmf-market-pulse": {
      "command": "npx",
      "args": [
        "tsx",
        "/absolute/path/to/workspace/server/mcp-server.ts"
      ],
      "env": {
        "SEC_API_KEY": "your-sec-api-key-here"
      }
    }
  }
}
```

**Alternative (using npm script):**
```json
{
  "mcpServers": {
    "thai-rmf-market-pulse": {
      "command": "npm",
      "args": [
        "run",
        "mcp:server"
      ],
      "cwd": "/absolute/path/to/workspace",
      "env": {
        "SEC_API_KEY": "your-sec-api-key-here"
      }
    }
  }
}
```

## Technical Considerations

### Environment Variables

**Required:**
- `SEC_API_KEY`: Thailand SEC API key (if making live API calls)

**Optional:**
- `NODE_ENV`: Set to 'production' for minimal logging
- `DATA_PATH`: Custom path to fund data files

### Data Loading Strategy

**Options:**

1. **Pre-loaded CSV (Recommended for stdio)**
   - Load `docs/rmf-funds-consolidated.csv` on startup
   - Fast initialization (<100ms)
   - No API calls during tool execution
   - Data is static (refresh requires restart)

2. **Hybrid (Current HTTP approach)**
   - Load base data from CSV
   - Fetch live data from SEC API as needed
   - Slower but always fresh
   - Requires API key

3. **Pure API (Not recommended for stdio)**
   - Fetch all data from SEC API on demand
   - Very slow initialization
   - Rate limit concerns

**Recommendation:** Use pre-loaded CSV for standalone MCP server (fast, reliable, no API dependencies)

### Error Handling

**Scenarios to Handle:**
- Data file not found
- Invalid fund code in tool calls
- Missing required parameters
- Process termination (SIGINT/SIGTERM)
- Stdio transport errors

### Performance Considerations

**Startup Time:**
- Target: <500ms from start to ready
- CSV parsing: ~50-100ms
- Index building: ~50-100ms
- Total: ~200-300ms acceptable

**Memory Usage:**
- 403 funds with full data: ~5-10MB
- Indexes (symbol, AMC, category): ~1-2MB
- Total: ~10-20MB acceptable

**Response Time:**
- Tool calls: <100ms for indexed lookups
- Comparison/sorting: <200ms for up to 5 funds

## Dependencies

**Required:**
- `@modelcontextprotocol/sdk`: Already installed (v1.21.1)
- `tsx`: Already in devDependencies
- `zod`: Already installed (for schemas)

**Optional (for development):**
- `@modelcontextprotocol/inspector`: For testing (use via npx)

## Risks & Mitigation

### Risk 1: Data Service Not Initializing
**Impact:** Server starts but tools fail
**Mitigation:** Add initialization check, fail fast with clear error

### Risk 2: File Path Issues
**Impact:** Can't find CSV data files
**Mitigation:** Use `__dirname` or `process.cwd()` with clear path resolution

### Risk 3: Stdio Protocol Conflicts
**Impact:** Logging to stdout breaks MCP protocol
**Mitigation:** Only log to stderr, never use console.log()

### Risk 4: Memory Leaks
**Impact:** Server crashes with long-running usage
**Mitigation:** Profile memory usage, add resource limits

## Success Criteria

1. ✅ Server starts in <500ms
2. ✅ All 6 tools work correctly in MCP Inspector
3. ✅ Can be installed in Claude Desktop successfully
4. ✅ Tools return same data as HTTP endpoint
5. ✅ No console.log() output (only stderr logging)
6. ✅ Graceful shutdown on SIGINT/SIGTERM
7. ✅ Documentation complete and tested

## Timeline Estimate

- **Phase 1** (MCP Server Entry Point): 30 minutes
- **Phase 2** (NPM Scripts): 5 minutes
- **Phase 3** (Data Service Review): 15 minutes
- **Phase 4** (Configuration Guide): 20 minutes
- **Phase 5** (Testing): 45 minutes
- **Phase 6** (Documentation): 15 minutes

**Total:** ~2.5 hours

## Future Enhancements

1. **Live Data Mode**: Option to fetch fresh data from SEC API
2. **Caching Layer**: Cache tool results for performance
3. **Configuration File**: Support `mcp-config.json` for settings
4. **Health Monitoring**: Periodic data refresh in background
5. **Multi-Fund Type**: Support ESG and ESGX funds (not just RMF)

## References

- MCP SDK Documentation: https://github.com/modelcontextprotocol/sdk
- Claude Desktop MCP Guide: https://docs.anthropic.com/claude/docs/model-context-protocol
- Current HTTP MCP Implementation: `server/mcp.ts`
- Data Service: `server/services/rmfDataService.ts`
- Fund Data: `docs/rmf-funds-consolidated.csv`
