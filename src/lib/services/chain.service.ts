import { Session, TableRows } from '@wharfkit/session';
import { Name } from '@wharfkit/session';

interface TableQueryOptions {
  lowerBound?: string;
  upperBound?: string;
  limit?: number;
  scope?: string;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  scope: string;
}

export class ChainService {
  private static instance: ChainService;
  private static CACHE_DURATION = 2000; // 2 seconds
  private cache: Map<string, CacheEntry<any>> = new Map();

  private constructor() {}

  static getInstance(): ChainService {
    if (!ChainService.instance) {
      ChainService.instance = new ChainService();
    }
    return ChainService.instance;
  }

  private getCacheKey(code: string, table: string, scope: string): string {
    return `${code}-${table}-${scope}`;
  }

  async getTableRows<T>(
    session: Session,
    code: string,
    table: string,
    options: TableQueryOptions = {}
  ): Promise<T[]> {
    const scope = options.scope || code;
    const cacheKey = this.getCacheKey(code, table, scope);
    const cached = this.cache.get(cacheKey);
    
    if (cached && 
        Date.now() - cached.timestamp < ChainService.CACHE_DURATION &&
        cached.scope === scope) {
      return cached.data;
    }

    try {
      const result: TableRows = await session.client.v1.chain.get_table_rows({
        code: Name.from(code),
        scope: Name.from(scope),
        table: Name.from(table),
        lower_bound: options.lowerBound,
        upper_bound: options.upperBound,
        limit: options.limit || 100,
        json: true
      });

      this.cache.set(cacheKey, {
        data: result.rows,
        timestamp: Date.now(),
        scope
      });

      return result.rows;
    } catch (error) {
      console.error('Chain query error:', error);
      if (cached && cached.scope === scope) {
        return cached.data;
      }
      throw error;
    }
  }

  clearCache(): void {
    this.cache.clear();
  }

  removeCacheEntry(code: string, table: string, scope: string): void {
    const key = this.getCacheKey(code, table, scope);
    this.cache.delete(key);
  }
}

export const chainService = ChainService.getInstance();