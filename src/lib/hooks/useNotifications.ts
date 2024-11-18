import { create } from 'zustand';

interface Notification {
  id: string;
  message: string;
  variant: 'success' | 'error' | 'pending';
  txid?: string;
  amount?: string;
  position?: 'top-right' | 'bottom-right' | 'bottom-center';
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useNotifications = create<NotificationStore>((set) => ({
  notifications: [],
  addNotification: (notification) => 
    set((state) => ({
      notifications: [
        ...state.notifications,
        { ...notification, id: Date.now().toString() }
      ]
    })),
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id)
    })),
  clearNotifications: () => set({ notifications: [] })
}));

// src/lib/hooks/usePolling.ts
import { useState, useEffect, useRef, useCallback } from 'react';

interface PollingOptions {
  interval?: number;
  enabled?: boolean;
  onError?: (error: Error) => void;
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
  const timeoutRef = useRef<NodeJS.Timeout>();

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
    
    // Wait for specified delay before refreshing
    await new Promise(resolve => setTimeout(resolve, delay));
    await fetch();
    
    // Restart the polling cycle
    if (enabled) {
      timeoutRef.current = setTimeout(startPolling, interval);
    }
  }, [fetch, interval, enabled]);

  const startPolling = useCallback(() => {
    fetch();
    timeoutRef.current = setTimeout(startPolling, interval);
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