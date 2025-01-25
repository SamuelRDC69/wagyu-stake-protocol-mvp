import React, { useEffect, useState, useCallback, memo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Shield, TrendingUp, Scale, Percent } from 'lucide-react';
import { PoolEntity } from '@/lib/types/pool';
import { cn } from '@/lib/utils';
import AnimatingTokenAmount from '../animated/AnimatingTokenAmount';

interface PoolStatsProps {
  poolData?: PoolEntity;
  isLoading?: boolean;
  userStakedQuantity?: string;
  userTierWeight?: string;
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

export const PoolStats: React.FC<PoolStatsProps> = memo(({ poolData, isLoading, userStakedQuantity, userTierWeight }) => {
  const [currentRewards, setCurrentRewards] = useState<number>(0);
  const [updateKey, setUpdateKey] = useState<number>(0);

  const calculateCurrentRewards = useCallback(() => {
    if (!poolData || !isValidPoolData(poolData)) return 0;

    try {
      const [initialAmountStr] = poolData.reward_pool.quantity.split(' ');
      const initialAmount = Math.round(parseFloat(initialAmountStr) * 100000000); // Convert to integer (8 decimals)

      const lastUpdate = new Date(poolData.last_emission_updated_at).getTime();
      const currentTime = new Date().getTime();
      const elapsedSeconds = Math.floor((currentTime - lastUpdate) / 1000);
      
      // Calculate emissions using same math as before
      const additionalAmount = Math.floor(elapsedSeconds * 500); // 0.00000500 * 100000000 = 500
      const totalAmount = initialAmount + additionalAmount;
      
      return totalAmount / 100000000; // Convert back to decimal
    } catch (error) {
      console.error('Error calculating rewards:', error);
      return 0;
    }
  }, [poolData]);

  useEffect(() => {
    setUpdateKey(prev => prev + 1);
  }, [poolData?.reward_pool.quantity, poolData?.last_emission_updated_at]);

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
      <Card className="w-full crystal-bg group">
        <CardHeader>
          <CardTitle>Pool Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
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
      <Card className="w-full crystal-bg group">
        <CardHeader>
          <CardTitle>Pool Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-400 text-center">Invalid pool data</div>
        </CardContent>
      </Card>
    );
  }

  const totalStaked = formatTokenString(poolData.total_staked_quantity);
  const totalWeight = formatTokenString(poolData.total_staked_weight);
  const { symbol } = formatTokenString(poolData.reward_pool.quantity);

  // Calculate user's weight if data is available
  let userWeight = '0.00000000';
  let userPercent = '0.00';
  if (userStakedQuantity && userTierWeight) {
    const { amount: userAmount } = formatTokenString(userStakedQuantity);
    const userWeightNum = parseFloat(userAmount) * parseFloat(userTierWeight);
    userWeight = userWeightNum.toFixed(8);
    const { amount: totalWeightAmount } = formatTokenString(poolData.total_staked_weight);
    userPercent = ((userWeightNum / parseFloat(totalWeightAmount)) * 100).toFixed(2);
  }

  return (
    <Card className="w-full crystal-bg group">
      <CardHeader>
        <CardTitle>Pool Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center gap-3 bg-slate-800/30 rounded-lg p-4 border border-slate-700/50 transition-all group-hover:border-purple-500/20">
            <div className={cn("p-2 rounded-lg bg-purple-500/10")}>
              <Shield className="w-8 h-8 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Total Staked</p>
              <p className="text-lg font-medium text-purple-200">
                {`${totalStaked.amount} ${totalStaked.symbol}`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-800/30 rounded-lg p-4 border border-slate-700/50 transition-all group-hover:border-purple-500/20">
            <div className={cn("p-2 rounded-lg bg-purple-500/10")}>
              <Scale className="w-8 h-8 text-purple-500" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Total Weight</p>
              <p className="text-lg font-medium text-purple-200">
                {`${totalWeight.amount} ${totalWeight.symbol}`}
              </p>
            </div>
          </div>

          {userStakedQuantity && (
            <>
              <div className="flex items-center gap-3 bg-slate-800/30 rounded-lg p-4 border border-slate-700/50 transition-all group-hover:border-purple-500/20">
                <div className={cn("p-2 rounded-lg bg-purple-500/10")}>
                  <Scale className="w-8 h-8 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Your Weight</p>
                  <p className="text-lg font-medium text-purple-200">
                    {`${userWeight} ${symbol}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-slate-800/30 rounded-lg p-4 border border-slate-700/50 transition-all group-hover:border-purple-500/20">
                <div className={cn("p-2 rounded-lg bg-purple-500/10")}>
                  <Percent className="w-8 h-8 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Your Share</p>
                  <p className="text-lg font-medium text-purple-200">{userPercent}%</p>
                </div>
              </div>
            </>
          )}

          <div className="flex items-center gap-3 bg-slate-800/30 rounded-lg p-4 border border-slate-700/50 transition-all group-hover:border-purple-500/20 md:col-span-2">
            <div className={cn("p-2 rounded-lg bg-purple-500/10")}>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
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