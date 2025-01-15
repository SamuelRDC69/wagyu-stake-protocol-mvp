// src/lib/hooks/useContractData.ts
import { useState, useContext, useCallback, useEffect } from 'react';
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

interface StakingData {
  pools: PoolEntity[];
  stakes: StakedEntity[];
  tiers: TierEntity[];
  config: ConfigEntity;
}

async function fetchFromAPI<T>(endpoint: string): Promise<T> {
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  console.log(`[API] Starting fetch from: ${fullUrl}`);
  console.log(`[API] Current timestamp: ${new Date().toISOString()}`);
  
  try {
    console.log('[API] Setting up fetch request...');
    const requestInit: RequestInit = {
      method: 'GET',
      headers: {
        'Accept': '*/*',
        'Access-Control-Allow-Origin': '*'
      },
      mode: 'no-cors', // Changed to no-cors
      cache: 'no-cache',
      credentials: 'omit'
    };
    console.log('[API] Request configuration:', requestInit);

    console.log('[API] Initiating fetch...');
    const response = await fetch(fullUrl, requestInit);
    console.log('[API] Response received:', response);

    if (response.type === 'opaque') {
      // no-cors mode returns opaque response, try to fetch again with CORS
      console.log('[API] Opaque response received, trying CORS...');
      const corsResponse = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        mode: 'cors',
        cache: 'no-cache'
      });

      if (!corsResponse.ok) {
        throw new Error(`HTTP error! status: ${corsResponse.status}`);
      }

      const text = await corsResponse.text();
      console.log('[API] Response text:', text);
      
      try {
        const data = JSON.parse(text);
        console.log('[API] Parsed data:', data);
        return data;
      } catch (parseError) {
        console.error('[API] Parse error:', parseError);
        throw new Error('Failed to parse response');
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const text = await response.text();
    console.log('[API] Response text:', text);

    try {
      const data = JSON.parse(text);
      console.log('[API] Parsed data:', data);
      return data;
    } catch (parseError) {
      console.error('[API] Parse error:', parseError);
      throw new Error('Failed to parse response');
    }
  } catch (error) {
    const errorDetails = {
      type: error instanceof Error ? error.constructor.name : typeof error,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      url: fullUrl,
      timestamp: new Date().toISOString()
    };
    console.error('[API] Detailed error information:', errorDetails);
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
        pools: poolsResponse.pools || [],
        stakes: stakingResponse.stakingDetails || [],
        tiers: DEFAULT_TIERS,
        config: DEFAULT_CONFIG
      };

      return stakingData;

    } catch (err) {
      console.error('Error in fetchData:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      
      // Return empty data on error
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