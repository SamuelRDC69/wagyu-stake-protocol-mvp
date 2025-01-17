// src/lib/hooks/useContractData.ts
import { useState, useContext, useCallback, useEffect } from 'react';
import { WharfkitContext } from '../wharfkit/context';
import { PoolEntity } from '../types/pool';
import { StakedEntity } from '../types/staked';
import { TierEntity } from '../types/tier';
import { ConfigEntity } from '../types/config';

const API_BASE_URL = 'https://maestrobeatz.servegame.com:3003/kek-staking';

// Default tiers matching the contract logic
const DEFAULT_TIERS: TierEntity[] = [
  {
    tier: "supplier",
    tier_name: "Supplier",
    weight: "1.0",
    staked_up_to_percent: "0.5"
  },
  {
    tier: "merchant",
    tier_name: "Merchant",
    weight: "1.05",
    staked_up_to_percent: "2.5"
  },
  {
    tier: "trader",
    tier_name: "Trader",
    weight: "1.10",
    staked_up_to_percent: "5.0"
  },
  {
    tier: "marketmkr",
    tier_name: "Market Maker",
    weight: "1.15",
    staked_up_to_percent: "10.0"
  },
  {
    tier: "exchange",
    tier_name: "Exchange",
    weight: "1.20",
    staked_up_to_percent: "100.0"
  }
];

const DEFAULT_CONFIG: ConfigEntity = {
  maintenance: 0,
  cooldown_seconds_per_claim: 60,
  vault_account: "stakevault"
};

interface StakingData {
  pools: PoolEntity[];
  stakes: StakedEntity[];
  tiers: TierEntity[];
  config: ConfigEntity;
}

async function fetchFromAPI<T>(endpoint: string): Promise<T> {
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  console.log(`[API] Starting fetch from: ${fullUrl}`);
  
  try {
    const response = await fetch(fullUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const text = await response.text();
    const data = JSON.parse(text);
    return data;
  } catch (error) {
    console.error('[API] Error:', error);
    throw error;
  }
}

export function useContractData() {
  const { session } = useContext(WharfkitContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetch, setLastFetch] = useState(0);
  const FETCH_COOLDOWN = 5000;

  const fetchData = useCallback(async () => {
    if (!session) return null;

    const now = Date.now();
    if (now - lastFetch < FETCH_COOLDOWN) {
      return null;
    }

    setLoading(true);
    
    try {
      // Fetch all users' staking data for leaderboard
      const allUsersResponse = await fetchFromAPI<{ stakingDetails: StakedEntity[] }>('/users');
      
      // Fetch pools data
      const poolsResponse = await fetchFromAPI<{ pools: PoolEntity[] }>('/pools');
      
      // Fetch current user's staking data
      const userResponse = await fetchFromAPI<{ stakingDetails: StakedEntity[] }>(
        `/user/${session.actor.toString()}`
      );

      setLastFetch(now);

      // Combine user stakes with all users for leaderboard
      const allStakes = allUsersResponse?.stakingDetails || [];
      const userStakes = userResponse?.stakingDetails || [];

      // Return combined data with default tiers and config
      const stakingData: StakingData = {
        pools: poolsResponse.pools || [],
        stakes: [...allStakes, ...userStakes.filter(stake => 
          !allStakes.some(s => s.pool_id === stake.pool_id && s.owner === stake.owner)
        )],
        tiers: DEFAULT_TIERS,
        config: DEFAULT_CONFIG
      };

      return stakingData;

    } catch (err) {
      console.error('Error in fetchData:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      
      return {
        pools: [],
        stakes: [],
        tiers: DEFAULT_TIERS,
        config: DEFAULT_CONFIG
      };
    } finally {
      setLoading(false);
    }
  }, [session, lastFetch]);

  // Set up automatic refresh when session exists
  useEffect(() => {
    if (!session) return;

    fetchData();
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, [session, fetchData]);

  return {
    fetchData,
    loading,
    error
  };
}