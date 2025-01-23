// src/lib/hooks/useContractData.ts
import { useState, useContext, useCallback, useEffect } from 'react';
import { WharfkitContext } from '../wharfkit/context';
import { PoolEntity } from '../types/pool';
import { StakedEntity } from '../types/staked';
import { TierEntity } from '../types/tier';
import { ConfigEntity } from '../types/config';
import { DEFAULT_TIERS } from '../config/tiers';

const API_BASE_URL = 'https://maestrobeatz.servegame.com:3003/kek-staking';
const API_ENDPOINTS = {
  POOLS: '/pools',
  ALL_USERS: '/api/allStakes',  // Update this to match your actual endpoint
  USER: (username: string) => `/user/${username}`
} as const;

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

interface APIResponse<T> {
  stakingDetails?: T[];
  pools?: PoolEntity[];
  error?: string;
}

// Helper function to enrich stake data with proper tier information
function enrichStakeData(stake: StakedEntity): StakedEntity {
  const matchingTier = DEFAULT_TIERS.find(t => 
    t.tier.toLowerCase() === stake.tier.toLowerCase()
  );

  if (matchingTier) {
    return {
      ...stake,
      tier: matchingTier.tier
    };
  }

  return stake;
}

async function fetchFromAPI<T>(endpoint: string): Promise<APIResponse<T>> {
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
      const poolsResponse = await fetchFromAPI<PoolEntity>(API_ENDPOINTS.POOLS);
      const pools = poolsResponse.pools || [];

      // Try to fetch all users' staking data
      let allStakes: StakedEntity[] = [];
      try {
        const allUsersResponse = await fetchFromAPI<StakedEntity>(API_ENDPOINTS.ALL_USERS);
        if (allUsersResponse.stakingDetails) {
          allStakes = allUsersResponse.stakingDetails.map(stake => 
            enrichStakeData({ ...stake })
          );
        }
      } catch (error) {
        console.warn('[API] Could not fetch all users data:', error);
        // Continue with empty allStakes array
      }
      
      // Fetch current user's staking data
      const userResponse = await fetchFromAPI<StakedEntity>(
        API_ENDPOINTS.USER(session.actor.toString())
      );

      setLastFetch(now);

      // Process user stakes
      const userStakes = userResponse.stakingDetails || [];
      const processedUserStakes = userStakes.map(stake => 
        enrichStakeData({
          ...stake,
          owner: session.actor.toString()
        })
      );

      // Combine all stakes, preferring user's own stake data
      const combinedStakes = [...allStakes];
      
      processedUserStakes.forEach(userStake => {
        const existingIndex = combinedStakes.findIndex(
          stake => stake.pool_id === userStake.pool_id && 
                   stake.owner === session.actor.toString()
        );
        
        if (existingIndex >= 0) {
          combinedStakes[existingIndex] = userStake;
        } else {
          combinedStakes.push(userStake);
        }
      });

      // Return combined data
      const stakingData: StakingData = {
        pools,
        stakes: combinedStakes,
        tiers: DEFAULT_TIERS,
        config: DEFAULT_CONFIG
      };

      console.log('Final staking data:', stakingData);
      return stakingData;

    } catch (err) {
      console.error('Error in fetchData:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      
      // Return default data on error
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