# Apps SDK Use Case Planning Guide

**Source:** https://developers.openai.com/apps-sdk/plan/use-case

## Overview
The documentation provides a structured approach to identifying and prioritizing use cases before building ChatGPT applications. The core principle emphasizes that "Discovery in ChatGPT is model-driven," meaning the assistant selects your app based on how well your metadata aligns with user needs.

## Key Planning Phases

### 1. Research & Input Gathering
Developers should collect:
- User interviews and support tickets to understand actual jobs-to-be-done
- Prompt sampling covering both direct requests ("show my Jira board") and indirect intentions
- System constraints including compliance, offline data, and rate limitations

Document each scenario with a user persona, context, and single-sentence success definition.

### 2. Evaluation Prompts
Create a "golden set" of test prompts:
- **Direct prompts (5+)**: Explicitly name your product or data
- **Indirect prompts (5+)**: State goals without naming the tool
- **Negative prompts**: Test precision by including prompts that should *not* trigger your app

This framework supports iterative refinement without overfitting.

### 3. Minimum Lovable Feature Definition
For each use case, determine:
- Required inline information for answering questions
- Which actions need write access and confirmation gates
- Persistent state requirements (filters, selections, drafts)

Prioritize scenarios by impact versus implementation effort, typically shipping one high-confidence P0 scenario first.

### 4. Tool Specification
Draft the tool contract covering:
- Input parameters with explicit enums and defaults
- Structured outputs including IDs, timestamps, and status fields
- Component intent (viewer, editor, or workspace)

Review with legal/compliance teams before implementation.

### 5. Post-Launch Iteration
Plan for ongoing measurement:
- Weekly tool selection accuracy tracking
- Qualitative feedback from early testers
- Analytics on tool calls and component interactions
