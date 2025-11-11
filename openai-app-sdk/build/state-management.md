---
source_url: https://developers.openai.com/apps-sdk/build/state-management
extracted_date: 2025-11-11
section: build
title: State Management
---

# Managing State in ChatGPT Apps

## Overview

State in ChatGPT applications falls into three distinct categories:

| State Type | Owner | Lifetime | Examples |
|---|---|---|---|
| Business data (authoritative) | MCP server or backend service | Long-lived | Tasks, tickets, documents |
| UI state (ephemeral) | Widget instance inside ChatGPT | Active widget only | Selected row, expanded panel, sort order |
| Cross-session state (durable) | Backend or storage system | Cross-conversation | Saved filters, view mode, workspace selection |

## How UI Components Live Inside ChatGPT

Widgets are tied to specific messages in conversations. Key behaviors include:

- **Message-scoped persistence**: Each response creating a widget generates a fresh instance with its own UI state
- **State restoration**: Reopening the same message restores saved UI state (selections, expansions, etc.)
- **Server-driven truth**: Business data updates occur only after tool completion, with UI state reapplied to the snapshot

The architecture follows this pattern: "Server (MCP or backend) → Authoritative business data (source of truth) → ChatGPT Widget → Ephemeral UI state + Rendered view"

## 1. Business State (Authoritative)

Business data represents the source of truth and should reside on the MCP server or backend, not within the widget.

**Workflow**:
1. UI calls server tool
2. Server updates data
3. Server returns new authoritative snapshot
4. Widget re-renders using snapshot

This prevents divergence between UI and server states.

### Example: MCP Server (Node.js)

```javascript
import { Server } from "@modelcontextprotocol/sdk/server";
import { jsonSchema } from "@modelcontextprotocol/sdk/schema";

const tasks = new Map();
let nextId = 1;

const server = new Server({
  tools: {
    get_tasks: {
      description: "Return all tasks",
      inputSchema: jsonSchema.object({}),
      async run() {
        return {
          structuredContent: {
            type: "taskList",
            tasks: Array.from(tasks.values()),
          }
        };
      }
    },
    add_task: {
      description: "Add a new task",
      inputSchema: jsonSchema.object({ title: jsonSchema.string() }),
      async run({ title }) {
        const id = `task-${nextId++}`;
        tasks.set(id, { id, title, done: false });
        return this.tools.get_tasks.run({});
      }
    }
  }
});

server.start();
```

## 2. UI State (Ephemeral)

UI state describes viewing behavior rather than data itself. Widgets do not auto-sync UI state when server data updates; instead, they maintain UI state and reapply it upon refresh.

Manage UI state through:
- `window.openai.widgetState` – read current widget-scoped state snapshot
- `window.openai.setWidgetState(newState)` – write next snapshot (synchronous)

React apps should use the `useWidgetState` hook, which:
- Hydrates initial state from `window.openai.widgetState`
- Subscribes to future updates
- Mirrors writes back to maintain sync

State persistence happens asynchronously; no `await` is necessary.

### Example: React Component

```javascript
import { useWidgetState } from "./use-widget-state";

export function TaskList({ data }) {
  const [widgetState, setWidgetState] = useWidgetState(() => ({
    selectedId: null,
  }));

  const selectTask = (id) => {
    setWidgetState((prev) => ({ ...prev, selectedId: id }));
  };

  return (
    <ul>
      {data.tasks.map((task) => (
        <li
          key={task.id}
          style={{
            fontWeight: widgetState?.selectedId === task.id ? "bold" : "normal",
          }}
          onClick={() => selectTask(task.id)}
        >
          {task.title}
        </li>
      ))}
    </ul>
  );
}
```

### Example: Vanilla JavaScript

