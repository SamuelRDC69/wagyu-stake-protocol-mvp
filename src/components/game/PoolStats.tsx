import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Shield, Timer, TrendingUp } from 'lucide-react';
import { PoolEntity } from '../../lib/types/pool';

interface PoolStatsProps {
  poolData: Pick<PoolEntity, 'total_staked_quantity' | 'total_staked_weight' | 'reward_pool' | 'emission_unit' | 'emission_rate'>;
}

export const PoolStats: React.FC<PoolStatsProps> = ({ poolData }) => {
  const formatEmissionRate = (unit: number, rate: number): string => {
    const perHour = (3600 / unit) * rate;
    return perHour.toFixed(8);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Pool Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm text-slate-400">Total Staked Weight</p>
              <p className="text-lg font-medium text-purple-200">{poolData.total_staked_weight}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Timer className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm text-slate-400">Emission Rate</p>
              <p className="text-lg font-medium text-purple-200">
                {`${formatEmissionRate(poolData.emission_unit, poolData.emission_rate)} / hour`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm text-slate-400">Current Rewards</p>
              <p className="text-lg font-medium text-purple-200">{poolData.reward_pool.quantity}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};