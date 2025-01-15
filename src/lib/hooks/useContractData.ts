// src/lib/hooks/useContractData.ts
import { useState, useContext, useCallback, useEffect } from 'react';
import { WharfkitContext } from '../wharfkit/context';
import { PoolEntity } from '../types/pool';
import { StakedEntity } from '../types/staked';
import { TierEntity } from '../types/tier';
import { ConfigEntity } from '../types/config';

// API endpoints
const API_BASE_URL = 'https://maestrobeatz.servegame.com:3003/kek-staking';

// Mock pool data for testing - matches API response exactly
const MOCK_POOL: PoolEntity = {
  pool_id: 2,
  staked_token_contract: "eosio.token",
  total_staked_quantity: "22.93100000 WAX",
  total_staked_weight: "125.42349999 WAX",
  reward_pool: {
    quantity: "9.20800483 WAX",
    contract: "eosio.token"
  },
  emission_unit: 1,
  emission_rate: 50000,
  last_emission_updated_at: "2025-01-12T14:25:17.000",
  emission_start_at: "2025-01-03T16:00:00.000",
  emission_end_at: "2025-02-02T14:59:52.541",
  is_active: 1
};

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

interface StakingData {
  pools: PoolEntity[];
  stakes: StakedEntity[];
  tiers: TierEntity[];
  config: ConfigEntity;
}

async function fetchFromAPI<T>(endpoint: string): Promise<T> {
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  console.log('Attempting to fetch from:', fullUrl);
  
  try {
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      cache: 'no-cache'
    });

    if (!response.ok) {
      console.error('API Response not ok:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    console.log('Raw API response:', text);

    if (!text) {
      console.error('Empty response from API');
      throw new Error('Empty response from API');
    }

    try {
      const data = JSON.parse(text);
      console.log('Parsed API data:', data);
      return data;
    } catch (parseError) {
      console.error('JSON Parse error:', parseError);
      throw new Error('Failed to parse API response');
    }
  } catch (error) {
    console.error('API fetch error:', {
      error,
      url: fullUrl,
      message: error instanceof Error ? error.message : 'Unknown error'
    });
    // Return mock data for testing
    if (endpoint === '/pools') {
      return { pools: [MOCK_POOL] } as T;
    }
    return { stakingDetails: [] } as T;
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
      console.log('Fetching data for user:', session.actor.toString());
      
      // Fetch pools data with mock fallback
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
        pools: poolsResponse.pools || [MOCK_POOL], // Use mock pool if API fails
        stakes: stakingResponse.stakingDetails || [],
        tiers: DEFAULT_TIERS,
        config: DEFAULT_CONFIG
      };

      return stakingData;

    } catch (err) {
      console.error('Error in fetchData:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      
      // Return mock data on error
      return {
        pools: [MOCK_POOL],
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