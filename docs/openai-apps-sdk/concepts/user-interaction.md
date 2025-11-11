# User Interaction Concepts

**Source:** https://developers.openai.com/apps-sdk/concepts/user-interaction

## Overview
User interaction encompasses how users discover, engage with, activate, and manage apps within ChatGPT. The system leverages tool metadata and usage history for intelligent app surfacing.

## Discovery Methods

### Named Mention
Users can surface your app by specifying its name at the beginning of their prompt. When mentioned directly, the application automatically appears in responses.

### In-Conversation Discovery
The model evaluates multiple factors to determine app relevance:

- **Chat context**: Including history, memories, and stated tool preferences
- **Brand references**: Whether your brand is explicitly requested or cited in search results
- **Tool metadata**: The names, descriptions, and parameter details you provide in your MCP server
- **User linking status**: Whether the user has granted access or needs to connect first

**Optimization tips** include:
- Using action-oriented descriptions like "Use this when the user wants to view their kanban board"
- Providing clear component descriptions in resource UI template metadata
- Testing prompts in developer mode to measure precision and recall

### Directory
A browsable surface outside conversations featuring your app name, icon, descriptions, tags, and optional onboarding materials.

## Entry Points

### In-Conversation Entry
Linked tools remain available in the model's context. The assistant decides tool activation based on conversation state and your metadata.

Best practices emphasize returning structured content with stable IDs for follow-up mutations and using `_meta` hints to streamline confirmation and rendering.

### Launcher
Accessible via the composer's + button, this high-intent entry point allows explicit app selection. Consider implementing deep linking with starter prompts and maintaining metadata alignment with supported scenarios.
