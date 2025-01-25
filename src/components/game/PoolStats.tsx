import React, { useEffect, useState, useCallback, memo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Shield, TrendingUp, Scale } from 'lucide-react';
import { PoolEntity } from '@/lib/types/pool';
import { cn } from '@/lib/utils';
import AnimatingTokenAmount from '../animated/AnimatingTokenAmount';
import { TokenImage } from '@/components/ui/TokenImage';

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
      const initialAmount = Math.round(parseFloat(initialAmountStr) * 100000000);
      const lastUpdate = new Date(poolData.last_emission_updated_at).getTime();
      const currentTime = new Date().getTime();
      const elapsedSeconds = Math.floor((currentTime - lastUpdate) / 1000);
      const additionalAmount = Math.floor(elapsedSeconds * 500);
      const totalAmount = initialAmount + additionalAmount;
      return totalAmount / 100000000;
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
            <div className="flex-1">
              <p className="text-sm text-slate-400">Total Staked</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-medium text-purple-200">
                  {totalStaked.amount}
                </p>
                <TokenImage symbol={symbol} className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/30 rounded-lg p-4 border border-slate-700/50 transition-all group-hover:border-purple-500/20">
            <div className={cn("p-2 rounded-lg bg-purple-500/10")}>
              <Scale className="w-8 h-8 text-purple-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-400">Total Weight</p>
              <div className="flex items-center gap-2">
                <p className="text-lg font-medium text-purple-200">
                  {totalWeight.amount}
                </p>
                <TokenImage symbol={symbol} className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="md:col-span-2 flex flex-col gap-4">
            {/* Rewards Container */}
            <div className="flex items-center gap-3 bg-slate-800/30 rounded-lg p-4 border border-slate-700/50 transition-all group-hover:border-purple-500/20">
              <div className={cn("p-2 rounded-lg bg-purple-500/10")}>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-400">Rewards</p>
                <div className="flex items-center gap-2">
                  <div className="text-lg font-medium text-purple-200">
                    <AnimatingTokenAmount value={currentRewards} />
                  </div>
                  <TokenImage symbol={symbol} className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* User Weight Container */}
            {userWeight !== '0.00000000' && (
              <div className="flex items-center gap-3 bg-slate-800/30 rounded-lg p-4 border border-slate-700/50 transition-all group-hover:border-purple-500/20">
                <div className={cn("p-2 rounded-lg bg-purple-500/10")}>
                  <Scale className="w-8 h-8 text-purple-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-slate-400">Your Pool Weight</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-medium text-purple-200">
                        {userWeight}
                      </p>
                      <TokenImage symbol={symbol} className="w-6 h-6" />
                    </div>
                    <div className="bg-slate-900/50 px-3 py-1 rounded-lg">
                      <span className="text-sm text-purple-200">{userPercent}% of pool</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

PoolStats.displayName = 'PoolStats';

export default PoolStats;