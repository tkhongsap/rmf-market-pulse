---
source_url: https://developers.openai.com/apps-sdk/plan/tools
extracted_date: 2025-11-11
section: plan
title: Define Tools
---

# Define Tools

Plan and define tools for your assistant.

## Tool-First Thinking

In Apps SDK, tools function as the contract between your MCP server and the model. They describe capabilities, invocation methods, and returned data. Strategic tool design ensures accurate discovery, reliable invocation, and predictable UX.

## Draft the Tool Surface Area

Starting from your use case research:

- **Single responsibility** – Each tool handles one read or write action (e.g., "fetch_board", "create_ticket") rather than combining multiple operations. This clarity helps the model choose appropriately between options.

- **Clear inputs** – Define `inputSchema` shape upfront, specifying parameter names, data types, and enums. Document which fields have defaults and which accept null values so the model understands what's optional.

- **Structured outputs** – List the fields you'll return, including machine-readable identifiers the model can use in subsequent calls.

For operations requiring both read and write capabilities, create separate tools to enable ChatGPT's confirmation flows for mutations.

## Capture Metadata for Discovery

Discovery depends heavily on metadata. For each tool, prepare:

- **Name** – Action-focused and distinct within your connector (`kanban.move_task`)
- **Description** – One or two sentences beginning with "Use this when…" so the model knows exactly when to invoke it
- **Parameter annotations** – Explain each argument and highlight safe ranges or permitted values to prevent malformed requests
- **Global metadata** – Ensure app-level name, icon, and descriptions are ready for directory listing and launcher display

## Model-Side Guardrails

Consider how the model should interact with your tools:

- **Authentication** – Determine if tools work without authentication or require user linking through the onboarding flow
- **Read-only hints** – Use the `readOnlyHint` annotation for non-mutating tools so ChatGPT can skip confirmation steps when appropriate
- **Result rendering** – Decide whether tools should render components, return JSON, or both via `_meta["openai/outputTemplate"]`

## Golden Prompt Rehearsal

Before implementation, validate your tool set against captured prompts:

1. For each direct prompt, confirm one tool clearly addresses it
2. For indirect prompts, ensure descriptions help the model select your connector over built-in alternatives
3. For negative prompts, verify metadata hides tools unless users explicitly request them

## Handoff to Implementation

When ready to implement, document:

- Tool name, description, input schema, and expected output schema
- Whether the tool should return a component and which UI component renders it
- Auth requirements, rate limits, and error handling specifications
- Test prompts that should succeed and fail

Bring this plan to the [Set up your server](/apps-sdk/build/mcp-server) guide to translate it into code.
