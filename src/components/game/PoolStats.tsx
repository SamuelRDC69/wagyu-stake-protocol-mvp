import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Shield, Timer, TrendingUp } from 'lucide-react';
import { PoolEntity } from '../../lib/types/pool';
import { parseTokenString } from '../../lib/utils/tokenUtils';

interface PoolStatsProps {
  poolData: PoolEntity;
}

export const PoolStats: React.FC<PoolStatsProps> = ({ poolData }) => {
  console.log('PoolStats raw data:', JSON.stringify(poolData, null, 2));

  const stats = useMemo(() => {
    try {
      console.log('Processing pool data...');
      
      // Verify poolData structure
      if (!poolData) {
        console.error('Pool data is undefined');
        throw new Error('No pool data provided');
      }

      // Log raw values before processing
      console.log('Raw values:', {
        total_staked_quantity: poolData.total_staked_quantity,
        total_staked_weight: poolData.total_staked_weight,
        reward_pool: poolData.reward_pool,
        emission_rate: poolData.emission_rate,
        emission_unit: poolData.emission_unit
      });

      // Safely process token quantities
      const totalStaked = poolData.total_staked_quantity ? 
        parseTokenString(poolData.total_staked_quantity) : 
        { formatted: '0.00000000 WAX' };
      
      const totalWeight = poolData.total_staked_weight ? 
        parseTokenString(poolData.total_staked_weight) : 
        { formatted: '0.00000000 WAX' };
      
      const rewards = poolData.reward_pool?.quantity ? 
        parseTokenString(poolData.reward_pool.quantity) : 
        { formatted: '0.00000000 WAX' };

      // Safely format emission rate
      let emissionRate = '0.00000000 / 0s';
      if (typeof poolData.emission_rate === 'number' && typeof poolData.emission_unit === 'number') {
        emissionRate = `${poolData.emission_rate.toFixed(8)} / ${poolData.emission_unit}s`;
      }

      console.log('Processed stats:', {
        totalStaked: totalStaked.formatted,
        totalWeight: totalWeight.formatted,
        rewards: rewards.formatted,
        emissionRate
      });

      return {
        totalStaked: totalStaked.formatted,
        totalWeight: totalWeight.formatted,
        rewards: rewards.formatted,
        emissionRate
      };
    } catch (error) {
      console.error('Error in stats calculation:', error);
      return {
        totalStaked: '0.00000000 WAX',
        totalWeight: '0.00000000 WAX',
        rewards: '0.00000000 WAX',
        emissionRate: '0.00000000 / 0s'
      };
    }
  }, [poolData]);

  // Render with error boundary
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