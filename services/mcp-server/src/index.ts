import { RMFMCPServer } from './rmfMcpServer';
import type { RmfDataRepository } from './types';

export type { FundSearchParams, RmfDataRepository } from './types';
export { RMFMCPServer } from './rmfMcpServer';
export { createMcpHttpHandler } from './httpHandler';

export function createRmfMcpServer(data: RmfDataRepository) {
  return new RMFMCPServer(data);
}
