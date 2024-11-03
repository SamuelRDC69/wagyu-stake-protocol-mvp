// src/components/Analytics/PoolAnalytics.tsx
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
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip 
} from 'recharts';
import { useAnalytics } from '../../hooks/useAnalytics';
import { 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Droplet,
  Timer
} from 'lucide-react';

const PoolAnalytics = () => {
  const { 
    poolMetrics,
    emissionData,
    claimPatterns,
    healthHistory
  } = useAnalytics();

  const COLORS = ['#1cb095', '#646cff', '#ff6b6b', '#ffd93d'];

  return (
    <Card variant="game">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-primary" />
          <Typography.H3>Pool Analytics</Typography.H3>
        </div>
      </div>

      <div className="space-y-6">
        {/* Health and Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {poolMetrics.map((metric, index) => (
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
            </div>
          ))}
        </div>

        {/* Health History Chart */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Droplet className="w-4 h-4 text-primary" />
            <Typography.Label>Pool Health History</Typography.Label>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={healthHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <RechartsTooltip />
              <Area 
                type="monotone" 
                dataKey="health" 
                stroke="#1cb095" 
                fill="#1cb09520"
                name="Health"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Emission Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Timer className="w-4 h-4 text-primary" />
              <Typography.Label>Emission Distribution</Typography.Label>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={emissionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {emissionData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Claim Patterns */}
          <div>
            <Typography.Label className="mb-4">Claim Patterns</Typography.Label>
            <div className="space-y-3">
              {claimPatterns.map((pattern, index) => (
                <div 
                  key={index}
                  className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex justify-between items-center mb-2">
                    <Typography.Body>{pattern.timeframe}</Typography.Body>
                    <Typography.Body>
                      {pattern.claimCount} claims
                    </Typography.Body>
                  </div>
                  <Progress 
                    value={pattern.claimCount}
                    max={Math.max(...claimPatterns.map(p => p.claimCount))}
                    variant="primary"
                    size="sm"
                  />
                  <Typography.Small className="text-gray-500 mt-1">
                    Average: {pattern.averageAmount} tokens
                  </Typography.Small>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PoolAnalytics;