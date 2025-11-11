# Design Components Planning Guide

**Source:** https://developers.openai.com/apps-sdk/plan/components

## Overview

This documentation guides developers through planning UI components for ChatGPT app integrations. Components serve as the user-visible interface for data interaction within the chat environment.

## Key Planning Areas

### 1. Why Components Matter
"UI components are the human-visible half of your connector." They enable users to view/edit data inline, expand to fullscreen when needed, and maintain synchronized context between conversation and interface actions.

### 2. Sample Components

The OpenAI Apps SDK provides reusable examples covering common patterns:

- **List** – Dynamic collections with empty-state handling
- **Map** – Geo-plotting with marker clustering and detail views
- **Album** – Media grids with fullscreen capabilities
- **Carousel** – Featured content with gesture support
- **Shop** – Product browsing with transaction affordances

All examples are available in the [openai-apps-sdk-examples](https://github.com/openai/openai-apps-sdk-examples) repository.

### 3. Clarifying User Interaction

Developers should determine:
- **Display mode** – read-only viewers versus interactive editors
- **Interaction scope** – single invocation versus multi-turn persistence
- **Layout context** – inline cards versus fullscreen/modal presentations

Document required fields, user actions, and empty-state behaviors before implementation.

### 4. Data Requirements Mapping

Components receive all necessary information through tool responses:
- Define structured JSON payloads for component parsing
- Use `window.openai.toolOutput` for initial render data
- Leverage `window.openai.setWidgetState` for state caching
- Include authentication context where applicable

### 5. Responsive Design Considerations

Components operate within iframes across devices:
- Establish adaptive breakpoints and graceful mobile scaling
- Implement accessible color schemes (dark mode support) and keyboard navigation
- Ensure launcher transitions keep navigation visible
- Maintain consistent CSS variables and typography

### 6. State Contract Definition

Clarify storage responsibility:
- **Component state** – use APIs for UI selections and form data
- **Server state** – maintain authoritative data backend-side
- **Model messages** – define human-readable updates via followup communications

### 7. Telemetry and Debugging

Plan instrumentation:
- Track component loads, interactions, and validation errors
- Correlate tool-call IDs with component telemetry
- Provide JSON fallbacks when components fail

## Next Steps

Once these planning phases conclude, developers proceed to [Build a custom UX](/apps-sdk/build/custom-ux) for implementation details.
