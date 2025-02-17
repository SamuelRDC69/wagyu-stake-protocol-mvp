import { useState, useContext, useCallback, useEffect } from 'react';
import { WharfkitContext } from '../wharfkit/context';
import { PoolEntity } from '../types/pool';
import { StakedEntity } from '../types/staked';
import { TierEntity } from '../types/tier';
import { ConfigEntity } from '../types/config';
import { TIER_CONFIG } from '../config/tierConfig';

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

const CONTRACT_TIERS: TierEntity[] = Object.entries(TIER_CONFIG).map(([key, value]) => ({
  tier: key,
  tier_name: value.displayName,
  weight: value.weight,
  staked_up_to_percent: value.staked_up_to_percent
}));

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

function enrichStakeData(stake: StakedEntity): StakedEntity {
  return {
    ...stake,
    tier: stake.tier.toLowerCase()
  };
}

async function fetchFromAPI<T>(endpoint: string): Promise<T> {
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(fullUrl);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
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
      const poolsResponse = await fetchFromAPI<{ pools: PoolEntity[] }>(API_ENDPOINTS.POOLS);
      const pools = poolsResponse.pools || [];
      const leaderboardStakes = await fetchFromAPI<StakedEntity[]>(API_ENDPOINTS.LEADERBOARD);
      const processedLeaderboardStakes = leaderboardStakes.map(stake => enrichStakeData(stake));

      const userStakesInLeaderboard = processedLeaderboardStakes.some(
        stake => stake.owner === session.actor.toString()
      );

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

      const combinedStakes = [
        ...processedLeaderboardStakes,
        ...userStakes.filter(userStake => 
          !processedLeaderboardStakes.some(leaderStake => 
            leaderStake.pool_id === userStake.pool_id && 
            leaderStake.owner === userStake.owner
          )
        )
      ];

      const sortedStakes = combinedStakes.sort((a, b) => {
        const amountA = parseFloat(a.staked_quantity.split(' ')[0]);
        const amountB = parseFloat(b.staked_quantity.split(' ')[0]);
        return amountB - amountA;
      });

      return {
        pools,
        stakes: sortedStakes,
        tiers: CONTRACT_TIERS,
        config: DEFAULT_CONFIG
      };

    } catch (err) {
      console.error('Error in fetchData:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      return {
        pools: [],
        stakes: [],
        tiers: CONTRACT_TIERS,
        config: DEFAULT_CONFIG
      };
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (!session) return;

    const refreshLeaderboardAndPools = async () => {
      try {
        const poolsResponse = await fetchFromAPI<{ pools: PoolEntity[] }>(API_ENDPOINTS.POOLS);
        const leaderboardStakes = await fetchFromAPI<StakedEntity[]>(API_ENDPOINTS.LEADERBOARD);
        setLastFetch(Date.now());
      } catch (err) {
        console.error('Error in periodic refresh:', err);
      }
    };

    fetchData();
    const interval = setInterval(refreshLeaderboardAndPools, 30000);

    return () => clearInterval(interval);
  }, [session]);

  return {
    fetchData,
    loading,
    error
  };
}