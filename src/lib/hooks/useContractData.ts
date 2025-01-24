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
  LEADERBOARD: '/leaderboard',
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

async function fetchFromAPI<T>(endpoint: string): Promise<T> {
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  console.log(`[API] Starting fetch from: ${fullUrl}`);
  
  try {
    const response = await fetch(fullUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
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
  const FETCH_COOLDOWN = 5000; // 5 second cooldown between fetches

  const fetchData = useCallback(async () => {
    if (!session) return null;

    const now = Date.now();
    if (now - lastFetch < FETCH_COOLDOWN) {
      return null;
    }

    setLoading(true);
    
    try {
      // Fetch pools data
      const poolsResponse = await fetchFromAPI<{ pools: PoolEntity[] }>(API_ENDPOINTS.POOLS);
      const pools = poolsResponse.pools || [];

      // Fetch leaderboard data
      const leaderboardStakes = await fetchFromAPI<StakedEntity[]>(API_ENDPOINTS.LEADERBOARD);
      
      // Process leaderboard stakes
      const processedLeaderboardStakes = leaderboardStakes.map(stake => 
        enrichStakeData(stake)
      );

      // Check if current user's stakes are in leaderboard
      const userStakesInLeaderboard = processedLeaderboardStakes.some(
        stake => stake.owner === session.actor.toString()
      );

      // Only fetch user stakes if they're not in leaderboard
      let userStakes: StakedEntity[] = [];
      if (!userStakesInLeaderboard) {
        try {
          const userResponse = await fetchFromAPI<{ stakingDetails: StakedEntity[] }>(
            API_ENDPOINTS.USER(session.actor.toString())
          );
          
          if (userResponse.stakingDetails) {
            userStakes = userResponse.stakingDetails.map(stake => 
              enrichStakeData({
                ...stake,
                owner: session.actor.toString()
              })
            );
          }
        } catch (error) {
          console.warn('[API] Could not fetch user data:', error);
        }
      }

      setLastFetch(now);

      // Combine leaderboard and user stakes
      const combinedStakes = [
        ...processedLeaderboardStakes,
        ...userStakes.filter(userStake => 
          !processedLeaderboardStakes.some(leaderStake => 
            leaderStake.pool_id === userStake.pool_id && 
            leaderStake.owner === userStake.owner
          )
        )
      ];

      // Sort stakes by staked quantity in descending order
      const sortedStakes = combinedStakes.sort((a, b) => {
        const amountA = parseFloat(a.staked_quantity.split(' ')[0]);
        const amountB = parseFloat(b.staked_quantity.split(' ')[0]);
        return amountB - amountA;
      });

      // Return combined data
      const stakingData: StakingData = {
        pools,
        stakes: sortedStakes,
        tiers: DEFAULT_TIERS,
        config: DEFAULT_CONFIG
      };

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
    const interval = setInterval(fetchData, 30000); // 30 second refresh interval

    return () => clearInterval(interval);
  }, [session, fetchData]);

  return {
    fetchData,
    loading,
    error
  };
}