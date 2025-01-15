// src/lib/hooks/useContractData.ts
import { useState, useContext, useCallback, useEffect } from 'react';
import { WharfkitContext } from '../wharfkit/context';
import { PoolEntity } from '../types/pool';
import { StakedEntity } from '../types/staked';
import { TierEntity } from '../types/tier';
import { ConfigEntity } from '../types/config';

// API endpoints
const API_BASE_URL = 'https://maestrobeatz.servegame.com:3003/kek-staking';

// Default tiers (will be replaced with API data when available)
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

// Default config (will be replaced with API data when available)
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

export function useContractData() {
  const { session } = useContext(WharfkitContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetch, setLastFetch] = useState(0);
  const FETCH_COOLDOWN = 5000; // 5 seconds minimum between fetches

  const fetchData = useCallback(async () => {
    if (!session) return null;
    
    // Rate limiting
    const now = Date.now();
    if (now - lastFetch < FETCH_COOLDOWN) {
      return null;
    }

    setLoading(true);
    
    try {
      console.log('Fetching data for user:', session.actor.toString());
      
      // Fetch pools data
      const poolsResponse = await fetchFromAPI<{ pools: PoolEntity[] }>('/pools');
      console.log('Pools response:', poolsResponse);
      
      // Fetch user staking data
      const stakingResponse = await fetchFromAPI<{ stakingDetails: StakedEntity[] }>(
        `/user/${session.actor.toString()}`
      );
      console.log('Staking response:', stakingResponse);

      setLastFetch(now);

      // Return combined data
      const stakingData: StakingData = {
        pools: poolsResponse.pools,
        stakes: stakingResponse.stakingDetails,
        tiers: DEFAULT_TIERS,
        config: DEFAULT_CONFIG
      };

      return stakingData;

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

  // Set up automatic refresh when session exists
  useEffect(() => {
    if (!session) return;

    // Initial fetch
    fetchData();

    // Set up periodic refresh
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [session, fetchData]);

  return {
    fetchData,
    loading,
    error
  };
}