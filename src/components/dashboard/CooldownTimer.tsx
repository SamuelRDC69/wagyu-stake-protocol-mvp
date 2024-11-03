import { useState, useEffect } from 'react';
import { Card, Typography, Progress } from '../common';
import { useCooldown } from '../../hooks/useCooldown';
import { Clock } from 'lucide-react';

const CooldownTimer = () => {
  const { timeUntilNextClaim, cooldownPeriod } = useCooldown();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(((cooldownPeriod - timeUntilNextClaim) / cooldownPeriod) * 100);
  }, [timeUntilNextClaim, cooldownPeriod]);

  return (
    <Card variant="game" className="relative">
      <div className="flex items-center gap-3 mb-4">
        <Clock className="w-6 h-6 text-primary" />
        <Typography.H3>Cooldown Timer</Typography.H3>
      </div>
      <div className="space-y-4">
        <Progress 
          value={progress} 
          max={100}
          variant={progress === 100 ? 'success' : 'default'}
          size="lg"
          showLabel
        />
        <div className="flex justify-between items-center">
          <Typography.Small className="text-gray-500">
            {timeUntilNextClaim > 0 ? (
              `${Math.floor(timeUntilNextClaim / 60)}m ${timeUntilNextClaim % 60}s remaining`
            ) : (
              'Ready to claim!'
            )}
          </Typography.Small>
          {progress === 100 && (
            <Typography.Small className="text-green-500 font-semibold">
              Claim Available!
            </Typography.Small>
          )}
        </div>
      </div>
    </Card>
  );
};