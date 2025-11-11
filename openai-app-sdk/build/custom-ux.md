---
source_url: https://developers.openai.com/apps-sdk/build/custom-ux
extracted_date: 2025-11-11
section: build
title: Build a Custom UX
---

# Build a Custom UX

## Overview

UI components transform structured tool results into user-friendly interfaces. Apps SDK components are typically React components that run inside an iframe, communicate with the host via the `window.openai` API, and render inline within the conversation.

## Understanding the `window.openai` API

The `window.openai` API serves as the bridge connecting your frontend to ChatGPT. Key capabilities include:

**Globals Available:**
- `theme`: Light or dark mode
- `userAgent`: Device type and capabilities (hover, touch)
- `locale`: User's language setting
- `maxHeight`, `displayMode`, `safeArea`: Layout information
- `toolInput`, `toolOutput`, `toolResponseMetadata`: Data from tool calls
- `widgetState`: Persistent component state

**Core Methods:**
- `callTool()`: Execute MCP server tools directly
- `sendFollowUpMessage()`: Insert conversational messages
- `requestDisplayMode()`: Switch between inline, PiP, or fullscreen layouts
- `setWidgetState()`: Persist data across sessions
- `openExternal()`: Launch external links or apps

### useOpenAiGlobal Hook

"Many Apps SDK projects wrap `window.openai` access in small hooks so views remain testable."

```typescript
export function useOpenAiGlobal<K extends keyof OpenAiGlobals>(
  key: K
): OpenAiGlobals[K] {
  return useSyncExternalStore(
    (onChange) => {
      const handleSetGlobal = (event: SetGlobalsEvent) => {
        const value = event.detail.globals[key];
        if (value === undefined) return;
        onChange();
      };
      window.addEventListener(SET_GLOBALS_EVENT_TYPE, handleSetGlobal, {
        passive: true,
      });
      return () => {
        window.removeEventListener(SET_GLOBALS_EVENT_TYPE, handleSetGlobal);
      };
    },
    () => window.openai[key]
  );
}
```

## Widget State Management

"Widget state can be used for persisting data across user sessions, and exposing data to ChatGPT."

State persists to a specific widget instance tied to a conversation message. When calling `setWidgetState()`, the host stores data under the widget's `message_id/widgetId` pair.

**Important considerations:**
- New widgets start with empty state if initiated from the main chat composer
- Keep payloads under 4,000 tokens for optimal performance
- State is rehydrated only for the specific widget instance

## Project Structure

Recommended layout separates component code from server logic:

```
app/
  server/            # MCP server (Python or Node)
  web/               # Component source
    package.json
    tsconfig.json
    src/component.tsx
    dist/component.js   # Build output
```

**Setup commands:**
```bash
cd app/web
npm init -y
npm install react@^18 react-dom@^18
npm install -D typescript esbuild
```

## Component Development

Your entry file should mount a React component into a `root` element and read initial data from `window.openai.toolOutput`.

### Example Components

The Apps SDK provides blueprint examples:

- **Pizzaz List**: Ranked card lists with favorites and CTAs
- **Pizzaz Carousel**: Horizontal scrolling for media-heavy layouts
- **Pizzaz Map**: Mapbox integration with fullscreen inspector
- **Pizzaz Album**: Stacked gallery for deep exploration
- **Pizzaz Video**: Scripted player with overlay controls

## Building the Component

Create a build script using esbuild:

```json
{
  "scripts": {
    "build": "esbuild src/component.tsx --bundle --format=esm --outfile=dist/component.js"
  }
}
```

Run `npm run build` to generate `dist/component.js` as a single bundled module.

## Integration

After bundling, embed the component in your MCP server response. Component UI templates are recommended for production environments.

## Navigation

Components can use standard routing APIs (e.g., React Router's `BrowserRouter`). The host mirrors iframe history into ChatGPT's navigation UI.

```typescript
const navigate = useNavigate();

function openDetails(placeId: string) {
  navigate(`place/${placeId}`, { replace: false });
}
```
