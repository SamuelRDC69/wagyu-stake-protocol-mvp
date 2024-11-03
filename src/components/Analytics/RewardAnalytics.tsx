// src/components/Analytics/RewardAnalytics.tsx
import { 
  Card, 
  Typography, 
  Badge,
  AnimatedNumber 
} from '../common';
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip 
} from 'recharts';
import { useAnalytics } from '../../hooks/useAnalytics';
import { 
  Gift,
  TrendingUp,
  Clock,
  Users,
  Award
} from 'lucide-react';

const RewardAnalytics = () => {
  const { 
    rewardMetrics,
    distributionHistory,
    tierStatistics,
    rewardPredictions
  } = useAnalytics();

  return (
    <Card variant="game">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Gift className="w-6 h-6 text-primary" />
          <Typography.H3>Reward Analytics</Typography.H3>
        </div>
      </div>

      <div className="space-y-6">
        {/* Reward Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rewardMetrics.map((metric, index) => (
            <div 
              key={index}
              className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg"
            >
              <Typography.Label>{metric.label}</Typography.Label>
              <Typography.H4>
                <AnimatedNumber 
                  value={metric.value} 
                  precision={2}
                  prefix="⟁ "
                />
              </Typography.H4>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="w-4 h-4 text-gray-500" />
                <Typography.Small className="text-gray-500">
                  {metric.timeframe}
                </Typography.Small>
              </div>
            </div>
          ))}
        </div>

        {/* Distribution History */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <Typography.Label>Reward Distribution History</Typography.Label>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={distributionHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <RechartsTooltip />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#1cb095" 
                name="Reward Amount"
              />
              <Line 
                type="monotone" 
                dataKey="claims" 
                stroke="#646cff" 
                name="Claim Count"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Tier Statistics */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-primary" />
            <Typography.Label>Tier Performance</Typography.Label>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={tierStatistics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tier" />
              <YAxis />
              <RechartsTooltip />
              <Bar dataKey="averageReward" fill="#1cb095" name="Average Reward" />
              <Bar dataKey="claimFrequency" fill="#646cff" name="Claim Frequency" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Reward Predictions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-primary" />
              <Typography.Label>Next 24h Predictions</Typography.Label>
            </div>
            <div className="space-y-3">
              {rewardPredictions.map((prediction, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <Typography.Body>{prediction.timeframe}</Typography.Body>
                    <Typography.Body>
                      <AnimatedNumber 
                        value={prediction.amount} 
                        precision={2}
                        prefix="⟁ "
                      />
                    </Typography.Body>
                  </div>
                  <div className="flex items-center gap-2">
                    <Typography.Small className="text-gray-500">
                      {prediction.claimCount} expected claims
                    </Typography.Small>
                    <Badge variant={prediction.confidence >= 70 ? 'success' : 'warning'}>
                      {prediction.confidence}% confidence
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg border border-green-500/20">
            <Typography.Label className="mb-4">Optimization Tips</Typography.Label>
            <div className="space-y-4">
              {rewardMetrics.optimizationTips.map((tip, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center mt-1">
                    {index + 1}
                  </div>
                  <div>
                    <Typography.Body className="font-medium">
                      {tip.title}
                    </Typography.Body>
                    <Typography.Small className="text-gray-500">
                      {tip.description}
                    </Typography.Small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default RewardAnalytics;