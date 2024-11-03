// src/components/Strategy/PoolForecast.tsx
import { 
  Card, 
  Typography, 
  Badge,
  AnimatedNumber,
  Tooltip 
} from '../common';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip 
} from 'recharts';
import { useClaimStrategy } from '../../hooks/useClaimStrategy';
import { 
  TrendingUp, 
  Activity,
  Users,
  Timer 
} from 'lucide-react';

const PoolForecast = () => {
  const { 
    healthForecast,
    activityMetrics,
    predictedOptimalWindows,
    confidenceScore
  } = useClaimStrategy();

  return (
    <Card variant="game">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-6 h-6 text-primary" />
          <Typography.H3>Pool Forecast</Typography.H3>
        </div>
        <Tooltip content="Forecast confidence based on historical data">
          <Badge variant={confidenceScore >= 70 ? 'success' : 'warning'}>
            {confidenceScore}% Confidence
          </Badge>
        </Tooltip>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-primary" />
            <Typography.Label>Health Projection</Typography.Label>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={healthForecast}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <RechartsTooltip />
              <Area 
                type="monotone" 
                dataKey="health" 
                stroke="#1cb095" 
                fill="#1cb09520" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-primary" />
              <Typography.Label>Active Users</Typography.Label>
            </div>
            <Typography.H4>
              <AnimatedNumber 
                value={activityMetrics.activeUsers}
                precision={0}
              />
            </Typography.H4>
            <Typography.Small className={activityMetrics.usersTrend >= 0 ? 'text-green-500' : 'text-red-500'}>
              {activityMetrics.usersTrend > 0 ? '+' : ''}{activityMetrics.usersTrend}% vs 1h ago
            </Typography.Small>
          </div>

          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-primary" />
              <Typography.Label>Claim Rate</Typography.Label>
            </div>
            <Typography.H4>
              {activityMetrics.claimsPerHour}/hr
            </Typography.H4>
            <Typography.Small className={activityMetrics.claimsTrend >= 0 ? 'text-green-500' : 'text-red-500'}>
              {activityMetrics.claimsTrend > 0 ? '+' : ''}{activityMetrics.claimsTrend}% vs 1h ago
            </Typography.Small>
          </div>

          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Timer className="w-4 h-4 text-primary" />
              <Typography.Label>Avg Time Between Claims</Typography.Label>
            </div>
            <Typography.H4>{activityMetrics.avgTimeBetweenClaims}m</Typography.H4>
            <Typography.Small className="text-gray-500">
              Historical average
            </Typography.Small>
          </div>
        </div>

        <div>
          <Typography.Label className="mb-4">Optimal Claim Windows</Typography.Label>
          <div className="space-y-3">
            {predictedOptimalWindows.map((window, index) => (
              <div 
                key={index}
                className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"
              >
                <div>
                  <Typography.Body>{window.timeRange}</Typography.Body>
                  <Typography.Small className="text-gray-500">
                    {window.competingClaims} competing claims expected
                  </Typography.Small>
                </div>
                <div className="text-right">
                  <Badge variant={window.optimality >= 80 ? 'success' : 'warning'}>
                    {window.optimality}% Optimal
                  </Badge>
                  <Typography.Small className="text-gray-500">
                    +{window.projectedBonus}% bonus
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

export default PoolForecast;