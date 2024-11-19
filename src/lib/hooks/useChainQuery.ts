import { useState, useEffect, useRef, useCallback } from 'react';
import { Session, Name } from '@wharfkit/session';

interface UseChainQueryOptions {
  code: string;
  table: string;
  scope?: string;
  lowerBound?: string;
  upperBound?: string;
  limit?: number;
  enabled?: boolean;
  refreshInterval?: number;
  onError?: (error: Error) => void;
}

interface TableResult<T> {
  more: boolean;
  next_key: string;
  rows: T[];
}

export function useChainQuery<T>(
  session: Session | undefined,
  options: UseChainQueryOptions
) {
  const [data, setData] = useState<TableResult<T> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const timerRef = useRef<number>();
  const isMounted = useRef(true);

  const fetchData = useCallback(async () => {
    if (!session || !options.enabled) return;

    try {
      const result = await session.client.v1.chain.get_table_rows({
        code: Name.from(options.code),
        scope: Name.from(options.scope || options.code),
        table: Name.from(options.table),
        lower_bound: options.lowerBound,
        upper_bound: options.upperBound,
        limit: options.limit || 100,
        json: true
      });
      
      if (isMounted.current) {
        setData(result);
        setError(null);
        setIsLoading(false);
      }
    } catch (e) {
      const err = e instanceof Error ? e : new Error('Query failed');
      if (isMounted.current) {
        setError(err);
        setIsLoading(false);
        options.onError?.(err);
      }
      console.error('Chain query error:', err);
    }
  }, [session, options]);

  const refresh = useCallback(async () => {
    if (isMounted.current) {
      setIsLoading(true);
    }
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    isMounted.current = true;
    if (!session || !options.enabled) {
      setIsLoading(false);
      return;
    }

    fetchData();

    if (options.refreshInterval && options.refreshInterval > 0) {
      timerRef.current = window.setInterval(fetchData, options.refreshInterval);
    }

    return () => {
      isMounted.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [fetchData, options.enabled, options.refreshInterval, session]);

  return { 
    data: data?.rows || [], 
    error, 
    isLoading, 
    refresh 
  };
}