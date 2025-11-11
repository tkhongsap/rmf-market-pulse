# Tools Planning Documentation for Apps SDK

**Source:** https://developers.openai.com/apps-sdk/plan/tools

## Overview

The Apps SDK guide on defining tools provides a structured approach to planning tool interfaces before implementation. Tools serve as the contract between an MCP server and the language model.

## Key Planning Principles

**Tool-First Thinking**: According to the documentation, "good tool design makes discovery accurate, invocation reliable, and downstream UX predictable."

The guide emphasizes several foundational concepts:

### Single Responsibility
Each tool should handle one discrete action. Rather than creating broad endpoints, separate read and write operations into distinct tools to enable proper confirmation flows.

### Input and Output Schema
- Define parameter names, data types, and enumerations explicitly
- Document which fields are optional and any default values
- Enumerate structured output fields with machine-readable identifiers for chaining calls

### Metadata for Discovery
Tools require clear naming, descriptions, and parameter annotations. The documentation advises descriptions should clarify "when…" to use each tool, helping models distinguish between alternatives.

## Model-Side Considerations

**Authentication Posture**: Determine whether tools require authentication or function anonymously.

**Read-Only Hints**: Tools that don't mutate state should be marked accordingly so ChatGPT can skip confirmation prompts.

**Output Components**: Define whether tools render custom UI, return JSON, or both.

## Validation Approach

Before coding, cross-reference your tool set against collected user prompts to ensure:
- Direct requests have corresponding tools
- Indirect requests have sufficient metadata context
- Negative use cases are properly hidden via metadata

## Handoff Checklist

Documentation recommends compiling tool specifications including:
- Names, descriptions, schemas (input/output)
- Component rendering requirements
- Auth and error handling specifications
- Success and failure test cases
