import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Shield, Timer, TrendingUp } from 'lucide-react';
import { PoolEntity } from '../../lib/types/pool';

interface PoolStatsProps {
  poolData: PoolEntity;
}

export const PoolStats: React.FC<PoolStatsProps> = ({ poolData }) => {
  // Simple function to safely format numbers
  const formatNumber = (value: string | undefined): string => {
    if (!value) return '0.00000000';
    const [amount] = value.split(' ');
    try {
      return parseFloat(amount).toFixed(8);
    } catch {
      return '0.00000000';
    }
  };

  // Get symbol from token string
  const getSymbol = (value: string | undefined): string => {
    if (!value) return 'WAX';
    const parts = value.split(' ');
    return parts[1] || 'WAX';
  };

  // Format token display
  const formatTokenDisplay = (value: string | undefined): string => {
    return `${formatNumber(value)} ${getSymbol(value)}`;
  };

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
                {formatTokenDisplay(poolData.total_staked_quantity)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-800/30 rounded-lg p-4">
            <Timer className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm text-slate-400">Weight</p>
              <p className="text-lg font-medium text-purple-200">
                {formatTokenDisplay(poolData.total_staked_weight)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-800/30 rounded-lg p-4">
            <TrendingUp className="w-8 h-8 text-purple-500" />
            <div>
              <p className="text-sm text-slate-400">Rewards</p>
              <p className="text-lg font-medium text-purple-200">
                {formatTokenDisplay(poolData.reward_pool?.quantity)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};