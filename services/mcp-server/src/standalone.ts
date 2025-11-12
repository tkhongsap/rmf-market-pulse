import express from 'express';
import { fileURLToPath } from 'url';
import { rmfDataService } from '../../../server/services/rmfDataService';
import { createMcpHttpHandler, createRmfMcpServer } from './index';

async function main() {
  await rmfDataService.initialize();

  const app = express();
  app.use(express.json());

  const mcpServer = createRmfMcpServer(rmfDataService);
  app.post('/mcp', createMcpHttpHandler(mcpServer));

  const port = parseInt(process.env.PORT ?? '7080', 10);
  app.listen(port, '0.0.0.0', () => {
    console.log(`Standalone RMF MCP service listening on port ${port}`);
  });
}

const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);

if (isMainModule) {
  main().catch(error => {
    console.error('Failed to start standalone MCP service', error);
    process.exitCode = 1;
  });
}
