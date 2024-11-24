import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Shield, Timer, TrendingUp } from 'lucide-react';
import { PoolEntity } from '../../lib/types/pool';
import AnimatedNumber from '../animated/AnimatedNumber';

interface PoolStatsProps {
  poolData?: PoolEntity;
  isLoading?: boolean;
}

export const PoolStats: React.FC<PoolStatsProps> = ({ poolData, isLoading }) => {
  const [currentRewards, setCurrentRewards] = useState<number>(0);

  // Validation function from project knowledge
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

  // Update rewards based on emission rate
  useEffect(() => {
    if (!poolData || !isValidPoolData(poolData)) return;

    const [initialAmount] = poolData.reward_pool.quantity.split(' ');
    setCurrentRewards(parseFloat(initialAmount));

    const emissionPerSecond = poolData.emission_rate / poolData.emission_unit;
    
    const interval = setInterval(() => {
      setCurrentRewards(prev => {
        const newValue = prev + emissionPerSecond;
        return Math.round(newValue * 100000000) / 100000000;
      });
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
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
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

  // Early validation from project knowledge
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

  // Format token string safely from project knowledge
  const formatTokenString = (value: string): { amount: string; symbol: string } => {
    try {
      const [amount, symbol = 'WAX'] = value.split(' ');
      return {
        amount: parseFloat(amount).toFixed(8),
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

  // Parse values
  const totalStaked = formatTokenString(poolData.total_staked_quantity);
  const totalWeight = formatTokenString(poolData.total_staked_weight);
  const { symbol } = formatTokenString(poolData.reward_pool.quantity);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Pool Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
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
            <Timer className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm text-slate-400">Weight</p>
              <p className="text-lg font-medium text-purple-200">
                {`${totalWeight.amount} ${totalWeight.symbol}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-800/30 rounded-lg p-4">
            <TrendingUp className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm text-slate-400">Rewards</p>
              <div className="text-lg font-medium text-purple-200">
                <AnimatedNumber value={currentRewards} />
                <span className="ml-1">{symbol}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};