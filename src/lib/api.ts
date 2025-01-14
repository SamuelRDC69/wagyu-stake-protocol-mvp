// src/lib/api.ts
import React, { useState, useCallback, useEffect } from 'react';
import { PoolEntity } from './types/pool';
import { StakedEntity } from './types/staked';

const API_BASE_URL = 'https://maestrobeatz.servegame.com:3003/kek-staking';

interface APIResponse<T> {
  data: T;
  error?: string;
}

interface PoolsResponse {
  pools: PoolEntity[];
}

interface UserStakingResponse {
  stakingDetails: StakedEntity[];
}

class APIError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'APIError';
  }
}

async function fetchAPI<T>(endpoint: string): Promise<T> {
  try {
    console.log(`Fetching from: ${API_BASE_URL}${endpoint}`);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      mode: 'cors', // Explicitly set CORS mode
      credentials: 'omit', // Don't send credentials
      cache: 'no-cache', // Don't use cache
    });
    
    if (!response.ok) {
      console.error(`API Error Response:`, {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      });
      throw new APIError(`API Error: ${response.statusText}`, response.status);
    }

    const text = await response.text(); // Get response as text first
    console.log('API Response text:', text);

    try {
      const data = JSON.parse(text);
      console.log('Parsed API Response:', data);
      return data as T;
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      throw new Error(`Failed to parse API response: ${parseError.message}`);
    }

  } catch (error) {
    console.error('Detailed API Error:', {
      error,
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(error instanceof Error ? error.message : 'Unknown error occurred');
  }
}

export async function fetchPools(): Promise<PoolEntity[]> {
  try {
    const response = await fetchAPI<PoolsResponse>('/pools');
    console.log('Pools response:', response);
    if (!response.pools) {
      console.error('No pools data in response:', response);
      return [];
    }
    return response.pools;
  } catch (error) {
    console.error('Error fetching pools:', error);
    return []; // Return empty array instead of throwing
  }
}

export async function fetchUserStaking(username: string): Promise<StakedEntity[]> {
  if (!username) {
    return [];
  }
  try {
    const response = await fetchAPI<UserStakingResponse>(`/user/${username}`);
    console.log('User staking response:', response);
    if (!response.stakingDetails) {
      console.error('No staking details in response:', response);
      return [];
    }
    return response.stakingDetails;
  } catch (error) {
    console.error('Error fetching user staking:', error);
    return []; // Return empty array instead of throwing
  }
}

// Custom hook for managing stake data
export function useStakingData(username: string | undefined) {
  const [data, setData] = useState<{
    pools: PoolEntity[];
    userStakes: StakedEntity[];
  }>({
    pools: [],
    userStakes: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refreshData = useCallback(async () => {
    if (!username) return;
    
    setLoading(true);
    try {
      const [pools, userStakes] = await Promise.all([
        fetchPools(),
        fetchUserStaking(username)
      ]);
      
      setData({ pools, userStakes });
      setError(null);
    } catch (err) {
      console.error('Error in useStakingData:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    refreshData();
  }, [username, refreshData]);

  return {
    ...data,
    loading,
    error,
    refresh: refreshData
  };
}