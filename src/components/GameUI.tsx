import React, { useState, useEffect } from 'react';
import { Crown, Sword, Shield, Star, Trophy, Timer, TrendingUp, Gauge, Users } from 'lucide-react';
import { Session, SessionKit } from '@wharfkit/session';
import { WalletPluginAnchor } from '@wharfkit/wallet-plugin-anchor';
import { WebRenderer } from '@wharfkit/web-renderer';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Initialize SessionKit
const sessionKit = new SessionKit({
  appName: 'Stakeland',
  chains: [Chains.Jungle4], // Adjust based on your deployment
  ui: new WebRenderer(),
  walletPlugins: [new WalletPluginAnchor()],
});

const GameUI = () => {
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('kingdom');
  const [showTierDetails, setShowTierDetails] = useState(false);
  const [selectedPool, setSelectedPool] = useState(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [pools, setPools] = useState([]);
  const [playerStake, setPlayerStake] = useState(null);
  const [isStaking, setIsStaking] = useState(false);

  // Fetch initial session on mount
  useEffect(() => {
    sessionKit.restore().then((restored) => setSession(restored));
  }, []);

  // Fetch pools data
  useEffect(() => {
    const fetchPools = async () => {
      if (session) {
        try {
          const response = await session.client.v1.chain.get_table_rows({
            code: 'token.staking',
            scope: 'token.staking',
            table: 'pools',
            limit: 10
          });
          setPools(response.rows);
        } catch (error) {
          console.error('Error fetching pools:', error);
        }
      }
    };
    fetchPools();
  }, [session]);

  // Fetch player's stake data
  useEffect(() => {
    const fetchPlayerStake = async () => {
      if (session && selectedPool) {
        try {
          const response = await session.client.v1.chain.get_table_rows({
            code: 'token.staking',
            scope: session.actor.toString(),
            table: 'stakeds',
            lower_bound: selectedPool.pool_id,
            upper_bound: selectedPool.pool_id,
            limit: 1
          });
          setPlayerStake(response.rows[0]);
        } catch (error) {
          console.error('Error fetching player stake:', error);
        }
      }
    };
    fetchPlayerStake();
  }, [session, selectedPool]);

  const login = async () => {
    try {
      const response = await sessionKit.login();
      setSession(response.session);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const logout = async () => {
    if (session) {
      await sessionKit.logout(session);
      setSession(null);
    }
  };

  const handleStake = async () => {
    if (!session || !selectedPool || !stakeAmount) return;
    
    setIsStaking(true);
    try {
      const action = {
        account: selectedPool.staked_token_contract,
        name: 'transfer',
        authorization: [session.permissionLevel],
        data: {
          from: session.actor,
          to: 'token.staking',
          quantity: `${parseFloat(stakeAmount).toFixed(4)} ${selectedPool.total_staked_quantity.symbol}`,
          memo: 'stake'
        }
      };

      await session.transact({ action });
      // Refresh player stake data after successful stake
      const response = await session.client.v1.chain.get_table_rows({
        code: 'token.staking',
        scope: session.actor.toString(),
        table: 'stakeds',
        lower_bound: selectedPool.pool_id,
        upper_bound: selectedPool.pool_id,
        limit: 1
      });
      setPlayerStake(response.rows[0]);
    } catch (error) {
      console.error('Staking error:', error);
    } finally {
      setIsStaking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-950 via-slate-950 to-slate-950 text-white relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 hex-pattern opacity-20" />
      
      {/* Game Header */}
      <div className="relative crystal-bg py-4 px-6 border-b border-purple-500/20">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-purple-200">Stakeland</h1>
          {session ? (
            <div className="flex items-center gap-4">
              <span className="text-purple-200">{session.actor.toString()}</span>
              <Button 
                variant="outline" 
                className="text-purple-200 border-purple-500" 
                onClick={logout}
              >
                Logout
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              className="text-purple-200 border-purple-500" 
              onClick={login}
            >
              Connect Wallet
            </Button>
          )}
        </div>
      </div>

      {/* Main Game Area */}
      {session ? (
        <div className="p-6 space-y-6">
          {/* Pool Selection */}
          <div className="crystal-bg rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">Select Kingdom</h2>
            <Select 
              onValueChange={(value) => setSelectedPool(pools.find(p => p.pool_id === parseInt(value)))}
              value={selectedPool?.pool_id.toString()}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a kingdom" />
              </SelectTrigger>
              <SelectContent>
                {pools.map((pool) => (
                  <SelectItem key={pool.pool_id} value={pool.pool_id.toString()}>
                    {pool.staked_token_contract} - {pool.total_staked_quantity.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPool && (
            <>
              {/* Pool Stats */}
              <div className="crystal-bg rounded-2xl p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm text-purple-300">Total Staked</h3>
                    <p className="text-xl font-bold">{selectedPool.total_staked_quantity}</p>
                  </div>
                  <div>
                    <h3 className="text-sm text-purple-300">Your Stake</h3>
                    <p className="text-xl font-bold">
                      {playerStake?.staked_quantity || '0.0000 ' + selectedPool.total_staked_quantity.symbol}
                    </p>
                  </div>
                </div>
              </div>

              {/* Staking Interface */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Stake Tokens
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Stake in {selectedPool.staked_token_contract}</DialogTitle>
                    <DialogDescription>
                      Enter the amount you want to stake in this kingdom
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      type="number"
                      placeholder="Amount to stake"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                    />
                    <Button 
                      onClick={handleStake} 
                      disabled={isStaking} 
                      className="w-full"
                    >
                      {isStaking ? 'Staking...' : 'Confirm Stake'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      ) : (
        <div className="flex justify-center items-center h-64">
          <p className="text-purple-200">Connect your wallet to start playing</p>
        </div>
      )}

      {/* Game Navigation */}
      <div className="fixed bottom-0 left-0 right-0 crystal-bg border-t border-purple-500/20">
        <div className="flex justify-around p-4 max-w-lg mx-auto">
          {[
            { icon: Crown, label: 'Kingdom', id: 'kingdom' },
            { icon: Users, label: 'Guild', id: 'guild' },
            { icon: Sword, label: 'Battle', id: 'battle' },
            { icon: Trophy, label: 'Rewards', id: 'rewards' }
          ].map((item) => (
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