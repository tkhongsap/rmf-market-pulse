# MCP Server Build Documentation

**Source:** https://developers.openai.com/apps-sdk/build/mcp-server

## Core Overview

The MCP server forms the foundation of Apps SDK integrations. It exposes callable tools, enforces authentication, and packages structured data with component HTML that ChatGPT renders inline.

## SDK Selection

Two official options are recommended:

- **Python SDK**: Built on the official ModelContextProtocol package, excellent for rapid prototyping
- **TypeScript SDK**: Optimal for Node/React stacks using `@modelcontextprotocol/sdk`

## Tool Definition

Tools require three key elements:

1. **Machine name, human-friendly title, and JSON schema** to help the model understand when and how to invoke each tool
2. **Per-tool metadata** including auth hints, status strings, and component configuration
3. **HTML UI template reference** via `text/html+skybridge` MIME type

As the documentation states: "Each tool on your MCP server should also reference an HTML UI template in its descriptor" that ChatGPT renders in an iframe.

## Response Structure

Tool responses contain three sibling fields:

- **`structuredContent`**: Hydration data for your component (e.g., playlist tracks, property listings)
- **`content`**: Optional Markdown or plain text visible to the model
- **`_meta`**: Arbitrary JSON passed only to the component, hidden from model reasoning

## Advanced Configuration

The documentation covers several specialized features:

- Component-initiated tool access via `openai/widgetAccessible: true`
- Content Security Policy declaration through `openai/widgetCSP`
- Custom subdomains for components with `openai/widgetDomain`
- Localized content support following IETF BCP 47 tags
- Status strings for improved UX during tool invocation
- Client context hints for user location and agent identification

## Deployment Path

Development uses ngrok tunneling for HTTPS exposure, while production requires low-latency HTTPS endpoints as detailed in the Deploy your app section.
