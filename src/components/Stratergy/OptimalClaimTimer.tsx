// src/components/Strategy/OptimalClaimTimer.tsx
import { useMemo } from 'react';
import { 
  Card, 
  Typography, 
  Progress, 
  Badge, 
  AnimatedNumber,
  Tooltip 
} from '../common';
import { useClaimStrategy } from '../../hooks/useClaimStrategy';
import { usePoolHealth } from '../../hooks/usePoolHealth';
import { 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  Users 
} from 'lucide-react';

const OptimalClaimTimer = () => {
  const { 
    optimalClaimTime, 
    timeUntilOptimal,
    projectedReward,
    competingClaims,
    confidenceScore 
  } = useClaimStrategy();
  
  const { poolHealth } = usePoolHealth();

  const optimality = useMemo(() => {
    if (confidenceScore >= 80) return { label: 'Highly Optimal', variant: 'success' };
    if (confidenceScore >= 60) return { label: 'Moderately Optimal', variant: 'warning' };
    return { label: 'Sub-Optimal', variant: 'danger' };
  }, [confidenceScore]);

  return (
    <Card variant="game">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-primary" />
          <Typography.H3>Optimal Claim Timer</Typography.H3>
        </div>
        <Badge variant={optimality.variant as any}>
          {optimality.label}
        </Badge>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Typography.Label>Time Until Optimal</Typography.Label>
            <div className="flex items-baseline gap-2">
              <Typography.H3>
                {Math.floor(timeUntilOptimal / 3600)}h {Math.floor((timeUntilOptimal % 3600) / 60)}m
              </Typography.H3>
              <Typography.Small className="text-gray-500">
                {new Date(optimalClaimTime).toLocaleTimeString()}
              </Typography.Small>
            </div>
          </div>

          <div>
            <Typography.Label>Projected Reward</Typography.Label>
            <div className="flex items-center gap-2">
              <Typography.H3>
                <AnimatedNumber 
                  value={projectedReward.amount} 
                  precision={4}
                  prefix="⟁ "
                />
              </Typography.H3>
              <Typography.Small className={projectedReward.change >= 0 ? 'text-green-500' : 'text-red-500'}>
                {projectedReward.change > 0 ? '+' : ''}{projectedReward.change}%
              </Typography.Small>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Typography.Label>Claim Window Optimality</Typography.Label>
            <Typography.Small>{confidenceScore}%</Typography.Small>
          </div>
          <Progress 
            value={confidenceScore}
            max={100}
            variant={optimality.variant as any}
            size="lg"
            showLabel
          />
        </div>

        <div className="grid grid-cols-2 gap-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-primary" />
              <Typography.Label>Competing Claims</Typography.Label>
            </div>
            <div className="flex items-baseline gap-2">
              <Typography.H4>{competingClaims.count}</Typography.H4>
              <Typography.Small className="text-gray-500">players</Typography.Small>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <Typography.Label>Pool Health</Typography.Label>
            </div>
            <Typography.H4>{poolHealth.currentHealth}%</Typography.H4>
          </div>
        </div>

        {competingClaims.count > 10 && (
          <div className="flex items-center gap-2 p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <Typography.Small>
              High competition detected. Consider adjusting your claim timing.
            </Typography.Small>
          </div>
        )}
      </div>
    </Card>
  );
};

export default OptimalClaimTimer;