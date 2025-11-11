---
source_url: https://developers.openai.com/apps-sdk/build/mcp-server
extracted_date: 2025-11-11
section: build
title: Set Up Your Server
---

# Set Up Your Server

## Overview

The MCP server forms the foundation of Apps SDK integrations. It exposes tools the model can invoke, enforces authentication, and packages structured data plus component HTML that ChatGPT renders inline.

## Choose an SDK

The official SDKs offer the fastest starting point:

- **Python SDK** – leverages FastMCP for rapid prototyping. Available at [`modelcontextprotocol/python-sdk`](https://github.com/modelcontextprotocol/python-sdk)
- **TypeScript SDK** – optimal for Node/React stacks using `@modelcontextprotocol/sdk`. Documentation at [`modelcontextprotocol.io`](https://modelcontextprotocol.io/)

Install your chosen SDK alongside a web framework like FastAPI or Express.

## Describe Your Tools

Tools form the contract between ChatGPT and your backend. Each tool requires:

- Machine-readable name
- Human-friendly title
- JSON schema defining when and how the model calls it
- Per-tool metadata including auth hints and component configuration

### Point to a Component Template

Each tool should reference an HTML UI template:

1. **Register the template** – expose a resource with `mimeType: text/html+skybridge` containing your compiled bundle. The URI (e.g., `ui://widget/kanban-board.html`) becomes the component's canonical ID.

2. **Link the tool to the template** – set `_meta["openai/outputTemplate"]` to match the URI. Optional metadata fields declare whether components can initiate tool calls or display custom status text.

3. **Version carefully** – when shipping breaking changes, register new resource URIs and update tool metadata simultaneously. ChatGPT aggressively caches templates, so unique URIs prevent stale assets.

### Example Implementation (Node SDK)

```javascript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readFileSync } from "node:fs";

const server = new McpServer({
  name: "kanban-server",
  version: "1.0.0"
});

const KANBAN_JS = readFileSync("web/dist/kanban.js", "utf8");
const KANBAN_CSS = (() => {
  try {
    return readFileSync("web/dist/kanban.css", "utf8");
  } catch {
    return "";
  }
})();

server.registerResource(
  "kanban-widget",
  "ui://widget/kanban-board.html",
  {},
  async () => ({
    contents: [
      {
        uri: "ui://widget/kanban-board.html",
        mimeType: "text/html+skybridge",
        text: `
<div id="kanban-root"></div>
${KANBAN_CSS ? `<style>${KANBAN_CSS}</style>` : ""}
<script type="module">${KANBAN_JS}</script>
        `.trim(),
        _meta: {
          "openai/widgetPrefersBorder": true,
          "openai/widgetDomain": 'https://chatgpt.com',
          'openai/widgetCSP': {
            connect_domains: ['https://chatgpt.com'],
            resource_domains: ['https://*.oaistatic.com'],
          }
        }
      },
    ],
  })
);

server.registerTool(
  "kanban-board",
  {
    title: "Show Kanban Board",
    _meta: {
      "openai/outputTemplate": "ui://widget/kanban-board.html",
      "openai/toolInvocation/invoking": "Displaying the board",
      "openai/toolInvocation/invoked": "Displayed the board"
    },
    inputSchema: { tasks: z.string() }
  },
  async () => {
    return {
      content: [{ type: "text", text: "Displayed the kanban board!" }],
      structuredContent: {}
    };
  }
);
```

## Structure Tool Response Data

Tool results can include three sibling fields:

- **`structuredContent`** – structured data hydrating your component (e.g., playlist tracks, property listings). ChatGPT injects this as `window.openai.toolOutput`. Keep it scoped to UI needs.

- **`content`** – optional free-form text (Markdown or plain strings) the model receives verbatim.

- **`_meta`** – arbitrary JSON passed only to the component. Use for data not influencing model reasoning (e.g., full dropdown options). Never shown to the model.

### Example Data Structure

```javascript
async function loadKanbanBoard() {
  const tasks = [
    { id: "task-1", title: "Design empty states", assignee: "Ada", status: "todo" },
    { id: "task-2", title: "Wireframe admin panel", assignee: "Grace", status: "in-progress" },
    { id: "task-3", title: "QA onboarding flow", assignee: "Lin", status: "done" }
  ];

  return {
    columns: [
      { id: "todo", title: "To do", tasks: tasks.filter((task) => task.status === "todo") },
      { id: "in-progress", title: "In progress", tasks: tasks.filter((task) => task.status === "in-progress") },
      { id: "done", title: "Done", tasks: tasks.filter((task) => task.status === "done") }
    ],
    tasksById: Object.fromEntries(tasks.map((task) => [task.id, task])),
    lastSyncedAt: new Date().toISOString()
  };
}

server.registerTool(
  "kanban-board",
  {
    title: "Show Kanban Board",
    _meta: {
      "openai/outputTemplate": "ui://widget/kanban-board.html",
      "openai/toolInvocation/invoking": "Displaying the board",
      "openai/toolInvocation/invoked": "Displayed the board"
    },
    inputSchema: { tasks: z.string() }
  },
  async () => {
    const board = await loadKanbanBoard();

    return {
      structuredContent: {
        columns: board.columns.map((column) => ({
          id: column.id,
          title: column.title,
          tasks: column.tasks.slice(0, 5)
        }))
      },
      content: [{ type: "text", text: "Here's your latest board. Drag cards in the component to update status." }],
      _meta: {
        tasksById: board.tasksById,
        lastSyncedAt: board.lastSyncedAt
      }
    };
  }
);
```

## Build Your Component

Follow the [Build a custom UX](/apps-sdk/build/custom-ux) guide to construct your component experience.

## Run Locally

1. Build your component bundle (see [Build a custom UX](/apps-sdk/build/custom-ux#bundle-for-the-iframe))
2. Start the MCP server
3. Point [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector) to `http://localhost:<port>/mcp`, list tools, and invoke them

Inspector validates responses include structured content and component metadata, rendering the component inline.

## Expose a Public Endpoint

ChatGPT requires HTTPS. During development, use a tunnelling service like [ngrok](https://ngrok.com/):

```bash
ngrok http <port>
# Forwarding: https://<subdomain>.ngrok.app -> http://127.0.0.1:<port>
```

Use the resulting URL when creating a connector in developer mode.

## Layer in Authentication and Storage

The [Authentication](/apps-sdk/build/auth) and [Manage state](/apps-sdk/build/state-management) guides demonstrate adding OAuth 2.1 flows, token verification, and user state management.

## Advanced

### Allow Component-Initiated Tool Access

Mark tools with `_meta.openai/widgetAccessible: true`:

```javascript
"_meta": {
  "openai/outputTemplate": "ui://widget/kanban-board.html",
  "openai/widgetAccessible": true
}
```

### Define Content Security Policies

Declare CSP using `openai/widgetCSP` meta property on component resources:

```javascript
server.registerResource(
  "html",
  "ui://widget/widget.html",
  {},
  async (req) => ({
    contents: [
      {
        uri: "ui://widget/widget.html",
        mimeType: "text/html",
        text: componentHtml,
        _meta: {
          "openai/widgetCSP": {
            connect_domains: [],
            resource_domains: ["https://persistent.oaistatic.com"],
          }
        },
      },
    ],
  })
);
```

CSP defines two arrays:
- `connect_domains` – URLs for network requests
- `resource_domains` – URLs for images, fonts, styles, scripts

### Configure Component Subdomains

Components render by default on `https://web-sandbox.oaiusercontent.com`. Configure custom subdomains:

```javascript
"openai/widgetDomain": "https://chatgpt.com"
```

The origin converts to a subdomain format, e.g., `chatgpt.com` becomes `chatgpt-com.web-sandbox.oaiusercontent.com`. This enables the fullscreen punchout button on desktop.

### Configure Status Strings

Provide localized status strings during and after invocation:

```javascript
"_meta": {
  "openai/outputTemplate": "ui://widget/kanban-board.html",
  "openai/toolInvocation/invoking": "Organizing tasks…",
  "openai/toolInvocation/invoked": "Board refreshed."
}
```

### Serve Localized Content

ChatGPT advertises user locale during the MCP initialize handshake using [IETF BCP 47](https://www.rfc-editor.org/rfc/bcp/bcp47.txt) tags (e.g., `en-US`, `fr-FR`).

Initialize request includes locale in `_meta["openai/locale"]`:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "capabilities": {
      "roots": { "listChanged": true },
      "sampling": {},
      "elicitation": {}
    },
    "_meta": {
      "openai/locale": "en-GB"
    },
    "clientInfo": {
      "name": "ChatGPT",
      "title": "ChatGPT",
      "version": "1.0.0"
    }
  }
}
```

Servers supporting localization should negotiate the closest match using [RFC 4647](https://datatracker.ietf.org/doc/html/rfc4647) and echo `_meta["openai/locale"]` with the resolved tag:

```javascript
"_meta": {
  "openai/outputTemplate": "ui://widget/kanban-board.html",
  "openai/locale": "en"
}
```

Every subsequent request repeats the locale in `_meta["openai/locale"]`. Include the same metadata key in responses so clients know which translation was served.

### Inspect Client Context Hints

Operation-phase requests include hints under `_meta.openai/*`:

- `_meta["openai/userAgent"]` – client identifier (e.g., `ChatGPT/1.2025.012`)
- `_meta["openai/userLocation"]` – coarse location object (country, region, city, timezone, coordinates)

Treat these as advisory only. Never rely on them for authorization. They help with formatting, regional content, and analytics.

### Add Component Descriptions

Set `openai/widgetDescription` on resource templates to describe components to the model:

```javascript
server.registerResource("html", "ui://widget/widget.html", {}, async () => ({
  contents: [
    {
      uri: "ui://widget/widget.html",
      mimeType: "text/html",
      text: componentHtml,
      _meta: {
        "openai/widgetDescription": "Renders an interactive UI showcasing the zoo animals returned by get_zoo_animals.",
      },
    },
  ],
}));

server.registerTool(
  "get_zoo_animals",
  {
    title: "get_zoo_animals",
    description: "Lists zoo animals and facts about them",
    inputSchema: { count: z.number().int().min(1).max(20).optional() },
    annotations: {
      readOnlyHint: true,
    },
    _meta: {
      "openai/outputTemplate": "ui://widget/widget.html",
    },
  },
  async ({ count = 10 }, _extra) => {
    const animals = generateZooAnimals(count);
    return {
      content: [],
      structuredContent: { animals },
    };
  }
);
```

**Note:** Refresh actions on your MCP in dev mode for descriptions to take effect.
