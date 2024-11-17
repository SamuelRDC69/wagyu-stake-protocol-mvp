import React, { useContext, useState, useEffect } from 'react';
import { Crown, Sword, Shield, Star, Trophy, Timer, TrendingUp, Gauge, Users } from 'lucide-react';
import { Name, UInt64 } from '@wharfkit/session';
import { WharfkitContext } from '../lib/wharfkit/context';
import { CONTRACTS } from '../lib/wharfkit/contracts';

// UI Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
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
import { parseTokenString, formatTokenAmount } from '../lib/utils/tokenUtils';
import { calculateTierProgress, isTierUpgradeAvailable } from '../lib/utils/tierUtils';
import { isActionReady } from '../lib/utils/dateUtils';

interface NavItem {
  icon: React.ComponentType<any>;
  label: string;
  id: string;
}

const GameUI: React.FC = () => {
  const { session, setSession, sessionKit } = useContext(WharfkitContext);
  const [activeTab, setActiveTab] = useState<string>('kingdom');
  const [selectedPool, setSelectedPool] = useState<PoolEntity | undefined>(undefined);
  const [stakeAmount, setStakeAmount] = useState<string>('');
  const [pools, setPools] = useState<PoolEntity[]>([]);
  const [playerStake, setPlayerStake] = useState<StakedEntity | undefined>(undefined);
  const [isStaking, setIsStaking] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [tiers, setTiers] = useState<TierEntity[]>([]);
  const [config, setConfig] = useState<ConfigEntity | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
  const fetchInitialData = async () => {
    if (session) {
      setIsLoading(true);
      try {
        console.log('Fetching data from contract:', CONTRACTS.STAKING.NAME);
        
        const [poolsResponse, tiersResponse, configResponse] = await Promise.all([
          session.client.v1.chain.get_table_rows({
            code: Name.from(CONTRACTS.STAKING.NAME),
            scope: Name.from(CONTRACTS.STAKING.NAME),
            table: Name.from(CONTRACTS.STAKING.TABLES.POOLS),
            limit: 10
          }),
          session.client.v1.chain.get_table_rows({
            code: Name.from(CONTRACTS.STAKING.NAME),
            scope: Name.from(CONTRACTS.STAKING.NAME),
            table: Name.from(CONTRACTS.STAKING.TABLES.TIERS),
            limit: 10
          }),
          session.client.v1.chain.get_table_rows({
            code: Name.from(CONTRACTS.STAKING.NAME),
            scope: Name.from(CONTRACTS.STAKING.NAME),
            table: Name.from(CONTRACTS.STAKING.TABLES.CONFIG),
            limit: 1
          })
        ]);

        console.log('Raw Pools Response:', poolsResponse);
        console.log('Raw Tiers Response:', tiersResponse);
        console.log('Raw Config Response:', configResponse);

        if (poolsResponse.rows?.length > 0) {
          console.log('Pool Data Structure:', poolsResponse.rows[0]);
          setPools(poolsResponse.rows as PoolEntity[]);
        }
        if (tiersResponse.rows?.length > 0) {
          console.log('Tier Data Structure:', tiersResponse.rows[0]);
          setTiers(tiersResponse.rows as TierEntity[]);
        }
        if (configResponse.rows?.length > 0) {
          console.log('Config Data Structure:', configResponse.rows[0]);
          setConfig(configResponse.rows[0] as ConfigEntity);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setError('Failed to load game data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };
  fetchInitialData();
}, [session]);
  useEffect(() => {
    const fetchPlayerStake = async () => {
      if (session && selectedPool) {
        try {
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
          console.error('Error fetching player stake:', error);
          setError('Failed to load stake data');
        }
      }
    };
    fetchPlayerStake();
  }, [session, selectedPool]);

  const handleStake = async (): Promise<void> => {
    if (!session || !selectedPool || !stakeAmount) return;
    
    setIsStaking(true);
    try {
      const { symbol } = parseTokenString(selectedPool.total_staked_quantity);
      const quantity = formatTokenAmount(parseFloat(stakeAmount), symbol);
      
      const action = {
        account: selectedPool.staked_token_contract,
        name: 'transfer',
        authorization: [session.permissionLevel],
        data: {
          from: session.actor,
          to: CONTRACTS.STAKING.NAME,
          quantity,
          memo: 'stake'
        }
      };

      await session.transact({ actions: [action] });
      
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
      setIsDialogOpen(false);
      setStakeAmount('');
    } catch (error) {
      console.error('Staking error:', error);
      setError('Failed to stake tokens. Please try again.');
    } finally {
      setIsStaking(false);
    }
  };

  const handleLogin = async () => {
    try {
      const response = await sessionKit.login();
      setSession(response.session);
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to connect wallet. Please try again.');
    }
  };

  const handleLogout = async () => {
    if (session) {
      await sessionKit.logout(session);
      setSession(undefined);
    }
  };

  const navItems: NavItem[] = [
    { icon: Crown, label: 'Kingdom', id: 'kingdom' },
    { icon: Users, label: 'Guild', id: 'guild' },
    { icon: Sword, label: 'Battle', id: 'battle' },
    { icon: Trophy, label: 'Rewards', id: 'rewards' }
  ];

  const tierProgress = React.useMemo(() => {
    if (playerStake && selectedPool && tiers.length > 0) {
      return calculateTierProgress(
        playerStake.staked_quantity,
        selectedPool.total_staked_quantity,
        tiers
      );
    }
    return null;
  }, [playerStake, selectedPool, tiers]);

  const canUpgradeTier = React.useMemo(() => {
    if (playerStake && selectedPool && tiers.length > 0 && tierProgress?.currentTier) {
      return isTierUpgradeAvailable(
        playerStake.staked_quantity,
        selectedPool.total_staked_quantity,
        tierProgress.currentTier,
        tiers
      );
    }
    return false;
  }, [playerStake, selectedPool, tiers, tierProgress]);

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
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
              {error}
            </div>
          )}

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
      console.log('Pool selection value:', value);
      console.log('Available pools:', pools);
      const pool = pools.find(p => p.pool_id === parseInt(value));
      console.log('Selected pool data:', JSON.stringify(pool, null, 2));
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
      {console.log('Rendering pool data:', {
        selectedPool,
        tierProgress,
        playerStake,
        config
      })}
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
                      />
                    )}

                    <RewardsChart poolData={selectedPool} />

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          className="w-full bg-purple-600 hover:bg-purple-700"
                          onClick={() => {
                            setError(null);
                            setIsDialogOpen(true);
                          }}
                        >
                          <TrendingUp className="w-4 h-4 mr-2" />
                          {`Stake ${parseTokenString(selectedPool.total_staked_quantity).symbol} Tokens`}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-900 text-white">
                        <DialogHeader>
                          <DialogTitle>
                            {`Stake ${parseTokenString(selectedPool.total_staked_quantity).symbol}`}
                          </DialogTitle>
                          <DialogDescription className="text-gray-300">
                            {`Enter the amount to stake in pool #${selectedPool.pool_id}`}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Input
                            type="number"
                            step="0.00000001"
                            min="0.00000001"
                            placeholder={`Amount of ${parseTokenString(selectedPool.total_staked_quantity).symbol}`}
                            value={stakeAmount}
                            onChange={(e) => setStakeAmount(e.target.value)}
                            className="bg-slate-800 border-slate-700 text-white"
                          />
                          <Button 
                            onClick={handleStake} 
                            disabled={isStaking || !stakeAmount || parseFloat(stakeAmount) <= 0} 
                            className="w-full bg-purple-600 hover:bg-purple-700"
                          >
                            {isStaking ? 'Staking...' : 'Confirm Stake'}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
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

      {/* Error Toast */}
      {error && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-red-500/90 text-white px-4 py-2 rounded-lg shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default GameUI;