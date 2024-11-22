import React, { useContext, useState, useMemo } from 'react';
import { Crown, 
  Sword, 
  Shield, 
  Star, 
  Trophy, 
  Timer, 
  TrendingUp, 
  Gauge, 
  Users, 
  BarChart3 } from 'lucide-react';
import { Name } from '@wharfkit/session';
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
import { Leaderboard } from './game/Leaderboard';

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
  const [selectedPool, setSelectedPool] = useState<PoolEntity | undefined>();
  const [pools, setPools] = useState<PoolEntity[]>([]);
  const [playerStake, setPlayerStake] = useState<StakedEntity | undefined>();
  const [tiers, setTiers] = useState<TierEntity[]>([]);
  const [config, setConfig] = useState<ConfigEntity | undefined>();
  const [error, setError] = useState<string | null>(null);

  const { fetchData, loading } = useContractData();

  const refreshData = async () => {
    if (!session) return;
    
    try {
      const data = await fetchData();
      if (data) {
        setPools(data.pools);
        setPlayerStake(data.stakes[0]);
        setTiers(data.tiers);
        setConfig(data.config);
      }
    } catch (err) {
      setError('Failed to load data');
    }
  };

  const handleClaim = async () => {
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
      await refreshData();
    } catch (error) {
      console.error('Claim error:', error);
      setError('Failed to claim rewards');
    }
  };

  const handleStake = async (amount: string) => {
 if (!session || !selectedPool) return;
 
 try {
   const { symbol } = parseTokenString(selectedPool.total_staked_quantity);
   const formattedAmount = parseFloat(amount).toFixed(8); // Forces 8 decimals
   const action = {
     account: Name.from(selectedPool.staked_token_contract),
     name: Name.from('transfer'),
     authorization: [session.permissionLevel],
     data: {
       from: session.actor,
       to: CONTRACTS.STAKING.NAME,
       quantity: `${formattedAmount} ${symbol}`,
       memo: 'stake'
     }
   };

   await session.transact({ actions: [action] });
   await refreshData();
 } catch (error) {
   console.error('Stake error:', error);
   setError('Failed to stake tokens');
 }
};

  const handleUnstake = async (amount: string) => {
    if (!session || !selectedPool) return;
    
    try {
      const { symbol } = parseTokenString(selectedPool.total_staked_quantity);
      const formattedAmount = parseFloat(amount).toFixed(8); // Forces 8 decimals
      const action = {
        account: Name.from(CONTRACTS.STAKING.NAME),
        name: Name.from('unstake'),
        authorization: [session.permissionLevel],
        data: {
          claimer: session.actor,
          pool_id: selectedPool.pool_id,
          quantity: `${formattedAmount} ${symbol}`,
        }
      };

      await session.transact({ actions: [action] });
      await refreshData();
    } catch (error) {
      console.error('Unstake error:', error);
      setError('Failed to unstake tokens');
    }
  };

  const handleLogin = async () => {
    try {
      const response = await sessionKit.login();
      setSession(response.session);
      await refreshData();
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

  const navItems: NavItem[] = [
  { icon: Crown, label: 'Kingdom', id: 'kingdom' },
  { icon: Users, label: 'Guild', id: 'guild' },
  { icon: BarChart3, label: 'Leaderboard', id: 'leaderboard' }, // Fixed BarChart to BarChart3
  { icon: Sword, label: 'Battle', id: 'battle' },
  { icon: Trophy, label: 'Rewards', id: 'rewards' }
];

// Calculate tier progress and upgrade availability
const tierProgress = useMemo(() => {
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

const canUpgradeTier = useMemo(() => {
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



  // Render appropriate content based on active tab
  const renderContent = () => {
    if (!session && activeTab !== 'leaderboard') {
      return (
        <div className="flex justify-center items-center h-64">
          <p className="text-purple-200">Connect your wallet to start playing</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'kingdom':
        return (
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
                  
                  {config && (
                    <UserStatus 
                      stakedData={playerStake}
                      config={config}
                      onClaim={handleClaim}
                      onUnstake={handleUnstake}
                      onStake={handleStake}
                      poolSymbol={parseTokenString(selectedPool.total_staked_quantity).symbol}
                      isLoading={loading}
                    />
                  )}

                  <RewardsChart poolData={selectedPool} />
                </div>
              </ErrorBoundary>
            )}
          </div>
        );

      case 'leaderboard':
        return <Leaderboard />;

      case 'guild':
        return (
          <div className="flex justify-center items-center h-64">
            <p className="text-purple-200">Guild features coming soon...</p>
          </div>
        );

      case 'battle':
        return (
          <div className="flex justify-center items-center h-64">
            <p className="text-purple-200">Battle features coming soon...</p>
          </div>
        );

      case 'rewards':
        return (
          <div className="flex justify-center items-center h-64">
            <p className="text-purple-200">Rewards features coming soon...</p>
          </div>
        );

      default:
        return (
          <div className="flex justify-center items-center h-64">
            <p className="text-purple-200">Select a tab to begin</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-slate-900 to-slate-900">
      <div className="relative crystal-bg py-4 px-6 border-b border-purple-500/20">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-purple-200">Stakeland</h1>
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <span className="text-purple-200">{session.actor.toString()}</span>
                <Button 
                  variant="outline" 
                  className="text-purple-200 border-purple-500"
                  onClick={refreshData}
                >
                  Refresh
                </Button>
                <Button 
                  variant="outline" 
                  className="text-purple-200 border-purple-500" 
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
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
      </div>

      <div className="p-6">
        {renderContent()}
      </div>

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
