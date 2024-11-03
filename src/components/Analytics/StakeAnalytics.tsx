// src/components/Analytics/StakeAnalytics.tsx
import { 
  Card, 
  Typography, 
  Progress, 
  AnimatedNumber,
  Badge 
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
import { useAnalytics } from '../../hooks/useAnalytics';
import { 
  TrendingUp, 
  BarChart2,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Users
} from 'lucide-react';

const StakeAnalytics = () => {
  const { 
    stakingMetrics,
    stakingHistory,
    projections,
    topStakers
  } = useAnalytics();

  return (
    <Card variant="game">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart2 className="w-6 h-6 text-primary" />
          <Typography.H3>Staking Analytics</Typography.H3>
        </div>
        <Badge variant="default">
          Last Updated: {new Date().toLocaleTimeString()}
        </Badge>
      </div>

      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stakingMetrics.map((metric, index) => (
            <div 
              key={index}
              className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg"
            >
              <Typography.Label>{metric.label}</Typography.Label>
              <div className="flex items-baseline gap-2">
                <Typography.H4>
                  <AnimatedNumber 
                    value={metric.value} 
                    precision={2}
                    prefix={metric.prefix}
                    suffix={metric.suffix}
                  />
                </Typography.H4>
                <div className={`flex items-center ${
                  metric.change >= 0 ? 'text-green-500' : 'text-red-500'
                }`}>
                  {metric.change >= 0 ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  <Typography.Small>
                    {Math.abs(metric.change)}%
                  </Typography.Small>
                </div>
              </div>
              <Typography.Small className="text-gray-500">
                vs last period
              </Typography.Small>
            </div>
          ))}
        </div>

        {/* Staking History Chart */}
        <div>
          <Typography.Label className="mb-4">Staking History</Typography.Label>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={stakingHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <RechartsTooltip />
              <Area 
                type="monotone" 
                dataKey="totalStaked" 
                stroke="#1cb095" 
                fill="#1cb09520"
                name="Total Staked"
              />
              <Area 
                type="monotone" 
                dataKey="activeStakers" 
                stroke="#646cff" 
                fill="#646cff20"
                name="Active Stakers"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Projections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-primary" />
              <Typography.Label>Growth Projections</Typography.Label>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={projections}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <RechartsTooltip />
                <Line 
                  type="monotone" 
                  dataKey="projected" 
                  stroke="#1cb095" 
                  strokeDasharray="5 5"
                  name="Projected"
                />
                <Line 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#646cff"
                  name="Actual"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top Stakers */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-primary" />
              <Typography.Label>Top Stakers</Typography.Label>
            </div>
            <div className="space-y-3">
              {topStakers.map((staker, index) => (
                <div 
                  key={index}
                  className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Badge variant="primary">#{index + 1}</Badge>
                      <div>
                        <Typography.Body>{staker.name}</Typography.Body>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-gray-500" />
                          <Typography.Small className="text-gray-500">
                            {staker.stakeDuration} days
                          </Typography.Small>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <AnimatedNumber 
                        value={staker.amount} 
                        precision={2}
                        prefix="⟁ "
                      />
                      <Typography.Small className={
                        staker.change >= 0 ? 'text-green-500' : 'text-red-500'
                      }>
                        {staker.change > 0 ? '+' : ''}{staker.change}%
                      </Typography.Small>
                    </div>
                  </div>
                  <Progress 
                    value={staker.amount}
                    max={topStakers[0].amount}
                    variant="primary"
                    size="sm"
                    className="mt-2"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StakeAnalytics;