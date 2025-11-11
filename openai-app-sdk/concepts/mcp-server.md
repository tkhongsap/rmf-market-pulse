---
source_url: https://developers.openai.com/apps-sdk/concepts/mcp-server
extracted_date: 2025-11-11
section: concepts
title: MCP Server
---

# Model Context Protocol (MCP) in Apps SDK

## Overview

The Model Context Protocol is an open specification enabling large language model clients to connect with external tools and resources. As described in the documentation, "an MCP server exposes **tools** that a model can call during a conversation, and return results given specified parameters."

## Core Architecture

### Three Essential Capabilities

1. **Tool Discovery** - Servers advertise supported tools with JSON Schema specifications and optional annotations
2. **Tool Execution** - Models send `call_tool` requests with arguments; servers execute actions and return structured content
3. **Component Rendering** - Tools can reference embedded resources that render as interfaces in the ChatGPT client

The protocol works across Server-Sent Events and Streamable HTTP transports, with Streamable HTTP being the recommended approach.

## Key Benefits

Apps SDK standardizes on MCP to provide:

- **Natural Discovery** - Tool metadata surfaces similarly to first-party connectors, enabling language-based discovery
- **Conversation Context** - Structured results and component state persist across conversation turns
- **Cross-Platform Support** - Self-describing protocol works on ChatGPT web and mobile without custom code
- **Authentication Flexibility** - Built-in support for OAuth 2.1 and protected resource metadata

## Getting Started Resources

- [Model Context Protocol specification](https://modelcontextprotocol.io/specification)
- Official implementations: Python SDK with FastMCP and TypeScript SDK
- [MCP Inspector](https://modelcontextprotocol.io/docs/tools/inspector) for debugging

## Next Phase

After understanding MCP fundamentals, developers proceed to the [Set up your server](/apps-sdk/build/mcp-server) implementation guide.
