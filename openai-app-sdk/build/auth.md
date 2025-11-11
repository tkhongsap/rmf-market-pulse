---
source_url: https://developers.openai.com/apps-sdk/build/auth
extracted_date: 2025-11-11
section: build
title: Authentication
---

# Authentication for Apps SDK

## Overview

The Apps SDK authentication documentation explains how to implement secure user authentication for apps that handle customer-specific data or write operations. While read-only anonymous modes are possible, protected features require proper authorization mechanisms.

## Custom OAuth 2.1 Implementation

The authentication architecture involves three key components:

- **Resource server**: Your MCP server exposing tools and validating access tokens
- **Authorization server**: Your identity provider (Auth0, Okta, Cognito, or custom) issuing tokens
- **Client**: ChatGPT acting on behalf of the user with dynamic client registration and PKCE support

## MCP Authorization Specification Requirements

### Protected Resource Metadata

Your MCP server must host an HTTPS endpoint returning JSON describing available authorization servers:

```json
{
  "resource": "https://your-mcp.example.com",
  "authorization_servers": ["https://auth.yourcompany.com"],
  "scopes_supported": ["files:read", "files:write"],
  "resource_documentation": "https://yourcompany.com/docs/mcp"
}
```

Critical fields include the canonical resource identifier, authorization server URLs, and supported scopes.

### OAuth Metadata Discovery

Identity providers must expose standard discovery documents at:
- `https://auth.yourcompany.com/.well-known/oauth-authorization-server`
- `https://auth.yourcompany.com/.well-known/openid-configuration`

Essential endpoints include authorization, token exchange, and dynamic client registration endpoints. The metadata must confirm PKCE support via `code_challenge_methods_supported: ["S256"]`.

### Resource Parameter Handling

ChatGPT appends `resource` query parameters throughout the OAuth flow. Your authorization server should copy this value into issued access tokens (typically the `aud` claim) so your MCP server can verify tokens were minted for the correct resource.

## OAuth Authorization Flow

1. ChatGPT queries your MCP server for protected resource metadata
2. ChatGPT performs dynamic client registration to obtain a `client_id`
3. User authenticates and consents during authorization code + PKCE flow
4. ChatGPT exchanges the authorization code for an access token
5. Your server verifies tokens on each request before executing tools

## Token Verification

Your MCP server must validate tokens independently by:

- Verifying signatures using authorization server JWKS
- Confirming issuer and audience claims match expectations
- Checking token expiration and validity windows
- Validating required scopes are present
- Running application-specific policy checks

The documentation notes: "Once a request reaches your MCP server you must assume the token is untrusted and perform the full set of resource-server checks yourself."

## Triggering Authentication UI

Use `securitySchemes` declarations on tools to indicate whether authentication is needed:

- `noauth`: Tool callable anonymously
- `oauth2`: Tool requires access token with specified scopes

Example for optional authentication:

```typescript
securitySchemes: [
  { type: "noauth" },
  { type: "oauth2", scopes: ["search.read"] }
]
```

For re-authentication scenarios, respond with `mcp/www_authenticate` metadata following RFC 9728 patterns.

## Recommended Identity Providers

The documentation recommends using established providers rather than custom implementations. Supported options include Auth0 and Stytch, each offering MCP-specific configuration guides.

## Testing and Rollout

Best practices include local testing with development tenants, dogfooding with trusted users before broader release, planning for token rotation and revocation, and using the MCP Inspector for debugging OAuth flows.
