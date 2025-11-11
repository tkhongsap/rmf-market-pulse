# OpenAI Apps SDK Documentation

Complete documentation for the OpenAI Apps SDK, extracted from the official documentation site.

## Extraction Metadata

- **Extracted Date**: 2025-11-11
- **Source**: https://developers.openai.com/apps-sdk
- **Total Pages**: 15
- **Format**: Markdown with frontmatter

## Documentation Structure

This folder contains the complete OpenAI Apps SDK documentation organized by section.

### Root Pages

| File | Title | URL |
|------|-------|-----|
| [00-index.md](00-index.md) | Apps SDK Overview | https://developers.openai.com/apps-sdk |
| [01-quickstart.md](01-quickstart.md) | Quickstart Guide | https://developers.openai.com/apps-sdk/quickstart |

### Concepts (3 pages)

Understanding core concepts of the Apps SDK.

| File | Title | URL |
|------|-------|-----|
| [concepts/mcp-server.md](concepts/mcp-server.md) | MCP Server | https://developers.openai.com/apps-sdk/concepts/mcp-server |
| [concepts/user-interaction.md](concepts/user-interaction.md) | User Interaction | https://developers.openai.com/apps-sdk/concepts/user-interaction |
| [concepts/design-guidelines.md](concepts/design-guidelines.md) | Design Guidelines | https://developers.openai.com/apps-sdk/concepts/design-guidelines |

### Plan (3 pages)

Planning your app implementation.

| File | Title | URL |
|------|-------|-----|
| [plan/use-case.md](plan/use-case.md) | Research Use Cases | https://developers.openai.com/apps-sdk/plan/use-case |
| [plan/tools.md](plan/tools.md) | Define Tools | https://developers.openai.com/apps-sdk/plan/tools |
| [plan/components.md](plan/components.md) | Design Components | https://developers.openai.com/apps-sdk/plan/components |

### Build (5 pages)

Building your app with the Apps SDK.

| File | Title | URL |
|------|-------|-----|
| [build/mcp-server.md](build/mcp-server.md) | Set Up Your Server | https://developers.openai.com/apps-sdk/build/mcp-server |
| [build/custom-ux.md](build/custom-ux.md) | Build a Custom UX | https://developers.openai.com/apps-sdk/build/custom-ux |
| [build/auth.md](build/auth.md) | Authentication | https://developers.openai.com/apps-sdk/build/auth |
| [build/state-management.md](build/state-management.md) | State Management | https://developers.openai.com/apps-sdk/build/state-management |
| [build/examples.md](build/examples.md) | Examples | https://developers.openai.com/apps-sdk/build/examples |

### Deploy (2 pages)

Deploying and testing your app.

| File | Title | URL |
|------|-------|-----|
| [deploy/connect-chatgpt.md](deploy/connect-chatgpt.md) | Connect from ChatGPT | https://developers.openai.com/apps-sdk/deploy/connect-chatgpt |
| [deploy/testing.md](deploy/testing.md) | Testing | https://developers.openai.com/apps-sdk/deploy/testing |

## Key Topics Covered

### Core Concepts
- **Model Context Protocol (MCP)**: Open specification for connecting LLMs to external tools
- **User Interaction**: Discovery, entry points, and launcher integration
- **Design Guidelines**: Best practices for apps that feel native to ChatGPT

### Planning Phase
- **Use Case Research**: Identifying opportunities and defining evaluation prompts
- **Tool Definition**: Designing tool contracts, metadata, and discovery
- **Component Design**: Planning UI interactions and state management

### Building Phase
- **MCP Server Setup**: Registering tools, resources, and handling responses
- **Custom UX**: Building React components with the `window.openai` API
- **Authentication**: OAuth 2.1 implementation and token verification
- **State Management**: Managing business data, UI state, and cross-session state
- **Examples**: Reference implementations and blueprint patterns

### Deployment Phase
- **ChatGPT Integration**: Creating connectors and testing in developer mode
- **Testing**: Unit tests, MCP Inspector, and validation strategies

## File Format

Each Markdown file includes frontmatter with metadata:

```yaml
---
source_url: https://developers.openai.com/apps-sdk/...
extracted_date: 2025-11-11
section: concepts|plan|build|deploy|root
title: Page Title
---
```

## Key Resources

- **Official Documentation**: https://developers.openai.com/apps-sdk
- **Model Context Protocol Spec**: https://modelcontextprotocol.io/specification
- **Python SDK**: https://github.com/modelcontextprotocol/python-sdk
- **TypeScript SDK**: https://modelcontextprotocol.io/
- **Examples Repository**: https://github.com/openai-apps-sdk-examples
- **Figma Components**: https://www.figma.com/community/file/1560064615791108827/apps-in-chatgpt-components-templates
- **MCP Inspector**: https://modelcontextprotocol.io/docs/tools/inspector

## Quick Navigation

### Getting Started
1. [Read the overview](00-index.md)
2. [Follow the quickstart](01-quickstart.md)
3. [Understand MCP concepts](concepts/mcp-server.md)

### Planning Your App
1. [Research use cases](plan/use-case.md)
2. [Define your tools](plan/tools.md)
3. [Design components](plan/components.md)

### Implementation
1. [Set up your MCP server](build/mcp-server.md)
2. [Build custom UX](build/custom-ux.md)
3. [Add authentication](build/auth.md)
4. [Manage state](build/state-management.md)

### Testing & Deployment
1. [Connect to ChatGPT](deploy/connect-chatgpt.md)
2. [Test your integration](deploy/testing.md)

## Notes

- **API Preview**: The Apps SDK is currently in preview
- **Publishing**: Public app submissions will open later in 2025
- **Plan Support**: Currently available on Plus, Pro, Go, and Free plans (Business/Enterprise coming)
- **HTTPS Required**: All MCP servers must be publicly accessible via HTTPS
- **Rate Limits**: Consider API rate limiting and backend protection

## Technical Stack

**Recommended Technologies:**
- **Server**: Node.js with `@modelcontextprotocol/sdk` or Python with FastMCP
- **Frontend**: React with esbuild for bundling
- **Authentication**: OAuth 2.1 with PKCE (Auth0, Stytch, or custom)
- **Development Tools**: MCP Inspector, ngrok for local testing

## Updates

This documentation snapshot was captured on 2025-11-11. For the latest updates, visit the official OpenAI Apps SDK documentation at https://developers.openai.com/apps-sdk.
