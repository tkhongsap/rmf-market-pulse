---
source_url: https://developers.openai.com/apps-sdk/deploy/connect-chatgpt
extracted_date: 2025-11-11
section: deploy
title: Connect from ChatGPT
---

# Connect from ChatGPT

## Overview

This guide explains how to connect your app to ChatGPT clients after building your MCP server.

## Before You Begin

### Developer Mode Requirements

To test your app in ChatGPT, you need to enable developer mode:

1. Navigate to **Settings → Apps & Connectors → Advanced settings**
2. Toggle developer mode (if your organization allows it)
3. Once active, a **Create** button appears under **Settings → Apps & Connectors**

### Plan Compatibility

ChatGPT Apps is supported on:
- Plus, Pro, Go, and Free plans

Not currently supported:
- Business, Enterprise, or Education plans (though these are on the roadmap)

Developer mode remains available on all plan types.

### Publishing Note

"publishing your app for public access is not available at the moment, but we will accept submissions later this year."

## Create a Connector

### Prerequisites

- Your MCP server must be publicly accessible via HTTPS
- For local development, use tunneling tools like [ngrok](https://ngrok.com/) or [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/)

### Setup Steps

1. In ChatGPT, go to **Settings → Connectors → Create**
2. Provide connector metadata:
   - **Connector name**: User-facing title (e.g., "Kanban board")
   - **Description**: Explain functionality and use cases for model discovery
   - **Connector URL**: Your server's public `/mcp` endpoint (e.g., `https://abc123.ngrok.app/mcp`)
3. Click **Create**

Success shows your advertised tools. If it fails, consult the [Testing guide](/apps-sdk/deploy/testing) for debugging with MCP Inspector or API Playground.

## Try the App

1. Open a new ChatGPT conversation
2. Click **+** near the message composer, then **More**
3. Select your connector from available tools
4. Prompt the model with tool-related requests (e.g., "What are my available tasks?")

ChatGPT displays tool payloads for confirmation. Write tools require manual approval unless you enable conversation-specific remembering.

## Refresh Metadata

When updating tools or descriptions:

1. Update and redeploy your MCP server (skip if using local server)
2. In **Settings → Connectors**, select your connector and choose **Refresh**
3. Verify the updated tool list and test new flows

## Using Other Clients

### API Playground
Visit the [platform playground](https://platform.openai.com/chat), open **Tools → Add → MCP Server**, and paste your HTTPS endpoint for raw request/response logging.

### Mobile Clients
Once connected on ChatGPT web, your connector automatically becomes available on mobile apps. Test mobile layouts early if using custom components.
