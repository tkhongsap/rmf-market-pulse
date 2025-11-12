# State Management in ChatGPT Apps SDK

**Source:** https://developers.openai.com/apps-sdk/build/state-management

## Overview

The documentation outlines three distinct state categories for ChatGPT applications:

1. **Business Data (Authoritative)** – owned by MCP server/backend, long-lived (tasks, tickets, documents)
2. **UI State (Ephemeral)** – owned by widget instance, active only during widget lifetime (selections, expanded panels)
3. **Cross-session State (Durable)** – owned by backend storage, persists across conversations (saved filters, preferences)

## Core Architecture

Widgets are message-scoped instances tied to specific conversation messages. The mental model separates concerns: the server maintains authoritative business data while the widget manages visual interactions independently. As stated in the documentation: "The widget only sees updated business data when a tool call completes, and then it reapplies its local UI state on top of that snapshot."

## Managing UI State

Developers interact with widget state using:

- `window.openai.widgetState` – reads current state
- `window.openai.setWidgetState(newState)` – writes updates synchronously
- `useWidgetState` hook – React convenience wrapper for state hydration and subscriptions

The documentation emphasizes that "widget state persists only for the widget instance belonging to a specific message," making it unsuitable for persistent preferences.

## Business Data Pattern

Server tools should always return authoritative data snapshots. When users interact with components, the flow follows:

Tool invocation → Server update → Data snapshot returned → Widget re-renders with preserved UI state

## Backend Integration

For cross-session persistence, applications should implement their own storage layer with proper authentication (OAuth), rate limiting, schema versioning, and compliance considerations for sensitive data handling.
