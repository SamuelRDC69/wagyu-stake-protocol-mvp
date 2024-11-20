import React, { useContext, useState, useEffect } from 'react';
import { Crown, Sword, Shield, Star, Trophy, Timer, TrendingUp, Gauge, Users } from 'lucide-react';
import { Name, UInt64 } from '@wharfkit/session';
import { WharfkitContext } from '../lib/wharfkit/context';
import { CONTRACTS } from '../lib/wharfkit/contracts';
import { useContractData } from '../lib/hooks/useContractData';

// UI Components
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";

// Game Components
import { TierDisplay } from './game/TierDisplay';
import { RewardsChart } from './game/RewardsChart';
import { UserStatus } from './game/UserStatus';
import { PoolStats } from './game/PoolStats';
import { ErrorBoundary } from './ErrorBoundary';

// Types
import { PoolEntity } from '../lib/types/pool';
import { StakedEntity } from '../lib/types/staked';
import { TierEntity } from '../lib/types/tier';
import { ConfigEntity } from '../lib/types/config';

// Utils
import { parseTokenString } from '../lib/utils/tokenUtils';
import { calculateTierProgress, isTierUpgradeAvailable } from '../lib/utils/tierUtils';

interface NavItem {
  icon: React.ComponentType<any>;
  label: string;
  id: string;
}

