# Next Steps: Data Contract Prep for OpenAI App SDK

## Executive Summary

We already have production-grade RMF data (`docs/rmf-funds-consolidated.csv`) and proof that the dataset is complete (`data/incomplete-funds-report.json`). Before we author any Apps SDK components, we must freeze the MCP tool contract and backing schemas so the front-end, server, and documentation teams can work in parallel. This document lays out the concrete steps to get there.

---

## Phase 0 – Validate Inputs (Today)
- **Data sanity check**: Sample at least 5 funds (equity, fixed income, Thai-only, global, cancelled) straight from `docs/rmf-funds-consolidated.csv` to confirm every field we plan to expose (performance, fees, allocation JSON) is populated or has predictable nulls.
- **Gap log**: If a column is systematically missing (e.g., `benchmark_*`), note that in `docs/openai-app-sdk/DATA_GAPS.md` to keep future UI/UX honest.
- **Owner**: Data & Infra.

## Phase 1 – MCP Tool Contract (1–2 days)
- **Artifact**: `docs/openai-app-sdk/TOOLS_CONTRACT.md`.
- **Content**:
  - Tool list (start with `rmf_list`, `rmf_detail`, `rmf_compare`, `rmf_top_performers`, `rmf_allocation`, `rmf_tax_helper`).
  - JSON Schemas (input + output) referencing actual field names from the CSV (e.g., `fund_classification`, `risk_level`).
  - Sample payloads copied from real funds so prompts can be rehearsed.
  - Component mapping via `_meta.openai/outputTemplate` ids we plan to implement later.
- **Why**: Routes in `server/routes.ts` already return JSON, but they lack structured metadata; locking this spec prevents churn once Apps SDK work begins.

## Phase 2 – Shared Types & Data Service (2–3 days)
- **Zod alignment**: Update `shared/schema.ts` so RMF types cover every field from the consolidated CSV (dividends, benchmarks, suitability). Add `FundSummary`, `FundDetail`, and `FundComparison` exports to match the contract.
- **Data loader**: Introduce `server/services/rmfDataService.ts` that hydrates an in-memory store from `docs/rmf-funds-consolidated.csv` (or `data/rmf-funds/*.json`) at boot time and exposes helper methods (`search`, `getBySymbol`, `topPerformers`, `compare`).
- **Tests**: Add targeted unit tests under `tests/server/rmfDataService.test.ts` with fixtures covering Thai text, missing metrics, and extreme NAV swings.

## Phase 3 – MCP Endpoint Upgrade (2 days)
- **Routes**: Extend `/mcp` in `server/routes.ts` so each tool defined in Phase 1 is discoverable under `tools/list` and executable via `tools/call`.
- **Output templates**: Return `_meta.openai/outputTemplate` + structured `content` blocks the Apps SDK renderer expects (table rows, key-value stats, chart datasets).
- **Error surface**: Standardize error payloads (`code`, `message`, `actionableHint`) so ChatGPT can recover gracefully.
- **Verification**: Use MCP Inspector to confirm discovery + execution flows with the staged schemas.

## Phase 4 – Component Blueprint (3 days, can overlap with Phase 3)
- **Artifact**: `docs/openai-app-sdk/COMPONENTS_BLUEPRINT.md`.
- **Scope**:
  - Wireframes for the five planned templates (list, detail, comparison, allocation chart, tax helper).
  - Data bindings describing how each JSON field maps to UI (e.g., `risk_level` → badge color palette from Apps SDK design guidelines in `openai-app-sdk/concepts/design-guidelines.md`).
  - Interaction notes for paging, sorting, and multi-fund selection.
- **Handoff**: Enables Apps SDK UI implementation while backend finalizes.

## Phase 5 – Prompt & Test Harness (1 day)
- **Golden prompts**: Capture the top direct/indirect queries in `docs/openai-app-sdk/GOLDEN_PROMPTS.md` and map each to the tool/response we expect (inspired by `openai-app-sdk/plan/tools.md` guidance).
- **Regression script**: Add a simple script (`scripts/mcp-smoke.ts`) that exercises each tool with realistic parameters and compares output hashes to detect accidental contract drift.

---

## Risks & Mitigations
- **Schema drift**: Mitigate by treating `TOOLS_CONTRACT.md` as the canonical source; no route or UI change merges without updating it.
- **Data freshness**: If SEC APIs change, rerun the ETL that produces `docs/rmf-funds-consolidated.csv` and rehydrate the cache; document the refresh cadence inside the contract file.
- **Tool bloat**: Keep initial scope to six tools; defer niche calculators until after V1 launch metrics justify them.

---

## Decision Checklist Before Coding Apps SDK
1. ✅ `docs/openai-app-sdk/TOOLS_CONTRACT.md` reviewed by Backend + UX.
2. ✅ `shared/schema.ts` exports match the contract.
3. ✅ `rmfDataService` returns deterministic results for fixture prompts.
4. ✅ `/mcp` endpoint returns `_meta.openai/outputTemplate` blocks for every tool.
5. ✅ Component blueprint approved with clear data bindings.

Once all boxes are checked, green-light the Apps SDK implementation (custom components + wiring to `window.openai`).
