// src/lib/hooks/useStakingData.ts
import { useState, useEffect, useCallback, useContext } from 'react';
import { WharfkitContext } from '../wharfkit/context';
import { fetchPools, fetchUserStaking } from '../api';
import { PoolEntity } from '../types/pool';
import { StakedEntity } from '../types/staked';

// Hardcoded tiers until we get them from API
const DEFAULT_TIERS = [
  {
    tier: "supplier",
    tier_name: "Supplier",
    weight: "1.0",
    staked_up_to_percent: "1.0"
  },
  {
    tier: "merchant",
    tier_name: "Merchant",
    weight: "2.0",
    staked_up_to_percent: "5.0"
  },
  {
    tier: "trader",
    tier_name: "Trader",
    weight: "3.0",
    staked_up_to_percent: "10.0"
  },
  {
    tier: "marketmkr",
    tier_name: "Market Maker",
    weight: "4.0",
    staked_up_to_percent: "20.0"
  },
  {
    tier: "exchange",
    tier_name: "Exchange",
    weight: "5.0",
    staked_up_to_percent: "30.0"
  }
];

const DEFAULT_CONFIG = {
  maintenance: 0,
  cooldown_seconds_per_claim: 60,
  vault_account: "stakevault"
};

export function useStakingData() {
  const { session } = useContext(WharfkitContext);
  const [pools, setPools] = useState<PoolEntity[]>([]);
  const [stakes, setStakes] = useState<StakedEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetch, setLastFetch] = useState(0);
  const FETCH_COOLDOWN = 5000; // 5 seconds between fetches

  const fetchData = useCallback(async () => {
    if (!session) return null;
    
    // Rate limiting
    const now = Date.now();
    if (now - lastFetch < FETCH_COOLDOWN) {
      return null;
    }

    setLoading(true);
    
    try {
      const [poolsData, stakesData] = await Promise.all([
        fetchPools(),
        fetchUserStaking(session.actor.toString())
      ]);

      setPools(poolsData);
      setStakes(stakesData);
      setLastFetch(now);

      return {
        pools: poolsData,
        stakes: stakesData,
        tiers: DEFAULT_TIERS,
        config: DEFAULT_CONFIG
      };

    } catch (error) {
      console.error('Error fetching staking data:', error);
      setError(error instanceof Error ? error : new Error('Unknown error occurred'));
      return null;
    } finally {
      setLoading(false);
    }
  }, [session, lastFetch]);

  // Set up periodic refresh when session exists
  useEffect(() => {
    if (!session) return;

    fetchData();
    const interval = setInterval(fetchData, FETCH_COOLDOWN);

    return () => clearInterval(interval);
  }, [session, fetchData]);

  return {
    fetchData,
    loading,
    error,
    data: {
      pools,
      stakes,
      tiers: DEFAULT_TIERS,
      config: DEFAULT_CONFIG
    }
  };
}
