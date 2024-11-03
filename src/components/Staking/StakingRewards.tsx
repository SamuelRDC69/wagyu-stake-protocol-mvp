// src/components/Staking/StakingRewards.tsx
import { 
  Card, 
  Typography, 
  Badge, 
  Progress, 
  AnimatedNumber,
  Tooltip 
} from '../common';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { useStaking } from '../../hooks/useStaking';
import { 
  GiftIcon, 
  TrendingUp, 
  Calendar,
  HelpCircle 
} from 'lucide-react';

const StakingRewards = () => {
  const { 
    rewardsHistory,
    projectedRewards,
    totalRewards,
    rewardsStats
  } = useStaking();

  return (
    <Card variant="game">
      <div className="flex items-center gap-3 mb-6">
        <GiftIcon className="w-6 h-6 text-primary" />
        <Typography.H3>Rewards Analytics</Typography.H3>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <Typography.Label>Total Earned</Typography.Label>
            <Typography.H4>
              <AnimatedNumber 
                value={totalRewards} 
                precision={4}
                prefix="⟁ "
              />
            </Typography.H4>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Typography.Label>APR</Typography.Label>
              <Tooltip content="Annual Percentage Rate based on current rewards">
                <HelpCircle className="w-4 h-4 text-gray-500" />
              </Tooltip>
            </div>
            <Typography.H4>{rewardsStats.apr}%</Typography.H4>
          </div>
          <div>
            <Typography.Label>Best Day</Typography.Label>
            <Typography.H4>
              <AnimatedNumber 
                value={rewardsStats.bestDay} 
                precision={4}
                prefix="⟁ "
              />
            </Typography.H4>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-primary" />
            <Typography.Label>Rewards History</Typography.Label>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={rewardsHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
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
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <Typography.Label>Projected Rewards</Typography.Label>
          </div>
          <div className="space-y-3">
            {projectedRewards.map((period, index) => (
              <div key={index} className="flex justify-between items-center">
                <Typography.Label>{period.label}</Typography.Label>
                <div className="text-right">
                  <AnimatedNumber 
                    value={period.amount} 
                    precision={4}
                    prefix="⟁ "
                  />
                  <Typography.Small className="text-gray-500">
                    {period.change > 0 ? '+' : ''}{period.change}% vs previous
                  </Typography.Small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StakingRewards;