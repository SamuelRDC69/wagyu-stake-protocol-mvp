// src/components/Analytics/PerformanceMetrics.tsx
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
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip 
} from 'recharts';
import { useAnalytics } from '../../hooks/useAnalytics';
import { 
  Zap, 
  TrendingUp,
  Server,
  Activity
} from 'lucide-react';

const PerformanceMetrics = () => {
  const { 
    systemMetrics,
    gasUsage,
    responseTime,
    errorRates
  } = useAnalytics();

  return (
    <Card variant="game">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Zap className="w-6 h-6 text-primary" />
          <Typography.H3>Performance Metrics</Typography.H3>
        </div>
      </div>

      <div className="space-y-6">
        {/* System Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {systemMetrics.map((metric, index) => (
            <div 
              key={index}
              className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg"
            >
              <div className="flex items-center gap-2 mb-2">
                <Server className="w-4 h-4 text-primary" />
                <Typography.Label>{metric.label}</Typography.Label>
              </div>
              <Typography.H4>
                <AnimatedNumber 
                  value={metric.value} 
                  precision={metric.precision || 0}
                  suffix={metric.suffix}
                />
              </Typography.H4>
              <Progress 
                value={metric.current}
                max={metric.max}
                variant={
                  metric.current / metric.max < 0.7 ? 'success' :
                  metric.current / metric.max < 0.9 ? 'warning' :
                  'danger'
                }
                size="sm"
                className="mt-2"
              />
            </div>
          ))}
        </div>

        {/* Response Time Graph */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              <Typography.Label>Response Time</Typography.Label>
            </div>
            <Badge variant={
              responseTime.average < 100 ? 'success' :
              responseTime.average < 300 ? 'warning' :
              'danger'
            }>
              {responseTime.average}ms Avg
            </Badge>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={responseTime.history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <RechartsTooltip />
              <Line 
                type="monotone" 
                dataKey="time" 
                stroke="#1cb095" 
                name="Response Time (ms)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gas Usage & Error Rates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Typography.Label className="mb-4">Gas Usage</Typography.Label>
            <div className="space-y-3">
              {gasUsage.map((operation, index) => (
                <div 
                  key={index}
                  className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex justify-between items-center mb-2">
                    <Typography.Body>{operation.name}</Typography.Body>
                    <Typography.Body>
                      {operation.gasUsed} gas
                    </Typography.Body>
                  </div>
                  <Progress 
                    value={operation.gasUsed}
                    max={operation.gasLimit}
                    variant="primary"
                    size="sm"
                  />
                  <Typography.Small className="text-gray-500 mt-1">
                    {operation.frequency} calls/hour
                  </Typography.Small>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Typography.Label className="mb-4">Error Rates</Typography.Label>
            <div className="space-y-3">
              {errorRates.map((error, index) => (
                <div 
                  key={index}
                  className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={
                      error.rate < 0.1 ? 'success' :
                      error.rate < 1 ? 'warning' :
                      'danger'
                    }>
                      {error.rate}%
                    </Badge>
                    <Typography.Body>{error.type}</Typography.Body>
                  </div>
                  <Typography.Small className="text-gray-500">
                    {error.description}
                  </Typography.Small>
                  <div className="flex items-center gap-2 mt-2">
                    <TrendingUp className={`w-4 h-4 ${
                      error.trend < 0 ? 'text-green-500' : 'text-red-500'
                    }`} />
                    <Typography.Small className={
                      error.trend < 0 ? 'text-green-500' : 'text-red-500'
                    }>
                      {error.trend > 0 ? '+' : ''}{error.trend}% vs last hour
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

export default PerformanceMetrics;