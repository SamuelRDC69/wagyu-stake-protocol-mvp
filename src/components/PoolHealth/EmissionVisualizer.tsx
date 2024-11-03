// src/components/PoolHealth/EmissionVisualizer.tsx
import { 
  Card, 
  Typography, 
  AnimatedNumber 
} from '../common';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip 
} from 'recharts';
import { usePoolHealth } from '../../hooks/usePoolHealth';
import { Droplet } from 'lucide-react';

const EmissionVisualizer = () => {
  const { emissionRate, emissionHistory, projectedEmissions } = usePoolHealth();

  return (
    <Card variant="game">
      <div className="flex items-center gap-3 mb-6">
        <Droplet className="w-6 h-6 text-primary" />
        <Typography.H3>Token Emissions</Typography.H3>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Typography.Label>Current Rate</Typography.Label>
            <Typography.H4>
              <AnimatedNumber 
                value={emissionRate} 
                precision={2}
                suffix=" tokens/hour"
              />
            </Typography.H4>
          </div>
          <div>
            <Typography.Label>24h Total</Typography.Label>
            <Typography.H4>
              <AnimatedNumber 
                value={emissionHistory.reduce((acc, curr) => acc + curr.amount, 0)} 
                precision={2}
                prefix="⟁ "
              />
            </Typography.H4>
          </div>
        </div>

        <div>
          <Typography.Label className="mb-4">Emission History</Typography.Label>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={emissionHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <RechartsTooltip />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#1cb095" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div>
          <Typography.Label className="mb-4">Projected Emissions</Typography.Label>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={projectedEmissions}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <RechartsTooltip />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#1cb095"
                fill="#1cb09520"
                strokeDasharray="5 5"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};

export default EmissionVisualizer;