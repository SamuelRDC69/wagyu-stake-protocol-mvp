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
    console.log('[API] Raw response:', text);
    
    const data = JSON.parse(text);
    console.log('[API] Parsed data:', data);
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
      // Fetch pools data first
      const poolsResponse = await fetchFromAPI<{ pools: PoolEntity[] }>('/pools');
      
      // Fetch all users' staking data
      const allUsersResponse = await fetch(`${API_BASE_URL}/allUsers`);
      let allStakes: StakedEntity[] = [];
      
      if (allUsersResponse.ok) {
        const allUsersData = await allUsersResponse.json();
        allStakes = allUsersData.stakingDetails || [];
      }
      
      // Fetch current user's staking data
      const userResponse = await fetchFromAPI<{ stakingDetails: StakedEntity[] }>(
        `/user/${session.actor.toString()}`
      );

      setLastFetch(now);

      // Combine and deduplicate stakes
      const combinedStakes = [...allStakes];
      
      // Add or update current user's stakes
      if (userResponse.stakingDetails) {
        userResponse.stakingDetails.forEach(userStake => {
          const existingIndex = combinedStakes.findIndex(
            stake => stake.pool_id === userStake.pool_id && 
                     stake.owner === session.actor.toString()
          );
          
          if (existingIndex >= 0) {
            combinedStakes[existingIndex] = {
              ...userStake,
              owner: session.actor.toString()
            };
          } else {
            combinedStakes.push({
              ...userStake,
              owner: session.actor.toString()
            });
          }
        });
      }

      // Return combined data
      const stakingData: StakingData = {
        pools: poolsResponse.pools || [],
        stakes: combinedStakes,
        tiers: DEFAULT_TIERS,
        config: DEFAULT_CONFIG
      };

      console.log('Final staking data:', stakingData);
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