# Apps SDK Quickstart Guide

**Source:** https://developers.openai.com/apps-sdk/quickstart

## Overview
The Apps SDK enables building ChatGPT extensions through two key components: a web component UI and a Model Context Protocol (MCP) server that exposes app capabilities as tools.

## Web Component Build
Create `public/todo-widget.html` containing a complete todo list interface. The component accesses ChatGPT integration via `window.openai`, which provides:
- `toolOutput`: Initial data injection from ChatGPT
- `callTool()`: Method to invoke backend operations and receive updated structured content

The example demonstrates a form for adding tasks and checkboxes for marking completion, styled with custom CSS.

## MCP Server Implementation
Using the Node SDK, create `server.js` that:
- Registers a resource serving the HTML component with MIME type `text/html+skybridge`
- Defines tools (`add_todo`, `complete_todo`) with input schemas and descriptions
- Returns responses containing both text messages and structured task data

The server listens on `/mcp` endpoint and handles CORS preflight requests.

## Local Development
Run the MCP server with `node server.js`. Test using MCP Inspector via:
```bash
npx @modelcontextprotocol/inspector@latest http://localhost:8787/mcp
```

Expose locally to ChatGPT using ngrok tunneling.

## ChatGPT Integration
Enable developer mode, create a connector with your public `/mcp` URL, then add it to conversations to test the complete flow.
