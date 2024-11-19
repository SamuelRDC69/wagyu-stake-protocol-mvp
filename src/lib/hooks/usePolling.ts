import { useState, useEffect, useRef, useCallback } from 'react';

interface PollingOptions {
  interval?: number;
  enabled?: boolean;
  onError?: (error: unknown) => void;
  skipInitialLoad?: boolean;  // Added this option
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
  const previousData = useRef<T | null>(null);
  const timeoutRef = useRef<number>();
  const isMounted = useRef(true);
  const lastFetchTime = useRef(0);

  const fetch = useCallback(async (isInitial = false) => {
    const now = Date.now();
    if (!isInitial && now - lastFetchTime.current < interval) {
      return;
    }

    try {
      if (isInitial) setIsLoading(true);

      const result = await fetchFn();
      
      if (!isMounted.current) return;

      if (JSON.stringify(result) !== JSON.stringify(previousData.current)) {
        previousData.current = result;
        setData(result);
      }
      
      setError(null);
      lastFetchTime.current = Date.now();
    } catch (err) {
      if (!isMounted.current) return;
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
    } finally {
      if (isMounted.current && isInitial) {
        setIsLoading(false);
      }
    }
  }, [fetchFn, interval, onError]);

  const refresh = useCallback(async (delay = 2000) => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    
    await new Promise(resolve => setTimeout(resolve, delay));
    await fetch(false);
    
    if (enabled && isMounted.current) {
      timeoutRef.current = window.setTimeout(() => startPolling(), interval);
    }
  }, [fetch, interval, enabled]);

  const startPolling = useCallback(() => {
    if (!enabled || !isMounted.current) return;
    
    fetch(false);
    timeoutRef.current = window.setTimeout(() => startPolling(), interval);
  }, [fetch, interval, enabled]);

  useEffect(() => {
    if (enabled && !skipInitialLoad) {
      fetch(true);
    }
    
    const timer = window.setTimeout(() => {
      if (enabled) startPolling();
    }, interval);

    return () => {
      isMounted.current = false;
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      window.clearTimeout(timer);
    };
  }, [enabled, fetch, interval, startPolling, skipInitialLoad]);

  return { 
    data: data || previousData.current, 
    error, 
    isLoading: isLoading && !previousData.current,
    refresh 
  };
}