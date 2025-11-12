import { rmfDataService } from './services/rmfDataService';
import { createRmfMcpServer } from '../services/mcp-server';

export const rmfMCPServer = createRmfMcpServer(rmfDataService);

export { RMFMCPServer } from '../services/mcp-server';
