---
source_url: https://developers.openai.com/apps-sdk/quickstart
extracted_date: 2025-11-11
section: root
title: Quickstart
---

# Apps SDK Quickstart

## Introduction

The Apps SDK requires two components to build an app for ChatGPT:

1. **Web component** - Built with your preferred framework, rendered in an iframe within ChatGPT
2. **MCP server** - Exposes your app and defines capabilities (tools) to ChatGPT using the Model Context Protocol

This guide creates a simple to-do list application in a single HTML file.

## Building a Web Component

Create `public/todo-widget.html` containing markup, styling, and JavaScript. The file includes:

- **Styling** - Dark text (#0b0b0f), Inter font family, white card layout with rounded corners and shadow effects
- **HTML structure** - Form for adding tasks, unordered list for displaying items with checkboxes
- **JavaScript functionality** - Task management and interaction with ChatGPT

### Using the Apps SDK Bridge

The `window.openai` object connects your frontend to ChatGPT:

- `window.openai.toolOutput` - Receives the latest tool response when ChatGPT loads the iframe
- `window.openai.callTool()` - Calls tools and returns fresh structured content to keep UI synchronized

Additional event: Listen to `"openai:set_globals"` for receiving updated globals.

## Building an MCP Server

Use the official Node or Python MCP SDK. This example uses Node:

```
npm install @modelcontextprotocol/sdk zod
```

Create `server.js` with:
- Resource registration for the HTML widget component
- Tool registration for `add_todo` and `complete_todo` operations
- HTTP server handling CORS, health checks, and MCP protocol

The server registers resources with URIs like `"ui://widget/todo.html"` and includes metadata such as `"openai/outputTemplate"` pointing to the widget resource.

## Running Locally

Ensure `package.json` includes `"type": "module"`:

```json
{
  "type": "module",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.20.2",
    "zod": "^3.25.76"
  }
}
```

Start the server:

```
node server.js
```

Output: `"Todo MCP server listening on http://localhost:8787/mcp"`

### Testing

Use the MCP Inspector:

```
npx @modelcontextprotocol/inspector@latest http://localhost:8787/mcp
```

Opens a browser interface for testing server responses.

### Public Internet Access

Use ngrok for development:

```
ngrok http <port>
```

Provides a public HTTPS URL (e.g., `https://<subdomain>.ngrok.app/mcp`) for ChatGPT access.

## Adding Your App to ChatGPT

1. Enable developer mode: **Settings → Apps & Connectors → Advanced settings**
2. Create connector: **Settings → Connectors** → Paste HTTPS `/mcp` URL
3. Name and describe the connector
4. Open new chat, add connector from **More** menu, and test with prompts like "Show my tasks"

## Next Steps

- Refresh connectors after MCP server changes via **Settings → Connectors**
- Review "[app developer guidelines](/apps-sdk/app-developer-guidelines)" for best practices
- Explore [custom UX](/apps-sdk/build/custom-ux), [user authentication](/apps-sdk/build/auth), and [state persistence](/apps-sdk/build/state-management)
