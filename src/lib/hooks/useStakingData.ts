// src/lib/hooks/useStakingData.ts
import { useState, useEffect, useCallback, useContext } from 'react';
import { WharfkitContext } from '../wharfkit/context';
import { PoolEntity } from '../types/pool';
import { StakedEntity } from '../types/staked';
import { TierEntity } from '../types/tier';
import { ConfigEntity } from '../types/config';

// API endpoints
const API_BASE_URL = 'https://maestrobeatz.servegame.com:3003/kek-staking';

// Default tiers
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

async function fetchFromAPI<T>(endpoint: string): Promise<T> {
  try {
    console.log(`Fetching from: ${API_BASE_URL}${endpoint}`);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-cache',
    });

    if (!response.ok) {
      console.error('API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });
      throw new Error(`API Error: ${response.statusText}`);
    }

    const text = await response.text();
    console.log('API Response text:', text);

    try {
      const data = JSON.parse(text);
      console.log('Parsed API Response:', data);
      return data as T;
    } catch (err) {
      const parseError = err as Error;
      console.error('JSON Parse Error:', parseError.message);
      throw new Error(`Failed to parse API response: ${parseError.message}`);
    }
  } catch (err) {
    const error = err as Error;
    console.error(`API fetch error for ${endpoint}:`, {
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    throw error;
  }
}

async function fetchPools(): Promise<PoolEntity[]> {
  try {
    const response = await fetchFromAPI<{ pools: PoolEntity[] }>('/pools');
    if (!response.pools) return [];
    return response.pools;
  } catch (error) {
    console.error('Error fetching pools:', error);
    return [];
  }
}

async function fetchUserStaking(username: string): Promise<StakedEntity[]> {
  if (!username) return [];
  try {
    const response = await fetchFromAPI<{ stakingDetails: StakedEntity[] }>(
      `/user/${username}`
    );
    if (!response.stakingDetails) return [];
    return response.stakingDetails;
  } catch (error) {
    console.error('Error fetching user staking:', error);
    return [];
  }
}

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
    
    const now = Date.now();
    if (now - lastFetch < FETCH_COOLDOWN) {
      return null;
    }

    setLoading(true);
    
    try {
      console.log('Fetching data for user:', session.actor.toString());
      
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
    } catch (err) {
      const error = err as Error;
      console.error('Error fetching data:', error.message);
      setError(error);
      // Return default data instead of null
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

  useEffect(() => {
    if (!session) return;

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds

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