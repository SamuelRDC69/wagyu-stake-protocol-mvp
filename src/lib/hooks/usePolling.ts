import { useState, useEffect, useRef, useCallback } from 'react';

interface PollingOptions {
  interval?: number;
  enabled?: boolean;
  onError?: (error: unknown) => void;
  skipInitialLoad?: boolean;
}

export function usePolling<T>(
  fetchFn: () => Promise<T>,
  options: PollingOptions = {}
) {
  const { 
    interval = 3000, 
    enabled = true,
    onError,
    skipInitialLoad = false
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(!skipInitialLoad);
  const timeoutRef = useRef<number>();
  const isMounted = useRef(true);

  const fetch = useCallback(async () => {
    if (!enabled) return;

    try {
      const result = await fetchFn();
      if (isMounted.current) {
        setData(result);
        setError(null);
        setIsLoading(false);
      }
    } catch (err) {
      if (isMounted.current) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        onError?.(error);
        setIsLoading(false);
      }
    }
  }, [fetchFn, enabled, onError]);

  const refresh = useCallback(async (delay = 2000) => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    await new Promise(resolve => setTimeout(resolve, delay));
    await fetch();
  }, [fetch]);

  useEffect(() => {
    isMounted.current = true;

    if (enabled) {
      fetch();
    }

    return () => {
      isMounted.current = false;
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, fetch]);

  useEffect(() => {
    if (!enabled) return;

    const timer = setInterval(() => {
      fetch();
    }, interval);

    return () => clearInterval(timer);
  }, [fetch, interval, enabled]);

  return { 
    data, 
    error, 
    isLoading,
    refresh 
  };
}