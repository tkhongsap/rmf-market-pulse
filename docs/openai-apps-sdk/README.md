# OpenAI Apps SDK Documentation

This directory contains extracted documentation from the OpenAI Apps SDK, organized for easy reference when building ChatGPT integrations.

## Documentation Structure

### Overview & Getting Started
- [01-overview.md](./01-overview.md) - Apps SDK overview and development workflow
- [02-quickstart.md](./02-quickstart.md) - Quick start guide with examples

### Concepts
- [concepts/mcp-server.md](./concepts/mcp-server.md) - Model Context Protocol server fundamentals
- [concepts/user-interaction.md](./concepts/user-interaction.md) - Discovery methods and entry points
- [concepts/design-guidelines.md](./concepts/design-guidelines.md) - Design principles and visual guidelines

### Planning Phase
- [plan/use-case.md](./plan/use-case.md) - Use case identification and prioritization
- [plan/tools.md](./plan/tools.md) - Tool interface planning and design
- [plan/components.md](./plan/components.md) - UI component planning

### Build Phase
- [build/mcp-server.md](./build/mcp-server.md) - MCP server implementation
- [build/custom-ux.md](./build/custom-ux.md) - Custom UI component development
- [build/auth.md](./build/auth.md) - OAuth 2.1 authentication implementation
- [build/state-management.md](./build/state-management.md) - State management strategies
- [build/examples.md](./build/examples.md) - Example applications and patterns

### Deploy Phase
- [deploy/connect-chatgpt.md](./deploy/connect-chatgpt.md) - Connecting to ChatGPT
- [deploy/testing.md](./deploy/testing.md) - Testing strategies and procedures

## Key Concepts Summary

### MCP Server
- Exposes tools that ChatGPT can call during conversations
- Returns structured content with optional UI components
- Supports Server-Sent Events or Streamable HTTP (recommended)

### Development Workflow
1. **Plan** - Define use cases, tools, and components
2. **Build** - Implement MCP server, custom UX, and authentication
3. **Deploy** - Connect to ChatGPT and test

### Display Modes
- **Inline** - Cards and carousels in conversation flow
- **Fullscreen** - Immersive experiences for rich interactions
- **Picture-in-Picture** - Persistent floating windows

### State Management
- **Business Data** - Server-owned, authoritative
- **UI State** - Widget-owned, ephemeral
- **Cross-session State** - Backend storage, persistent

## Official Resources

- [OpenAI Apps SDK Documentation](https://developers.openai.com/apps-sdk)
- [Apps SDK Examples Repository](https://github.com/openai/openai-apps-sdk-examples)
- [MCP Inspector](https://www.npmjs.com/package/@modelcontextprotocol/inspector)

## Extracted On

2025-11-11
