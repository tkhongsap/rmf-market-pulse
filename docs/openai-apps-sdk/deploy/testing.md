# Testing Deployment Documentation for Apps SDK

**Source:** https://developers.openai.com/apps-sdk/deploy/testing

## Overview
The Apps SDK testing strategy focuses on validating three core areas: tool correctness, component UX, and discovery precision before exposing connectors to users.

## Testing Procedures

### Unit Testing Tool Handlers
Test each tool function with representative inputs to verify:
- Schema validation operates correctly
- Error handling functions as intended
- Edge cases (empty results, missing IDs) are managed properly
- Authentication flows issue tokens and require linking appropriately

Keep test fixtures near MCP code to maintain alignment as schemas evolve.

### MCP Inspector Development Testing
The MCP Inspector enables rapid local debugging:

1. Run your MCP server
2. Launch the inspector via command line
3. Enter your server URL (e.g., `http://127.0.0.1:2091/mcp`)
4. Use "List Tools" and "Call Tool" features to examine raw requests/responses

As stated in the documentation: "Inspector renders components inline and surfaces errors immediately. Capture screenshots for your launch review."

### ChatGPT Developer Mode Validation
Once your connector is HTTPS-accessible:

- Link it through Settings → Connectors → Developer mode
- Run golden prompt sets (direct, indirect, negative cases)
- Verify model tool selection and argument passing
- Test mobile layouts on iOS and Android apps

### API Playground Testing
Access the [API Playground](https://platform.openai.com/playground) for raw logs:

1. Select Tools → Add → MCP Server
2. Provide HTTPS endpoint
3. Issue test prompts and review JSON pairs

## Pre-Launch Regression Checklist

- Tool list aligns with documentation; remove unused prototypes
- Structured content matches declared `outputSchema`
- Widgets render without console errors and maintain state correctly
- Auth flows return valid tokens with meaningful rejection messages
- Discovery works across golden prompts without false triggers

Document findings for release-to-release comparison to maintain reliability.
