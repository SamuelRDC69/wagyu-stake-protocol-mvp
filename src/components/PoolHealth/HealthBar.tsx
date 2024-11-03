// src/components/PoolHealth/HealthBar.tsx
import { useState, useMemo } from 'react';
import { 
  Card, 
  Typography, 
  Progress, 
  Badge, 
  Tooltip 
} from '../common';
import { usePoolHealth } from '../../hooks/usePoolHealth';
import { 
  Activity, 
  TrendingDown, 
  TrendingUp, 
  AlertCircle
} from 'lucide-react';

const HealthBar = () => {
  const { 
    poolHealth, 
    recentDepletion,
    projectedHealth,
    topDepleting 
  } = usePoolHealth();

  const healthStatus = useMemo(() => {
    if (poolHealth.currentHealth >= 70) return { label: 'Healthy', variant: 'success' };
    if (poolHealth.currentHealth >= 40) return { label: 'Warning', variant: 'warning' };
    return { label: 'Critical', variant: 'danger' };
  }, [poolHealth.currentHealth]);

  return (
    <Card variant="game" className="relative">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className="w-6 h-6 text-primary" />
          <Typography.H3>Pool Health</Typography.H3>
        </div>
        <Badge variant={healthStatus.variant as any}>
          {healthStatus.label}
        </Badge>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <Typography.Label>Current Health</Typography.Label>
            <Typography.H4>{poolHealth.currentHealth}%</Typography.H4>
          </div>
          <Progress 
            value={poolHealth.currentHealth} 
            max={100}
            variant={healthStatus.variant as any}
            size="lg"
            showLabel
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Typography.Label className="mb-2">24h Change</Typography.Label>
            <div className="flex items-center gap-2">
              {recentDepletion > 0 ? (
                <TrendingDown className="w-5 h-5 text-red-500" />
              ) : (
                <TrendingUp className="w-5 h-5 text-green-500" />
              )}
              <Typography.H4 className={recentDepletion > 0 ? 'text-red-500' : 'text-green-500'}>
                {Math.abs(recentDepletion)}%
              </Typography.H4>
            </div>
          </div>

          <div>
            <Typography.Label className="mb-2">Projected</Typography.Label>
            <div className="flex items-center gap-2">
              <Typography.H4>{projectedHealth}%</Typography.H4>
              {projectedHealth < poolHealth.currentHealth && (
                <Tooltip content="Based on pending claims and current depletion rate">
                  <AlertCircle className="w-4 h-4 text-yellow-500" />
                </Tooltip>
              )}
            </div>
          </div>
        </div>

        {topDepleting.length > 0 && (
          <div>
            <Typography.Label className="mb-2">Top Depleting Tiers</Typography.Label>
            <div className="space-y-2">
              {topDepleting.map((tier, index) => (
                <div key={index} className="flex justify-between items-center">
                  <Badge variant={`tier${tier.level}` as any}>
                    {tier.name}
                  </Badge>
                  <Typography.Small>{tier.depletionRate}%/hour</Typography.Small>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default HealthBar;