const GameUI: React.FC = () => {
  const { session, setSession, sessionKit } = useContext(WharfkitContext);
  const [activeTab, setActiveTab] = useState<string>('kingdom');
  const [selectedPool, setSelectedPool] = useState<PoolEntity | undefined>(undefined);
  const [pools, setPools] = useState<PoolEntity[]>([]);
  const [playerStake, setPlayerStake] = useState<StakedEntity | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Start with false
  const [tiers, setTiers] = useState<TierEntity[]>([]);
  const [config, setConfig] = useState<ConfigEntity | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

// Add this inside your GameUI component, right after the state declarations:

useEffect(() => {
  const fetchInitialData = async () => {
    if (!session) {
      setIsLoading(false);
      return;
    }
      
    setIsLoading(true);
    console.log('Starting data fetch with session:', session.actor.toString());
      
    try {
      // Fetch all data in parallel with better error handling
      const [poolsResponse, tiersResponse, configResponse] = await Promise.all([
        session.client.v1.chain.get_table_rows({
          code: Name.from(CONTRACTS.STAKING.NAME),
          scope: Name.from(CONTRACTS.STAKING.NAME),
          table: Name.from(CONTRACTS.STAKING.TABLES.POOLS),
          limit: 10
        }).catch(error => {
          console.error('Error fetching pools:', error);
          return { rows: [] };
        }),

        session.client.v1.chain.get_table_rows({
          code: Name.from(CONTRACTS.STAKING.NAME),
          scope: Name.from(CONTRACTS.STAKING.NAME),
          table: Name.from(CONTRACTS.STAKING.TABLES.TIERS),
          limit: 10
        }).catch(error => {
          console.error('Error fetching tiers:', error);
          return { rows: [] };
        }),

        session.client.v1.chain.get_table_rows({
          code: Name.from(CONTRACTS.STAKING.NAME),
          scope: Name.from(CONTRACTS.STAKING.NAME),
          table: Name.from(CONTRACTS.STAKING.TABLES.CONFIG),
          limit: 1
        }).catch(error => {
          console.error('Error fetching config:', error);
          return { rows: [] };
        })
      ]);

      console.log('Data fetch responses:', {
        pools: poolsResponse.rows,
        tiers: tiersResponse.rows,
        config: configResponse.rows
      });

      // Set data with validation
      if (poolsResponse.rows?.length > 0) {
        setPools(poolsResponse.rows);
        if (!selectedPool) {
          setSelectedPool(poolsResponse.rows[0]);
        }
      } else {
        console.log('No pools data received');
      }

      if (tiersResponse.rows?.length > 0) {
        setTiers(tiersResponse.rows);
      } else {
        console.log('No tiers data received');
      }

      if (configResponse.rows?.length > 0) {
        setConfig(configResponse.rows[0]);
      } else {
        console.log('No config data received');
      }

      setError(null);
    } catch (error) {
      console.error('Error in fetchInitialData:', error);
      setError('Failed to load game data');
    } finally {
      setIsLoading(false);
    }
  };

  // If we have a session, fetch the data
  if (session) {
    fetchInitialData();
  }
}, [session, selectedPool]); // Add selectedPool to dependencies if you want to refetch when it changes
// Also, let's add this useEffect to handle session state changes
useEffect(() => {
  if (!session) {
    // Clear all data when session is gone
    setPools([]);
    setTiers([]);
    setConfig(undefined);
    setSelectedPool(undefined);
    setPlayerStake(undefined);
    setError(null);
  }
}, [session]);

  // Add this useEffect right after the first one in GameUI:

// Fetch player stake when pool is selected
useEffect(() => {
  const fetchPlayerStake = async () => {
    if (!session || !selectedPool) {
      console.log('No session or selected pool for fetching player stake');
      return;
    }
    
    try {
      console.log('Fetching player stake for pool:', selectedPool.pool_id);
      const response = await session.client.v1.chain.get_table_rows({
        code: Name.from(CONTRACTS.STAKING.NAME),
        scope: Name.from(session.actor.toString()),
        table: Name.from(CONTRACTS.STAKING.TABLES.STAKEDS),
        lower_bound: UInt64.from(selectedPool.pool_id),
        upper_bound: UInt64.from(selectedPool.pool_id),
        limit: 1
      });

      console.log('Player stake response:', response);
      
      if (response.rows?.length > 0) {
        console.log('Setting player stake:', response.rows[0]);
        setPlayerStake(response.rows[0]);
      } else {
        console.log('No stake found for this pool');
        setPlayerStake(undefined);
      }
    } catch (error) {
      console.error('Error fetching player stake:', error);
      setPlayerStake(undefined);
    }
  };

  fetchPlayerStake();
}, [session, selectedPool]); // Depend on both session and selectedPool changes

  const handleLogin = async () => {
    try {
      const response = await sessionKit.login();
      setSession(response.session);
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to connect wallet');
    }
  };

  const handleLogout = async () => {
    if (session) {
      await sessionKit.logout(session);
      setSession(undefined);
    }
  };

  const handleClaim = async (): Promise<void> => {
    if (!session || !selectedPool) return;
    
    try {
      const action = {
        account: Name.from(CONTRACTS.STAKING.NAME),
        name: Name.from('claim'),
        authorization: [session.permissionLevel],
        data: {
          claimer: session.actor,
          pool_id: selectedPool.pool_id
        }
      };

      await session.transact({ actions: [action] });
      
      // Refresh player stake data after claim
      const response = await session.client.v1.chain.get_table_rows({
        code: Name.from(CONTRACTS.STAKING.NAME),
        scope: Name.from(session.actor.toString()),
        table: Name.from(CONTRACTS.STAKING.TABLES.STAKEDS),
        lower_bound: UInt64.from(selectedPool.pool_id),
        upper_bound: UInt64.from(selectedPool.pool_id),
        limit: 1
      });
      
      if (response.rows?.length > 0) {
        setPlayerStake(response.rows[0] as StakedEntity);
      }
    } catch (error) {
      console.error('Claim error:', error);
      setError('Failed to claim rewards. Please try again.');
    }
  };

  // Add this function alongside handleClaim and handleUnstake in GameUI:

const handleStake = async (amount: string): Promise<void> => {
  if (!session || !selectedPool) return;
  
  try {
    const { symbol } = parseTokenString(selectedPool.total_staked_quantity);
    const action = {
      account: selectedPool.staked_token_contract,
      name: 'transfer',
      authorization: [session.permissionLevel],
      data: {
        from: session.actor,
        to: CONTRACTS.STAKING.NAME,
        quantity: `${amount} ${symbol}`,
        memo: 'stake'
      }
    };

    await session.transact({ actions: [action] });
    
    // Refresh player stake data after stake
    const response = await session.client.v1.chain.get_table_rows({
      code: Name.from(CONTRACTS.STAKING.NAME),
      scope: Name.from(session.actor.toString()),
      table: Name.from(CONTRACTS.STAKING.TABLES.STAKEDS),
      lower_bound: UInt64.from(selectedPool.pool_id),
      upper_bound: UInt64.from(selectedPool.pool_id),
      limit: 1
    });
    
    if (response.rows?.length > 0) {
      setPlayerStake(response.rows[0] as StakedEntity);
    }
  } catch (error) {
    console.error('Staking error:', error);
    setError('Failed to stake tokens. Please try again.');
  }
};

  const handleUnstake = async (amount: string): Promise<void> => {
    if (!session || !selectedPool) return;
    
    try {
      const action = {
        account: Name.from(CONTRACTS.STAKING.NAME),
        name: Name.from('unstake'),
        authorization: [session.permissionLevel],
        data: {
          claimer: session.actor,
          pool_id: selectedPool.pool_id,
          quantity: `${amount} ${parseTokenString(selectedPool.total_staked_quantity).symbol}`
        }
      };

      await session.transact({ actions: [action] });
      
      // Refresh player stake data after unstake
      const response = await session.client.v1.chain.get_table_rows({
        code: Name.from(CONTRACTS.STAKING.NAME),
        scope: Name.from(session.actor.toString()),
        table: Name.from(CONTRACTS.STAKING.TABLES.STAKEDS),
        lower_bound: UInt64.from(selectedPool.pool_id),
        upper_bound: UInt64.from(selectedPool.pool_id),
        limit: 1
      });
      
      if (response.rows?.length > 0) {
        setPlayerStake(response.rows[0] as StakedEntity);
      } else {
        setPlayerStake(undefined);
      }
    } catch (error) {
      console.error('Unstake error:', error);
      setError('Failed to unstake tokens. Please try again.');
    }
  };

  const navItems: NavItem[] = [
    { icon: Crown, label: 'Kingdom', id: 'kingdom' },
    { icon: Users, label: 'Guild', id: 'guild' },
    { icon: Sword, label: 'Battle', id: 'battle' },
    { icon: Trophy, label: 'Rewards', id: 'rewards' }
  ];

  // Calculate tier progress only when all required data is available
  const tierProgress = React.useMemo(() => {
    if (!playerStake || !selectedPool || !tiers.length) return null;

    try {
      return calculateTierProgress(
        playerStake.staked_quantity,
        selectedPool.total_staked_quantity,
        tiers
      );
    } catch (error) {
      console.error('Error calculating tier progress:', error);
      return null;
    }
  }, [playerStake, selectedPool, tiers]);

  // Calculate upgrade availability only when tier progress is available
  const canUpgradeTier = React.useMemo(() => {
    if (!tierProgress?.currentTier || !selectedPool || !playerStake) return false;

    try {
      return isTierUpgradeAvailable(
        playerStake.staked_quantity,
        selectedPool.total_staked_quantity,
        tierProgress.currentTier,
        tiers
      );
    } catch (error) {
      console.error('Error calculating upgrade availability:', error);
      return false;
    }
  }, [tierProgress, selectedPool, playerStake, tiers]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-slate-950 to-slate-950 text-white relative overflow-hidden">
      <div className="fixed inset-0 hex-pattern opacity-20" />
      
      <div className="relative crystal-bg py-4 px-6 border-b border-purple-500/20">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-purple-200">Stakeland</h1>
          {session ? (
            <div className="flex items-center gap-4">
              <span className="text-purple-200">{session.actor.toString()}</span>
              <Button 
                variant="outline" 
                className="text-purple-200 border-purple-500" 
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              className="text-purple-200 border-purple-500" 
              onClick={handleLogin}
            >
              Connect Wallet
            </Button>
          )}
        </div>
      </div>

      {session ? (
        <div className="p-6 space-y-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="loading-spinner" />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="crystal-bg rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4">Select Kingdom</h2>
                <Select 
                  onValueChange={(value) => {
                    try {
                      const pool = pools.find(p => p.pool_id === parseInt(value));
                      setSelectedPool(pool);
                      setError(null);
                    } catch (error) {
                      console.error('Error selecting pool:', error);
                      setError('Error selecting pool');
                    }
                  }}
                  value={selectedPool?.pool_id?.toString()}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a kingdom" />
                  </SelectTrigger>
                  <SelectContent>
                    <div>
                      {pools.map((pool) => {
                        try {
                          const { symbol } = parseTokenString(pool.total_staked_quantity);
                          return (
                            <SelectItem 
                              key={pool.pool_id} 
                              value={pool.pool_id.toString()}
                            >
                              {`${symbol} - Pool #${pool.pool_id}`}
                            </SelectItem>
                          );
                        } catch (e) {
                          console.error('Error parsing pool data:', e);
                          return null;
                        }
                      })}
                    </div>
                  </SelectContent>
                </Select>
              </div>

              {selectedPool && (
                <ErrorBoundary 
                  fallback={<div className="text-red-400">
                    Error loading pool data. Check console for details.
                  </div>}
                >
                  <div className="space-y-6">
                    <PoolStats poolData={selectedPool} />

                    {tierProgress && (
                      <TierDisplay 
                        tierProgress={tierProgress}
                        isUpgradeAvailable={canUpgradeTier}
                      />
                    )}
                    
                    {playerStake && config && (
  <UserStatus 
    stakedData={playerStake}
    config={config}
    onCooldownComplete={() => setError(null)}
    onClaim={handleClaim}
    onUnstake={handleUnstake}
    onStake={handleStake}
    poolSymbol={parseTokenString(selectedPool.total_staked_quantity).symbol}
  />
)}

                    <RewardsChart poolData={selectedPool} />
                  </div>
                </ErrorBoundary>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="flex justify-center items-center h-64">
          <p className="text-purple-200">Connect your wallet to start playing</p>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 crystal-bg border-t border-purple-500/20">
        <div className="flex justify-around p-4 max-w-lg mx-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 ${
                activeTab === item.id ? 'text-purple-300' : 'text-white/60'
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-lg shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default GameUI;