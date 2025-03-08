import { useState, useContext, useCallback, useEffect } from 'react';
import { WharfkitContext } from '../wharfkit/context';
import { PoolEntity } from '../types/pool';
import { StakedEntity } from '../types/staked';
import { TierEntity } from '../types/tier';
import { ConfigEntity } from '../types/config';
import { TIER_CONFIG } from '../config/tierConfig';
import { parseTokenString } from '../utils/tokenUtils';

const API_BASE_URL = 'https://maestrobeatz.servegame.com:3003/kek-staking';
const API_ENDPOINTS = {
  POOLS: '/pools',
  LEADERBOARD: '/leaderboard',
  FILTERED_LEADERBOARD: (poolId: number) => `/leaderboard/${poolId}`,
  USER: (username: string) => `/user/${username}`
} as const;

const DEFAULT_CONFIG: ConfigEntity = {
  maintenance: 0,
  cooldown_seconds_per_claim: 60,
  vault_account: "stakevault"
};

// This function builds properly formatted tier entities that match the frontend configuration
const buildTierEntities = (): TierEntity[] => {
  // Create tiers based on TIER_CONFIG with correct mapping
  return Object.entries(TIER_CONFIG).map(([key, value]) => ({
    tier: key, // This is the important part - using the actual key from TIER_CONFIG
    tier_name: value.displayName,
    weight: value.weight,
    staked_up_to_percent: value.staked_up_to_percent
  }));
};

// Constant tiers based on frontend configuration
const CONTRACT_TIERS: TierEntity[] = buildTierEntities();

interface StakingData {
  pools: PoolEntity[];
  stakes: StakedEntity[];
  tiers: TierEntity[];
  config: ConfigEntity;
}

/**
 * Normalize tier data to ensure consistent tier keys
 */
function enrichStakeData(stake: StakedEntity): StakedEntity {
  console.log("Processing stake tier:", stake.tier);
  
  // Normalize tier key to lowercase letter
  let tierKey: string;
  
  // Handle already correct letter tiers (a through v)
  if (/^[a-v]$/i.test(stake.tier)) {
    tierKey = stake.tier.toLowerCase();
  } 
  // Handle level-based tier names (e.g., "Level 5")
  else if (/^level\s*\d+$/i.test(stake.tier)) {
    const levelMatch = stake.tier.match(/(\d+)/);
    const level = levelMatch ? parseInt(levelMatch[1]) : 0;
    // Map level to letter (a=0, b=1, etc.)
    const tierKeys = Object.keys(TIER_CONFIG).sort();
    tierKey = level < tierKeys.length ? tierKeys[level] : 'a';
  }
  // Handle numeric tiers
  else if (!isNaN(parseInt(stake.tier))) {
    const level = parseInt(stake.tier);
    const tierKeys = Object.keys(TIER_CONFIG).sort();
    tierKey = level < tierKeys.length ? tierKeys[level] : 'a';
  }
  // Default to lowest tier if can't determine
  else {
    tierKey = 'a';
    console.warn(`Could not determine tier for "${stake.tier}", defaulting to lowest tier`);
  }
  
  console.log(`Mapped tier from "${stake.tier}" to "${tierKey}"`);
  
  // Return stake with corrected tier
  return {
    ...stake,
    tier: tierKey
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

  const fetchData = useCallback(async (selectedPoolId?: number) => {
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

      // Fetch leaderboard data with filtering if a pool is selected
      const leaderboardEndpoint = selectedPoolId 
        ? API_ENDPOINTS.FILTERED_LEADERBOARD(selectedPoolId)
        : API_ENDPOINTS.LEADERBOARD;
        
      const leaderboardStakes = await fetchFromAPI<StakedEntity[]>(leaderboardEndpoint);
      
      console.log("Raw leaderboard stakes:", leaderboardStakes);
      const processedLeaderboardStakes = leaderboardStakes.map(stake => enrichStakeData(stake));
      console.log("Processed leaderboard stakes:", processedLeaderboardStakes);
      
      // Check if current user's stakes are in leaderboard
      const userStakesInLeaderboard = session ? processedLeaderboardStakes.some(
        stake => stake.owner === session.actor.toString()
      ) : false;

      // Only fetch user stakes if they're not in leaderboard and we have a session
      let userStakes: StakedEntity[] = [];
      if (session && !userStakesInLeaderboard) {
        try {
          const userResponse = await fetchFromAPI<{ stakingDetails: StakedEntity[] }>(
            API_ENDPOINTS.USER(session.actor.toString())
          );
          
          if (userResponse.stakingDetails) {
            console.log("Raw user stakes:", userResponse.stakingDetails);
            userStakes = userResponse.stakingDetails
              .filter(stake => !selectedPoolId || stake.pool_id === selectedPoolId)
              .map(stake => 
                enrichStakeData({
                  ...stake,
                  owner: session.actor.toString()
                })
              );
            console.log("Processed user stakes:", userStakes);
          }
        } catch (error) {
          console.warn('[API] Could not fetch user data:', error);
        }
      }

      setLastFetch(now);

      // Filter stakes by selected pool if needed
      const filteredLeaderboard = selectedPoolId 
        ? processedLeaderboardStakes.filter(stake => stake.pool_id === selectedPoolId)
        : processedLeaderboardStakes;

      // Combine leaderboard and user stakes
      const combinedStakes = [
        ...filteredLeaderboard,
        ...userStakes.filter(userStake => 
          !filteredLeaderboard.some(leaderStake => 
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
      
      console.log("Using tier configuration:", CONTRACT_TIERS);

      return {
        pools,
        stakes: sortedStakes,
        tiers: CONTRACT_TIERS, // Use our frontend-defined tiers
        config: DEFAULT_CONFIG
      };

    } catch (err) {
      console.error('Error in fetchData:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      
      // Return default data on error
      return {
        pools: [],
        stakes: [],
        tiers: CONTRACT_TIERS,
        config: DEFAULT_CONFIG
      };
    } finally {
      setLoading(false);
    }
  }, [session, lastFetch]);

  const fetchLeaderboardByPool = useCallback(async (poolId: number) => {
    setLoading(true);
    try {
      // Try the specific endpoint first
      try {
        const endpoint = API_ENDPOINTS.FILTERED_LEADERBOARD(poolId);
        const leaderboardStakes = await fetchFromAPI<StakedEntity[]>(endpoint);
        return leaderboardStakes.map(stake => enrichStakeData(stake));
      } catch (err) {
        // If specific endpoint fails, fall back to general leaderboard and filter
        console.warn('Filtered leaderboard API failed, falling back to global leaderboard');
        const leaderboardStakes = await fetchFromAPI<StakedEntity[]>(API_ENDPOINTS.LEADERBOARD);
        return leaderboardStakes
          .filter(stake => stake.pool_id === poolId)
          .map(stake => enrichStakeData(stake));
      }
    } catch (err) {
      console.error('Error fetching filtered leaderboard:', err);
      setError(err instanceof Error ? err : new Error('Failed to load leaderboard'));
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!session) return;

    const refreshData = async () => {
      try {
        await fetchData();
      } catch (err) {
        console.error('Error in periodic refresh:', err);
      }
    };

    refreshData();
    const interval = setInterval(refreshData, 30000);

    return () => clearInterval(interval);
  }, [session, fetchData]);

  return {
    fetchData,
    fetchLeaderboardByPool,
    loading,
    error
  };
}