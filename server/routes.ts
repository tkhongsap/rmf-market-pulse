import type { Express } from "express";
import { createServer, type Server } from "http";
import {
  fetchRMFFunds,
  fetchRMFFundDetail,
  searchRMFFunds,
} from "./services/secApi";
import { rmfMCPServer } from "./mcp";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/healthz", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Debug endpoint to test SEC API key
  app.get("/api/debug/sec", async (_req, res) => {
    const SEC_API_KEY = process.env.SEC_API_KEY;
    
    if (!SEC_API_KEY) {
      return res.json({
        status: "error",
        message: "SEC_API_KEY environment variable not set",
        keyLength: 0,
      });
    }

    try {
      // Try a simple API call to test the key
      const testUrl = 'https://api.sec.or.th/FundFactsheet/fund';
      const response = await fetch(testUrl, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': SEC_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword: 'RMF' }),
      });

      const responseText = await response.text();
      
      return res.json({
        status: response.ok ? "success" : "error",
        statusCode: response.status,
        statusText: response.statusText,
        keyLength: SEC_API_KEY.length,
        keyPrefix: SEC_API_KEY.substring(0, 8) + '...',
        responsePreview: responseText.substring(0, 500),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      return res.json({
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        keyLength: SEC_API_KEY.length,
      });
    }
  });

  // Get all RMF (Retirement Mutual Fund) funds with pagination
  app.get("/api/rmf", async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 20;
      const fundType = req.query.fundType as string | undefined;
      const search = req.query.search as string | undefined;

      // If search query provided, use search function
      if (search) {
        const funds = await searchRMFFunds(search);
        return res.json({
          funds,
          total: funds.length,
          page: 1,
          pageSize: funds.length,
          timestamp: new Date().toISOString(),
        });
      }

      // Otherwise, fetch with pagination
      const { funds, total } = await fetchRMFFunds({ page, pageSize, fundType });
      res.json({
        funds,
        total,
        page,
        pageSize,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error fetching RMF funds:", error);
      res.status(500).json({
        error: "Failed to fetch RMF funds",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Get specific RMF fund by code
  app.get("/api/rmf/:fundCode", async (req, res) => {
    try {
      const { fundCode } = req.params;
      const fund = await fetchRMFFundDetail(fundCode);

      if (!fund) {
        return res.status(404).json({
          error: "RMF fund not found",
          message: `No data available for fund: ${fundCode}`,
        });
      }

      res.json({
        fund,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error fetching RMF fund detail:", error);
      res.status(500).json({
        error: "Failed to fetch RMF fund detail",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // MCP Protocol endpoint for ChatGPT integration
  app.post("/mcp", async (req, res) => {
    try {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true,
      });

      res.on('close', () => {
        transport.close();
      });

      await rmfMCPServer.getServer().connect(transport);
      await transport.handleRequest(req, res, req.body);
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
  });

  const httpServer = createServer(app);
  return httpServer;
}
