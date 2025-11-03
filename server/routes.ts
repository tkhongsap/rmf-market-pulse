import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import {
  fetchCommodities,
  fetchForex,
  fetchSpecificCommodity,
  fetchSpecificForexPair
} from "./services/yahooFinance";
import {
  fetchRMFFunds,
  fetchRMFFundDetail,
  searchRMFFunds,
} from "./services/secApi";

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

  // Get all commodity prices
  app.get("/api/commodities", async (_req, res) => {
    try {
      const commodities = await fetchCommodities();
      res.json({
        commodities,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error fetching commodities:", error);
      res.status(500).json({
        error: "Failed to fetch commodity prices",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Get specific commodity price
  app.get("/api/commodities/:commodity", async (req, res) => {
    try {
      const { commodity } = req.params;
      const data = await fetchSpecificCommodity(commodity);
      
      if (!data) {
        return res.status(404).json({
          error: "Commodity not found",
          message: `No data available for commodity: ${commodity}`,
        });
      }

      res.json(data);
    } catch (error) {
      console.error("Error fetching commodity:", error);
      res.status(500).json({
        error: "Failed to fetch commodity price",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Get all forex pairs
  app.get("/api/forex", async (_req, res) => {
    try {
      const pairs = await fetchForex();
      res.json({
        pairs,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error fetching forex:", error);
      res.status(500).json({
        error: "Failed to fetch forex rates",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Get specific forex pair
  app.get("/api/forex/:pair", async (req, res) => {
    try {
      const { pair } = req.params;
      const data = await fetchSpecificForexPair(pair);

      if (!data) {
        return res.status(404).json({
          error: "Forex pair not found",
          message: `No data available for pair: ${pair}`,
        });
      }

      res.json(data);
    } catch (error) {
      console.error("Error fetching forex pair:", error);
      res.status(500).json({
        error: "Failed to fetch forex rate",
        message: error instanceof Error ? error.message : "Unknown error",
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
      const { method, params } = req.body;

      // Handle MCP tool discovery
      if (method === "tools/list") {
        return res.json({
          tools: [
            {
              name: "get_commodity_prices",
              description: "Get real-time commodity prices for precious metals, energy, industrial metals, and agricultural products",
              inputSchema: {
                type: "object",
                properties: {
                  commodities: {
                    type: "array",
                    items: { type: "string" },
                    description: "Optional list of specific commodities to fetch (e.g., 'gold', 'oil', 'wheat')",
                  },
                },
              },
            },
            {
              name: "get_forex_rates",
              description: "Get real-time currency exchange rates for major forex pairs",
              inputSchema: {
                type: "object",
                properties: {
                  pairs: {
                    type: "array",
                    items: { type: "string" },
                    description: "Optional list of specific currency pairs to fetch (e.g., 'EUR/USD', 'GBP/USD')",
                  },
                },
              },
            },
            {
              name: "get_rmf_funds",
              description: "Get Thai Retirement Mutual Fund (RMF) data including NAV, performance, and fund details",
              inputSchema: {
                type: "object",
                properties: {
                  page: {
                    type: "number",
                    description: "Page number for pagination (default: 1)",
                  },
                  pageSize: {
                    type: "number",
                    description: "Number of funds per page (default: 20)",
                  },
                  search: {
                    type: "string",
                    description: "Search query for fund name or code",
                  },
                  fundType: {
                    type: "string",
                    description: "Filter by fund type (e.g., 'Equity', 'Fixed Income', 'Mixed')",
                  },
                },
              },
            },
            {
              name: "get_rmf_fund_detail",
              description: "Get detailed information for a specific Thai RMF fund including holdings and asset allocation",
              inputSchema: {
                type: "object",
                properties: {
                  fundCode: {
                    type: "string",
                    description: "Fund code (e.g., 'SCBRMMONEY', 'SCBRMLEQ')",
                  },
                },
                required: ["fundCode"],
              },
            },
          ],
        });
      }

      // Handle MCP tool calls
      if (method === "tools/call") {
        const { name, arguments: args } = params;

        if (name === "get_commodity_prices") {
          const commodities = await fetchCommodities(args?.commodities);
          return res.json({
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  commodities,
                  timestamp: new Date().toISOString(),
                }),
              },
            ],
          });
        }

        if (name === "get_forex_rates") {
          const pairs = await fetchForex(args?.pairs);
          return res.json({
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  pairs,
                  timestamp: new Date().toISOString(),
                }),
              },
            ],
          });
        }

        if (name === "get_rmf_funds") {
          if (args?.search) {
            const funds = await searchRMFFunds(args.search);
            return res.json({
              content: [
                {
                  type: "text",
                  text: JSON.stringify({
                    funds,
                    total: funds.length,
                    timestamp: new Date().toISOString(),
                  }),
                },
              ],
            });
          }

          const { funds, total } = await fetchRMFFunds({
            page: args?.page || 1,
            pageSize: args?.pageSize || 20,
            fundType: args?.fundType,
          });
          return res.json({
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  funds,
                  total,
                  page: args?.page || 1,
                  pageSize: args?.pageSize || 20,
                  timestamp: new Date().toISOString(),
                }),
              },
            ],
          });
        }

        if (name === "get_rmf_fund_detail") {
          if (!args?.fundCode) {
            return res.status(400).json({
              error: "Missing required parameter",
              message: "fundCode is required",
            });
          }

          const fund = await fetchRMFFundDetail(args.fundCode);
          if (!fund) {
            return res.status(404).json({
              error: "Fund not found",
              message: `No data available for fund: ${args.fundCode}`,
            });
          }

          return res.json({
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  fund,
                  timestamp: new Date().toISOString(),
                }),
              },
            ],
          });
        }

        return res.status(400).json({
          error: "Unknown tool",
          message: `Tool '${name}' is not recognized`,
        });
      }

      res.status(400).json({
        error: "Invalid MCP method",
        message: `Method '${method}' is not supported`,
      });
    } catch (error) {
      console.error("MCP endpoint error:", error);
      res.status(500).json({
        error: "MCP request failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