```javascript
const tasks = window.openai.toolOutput?.tasks ?? [];
let widgetState = window.openai.widgetState ?? { selectedId: null };

function selectTask(id) {
  widgetState = { ...widgetState, selectedId: id };
  window.openai.setWidgetState(widgetState);
  renderTasks();
}

function renderTasks() {
  const list = document.querySelector("#task-list");
  list.innerHTML = tasks
    .map(
      (task) => `
        <li
          style="font-weight: ${widgetState.selectedId === task.id ? "bold" : "normal"}"
          onclick="selectTask('${task.id}')"
        >
          ${task.title}
        </li>
      `
    )
    .join("");
}

renderTasks();
```

## 3. Cross-session State

Preferences persisting across conversations, devices, or sessions require backend storage. While the Apps SDK handles conversation state automatically, real-world apps often need additional persistence for cached data, user preferences, or created artifacts.

### Bring Your Own Backend

Integrate with existing storage infrastructure:

- **Authentication**: Use OAuth to map ChatGPT identities to internal accounts (see [Authentication](/apps-sdk/build/auth))
- **Backend APIs**: Fetch and mutate data efficiently; target few-hundred-millisecond component rendering
- **Structured content**: Return sufficient data so models understand context even if component loading fails

**Considerations**:
- **Data residency and compliance**: Establish agreements before transferring PII or regulated data
- **Rate limits**: Protect APIs against bursty traffic from model retries or concurrent components
- **Versioning**: Include schema versions in stored objects for seamless migration

### Example: Widget Invoking Tool

```javascript
import { useState } from "react";

export function PreferencesForm({ userId, initialPreferences }) {
  const [formState, setFormState] = useState(initialPreferences);
  const [isSaving, setIsSaving] = useState(false);

  async function savePreferences(next) {
    setIsSaving(true);
    setFormState(next);
    window.openai.setWidgetState(next);

    const result = await window.openai.callTool("set_preferences", {
      userId,
      preferences: next,
    });

    const updated = result?.structuredContent?.preferences ?? next;
    setFormState(updated);
    window.openai.setWidgetState(updated);
    setIsSaving(false);
  }

  return (
    <form>
      <button type="button" disabled={isSaving} onClick={() => savePreferences(formState)}>
        {isSaving ? "Saving…" : "Save preferences"}
      </button>
    </form>
  );
}
```

### Example: Server Tool Handler (Node.js)

```javascript
import { Server } from "@modelcontextprotocol/sdk/server";
import { jsonSchema } from "@modelcontextprotocol/sdk/schema";
import { request } from "undici";

async function readPreferences(userId) {
  const response = await request(`https://api.example.com/users/${userId}/preferences`, {
    method: "GET",
    headers: { Authorization: `Bearer ${process.env.API_TOKEN}` }
  });
  if (response.statusCode === 404) return {};
  if (response.statusCode >= 400) throw new Error("Failed to load preferences");
  return await response.body.json();
}

async function writePreferences(userId, preferences) {
  const response = await request(`https://api.example.com/users/${userId}/preferences`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${process.env.API_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(preferences)
  });
  if (response.statusCode >= 400) throw new Error("Failed to save preferences");
  return await response.body.json();
}

const server = new Server({
  tools: {
    get_preferences: {
      inputSchema: jsonSchema.object({ userId: jsonSchema.string() }),
      async run({ userId }) {
        const preferences = await readPreferences(userId);
        return { structuredContent: { type: "preferences", preferences } };
      }
    },
    set_preferences: {
      inputSchema: jsonSchema.object({
        userId: jsonSchema.string(),
        preferences: jsonSchema.object({})
      }),
      async run({ userId, preferences }) {
        const updated = await writePreferences(userId, preferences);
        return { structuredContent: { type: "preferences", preferences: updated } };
      }
    }
  }
});
```

## Summary

- Store **business data** on the server
- Store **UI state** using `window.openai.widgetState`, `window.openai.setWidgetState`, or the `useWidgetState` hook
- Store **cross-session state** in controlled backend storage
- Widget state persists only for the specific message instance
- Avoid `localStorage` for core application state

---

**Related**: [Authenticate users](/apps-sdk/build/auth) | [Examples](/apps-sdk/build/examples)
