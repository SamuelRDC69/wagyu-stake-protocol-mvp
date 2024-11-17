import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PoolEntity } from '../../lib/types/pool';

interface RewardsChartProps {
  poolData: Pick<PoolEntity, 'reward_pool' | 'emission_unit' | 'emission_rate' | 'last_emission_updated_at'>;
}

export const RewardsChart: React.FC<RewardsChartProps> = ({ poolData }) => {
  const chartData = useMemo(() => {
    const currentTime = new Date().getTime();
    const lastUpdate = new Date(poolData.last_emission_updated_at).getTime();
    const timeDiff = currentTime - lastUpdate;
    const currentRewards = parseFloat(poolData.reward_pool.quantity.split(' ')[0]);
    
    // Calculate projected rewards for next 24 hours
    const data = [];
    for (let i = 0; i <= 24; i++) {
      const timePoint = lastUpdate + (i * 3600000); // hourly points
      const projectedRewards = currentRewards + 
        ((timePoint - lastUpdate) / (poolData.emission_unit * 1000)) * poolData.emission_rate;
      
      data.push({
        time: new Date(timePoint).toLocaleTimeString(),
        rewards: projectedRewards.toFixed(8),
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
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '0.5rem'
                }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Line 
                type="monotone" 
                dataKey="rewards" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};