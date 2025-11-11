---
source_url: https://developers.openai.com/apps-sdk/concepts/user-interaction
extracted_date: 2025-11-11
section: concepts
title: User Interaction
---

# User Interaction

How users find, engage with, activate and manage apps that are available in ChatGPT.

## Discovery

Discovery encompasses the various ways users and the model learn about your app and its capabilities: natural-language prompts, directory browsing, and proactive entry points. The Apps SDK relies on tool metadata and usage history to make intelligent selections. Maintaining good discovery practices means your app appears contextually relevant while remaining unobtrusive when not needed.

### Named mention

When a user explicitly names your app at the start of a prompt, ChatGPT automatically surfaces it in the response. If the app name isn't mentioned initially, it may still appear through in-conversation discovery suggestions.

### In-conversation discovery

The model evaluates several factors when determining whether to suggest your app:

- **Conversation context** – chat history, tool results, saved preferences, and explicit tool requests
- **Brand mentions and citations** – whether your brand appears in the query or search results
- **Tool metadata** – names, descriptions, and parameter documentation from your MCP server
- **User linking state** – whether the user has granted access or needs to connect first

Improve discoverability by:

1. Writing task-focused tool descriptions (e.g., "Use this when the user wants to view their kanban board") rather than generic language
2. Providing clear component descriptions in your resource UI template metadata
3. Testing your key prompts in ChatGPT developer mode and monitoring precision and recall metrics

When the assistant selects your tool, it manages arguments, displays confirmations as needed, and renders components inline. If no linked tool is an obvious fit, ChatGPT defaults to built-in capabilities.

### Directory

The directory provides users a browsable way to discover apps outside conversations. Directory listings typically include:

- App name and icon
- Short and long descriptions
- Tags or categories
- Optional onboarding instructions or screenshots

## Entry points

After a user links your app, ChatGPT can surface it through multiple entry points. Understanding each surface helps you design experiences that feel native.

### In-conversation entry

Linked tools remain active in the model's context. The assistant decides whether to invoke your tool based on conversation state and your metadata. Recommended practices:

- Use action-oriented tool descriptions to help the model distinguish between similar apps
- Return structured content with stable IDs for follow-up prompts to modify or summarize results
- Provide `_meta` hints so the client can streamline confirmation and rendering

Successful calls render the component inline with the current theme, composer, and confirmation settings applied.

### Launcher

The launcher (accessed via the + button in the composer) offers a high-intent entry point where users explicitly select an app. Consider:

- **Deep linking** – include starter prompts or entry arguments so users land on the most useful tool immediately
- **Context awareness** – the launcher ranks apps using current conversation signals, so align metadata with supported scenarios
