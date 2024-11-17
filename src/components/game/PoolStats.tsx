import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Shield, Timer, TrendingUp } from 'lucide-react';
import { PoolEntity } from '../../lib/types/pool';
import { parseTokenString, formatTokenAmount } from '../../lib/utils/tokenUtils';
import { formatEmissionRate, formatNumber } from '../../lib/utils/formatUtils';

interface PoolStatsProps {
  poolData: PoolEntity;
}

export const PoolStats: React.FC<PoolStatsProps> = ({ poolData }) => {
  console.log('PoolStats received data:', poolData); // Debug log

  const stats = useMemo(() => {
    try {
      const totalStaked = parseTokenString(poolData.total_staked_quantity);
      const totalWeight = parseTokenString(poolData.total_staked_weight);
      const rewards = parseTokenString(poolData.reward_pool.quantity);

      return {
        totalStaked: totalStaked.formatted,
        totalWeight: totalWeight.formatted,
        rewards: rewards.formatted,
        emissionRate: `${(poolData.emission_rate || 0).toFixed(8)} / ${poolData.emission_unit || 0}s`
      };
    } catch (error) {
      console.error('Error processing pool stats:', error);
      return {
        totalStaked: '0.00000000 WAX',
        totalWeight: '0.00000000 WAX',
        rewards: '0.00000000 WAX',
        emissionRate: '0.00000000 / 0s'
      };
    }
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
              <p className="text-sm text-slate-400">Total Staked</p>
              <p className="text-lg font-medium text-purple-200">
                {stats.totalStaked}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/30 rounded-lg p-4">
            <Timer className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm text-slate-400">Weight</p>
              <p className="text-lg font-medium text-purple-200">
                {stats.totalWeight}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-800/30 rounded-lg p-4">
            <TrendingUp className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm text-slate-400">Rewards</p>
              <p className="text-lg font-medium text-purple-200">
                {stats.rewards}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};