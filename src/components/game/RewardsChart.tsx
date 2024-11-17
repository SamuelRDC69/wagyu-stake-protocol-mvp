import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  TooltipProps 
} from 'recharts';
import { PoolEntity } from '../../lib/types/pool';
import { parseTokenString } from '../../lib/utils/tokenUtils';
import { formatNumber } from '../../lib/utils/formatUtils';

interface RewardsChartProps {
  poolData: Pick<PoolEntity, 'reward_pool' | 'emission_unit' | 'emission_rate' | 'last_emission_updated_at'>;
}

interface ChartDataPoint {
  time: string;
  rewards: number;
  formatted: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: ChartDataPoint;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-700 p-2 rounded-lg">
        <p className="text-sm text-slate-300">{label}</p>
        <p className="text-sm font-medium text-purple-300">
          {payload[0].payload.formatted}
        </p>
      </div>
    );
  }
  return null;
};

export const RewardsChart: React.FC<RewardsChartProps> = ({ poolData }) => {
  const chartData = useMemo(() => {
    const data: ChartDataPoint[] = [];
    const currentTime = new Date().getTime();
    const lastUpdate = new Date(poolData.last_emission_updated_at).getTime();
    const { amount: currentRewards, symbol } = parseTokenString(poolData.reward_pool.quantity);
    
    // Calculate 24 hourly points
    for (let i = 0; i <= 24; i++) {
      const timePoint = lastUpdate + (i * 3600000); // hourly points
      const emissionTime = (timePoint - lastUpdate) / 1000; // seconds
      const newEmissions = (emissionTime / poolData.emission_unit) * poolData.emission_rate;
      const projectedRewards = currentRewards + newEmissions;

      data.push({
        time: new Date(timePoint).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        rewards: projectedRewards,
        formatted: `${formatNumber(projectedRewards)} ${symbol}`
      });
    }
    
    return data;
  }, [poolData]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Rewards Pool Projection</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="time" 
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8' }}
              />
              <YAxis 
                stroke="#94a3b8"
                tick={{ fill: '#94a3b8' }}
                tickFormatter={(value: number) => formatNumber(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="rewards" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: '#8b5cf6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};