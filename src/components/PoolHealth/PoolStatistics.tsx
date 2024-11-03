// src/components/PoolHealth/PoolStatistics.tsx
import { 
  Card, 
  Typography, 
  Progress, 
  Badge, 
  AnimatedNumber 
} from '../common';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip 
} from 'recharts';
import { usePoolHealth } from '../../hooks/usePoolHealth';

const PoolStatistics = () => {
  const { 
    totalStaked, 
    activeStakers,
    avgStakeTime,
    tierDistribution,
    volumeStats
  } = usePoolHealth();

  return (
    <Card variant="game">
      <Typography.H3 className="mb-6">Pool Statistics</Typography.H3>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <div>
          <Typography.Label>Total Staked</Typography.Label>
          <Typography.H4>
            <AnimatedNumber 
              value={totalStaked} 
              precision={2}
              prefix="⟁ "
            />
          </Typography.H4>
        </div>
        <div>
          <Typography.Label>Active Stakers</Typography.Label>
          <Typography.H4>{activeStakers}</Typography.H4>
        </div>
        <div>
          <Typography.Label>Avg Stake Time</Typography.Label>
          <Typography.H4>{avgStakeTime} days</Typography.H4>
        </div>
        <div>
          <Typography.Label>24h Volume</Typography.Label>
          <Typography.H4>
            <AnimatedNumber 
              value={volumeStats.daily} 
              precision={2}
              prefix="⟁ "
            />
          </Typography.H4>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Typography.Label className="mb-4">Tier Distribution</Typography.Label>
          <div className="space-y-3">
            {tierDistribution.map((tier, index) => (
              <div key={index}>
                <div className="flex justify-between mb-1">
                  <Badge variant={`tier${tier.level}` as any}>
                    {tier.name}
                  </Badge>
                  <Typography.Small>{tier.percentage}%</Typography.Small>
                </div>
                <Progress 
                  value={tier.percentage} 
                  max={100}
                  variant={`tier${tier.level}` as any}
                  size="sm"
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <Typography.Label className="mb-4">Volume Trends</Typography.Label>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={volumeStats.hourly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <RechartsTooltip />
              <Line 
                type="monotone" 
                dataKey="volume" 
                stroke="#1cb095" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};

export default PoolStatistics;