import { useCallback, useEffect, useRef } from 'react';
import { Session } from '@wharfkit/session';
import { Name } from '@wharfkit/session';
import { CONTRACTS } from '../wharfkit/contracts';
import { RefreshTrigger, RefreshScope, RefreshOptions } from '../types/refresh';

export function useStakingRefresh({
  session,
  tableScopes,
  onSuccess,
  onError,
  intervalMs
}: {
  session?: Session;
  tableScopes: RefreshScope[];
} & RefreshOptions) {
  const mounted = useRef(false);
  const refreshing = useRef(false);
  const lastRefreshTime = useRef<number>(0);
  const THROTTLE_MS = 2000;

  const refresh = useCallback(async (trigger: RefreshTrigger) => {
    if (!session || refreshing.current) return;
    
    const now = Date.now();
    if (now - lastRefreshTime.current < THROTTLE_MS) return;

    try {
      refreshing.current = true;
      lastRefreshTime.current = now;

      const results = await Promise.all(
        tableScopes.map(async ({ table, scope, limit = 100, lowerBound, upperBound }) => {
          const response = await session.client.v1.chain.get_table_rows({
            code: Name.from(CONTRACTS.STAKING.NAME),
            scope: Name.from(scope),
            table: Name.from(table),
            limit,
            lower_bound: lowerBound,
            upper_bound: upperBound
          });
          return {
            table,
            scope,
            rows: response.rows
          };
        })
      );

      if (mounted.current) {
        onSuccess?.(results.reduce((acc, { table, rows }) => ({
          ...acc,
          [table]: rows
        }), {}));
      }
    } catch (error) {
      console.error('Refresh error:', error);
      if (mounted.current) {
        onError?.(error as Error);
      }
    } finally {
      refreshing.current = false;
    }
  }, [session, tableScopes, onSuccess, onError]);

  useEffect(() => {
    mounted.current = true;
    if (session) refresh('manual');
    return () => { mounted.current = false; };
  }, [session, refresh]);

  useEffect(() => {
    if (!intervalMs || !session) return;
    const interval = setInterval(() => refresh('interval'), intervalMs);
    return () => clearInterval(interval);
  }, [refresh, intervalMs, session]);

  useEffect(() => {
    const handleFocus = () => refresh('focus');
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refresh]);

  return {
    refresh,
    refreshing: refreshing.current
  };
}