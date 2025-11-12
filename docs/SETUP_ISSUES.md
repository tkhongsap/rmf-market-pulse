# Setup Issues & Environment Notes

## Environment Setup (Phase -1)

### Completed Tasks

#### 0.1-0.4: Basic Environment ✅
- **Node.js**: v22.21.1 (requirement: v18+) ✅
- **npm**: v10.9.4 ✅
- **Dependencies**: Installed successfully (545 packages) ✅
- **MCP SDK**: @modelcontextprotocol/sdk v1.21.1 already in package.json ✅

#### 0.5: Environment Variables ✅
- Created `.env` file from `.env.example`
- **IMPORTANT**: Placeholder values set for SEC API keys
- **ACTION REQUIRED**: Replace placeholder keys with real keys from https://api-portal.sec.or.th/
  - `SEC_FUND_FACTSHEET_KEY`
  - `SEC_FUND_FACTSHEET_SECONDARY_KEY`
  - `SEC_FUND_DAILY_INFO_KEY`

#### 0.6: Data Files ✅
- `docs/rmf-funds-consolidated.csv`: 1.5MB, 403 funds ✅
- `data/rmf-funds/*.json`: 403 files ✅

#### 0.8: TypeScript Type Checking ✅
- **Issue Found**: `server/storage.ts` was importing `User` and `InsertUser` types that didn't exist in `shared/schema.ts`
- **Resolution**: Added User schema to `shared/schema.ts` (marked as not used in RMF MVP)
- **Result**: Type checking now passes with no errors ✅

### Pending Tasks
- 0.7: Test server startup
- 0.9: Verify existing MCP endpoint
- 0.10: Complete this documentation

### Notes
- 8 npm vulnerabilities (3 low, 5 moderate) - acceptable for development
- 2 deprecation warnings for @esbuild-kit packages (merged into tsx) - not blocking

## Date: 2025-11-12
