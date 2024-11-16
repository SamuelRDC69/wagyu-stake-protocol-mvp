import React, { useContext, useState, useEffect } from 'react';
import { Crown, Sword, Shield, Star, Trophy, Timer, TrendingUp, Gauge, Users } from 'lucide-react';
import { Name, UInt64 } from '@wharfkit/session';
import { WharfkitContext } from '../lib/wharfkit/context';
import { CONTRACTS } from '../lib/wharfkit/contracts';
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

// Interface definitions...
interface PoolEntity {
  pool_id: number;
  staked_token_contract: string;
  total_staked_quantity: {
    amount: number;
    symbol: string;
  };
  total_staked_weight: {
    amount: number;
    symbol: string;
  };
  reward_pool: {
    contract: string;
    quantity: {
      amount: number;
      symbol: string;
    };
  };
  emission_unit: number;
  emission_rate: number;
  last_emission_updated_at: string;
  is_active: boolean;
}

interface StakedEntity {
  pool_id: number;
  staked_quantity: {
    amount: number;
    symbol: string;
  };
  tier: string;
  last_claimed_at: string;
  cooldown_end_at: string;
}

interface NavItem {
  icon: React.ComponentType<any>;
  label: string;
  id: string;
}

const GameUI: React.FC = () => {
  const { session, setSession, sessionKit } = useContext(WharfkitContext);
  const [activeTab, setActiveTab] = useState<string>('kingdom');
  const [showTierDetails, setShowTierDetails] = useState<boolean>(false);
  const [selectedPool, setSelectedPool] = useState<PoolEntity | undefined>(undefined);
  const [stakeAmount, setStakeAmount] = useState<string>('');
  const [pools, setPools] = useState<PoolEntity[]>([]);
  const [playerStake, setPlayerStake] = useState<StakedEntity | undefined>(undefined);
  const [isStaking, setIsStaking] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
  const fetchPools = async (): Promise<void> => {
    if (session) {
      setIsLoading(true);
      try {
        console.log('Fetching pools...');
        const response = await session.client.v1.chain.get_table_rows({
          code: Name.from(CONTRACTS.STAKING.NAME),
          scope: Name.from(CONTRACTS.STAKING.NAME),
          table: Name.from(CONTRACTS.STAKING.TABLES.POOLS),
          limit: 10
        });
        console.log('Pools response:', response);
        setPools(response.rows as PoolEntity[]);
      } catch (error) {
        console.error('Error fetching pools:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  fetchPools();
}, [session]);

  useEffect(() => {
    const fetchPlayerStake = async (): Promise<void> => {
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
          setPlayerStake(response.rows[0] as StakedEntity);
        } catch (error) {
          console.error('Error fetching player stake:', error);
        }
      }
    };
    fetchPlayerStake();
  }, [session, selectedPool]);

  const handleStake = async (): Promise<void> => {
    if (!session || !selectedPool || !stakeAmount) return;
    
    setIsStaking(true);
    try {
      // Log the action for debugging
      console.log('Starting stake transaction...');
      
      const action = {
        account: selectedPool.staked_token_contract, // Use the token contract
        name: 'transfer',
        authorization: [session.permissionLevel],
        data: {
          from: session.actor,
          to: CONTRACTS.STAKING.NAME,
          quantity: `${parseFloat(stakeAmount).toFixed(4)} ${selectedPool.total_staked_quantity.symbol}`,
          memo: 'stake'
        }
      };

      console.log('Transaction action:', action);

      try {
        const result = await session.transact({
          actions: [action] // Notice the actions array
        });
        console.log('Transaction result:', result);

        // Refresh stake data
        const response = await session.client.v1.chain.get_table_rows({
          code: Name.from(CONTRACTS.STAKING.NAME),
          scope: Name.from(session.actor.toString()),
          table: Name.from(CONTRACTS.STAKING.TABLES.STAKEDS),
          lower_bound: UInt64.from(selectedPool.pool_id),
          upper_bound: UInt64.from(selectedPool.pool_id),
          limit: 1
        });
        setPlayerStake(response.rows[0] as StakedEntity);
      } catch (e) {
        console.error('Transaction error:', e);
      }
    } catch (error) {
      console.error('Staking error:', error);
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
        <p className="text-purple-200">Loading pools...</p>
      </div>
    ) : pools.length === 0 ? (
      <div className="flex justify-center items-center h-64">
        <p className="text-purple-200">No pools available</p>
      </div>
    ) : (
      <>
        <div className="crystal-bg rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">Select Kingdom</h2>
          <Select 
            onValueChange={(value) => {
              console.log('Selected pool value:', value);
              const pool = pools.find(p => p.pool_id === parseInt(value));
              console.log('Found pool:', pool);
              setSelectedPool(pool);
            }}
            value={selectedPool?.pool_id.toString()}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a kingdom" />
            </SelectTrigger>
            <SelectContent>
              {pools.map((pool) => (
                <SelectItem key={pool.pool_id} value={pool.pool_id.toString()}>
                  {`${pool.total_staked_quantity.symbol.split(' ')[1]} - Pool #${pool.pool_id}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedPool && (
          <>
            <div className="crystal-bg rounded-2xl p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm text-purple-300">Total Staked</h3>
                  <p className="text-xl font-bold">
                    {`${selectedPool.total_staked_quantity.amount} ${selectedPool.total_staked_quantity.symbol}`}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm text-purple-300">Your Stake</h3>
                  <p className="text-xl font-bold">
                    {playerStake ? 
                      `${playerStake.staked_quantity.amount} ${playerStake.staked_quantity.symbol}` : 
                      `0.0000 ${selectedPool.total_staked_quantity.symbol}`
                    }
                  </p>
                </div>
              </div>
            </div>

            <Dialog>
  <DialogTrigger asChild>
    <Button 
      className="w-full bg-purple-600 hover:bg-purple-700"
      onClick={() => {
        console.log('Opening stake dialog');
        console.log('Selected Pool:', selectedPool);
      }}
    >
      <TrendingUp className="w-4 h-4 mr-2" />
      Stake {selectedPool.total_staked_quantity.symbol.split(' ')[1]} Tokens
    </Button>
  </DialogTrigger>
  <DialogContent className="bg-slate-900 text-white">
    <DialogHeader>
      <DialogTitle>Stake {selectedPool.total_staked_quantity.symbol.split(' ')[1]}</DialogTitle>
      <DialogDescription className="text-gray-300">
        Enter the amount of {selectedPool.total_staked_quantity.symbol.split(' ')[1]} tokens to stake in pool #{selectedPool.pool_id}
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4">
      <Input
        type="number"
        step="0.00000001"
        min="0.00000001"
        placeholder={`Amount of ${selectedPool.total_staked_quantity.symbol.split(' ')[1]}`}
        value={stakeAmount}
        onChange={(e) => {
          console.log('Input changed:', e.target.value);
          setStakeAmount(e.target.value);
        }}
        className="bg-slate-800 border-slate-700 text-white"
      />
      <Button 
        onClick={(e) => {
          e.preventDefault();
          console.log('Confirm stake clicked');
          console.log('Amount:', stakeAmount);
          handleStake();
        }} 
        disabled={isStaking || !stakeAmount || parseFloat(stakeAmount) <= 0} 
        className="w-full"
      >
        {isStaking ? 'Staking...' : `Confirm Stake of ${stakeAmount || '0.00000000'} ${selectedPool.total_staked_quantity.symbol.split(' ')[1]}`}
      </Button>
    </div>
  </DialogContent>
</Dialog>
          </>
        )}
      </>
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
    </div>
  );
};

export default GameUI;