// src/components/Staking/ClaimRewards.tsx
import { useState } from 'react';
import { 
  Card, 
  Typography, 
  Button, 
  Progress, 
  AnimatedNumber,
  Badge 
} from '../common';
import { useStaking } from '../../hooks/useStaking';
import { usePoolHealth } from '../../hooks/usePoolHealth';
import { Gift, Clock, Zap } from 'lucide-react';

interface ClaimRewardsProps {
  onSuccess?: () => void;
}

const ClaimRewards = ({ onSuccess }: ClaimRewardsProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { 
    claim, 
    pendingRewards, 
    currentTier,
    claimCooldown,
    optimalClaimTime,
    rewardMultiplier 
  } = useStaking();
  
  const { poolHealth } = usePoolHealth();

  const handleClaim = async () => {
    setIsSubmitting(true);
    try {
      await claim();
      onSuccess?.();
    } catch (error) {
      console.error('Claim failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOptimalTime = optimalClaimTime <= Date.now();
  const canClaim = claimCooldown.timeRemaining <= 0;
  const cooldownProgress = ((claimCooldown.duration - claimCooldown.timeRemaining) / claimCooldown.duration) * 100;

  return (
    <Card variant="game">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Gift className="w-6 h-6 text-primary" />
          <Typography.H3>Pending Rewards</Typography.H3>
        </div>
        <Badge variant={`tier${currentTier.level}` as any}>
          {currentTier.name} Tier
        </Badge>
      </div>

      <div className="space-y-6">
        <div>
          <Typography.Label>Available to Claim</Typography.Label>
          <div className="flex items-baseline gap-2">
            <Typography.H2>
              <AnimatedNumber 
                value={pendingRewards} 
                precision={4}
                prefix="⟁ "
              />
            </Typography.H2>
            <Typography.Small className="text-green-500">
              {rewardMultiplier}x Multiplier
            </Typography.Small>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Typography.Label>Cooldown Status</Typography.Label>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <Typography.Small>
                {canClaim ? 'Ready to Claim' : `${Math.ceil(claimCooldown.timeRemaining / 60)}m remaining`}
              </Typography.Small>
            </div>
          </div>
          <Progress 
            value={cooldownProgress}
            max={100}
            variant={canClaim ? 'success' : 'default'}
            size="md"
            showLabel
          />
        </div>

        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-yellow-500" />
            <Typography.Label>Pool Health Impact</Typography.Label>
          </div>
          <div className="space-y-2">
            <Progress 
              value={poolHealth.currentHealth}
              max={100}
              variant={poolHealth.currentHealth > 70 ? 'success' : 
                      poolHealth.currentHealth > 40 ? 'warning' : 'danger'}
              size="sm"
              showLabel
            />
            <Typography.Small className="text-gray-500">
              {isOptimalTime ? 
                'Optimal time to claim! Pool health is favorable.' : 
                'Consider waiting for better pool conditions.'
              }
            </Typography.Small>
          </div>
        </div>

        <Button
          variant={isOptimalTime ? 'success' : 'primary'}
          size="lg"
          isLoading={isSubmitting}
          disabled={!canClaim || isSubmitting || pendingRewards <= 0}
          onClick={handleClaim}
          fullWidth
        >
          {!canClaim ? 'Cooling Down...' :
           pendingRewards <= 0 ? 'No Rewards Available' :
           isOptimalTime ? 'Claim Rewards (Optimal Time!)' : 'Claim Rewards'}
        </Button>
      </div>
    </Card>
  );
};

export default ClaimRewards;