import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Shield, TrendingUp } from 'lucide-react';
import { PoolEntity } from '../../lib/types/pool';
import AnimatingTokenAmount from '../animated/AnimatingTokenAmount';

interface PoolStatsProps {
  poolData?: PoolEntity;
  isLoading?: boolean;
}

export const PoolStats: React.FC<PoolStatsProps> = ({ poolData, isLoading }) => {
  const [currentRewards, setCurrentRewards] = useState<number>(0);

  const isValidPoolData = (data: any): data is PoolEntity => {
    return (
      data &&
      typeof data === 'object' &&
      'total_staked_quantity' in data &&
      'total_staked_weight' in data &&
      'reward_pool' in data &&
      typeof data.reward_pool === 'object' &&
      'quantity' in data.reward_pool
    );
  };

  // Calculate current rewards based on smart contract logic
  useEffect(() => {
    if (!poolData || !isValidPoolData(poolData)) return;

    const calculateCurrentRewards = () => {
      try {
        // Parse initial rewards from the pool maintaining precision
        const [initialAmountStr] = poolData.reward_pool.quantity.split(' ');
        const initialAmount = Math.round(parseFloat(initialAmountStr) * 100000000); // Convert to integer (8 decimals)
        
        // Calculate time elapsed since last emission update
        const lastUpdate = new Date(poolData.last_emission_updated_at).getTime();
        const currentTime = new Date().getTime();
        const elapsedMilliseconds = currentTime - lastUpdate;
        const elapsedSeconds = Math.floor(elapsedMilliseconds / 1000);
        
        // Calculate emissions using integer arithmetic like the contract
        const emissionPeriods = Math.floor(elapsedSeconds / poolData.emission_unit);
        const emissionAmount = BigInt(emissionPeriods) * BigInt(poolData.emission_rate);
        
        // Convert back to floating point with proper precision
        const totalAmount = Number(initialAmount + Number(emissionAmount));
        return totalAmount / 100000000; // Convert back to 8 decimal places
      } catch (error) {
        console.error('Error calculating rewards:', error);
        return 0;
      }
    };

    // Set initial value
    setCurrentRewards(calculateCurrentRewards());

    // Update every second
    const interval = setInterval(() => {
      setCurrentRewards(calculateCurrentRewards());
    }, 1000);

    return () => clearInterval(interval);
  }, [poolData]);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Pool Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 bg-slate-800/30 rounded-lg p-4">
                <div className="w-8 h-8 bg-purple-500/20 rounded animate-pulse" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-700 rounded w-1/2 animate-pulse" />
                  <div className="h-4 bg-slate-700 rounded w-3/4 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isValidPoolData(poolData)) {
    console.error('Invalid pool data:', poolData);
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Pool Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-400">Invalid pool data</div>
        </CardContent>
      </Card>
    );
  }

  const formatTokenString = (value: string): { amount: string; symbol: string } => {
    try {
      const [amount, symbol = 'WAX'] = value.split(' ');
      return {
        amount: parseFloat(amount).toFixed(8), // Maintain 8 decimal places
        symbol
      };
    } catch (e) {
      console.error('Error formatting token string:', e);
      return {
        amount: '0.00000000',
        symbol: 'WAX'
      };
    }
  };

  const totalStaked = formatTokenString(poolData.total_staked_quantity);
  const { symbol } = formatTokenString(poolData.reward_pool.quantity);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Pool Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center gap-3 bg-slate-800/30 rounded-lg p-4">
            <Shield className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm text-slate-400">Total Staked</p>
              <p className="text-lg font-medium text-purple-200">
                {`${totalStaked.amount} ${totalStaked.symbol}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-800/30 rounded-lg p-4">
            <TrendingUp className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm text-slate-400">Rewards</p>
              <div className="text-lg font-medium text-purple-200">
                <AnimatingTokenAmount value={currentRewards} />
                <span className="ml-1">{symbol}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};