# MCP Server Concepts

**Source:** https://developers.openai.com/apps-sdk/concepts/mcp-server

## Overview

The Model Context Protocol (MCP) is an open specification for connecting language model clients to external tools and resources. According to the documentation, "An MCP server exposes **tools** that a model can call during a conversation, and return results given specified parameters."

## Core Building Blocks

A minimal MCP server implementation requires three capabilities:

1. **Tool Discovery** - Servers advertise supported tools with JSON Schema input/output contracts and optional metadata annotations

2. **Tool Execution** - When models select tools, servers receive `call_tool` requests with user-intent arguments, execute actions, and return structured content

3. **UI Component Rendering** - Tools can optionally point to embedded resources representing interfaces for ChatGPT client display

## Transport Options

The protocol supports multiple transport mechanisms. The documentation notes that "The protocol is transport agnostic, you can host the server over Server-Sent Events or Streamable HTTP." Apps SDK supports both, though Streamable HTTP is recommended.

## Key Benefits

Using Apps SDK with MCP provides:

- **Model Integration** - Tools are discovered and ranked similarly to first-party connectors
- **Context Preservation** - Structured content and component state persist throughout conversations
- **Cross-Platform Support** - Self-describing protocol enables ChatGPT web and mobile compatibility
- **Authentication** - Built-in OAuth 2.1 flows and dynamic client registration

## Getting Started Resources

The documentation recommends reviewing the official MCP specification, Python and TypeScript SDKs, and the MCP Inspector debugging tool before implementation.
