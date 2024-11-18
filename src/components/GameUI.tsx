import React, { useContext, useState } from 'react';
import { Crown, Sword, Shield, Star, Trophy, Timer, TrendingUp, Gauge, Users } from 'lucide-react';
import { Name, UInt64 } from '@wharfkit/session';
import { WharfkitContext } from '../lib/wharfkit/context';
import { CONTRACTS } from '../lib/wharfkit/contracts';
import { usePolling } from '../lib/hooks/usePolling';
import { useNotifications } from '../lib/hooks/useNotifications';

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
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<string>('kingdom');
  const [selectedPool, setSelectedPool] = useState<PoolEntity | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [pools, setPools] = useState<PoolEntity[]>([]);
  const [playerStake, setPlayerStake] = useState<StakedEntity | undefined>(undefined);
  const [tiers, setTiers] = useState<TierEntity[]>([]);
  const [config, setConfig] = useState<ConfigEntity | undefined>(undefined);

  // Polling for pools data
  const { 
    data: poolsData, 
    isLoading: poolsLoading,
    refresh: refreshPools 
  } = usePolling(
    async () => {
      if (!session) return null;
      const response = await session.client.v1.chain.get_table_rows({
        code: Name.from(CONTRACTS.STAKING.NAME),
        scope: Name.from(CONTRACTS.STAKING.NAME),
        table: Name.from(CONTRACTS.STAKING.TABLES.POOLS),
        limit: 10
      });
      return response.rows;
    },
    {
      enabled: !!session,
      onError: (error) => {
        console.error('Error fetching pools:', error);
        addNotification({
          variant: 'error',
          message: 'Failed to fetch pool data',
          position: 'bottom-center'
        });
      }
    }
  );

  // Polling for tiers data
  const {
    data: tiersData,
    refresh: refreshTiers
  } = usePolling(
    async () => {
      if (!session) return null;
      const response = await session.client.v1.chain.get_table_rows({
        code: Name.from(CONTRACTS.STAKING.NAME),
        scope: Name.from(CONTRACTS.STAKING.NAME),
        table: Name.from(CONTRACTS.STAKING.TABLES.TIERS),
        limit: 10
      });
      return response.rows;
    },
    {
      enabled: !!session,
      onError: (error) => {
        console.error('Error fetching tiers:', error);
      }
    }
  );

  // Polling for config data
  const {
    data: configData,
    refresh: refreshConfig
  } = usePolling(
    async () => {
      if (!session) return null;
      const response = await session.client.v1.chain.get_table_rows({
        code: Name.from(CONTRACTS.STAKING.NAME),
        scope: Name.from(CONTRACTS.STAKING.NAME),
        table: Name.from(CONTRACTS.STAKING.TABLES.CONFIG),
        limit: 1
      });
      return response.rows[0] || null;
    },
    {
      enabled: !!session,
      onError: (error) => {
        console.error('Error fetching config:', error);
      }
    }
  );

  // Polling for player stake data
  const {
    data: playerStakeData,
    refresh: refreshPlayerStake
  } = usePolling(
    async () => {
      if (!session || !selectedPool) return null;
      const response = await session.client.v1.chain.get_table_rows({
        code: Name.from(CONTRACTS.STAKING.NAME),
        scope: Name.from(session.actor.toString()),
        table: Name.from(CONTRACTS.STAKING.TABLES.STAKEDS),
        lower_bound: UInt64.from(selectedPool.pool_id),
        upper_bound: UInt64.from(selectedPool.pool_id),
        limit: 1
      });
      return response.rows[0] || null;
    },
    {
      enabled: !!session && !!selectedPool,
      onError: (error) => {
        console.error('Error fetching player stake:', error);
      }
    }
  );

  // Effect to update states when polling data changes
  React.useEffect(() => {
    if (poolsData) {
      setPools(poolsData);
      if (!selectedPool && poolsData.length > 0) {
        setSelectedPool(poolsData[0]);
      }
    }
    if (tiersData) {
      setTiers(tiersData);
    }
    if (configData) {
      setConfig(configData);
    }
    if (playerStakeData) {
      setPlayerStake(playerStakeData);
    } else {
      setPlayerStake(undefined);
    }
  }, [poolsData, tiersData, configData, playerStakeData]);

  const handleStake = async (amount: string): Promise<void> => {
    if (!session || !selectedPool) return;
    
    try {
      addNotification({
        variant: 'pending',
        message: 'Staking tokens...',
        amount: `${amount} ${parseTokenString(selectedPool.total_staked_quantity).symbol}`,
        position: 'bottom-center'
      });

      const action = {
        account: selectedPool.staked_token_contract,
        name: 'transfer',
        authorization: [session.permissionLevel],
        data: {
          from: session.actor,
          to: CONTRACTS.STAKING.NAME,
          quantity: `${amount} ${parseTokenString(selectedPool.total_staked_quantity).symbol}`,
          memo: 'stake'
        }
      };

      const result = await session.transact({ actions: [action] });

      addNotification({
        variant: 'success',
        message: 'Successfully staked tokens',
        amount: `${amount} ${parseTokenString(selectedPool.total_staked_quantity).symbol}`,
        txid: result.transaction.id,
        position: 'bottom-center'
      });

      // Refresh data after transaction
      await Promise.all([
        refreshPools(2000),
        refreshPlayerStake(2000)
      ]);
    } catch (error) {
      console.error('Staking error:', error);
      addNotification({
        variant: 'error',
        message: 'Failed to stake tokens',
        position: 'bottom-center'
      });
    }
  };

  const handleClaim = async (): Promise<void> => {
    if (!session || !selectedPool) return;
    
    try {
      addNotification({
        variant: 'pending',
        message: 'Claiming rewards...',
        position: 'bottom-center'
      });

      const action = {
        account: Name.from(CONTRACTS.STAKING.NAME),
        name: Name.from('claim'),
        authorization: [session.permissionLevel],
        data: {
          claimer: session.actor,
          pool_id: selectedPool.pool_id
        }
      };

      const result = await session.transact({ actions: [action] });

      addNotification({
        variant: 'success',
        message: 'Successfully claimed rewards',
        txid: result.transaction.id,
        position: 'bottom-center'
      });

      await Promise.all([
        refreshPools(2000),
        refreshPlayerStake(2000)
      ]);
    } catch (error) {
      console.error('Claim error:', error);
      addNotification({
        variant: 'error',
        message: 'Failed to claim rewards',
        position: 'bottom-center'
      });
    }
  };

  const handleUnstake = async (amount: string): Promise<void> => {
    if (!session || !selectedPool) return;
    
    try {
      addNotification({
        variant: 'pending',
        message: 'Unstaking tokens...',
        amount: `${amount} ${parseTokenString(selectedPool.total_staked_quantity).symbol}`,
        position: 'bottom-center'
      });

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

      const result = await session.transact({ actions: [action] });

      addNotification({
        variant: 'success',
        message: 'Successfully unstaked tokens',
        amount: `${amount} ${parseTokenString(selectedPool.total_staked_quantity).symbol}`,
        txid: result.transaction.id,
        position: 'bottom-center'
      });

      await Promise.all([
        refreshPools(2000),
        refreshPlayerStake(2000)
      ]);
    } catch (error) {
      console.error('Unstake error:', error);
      addNotification({
        variant: 'error',
        message: 'Failed to unstake tokens',
        position: 'bottom-center'
      });
    }
  };

  const handleLogin = async () => {
    try {
      const response = await sessionKit.login();
      setSession(response.session);
      addNotification({
        variant: 'success',
        message: `Welcome ${response.session.actor.toString()}!`,
        position: 'bottom-center'
      });
    } catch (error) {
      console.error('Login error:', error);
      addNotification({
        variant: 'error',
        message: 'Failed to connect wallet',
        position: 'bottom-center'
      });
    }
  };

  const handleLogout = async () => {
    if (session) {
      try {
        await sessionKit.logout(session);
        setSession(undefined);
        addNotification({
          variant: 'success',
          message: 'Successfully logged out',
          position: 'bottom-center'
        });
      } catch (error) {
        console.error('Logout error:', error);
        addNotification({
          variant: 'error',
          message: 'Failed to logout',
          position: 'bottom-center'
        });
      }
    }
  };

  const navItems: NavItem[] = [
    { icon: Crown, label: 'Kingdom', id: 'kingdom' },
    { icon: Users, label: 'Guild', id: 'guild' },
    { icon: Sword, label: 'Battle', id: 'battle' },
    { icon: Trophy, label: 'Rewards', id: 'rewards' }
  ];

  // Calculate tier progress
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

  // Calculate upgrade availability
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
          {poolsLoading ? (
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