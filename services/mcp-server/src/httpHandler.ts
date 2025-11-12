import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import type { Request, Response } from 'express';
import type { RMFMCPServer } from './rmfMcpServer';

export function createMcpHttpHandler(mcpServer: RMFMCPServer) {
  return async function handleMcpRequest(req: Request, res: Response) {
    try {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true,
      });

      res.on('close', () => {
        transport.close();
      });

      await mcpServer.getServer().connect(transport);
      await transport.handleRequest(req, res, (req as any).body ?? req.body);
    } catch (error) {
      console.error('MCP endpoint error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: error instanceof Error ? error.message : 'Internal error',
          },
          id: null,
        });
      }
    }
  };
}
