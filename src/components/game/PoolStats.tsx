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

export const PoolStats: React.FC<PoolStatsProps> = memo(({ 
  poolData, 
  isLoading, 
  userStakedQuantity, 
  userTierWeight 
}) => {
  const [currentRewards, setCurrentRewards] = useState<number>(0);
  const [updateKey, setUpdateKey] = useState<number>(0);

  const calculateCurrentRewards = useCallback(() => {
    if (!poolData) return 0;

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
    if (!poolData) return;

    const updateRewards = () => {
      setCurrentRewards(calculateCurrentRewards());
    };

    updateRewards();
    const interval = setInterval(updateRewards, 1000);
    return () => clearInterval(interval);
  }, [updateKey, calculateCurrentRewards, poolData]);

  if (isLoading) {
    return (
      <Card className="w-full crystal-bg">
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

  if (!poolData) {
    return (
      <Card className="w-full crystal-bg">
        <CardHeader>
          <CardTitle>Pool Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-400 text-center">No pool data available</div>
        </CardContent>
      </Card>
    );
  }

  // Parse pool data
  const [totalStakedAmount, symbol] = poolData.total_staked_quantity.split(' ');
  const totalStakedFormatted = parseFloat(totalStakedAmount).toFixed(8);

  // Parse weight data
  let userWeight = '0.00000000';
  let userPercent = '0.00';
  if (userStakedQuantity && userTierWeight) {
    const [userAmount] = userStakedQuantity.split(' ');
    const userWeightNum = parseFloat(userAmount) * parseFloat(userTierWeight);
    userWeight = userWeightNum.toFixed(8);
    const [totalWeightAmount] = poolData.total_staked_weight.split(' ');
    userPercent = ((userWeightNum / parseFloat(totalWeightAmount)) * 100).toFixed(2);
  }

  return (
    <Card className="w-full crystal-bg">
      <CardHeader>
        <CardTitle>Farm Stats</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex items-center gap-3 bg-slate-800/30 rounded-lg p-3 md:p-4 border border-slate-700/50 transition-all hover:bg-slate-800/40">
            <div className={cn("p-2 rounded-lg bg-purple-500/10 transition-all")}>
              <Shield className="w-5 h-5 md:w-6 md:h-6 text-purple-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm text-slate-400">Total Staked to Farm</p>
              <div className="flex items-center gap-2">
                <p className="text-sm md:text-base font-medium text-purple-200 truncate">
                  {totalStakedFormatted}
                </p>
                <TokenImage symbol={symbol} className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/30 rounded-lg p-3 md:p-4 border border-slate-700/50 transition-all hover:bg-slate-800/40">
            <div className={cn("p-2 rounded-lg bg-purple-500/10")}>
              <Scale className="w-5 h-5 md:w-6 md:h-6 text-purple-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs md:text-sm text-slate-400">Farm Total Weight</p>
              <div className="flex items-center gap-2">
                <p className="text-sm md:text-base font-medium text-purple-200 truncate">
                  {parseFloat(poolData.total_staked_weight).toFixed(8)}
                </p>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 flex flex-col gap-4">
            <div className="flex items-center gap-3 bg-slate-800/30 rounded-lg p-3 md:p-4 border border-slate-700/50 transition-all hover:bg-slate-800/40">
              <div className={cn("p-2 rounded-lg bg-purple-500/10")}>
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-purple-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs md:text-sm text-slate-400">Farm Rewards Pool</p>
                <div className="flex items-center gap-2">
                  <div className="text-sm md:text-base font-medium text-purple-200 truncate">
                    <AnimatingTokenAmount value={currentRewards} />
                  </div>
                  <TokenImage symbol={symbol} className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                </div>
              </div>
            </div>

            {userWeight !== '0.00000000' && (
              <div className="flex items-center gap-3 bg-slate-800/30 rounded-lg p-3 md:p-4 border border-slate-700/50 transition-all hover:bg-slate-800/40">
                <div className={cn("p-2 rounded-lg bg-purple-500/10")}>
                  <Scale className="w-5 h-5 md:w-6 md:h-6 text-purple-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm text-slate-400">Your Total Weight</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="text-sm md:text-base font-medium text-purple-200 truncate">
                        {userWeight}
                      </p>
                    </div>
                    <div className="bg-slate-900/50 px-2 py-1 rounded-lg">
                      <span className="text-xs md:text-sm text-purple-200">{userPercent}% of Farm</span>
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