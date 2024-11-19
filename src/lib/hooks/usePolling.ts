import { useState, useEffect, useRef, useCallback } from 'react';

interface PollingOptions {
  interval?: number;
  enabled?: boolean;
  onError?: (error: unknown) => void;
}

export function usePolling<T>(
  fetchFn: () => Promise<T>,
  options: PollingOptions = {}
) {
  const { 
    interval = 3000, 
    enabled = true,
    onError 
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<number>();

  const fetch = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await fetchFn();
      setData(result);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, onError]);

  const refresh = useCallback(async (delay = 2000) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    await new Promise(resolve => setTimeout(resolve, delay));
    await fetch();
    
    if (enabled) {
      timeoutRef.current = window.setTimeout(startPolling, interval);
    }
  }, [fetch, interval, enabled]);

  const startPolling = useCallback(() => {
    fetch();
    timeoutRef.current = window.setTimeout(startPolling, interval);
  }, [fetch, interval]);

  useEffect(() => {
    if (enabled) {
      startPolling();
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, startPolling]);

  return { data, error, isLoading, refresh };
}