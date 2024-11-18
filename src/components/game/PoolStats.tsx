import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Shield, Timer, TrendingUp, Coins } from 'lucide-react';
import { PoolEntity } from '../../lib/types/pool';
import { parseTokenString } from '../../lib/utils/tokenUtils';

interface PoolStatsProps {
  poolData: PoolEntity;
}

export const PoolStats: React.FC<PoolStatsProps> = ({ poolData }) => {
  // Validation check
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

  // Format token string safely
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

  const calculateEmissionRate = () => {
    const perHour = (3600 / poolData.emission_unit) * poolData.emission_rate;
    const rewards = parseTokenString(poolData.reward_pool.quantity);
    return `${perHour.toFixed(8)} ${rewards.symbol}/hr`;
  };

  // Parse values
  const totalStaked = formatTokenString(poolData.total_staked_quantity);
  const totalWeight = formatTokenString(poolData.total_staked_weight);
  const rewards = formatTokenString(poolData.reward_pool.quantity);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Pool Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-4">
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
            <Coins className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm text-slate-400">Rewards Pool</p>
              <p className="text-lg font-medium text-purple-200">
                {`${rewards.amount} ${rewards.symbol}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-800/30 rounded-lg p-4">
            <TrendingUp className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm text-slate-400">Emission Rate</p>
              <p className="text-lg font-medium text-purple-200">
                {calculateEmissionRate()}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};