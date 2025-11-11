---
source_url: https://developers.openai.com/apps-sdk/plan/components
extracted_date: 2025-11-11
section: plan
title: Design Components
---

# Design Components

## Overview

This guide helps developers plan and design UI components for ChatGPT app integrations. Components serve as the user-facing interface for your Model Context Protocol (MCP) server, enabling data viewing, editing, and context synchronization.

## Why Components Matter

"UI components are the human-visible half of your connector." They allow users to interact with data inline, expand to fullscreen when needed, and maintain synchronized state between text prompts and UI interactions. Early planning ensures your MCP server returns properly structured data from the start.

## Sample Components

The openai-apps-sdk-examples repository provides reusable patterns:

- **List** – Dynamic collections with empty-state handling
- **Map** – Geospatial data with marker clustering and detail panes
- **Album** – Media grids with fullscreen transitions
- **Carousel** – Featured content with swipe gestures
- **Shop** – Product browsing with checkout features

## Key Planning Decisions

### Clarify User Interaction

Define the interaction model for each use case:

- **Viewer vs. editor** – Read-only displays (charts, dashboards) or interactive editing (forms, kanban boards)?
- **Single-shot vs. multiturn** – One-time task completion or persistent state across multiple turns?
- **Inline vs. fullscreen** – Inline cards for simple tasks, fullscreen or picture-in-picture for complex workflows

Document fields, affordances, and empty states before implementation.

### Map Data Requirements

Components receive all necessary data in the tool response:

- **Structured content** – Define JSON payloads the component will parse
- **Initial state** – Use `window.openai.toolOutput` for initial rendering; use `callTool` return values for updates
- **State caching** – Employ `window.openai.setWidgetState` for re-rendering
- **Auth context** – Determine if components display linked accounts or require user connection prompts

### Design Responsive Layouts

Components run in iframes on desktop and mobile:

- **Adaptive breakpoints** – Implement max widths and graceful layout collapse
- **Accessibility** – Support system dark mode and keyboard navigation
- **Transitions** – Keep navigation visible during launcher or fullscreen expansion

Establish CSS variables, font stacks, and icon systems upfront.

### Define State Contract

Clarify what is stored where:

- **Component state** – Use `window.openai.setWidgetState` for UI state (selections, scroll position, form data)
- **Server state** – Store authoritative data in backends; decide how to merge changes after tool calls
- **Model messages** – Use `sendFollowUpMessage` to keep conversation transcripts meaningful

### Plan Instrumentation

Add debugging capabilities:

- Emit analytics for component loads, clicks, and validation errors
- Log tool-call IDs with telemetry for end-to-end tracing
- Provide JSON fallbacks when components fail to load

## Next Steps

Once planning is complete, proceed to [Build a custom UX](/apps-sdk/build/custom-ux) for implementation details.
