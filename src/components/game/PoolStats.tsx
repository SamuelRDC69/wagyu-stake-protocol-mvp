import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Shield, Timer, TrendingUp } from 'lucide-react';
import { PoolEntity } from '../../lib/types/pool';

interface PoolStatsProps {
  poolData: PoolEntity;
}

export const PoolStats: React.FC<PoolStatsProps> = ({ poolData }) => {
  console.log('PoolStats received data:', poolData);

  // Validation check
  if (!poolData || typeof poolData !== 'object') {
    console.error('Invalid pool data received:', poolData);
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Pool Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-400">Error loading pool data</div>
        </CardContent>
      </Card>
    );
  }

  // Simple function to safely format numbers
  const formatNumber = (value: string | undefined): string => {
    if (!value) return '0.00000000';
    try {
      const [amount] = value.split(' ');
      const num = parseFloat(amount);
      return isNaN(num) ? '0.00000000' : num.toFixed(8);
    } catch (e) {
      console.error('Error formatting number:', e);
      return '0.00000000';
    }
  };

  // Get symbol from token string
  const getSymbol = (value: string | undefined): string => {
    if (!value) return 'WAX';
    try {
      const parts = value.split(' ');
      return parts[1] || 'WAX';
    } catch (e) {
      console.error('Error getting symbol:', e);
      return 'WAX';
    }
  };

  // Safely get formatted values
  const totalStaked = `${formatNumber(poolData.total_staked_quantity)} ${getSymbol(poolData.total_staked_quantity)}`;
  const totalWeight = `${formatNumber(poolData.total_staked_weight)} ${getSymbol(poolData.total_staked_weight)}`;
  const rewards = `${formatNumber(poolData.reward_pool?.quantity)} ${getSymbol(poolData.reward_pool?.quantity)}`;

  console.log('Formatted values:', { totalStaked, totalWeight, rewards });

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
              <p className="text-lg font-medium text-purple-200">{totalStaked}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-800/30 rounded-lg p-4">
            <Timer className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm text-slate-400">Weight</p>
              <p className="text-lg font-medium text-purple-200">{totalWeight}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-800/30 rounded-lg p-4">
            <TrendingUp className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm text-slate-400">Rewards</p>
              <p className="text-lg font-medium text-purple-200">{rewards}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};