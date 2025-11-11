---
source_url: https://developers.openai.com/apps-sdk/plan/use-case
extracted_date: 2025-11-11
section: plan
title: Research Use Cases
---

# Research Use Cases

## Overview

This page guides developers through identifying and prioritizing use cases for Apps SDK applications. The foundational principle: successful apps begin with clarity about user goals, since ChatGPT's model-driven discovery selects your app when metadata and usage patterns match user prompts.

## Key Sections

### Why Start with Use Cases

The document emphasizes that understanding "what the user is trying to accomplish" precedes tool definition or component building. Discovery depends on alignment between tool metadata, descriptions, and user intent—making upfront planning essential.

### Gather Inputs

Research should combine qualitative and quantitative approaches:

- **User interviews and support requests** to capture jobs-to-be-done and current data workflows
- **Prompt sampling** covering both direct requests ("show my Jira board") and indirect intents ("what's blocking our launch?")
- **System constraints** including compliance, offline data requirements, and rate limits

Documentation should capture persona, context, and success criteria in concise form.

### Define Evaluation Prompts

Create a "golden set" for iterating on discovery accuracy:

1. Author at least five direct prompts referencing your product explicitly
2. Draft five indirect prompts stating goals without naming the tool
3. Add negative prompts to measure precision and avoid false positives

### Scope the Minimum Lovable Feature

For each use case, determine:

- Required inline information to answer questions or enable action
- Which actions need write access and confirmation gates
- State persistence needs (filters, selections, drafts)

Rank scenarios by user impact and implementation effort, prioritizing one P0 scenario before expanding.

### Translate Use Cases into Tooling

Draft the tool contract specifying:

- **Inputs:** explicit parameters with enums for constrained sets
- **Outputs:** structured content including IDs, timestamps, and status fields
- **Component intent:** whether the UI is read-only, editable, or multiturn

Share drafts with compliance and legal teams before implementation.

### Prepare for Iteration

Post-launch refinement should include:

- Weekly review of prompt accuracy against the golden set
- Qualitative feedback from ChatGPT developer mode testers
- Analytics on tool calls and component interactions for adoption measurement
