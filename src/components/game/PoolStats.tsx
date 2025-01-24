import React, { useEffect, useState, useCallback, memo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Shield, TrendingUp } from 'lucide-react';
import { PoolEntity } from '../../lib/types/pool';
import AnimatingTokenAmount from '../animated/AnimatingTokenAmount';

interface PoolStatsProps {
  poolData?: PoolEntity;
  isLoading?: boolean;
}

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

export const PoolStats: React.FC<PoolStatsProps> = memo(({ poolData, isLoading }) => {
  const [currentRewards, setCurrentRewards] = useState<number>(0);
  const [updateKey, setUpdateKey] = useState<number>(0);

  const calculateCurrentRewards = useCallback(() => {
    if (!poolData || !isValidPoolData(poolData)) return 0;

    try {
      const [initialAmountStr] = poolData.reward_pool.quantity.split(' ');
      const initialAmount = Math.round(parseFloat(initialAmountStr) * 100000000);

      const lastUpdate = new Date(poolData.last_emission_updated_at).getTime();
      const currentTime = new Date().getTime();
      const elapsedSeconds = Math.floor((currentTime - lastUpdate) / 1000);
      
      const additionalAmount = Math.floor(elapsedSeconds * poolData.emission_rate);
      const totalAmount = initialAmount + additionalAmount;
      
      return totalAmount / 100000000;
    } catch (error) {
      console.error('Error calculating rewards:', error);
      return 0;
    }
  }, [poolData]);

  // Reset calculation when pool data changes
  useEffect(() => {
    setUpdateKey(prev => prev + 1);
  }, [poolData?.reward_pool.quantity, poolData?.last_emission_updated_at]);

  // Handle reward calculations
  useEffect(() => {
    if (!poolData || !isValidPoolData(poolData)) return;

    const updateRewards = () => {
      setCurrentRewards(calculateCurrentRewards());
    };

    updateRewards();
    const interval = setInterval(updateRewards, 1000);
    
    return () => clearInterval(interval);
  }, [updateKey, calculateCurrentRewards, poolData]);

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
});

PoolStats.displayName = 'PoolStats';

export default PoolStats;