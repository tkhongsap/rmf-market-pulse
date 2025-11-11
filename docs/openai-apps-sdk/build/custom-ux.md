# Custom UX Build Documentation

**Source:** https://developers.openai.com/apps-sdk/build/custom-ux

## Overview

The Apps SDK enables developers to create custom UI components as React components running in an iframe that communicate with ChatGPT via the `window.openai` API.

## Core API: window.openai

The bridge between frontend and ChatGPT includes:

**Key Methods:**
- `callTool(name, args)` - Execute MCP server tools
- `sendFollowUpMessage({ prompt })` - Insert conversation messages
- `openExternal({ href })` - Navigate external links
- `requestDisplayMode({ mode })` - Switch between inline, PiP, fullscreen
- `setWidgetState(state)` - Persist and expose component state

**Global Properties:**
- `theme`, `userAgent`, `locale`
- `maxHeight`, `displayMode`, `safeArea`
- `toolInput`, `toolOutput`, `toolResponseMetadata`, `widgetState`

## Helper Hook Pattern

The documentation recommends wrapping API access with `useOpenAiGlobal` for reactive subscriptions: "a small hook that listens for host openai:set_globals events and lets React components subscribe to a single global value."

Widget state synchronization maintains data across sessions within a specific widget instance tied to a conversation message.

## Project Structure

```
app/
  server/    # MCP server (Python/Node)
  web/       # Component source
    src/component.tsx
    dist/component.js  # Build output
```

## Building & Bundling

Using esbuild as the recommended bundler:

```json
"build": "esbuild src/component.tsx --bundle --format=esm --outfile=dist/component.js"
```

The documentation notes that "component UI templates are the recommended path for production" while development allows hot-reloading during iteration.

## Resource References

The SDK provides example components (Pizzaz List, Carousel, Map, Album, Video) demonstrating layout patterns, asset bundling, and state management strategies applicable to real conversation scenarios.
