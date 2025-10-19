import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { 
  fetchCommodities, 
  fetchForex, 
  fetchSpecificCommodity, 
  fetchSpecificForexPair 
} from "./services/yahooFinance";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/healthz", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
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
