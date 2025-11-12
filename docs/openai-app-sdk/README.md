# OpenAI Apps SDK Documentation

This directory contains extracted documentation for building OpenAI apps using the Apps SDK and Model Context Protocol (MCP).

## Contents

0. **[Overview](00-overview.md)** - OpenAI Apps SDK introduction and roadmap
   - Core purpose and platform status
   - Getting started path (Plan, Build, Deploy)
   - Key concepts and important resources

1. **[Quickstart Guide](01-quickstart.md)** - Getting started with OpenAI Apps SDK
   - Building web components
   - Creating MCP servers
   - Local development and testing
   - Integration with ChatGPT

2. **[MCP Server](02-mcp-server.md)** - Model Context Protocol server documentation
   - Core components (tool discovery, execution, rendering)
   - Transport options
   - Key benefits and features
   - Getting started resources

3. **[User Interaction](03-user-interaction.md)** - How users discover and engage with apps
   - Discovery methods (named mention, in-conversation, directory)
   - Entry points (in-conversation access, launcher integration)
   - Best practices for tool descriptions

4. **[Design Guidelines](04-design-guidelines.md)** - App design principles and standards
   - Core design principles
   - Use case framework
   - Display modes (inline, fullscreen, PiP)
   - Visual design standards
   - Tone and communication guidelines

## Overview

The OpenAI Apps SDK allows developers to build applications for ChatGPT using:
- **Web Component**: Custom UI rendered in an iframe within ChatGPT
- **MCP Server**: Model Context Protocol server that exposes app capabilities to ChatGPT

## Key Concepts

- **Conversational Integration**: Apps should feel like natural extensions of ChatGPT
- **Structured Responses**: Tools return both human-readable content and machine-readable state
- **Tool Discovery**: MCP servers advertise tools with JSON Schema contracts
- **Component Rendering**: Tools reference embedded resources for display in ChatGPT

## Quick Links

- [Official MCP Specification](https://modelcontextprotocol.io/)
- [OpenAI Apps SDK](https://developers.openai.com/apps-sdk)
- [Figma Component Library](https://www.figma.com/community/file/1560064615791108827/apps-in-chatgpt-components-templates)

## Our Implementation

This project (Thai Fund Market Pulse) will be adapted to work as an OpenAI app, providing:
- Real-time Thai mutual fund data (RMF, ESG, ESGX)
- Interactive fund browsing and search
- Fund performance visualization
- Integration with ChatGPT for natural language queries

---

*Documentation extracted: 2025-11-12*
