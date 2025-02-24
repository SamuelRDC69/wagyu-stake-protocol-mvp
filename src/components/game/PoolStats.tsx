import React, { useEffect, useState, useCallback, memo, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Shield, TrendingUp, Scale, Info } from 'lucide-react';
import { PoolEntity } from '@/lib/types/pool';
import { cn } from '@/lib/utils';
import AnimatingTokenAmount from '../animated/AnimatingTokenAmount';
import { TokenImage } from '@/components/ui/TokenImage';
import { Button } from '@/components/ui/button';
import { FarmStatsInfo } from './FarmStatsInfo';
import { parseTokenString } from '@/lib/utils/tokenUtils';

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
  const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);

  // Get decimals from pool data
  const { decimals, symbol } = useMemo(() => 
    parseTokenString(poolData?.total_staked_quantity),
    [poolData?.total_staked_quantity]
  );

const calculateCurrentRewards = useCallback(() => {
  if (!poolData) return 0;

  try {
    const [initialAmountStr] = poolData.reward_pool.quantity.split(' ');
    const initialAmount = parseFloat(initialAmountStr);
    const lastUpdate = new Date(poolData.last_emission_updated_at).getTime();
    const currentTime = new Date().getTime();
    
    // Convert to nanoseconds
    const elapsedNanos = (currentTime - lastUpdate) * 1000000;
    
    // Match contract calculation exactly
    const additionalAmount = (elapsedNanos * poolData.emission_rate) / 
                           (poolData.emission_unit * 1000000000);
    
    return initialAmount + additionalAmount;
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
          <CardTitle>Farm Status</CardTitle>
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
          <CardTitle>Farm Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-400 text-center">No pool data available</div>
        </CardContent>
      </Card>
    );
  }

  // Parse pool data with correct decimals
  const { amount: totalStakedAmount } = parseTokenString(poolData.total_staked_quantity);
  const totalStakedFormatted = totalStakedAmount.toFixed(decimals);

  // Parse weight data with correct decimals
  let userWeight = '0'.padEnd(decimals + 2, '0');
  let userPercent = '0.00';
  if (userStakedQuantity && userTierWeight) {
    const { amount: userAmount } = parseTokenString(userStakedQuantity);
    const userWeightNum = userAmount * parseFloat(userTierWeight);
    userWeight = userWeightNum.toFixed(decimals);
    const { amount: totalWeightAmount } = parseTokenString(poolData.total_staked_weight);
    userPercent = ((userWeightNum / totalWeightAmount) * 100).toFixed(2);
  }

  return (
    <>
      <Card className="w-full crystal-bg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <CardTitle>Farm Status</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-slate-800/30 hover:bg-slate-700/50"
            onClick={() => setIsInfoDialogOpen(true)}
          >
            <Info className="h-4 w-4 text-purple-400" />
          </Button>
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
                    {parseFloat(poolData.total_staked_weight).toFixed(decimals)}
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
                      <AnimatingTokenAmount 
                        value={currentRewards} 
                        decimals={decimals}
                      />
                    </div>
                    <TokenImage symbol={symbol} className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                  </div>
                </div>
              </div>

              {userWeight !== '0'.padEnd(decimals + 2, '0') && (
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

      <FarmStatsInfo 
        open={isInfoDialogOpen}
        onOpenChange={setIsInfoDialogOpen}
      />
    </>
  );
});

PoolStats.displayName = 'PoolStats';

export default PoolStats;