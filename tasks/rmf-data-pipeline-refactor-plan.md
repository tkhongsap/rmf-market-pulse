# RMF Data Pipeline Integration & Codebase Cleanup Plan

## Objective
Integrate the RMF data extraction pipeline into the main codebase by moving scripts from `tests/api/` to a proper data extraction directory structure and cleaning up the codebase.

## Current State

### Scripts in `tests/api/` (to be moved):
- `build-fund-mapping.ts` - Phase 0: Build fund symbol → proj_id mapping
- `fetch-all-rmf-funds.ts` - Phase 1: Batch fetch all RMF funds
- `fetch-complete-rmf-data.ts` - Core data fetcher (used by Phase 1)
- `identify-incomplete-funds.ts` - Utility: Identify funds with incomplete data
- `reprocess-incomplete-funds.ts` - Utility: Re-process incomplete funds

### Root-level scripts (to be organized):
- `parse_rmf_funds.js` - Parse HTML table to CSV/MD
- `parse_rmf_funds.py` - Python version of parser

### Test files (to be kept in tests/):
- `test-abapac-rmf.ts` - Unit tests
- `test-abapac-sec-api.ts` - API tests
- `test-fund-discovery.ts` - Discovery tests
- Other test files...

## Proposed Structure

```
scripts/
├── data-extraction/
│   ├── rmf/
│   │   ├── phase-0-build-mapping.ts      # Build fund mapping
│   │   ├── phase-1-fetch-all-funds.ts    # Batch fetch all funds
│   │   ├── fetch-complete-fund-data.ts   # Core data fetcher
│   │   ├── identify-incomplete-funds.ts  # Utility: identify incomplete
│   │   └── reprocess-incomplete-funds.ts # Utility: reprocess incomplete
│   └── parsers/
│       ├── parse-rmf-funds.ts            # Parse HTML to CSV/MD (TypeScript)
│       └── parse-rmf-funds.py            # Python version (keep for reference)
└── README.md                              # Documentation for scripts

tests/
└── api/
    ├── test-abapac-rmf.ts                # Keep unit tests
    ├── test-abapac-sec-api.ts            # Keep API tests
    └── ... (other test files)
```

## Tasks

### Phase 1: Create Directory Structure
- [ ] Create `scripts/data-extraction/rmf/` directory
- [ ] Create `scripts/data-extraction/parsers/` directory
- [ ] Create `scripts/README.md` with documentation

### Phase 2: Move and Refactor Scripts
- [ ] Move `build-fund-mapping.ts` → `scripts/data-extraction/rmf/phase-0-build-mapping.ts`
  - Update imports to use new paths
  - Update documentation
- [ ] Move `fetch-all-rmf-funds.ts` → `scripts/data-extraction/rmf/phase-1-fetch-all-funds.ts`
  - Update imports
  - Update references to `fetch-complete-rmf-data.ts`
- [ ] Move `fetch-complete-rmf-data.ts` → `scripts/data-extraction/rmf/fetch-complete-fund-data.ts`
  - Update imports for SEC API services
- [ ] Move `identify-incomplete-funds.ts` → `scripts/data-extraction/rmf/identify-incomplete-funds.ts`
- [ ] Move `reprocess-incomplete-funds.ts` → `scripts/data-extraction/rmf/reprocess-incomplete-funds.ts`

### Phase 3: Organize Parsers
- [ ] Move `parse_rmf_funds.js` → `scripts/data-extraction/parsers/parse-rmf-funds.js`
- [ ] Move `parse_rmf_funds.py` → `scripts/data-extraction/parsers/parse-rmf-funds.py`
- [ ] Consider creating TypeScript version: `parse-rmf-funds.ts`

### Phase 4: Update Documentation
- [ ] Update `CLAUDE.md` with new script locations
- [ ] Update `README.md` with new script locations
- [ ] Create `scripts/README.md` with usage instructions
- [ ] Document the data pipeline workflow

### Phase 5: Update Package.json Scripts
- [ ] Add npm scripts for common data extraction tasks:
  ```json
  {
    "scripts": {
      "data:rmf:build-mapping": "tsx scripts/data-extraction/rmf/phase-0-build-mapping.ts",
      "data:rmf:fetch-all": "tsx scripts/data-extraction/rmf/phase-1-fetch-all-funds.ts",
      "data:rmf:identify-incomplete": "tsx scripts/data-extraction/rmf/identify-incomplete-funds.ts",
      "data:rmf:reprocess": "tsx scripts/data-extraction/rmf/reprocess-incomplete-funds.ts",
      "data:rmf:parse": "node scripts/data-extraction/parsers/parse-rmf-funds.js"
    }
  }
  ```

### Phase 6: Cleanup
- [ ] Remove old script files from `tests/api/` (after moving)
- [ ] Remove any duplicate or unused test files
- [ ] Clean up root-level test files if they're obsolete
- [ ] Update any references in documentation

### Phase 7: Verification
- [ ] Test that all scripts work from new locations
- [ ] Verify imports are correct
- [ ] Test npm scripts
- [ ] Update any CI/CD configurations if needed

## Benefits

1. **Better Organization**: Data extraction scripts are clearly separated from tests
2. **Easier Discovery**: Scripts are in a logical location (`scripts/data-extraction/`)
3. **Maintainability**: Clear structure makes it easier to add new data extraction scripts
4. **Documentation**: Centralized documentation for all data extraction workflows
5. **NPM Scripts**: Easy-to-use commands for common tasks

## Notes

- Keep test files in `tests/` directory
- Maintain backward compatibility where possible (update imports gradually)
- Consider creating a shared utilities module for common functions
- Document the data pipeline workflow (Phase 0 → Phase 1 → Verification)

