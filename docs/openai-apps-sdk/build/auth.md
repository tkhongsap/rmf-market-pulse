# Apps SDK Authentication Build Documentation

**Source:** https://developers.openai.com/apps-sdk/build/auth

## Overview

The authentication documentation covers implementing OAuth 2.1 flows for Apps SDK applications that need to expose customer-specific data or enable write actions.

## Key Components

**Three-party system:**
- Resource server (your MCP server)
- Authorization server (identity provider)
- Client (ChatGPT)

## MCP Authorization Spec Requirements

### Protected Resource Metadata

Your MCP server must host metadata at `/.well-known/oauth-protected-resource`:

```json
{
  "resource": "https://your-mcp.example.com",
  "authorization_servers": ["https://auth.yourcompany.com"],
  "scopes_supported": ["files:read", "files:write"],
  "resource_documentation": "https://yourcompany.com/docs/mcp"
}
```

Alternatively, advertise the URL via `WWW-Authenticate` header on 401 responses.

### Authorization Server Metadata

Identity providers must expose discovery documents at standard locations:
- OAuth 2.0: `/.well-known/oauth-authorization-server`
- OpenID Connect: `/.well-known/openid-configuration`

Critical fields include:
- `authorization_endpoint`, `token_endpoint`, `jwks_uri`
- `registration_endpoint` (for dynamic client registration)
- `code_challenge_methods_supported` (must include `S256`)

### Resource Parameter Echo

ChatGPT appends `resource=` to authorization and token requests. Your server should copy this into access token claims (typically `aud`).

## OAuth Flow Steps

1. ChatGPT queries your MCP server for protected resource metadata
2. ChatGPT performs dynamic client registration, obtaining a `client_id`
3. User authenticates and consents during authorization code + PKCE flow
4. ChatGPT exchanges code for access token
5. Server verifies token on each request before executing tools

## Token Verification

Your MCP server must validate:
- Signature and issuer (`iss`)
- Expiration (`exp`/`nbf`)
- Audience matching (`aud` or `resource` claim)
- Required scopes
- App-specific policies

Return `401 Unauthorized` with `WWW-Authenticate` challenge if verification fails.

## Triggering Authentication UI

### Proactive Declaration

Use `securitySchemes` on tools to signal OAuth availability:

**Public + optional auth:**
```typescript
securitySchemes: [
  { type: "noauth" },
  { type: "oauth2", scopes: ["search.read"] }
]
```

**Auth required:**
```typescript
securitySchemes: [
  { type: "oauth2", scopes: ["docs.write"] }
]
```

### Runtime Re-authentication

When tokens expire or lack scopes, respond with `mcp/www_authenticate`:

```typescript
throw new ToolError("Authentication required", {
  _meta: {
    "mcp/www_authenticate":
      'Bearer resource_metadata="https://your-mcp.example.com/.well-known/oauth-protected-resource", scope="files:read"'
  }
});
```

## Implementation Resources

- **Python SDK**: Includes token verification helpers
- **TypeScript SDK**: Provides authentication utilities
- **Recommended providers**: Auth0, Stytch (with specific MCP guides available)

## Testing Strategy

- Start with development tenant for quick iteration
- Gate access to trusted testers before broad rollout
- Plan for token rotation and refresh mechanisms
- Use MCP Inspector's Auth settings for debugging
