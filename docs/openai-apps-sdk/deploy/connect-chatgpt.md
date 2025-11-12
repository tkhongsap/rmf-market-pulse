# ChatGPT Connection Deployment Documentation

**Source:** https://developers.openai.com/apps-sdk/deploy/connect-chatgpt

## Prerequisites

Before connecting your app, you need to enable developer mode. Navigate to **Settings → Apps & Connectors → Advanced settings** and toggle developer mode if your organization permits it.

**Important limitation:** "ChatGPT Apps is only supported on Plus, Pro, Go and Free plans. Business, Enterprise, or Education plans do not support ChatGPT Apps today."

## Creating a Connector

Follow these steps to establish your connection:

1. **Ensure HTTPS accessibility** – Your MCP server must be publicly reachable via HTTPS. For local development, use tools like ngrok or Cloudflare Tunnel to expose your server.

2. **Access connector creation** – In ChatGPT, go to **Settings → Connectors → Create**.

3. **Configure metadata** – Provide three essential details:
   - Connector name (user-facing title)
   - Description (explains functionality; used by the model for discovery)
   - Connector URL (the `/mcp` endpoint, e.g., `https://abc123.ngrok.app/mcp`)

4. **Verify connection** – Click Create. Success displays your advertised tools; failures require debugging via MCP Inspector or the API Playground.

## Testing Your App

Once created, test in a new ChatGPT conversation by clicking the **+** button near the message composer, selecting **More**, and choosing your connector. The model will display tool-call payloads for confirmation, with write operations requiring approval unless you enable remember-approvals.

## Metadata Refresh

When modifying tools or descriptions, redeploy your server and navigate to **Settings → Connectors** to click **Refresh** on your connector.

## Alternative Clients

Your MCP server also works with the API Playground and mobile ChatGPT applications once the web connector is linked.
