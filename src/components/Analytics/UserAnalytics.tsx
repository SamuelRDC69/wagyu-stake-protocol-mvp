// src/components/Analytics/UserAnalytics.tsx
import { 
  Card, 
  Typography, 
  Progress, 
  AnimatedNumber,
  Badge 
} from '../common';
import { 
  AreaChart, 
  Area,
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
  Users, 
  TrendingUp,
  Clock,
  Target,
  Award
} from 'lucide-react';

const UserAnalytics = () => {
  const { 
    userMetrics,
    retentionData,
    activityPatterns,
    performanceStats
  } = useAnalytics();

  return (
    <Card variant="game">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-primary" />
          <Typography.H3>User Analytics</Typography.H3>
        </div>
      </div>

      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {userMetrics.map((metric, index) => (
            <div 
              key={index}
              className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg"
            >
              <Typography.Label>{metric.label}</Typography.Label>
              <Typography.H4>
                <AnimatedNumber 
                  value={metric.value} 
                  precision={metric.precision || 0}
                  suffix={metric.suffix}
                />
              </Typography.H4>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <Typography.Small className={
                  metric.trend >= 0 ? 'text-green-500' : 'text-red-500'
                }>
                  {metric.trend > 0 ? '+' : ''}{metric.trend}% (24h)
                </Typography.Small>
              </div>
            </div>
          ))}
        </div>

        {/* Retention Chart */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <Typography.Label>User Retention</Typography.Label>
            </div>
            <Badge variant="success">
              {retentionData.averageRetention}% Avg. Retention
            </Badge>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={retentionData.daily}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <RechartsTooltip />
              <Area
                type="monotone"
                dataKey="retention"
                stroke="#1cb095"
                fill="#1cb09520"
                name="Retention Rate"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Activity Patterns */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-primary" />
              <Typography.Label>Activity Patterns</Typography.Label>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={activityPatterns}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <RechartsTooltip />
                <Bar 
                  dataKey="activeUsers" 
                  fill="#1cb095" 
                  name="Active Users"
                />
                <Bar 
                  dataKey="transactions" 
                  fill="#646cff" 
                  name="Transactions"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Performance Stats */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-4 h-4 text-primary" />
              <Typography.Label>User Performance</Typography.Label>
            </div>
            <div className="space-y-4">
              {performanceStats.map((stat, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <Typography.Body>{stat.category}</Typography.Body>
                    <Typography.Body className="font-medium">
                      {stat.value}
                    </Typography.Body>
                  </div>
                  <Progress 
                    value={stat.percentile}
                    max={100}
                    variant={
                      stat.percentile >= 75 ? 'success' :
                      stat.percentile >= 50 ? 'warning' :
                      'default'
                    }
                    size="sm"
                  />
                  <Typography.Small className="text-gray-500">
                    Top {stat.percentile}% of users
                  </Typography.Small>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Segments */}
        <div className="p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
          <Typography.Label className="mb-4">User Segments</Typography.Label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {userMetrics.segments.map((segment, index) => (
              <div key={index} className="text-center">
                <div className="inline-block p-3 rounded-full bg-primary/20 mb-2">
                  {segment.icon}
                </div>
                <Typography.Body className="font-medium">
                  {segment.name}
                </Typography.Body>
                <Typography.H4>
                  {segment.percentage}%
                </Typography.H4>
                <Typography.Small className="text-gray-500">
                  {segment.count} users
                </Typography.Small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default UserAnalytics;