import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Shield, Timer, TrendingUp } from 'lucide-react';
import { PoolEntity } from '../../lib/types/pool';
import { parseTokenString, formatTokenAmount } from '../../lib/utils/tokenUtils';
import { formatEmissionRate, formatNumber } from '../../lib/utils/formatUtils';

interface PoolStatsProps {
  poolData: Pick<PoolEntity, 
    'total_staked_quantity' | 
    'total_staked_weight' | 
    'reward_pool' | 
    'emission_unit' | 
    'emission_rate'
  >;
}

export const PoolStats: React.FC<PoolStatsProps> = ({ poolData }) => {
  const stats = useMemo(() => {
    const { amount: stakedAmount, symbol } = parseTokenString(poolData.total_staked_weight);
    const { amount: rewardAmount } = parseTokenString(poolData.reward_pool.quantity);
    const emissionPerHour = formatEmissionRate(poolData.emission_unit, poolData.emission_rate);

    return {
      totalWeight: formatTokenAmount(stakedAmount, symbol),
      currentRewards: formatTokenAmount(rewardAmount, symbol),
      emissionRate: `${emissionPerHour} ${symbol}/hr`
    };
  }, [poolData]);

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
              <p className="text-sm text-slate-400">Total Staked Weight</p>
              <p className="text-lg font-medium text-purple-200">
                {stats.totalWeight}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/30 rounded-lg p-4">
            <Timer className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm text-slate-400">Emission Rate</p>
              <p className="text-lg font-medium text-purple-200">
                {stats.emissionRate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/30 rounded-lg p-4">
            <TrendingUp className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm text-slate-400">Current Rewards</p>
              <p className="text-lg font-medium text-purple-200">
                {stats.currentRewards}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};