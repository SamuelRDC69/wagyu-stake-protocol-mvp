import { useEffect, useMemo } from 'react';
import { Card, Typography, Progress, AnimatedNumber } from '../common';
import { usePoolHealth } from '../../hooks/usePoolHealth';
import { useCooldown } from '../../hooks/useCooldown';
import { Gauge } from 'lucide-react';

const ClaimProjectionGauge = () => {
  const { poolHealth, emissionRate } = usePoolHealth();
  const { timeUntilNextClaim } = useCooldown();
  
  const projectedReward = useMemo(() => {
    // Calculate projected reward based on pool health and emission rate
    const baseReward = poolHealth.rewardPool * (emissionRate / 100);
    const healthMultiplier = Math.max(0.5, poolHealth.currentHealth / 100);
    return baseReward * healthMultiplier;
  }, [poolHealth, emissionRate]);

  return (
    <Card variant="game" className="relative">
      <div className="flex items-center gap-3 mb-4">
        <Gauge className="w-6 h-6 text-primary" />
        <Typography.H3>Reward Projection</Typography.H3>
      </div>
      <div className="space-y-4">
        <div>
          <Typography.Label className="mb-2">Estimated Reward</Typography.Label>
          <div className="text-3xl font-bold">
            <AnimatedNumber 
              value={projectedReward} 
              precision={4} 
              prefix="⟁ "
            />
          </div>
        </div>
        <div>
          <Typography.Label className="mb-2">Pool Health Impact</Typography.Label>
          <Progress 
            value={poolHealth.currentHealth} 
            max={100}
            variant={poolHealth.currentHealth > 70 ? 'success' : 
                    poolHealth.currentHealth > 30 ? 'warning' : 'danger'}
            showLabel
          />
        </div>
        {timeUntilNextClaim > 0 && (
          <Typography.Small className="text-gray-500">
            Next claim available in {Math.ceil(timeUntilNextClaim / 60)} minutes
          </Typography.Small>
        )}
      </div>
    </Card>
  );
};