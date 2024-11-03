// src/components/Staking/StakingOverview.tsx
import { 
  Card, 
  Typography, 
  Badge, 
  Progress, 
  AnimatedNumber 
} from '../common';
import { useStaking } from '../../hooks/useStaking';
import { 
  BarChart3, 
  Timer, 
  TrendingUp, 
  Award 
} from 'lucide-react';

const StakingOverview = () => {
  const { 
    stakedAmount, 
    rewardsRate,
    currentTier,
    stakingStats,
    nextTierProgress
  } = useStaking();

  return (
    <Card variant="game">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-primary" />
          <Typography.H3>Staking Overview</Typography.H3>
        </div>
        <Badge variant={`tier${currentTier.level}` as any}>
          {currentTier.name} Tier
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Typography.Label>Total Staked</Typography.Label>
            <Typography.H3>
              <AnimatedNumber 
                value={stakedAmount} 
                precision={4}
                prefix="⟁ "
              />
            </Typography.H3>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <Timer className="w-4 h-4 text-primary" />
              <Typography.Label>Rewards Rate</Typography.Label>
            </div>
            <Typography.H4>
              <AnimatedNumber 
                value={rewardsRate} 
                precision={4}
                suffix=" tokens/hour"
              />
            </Typography.H4>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <Typography.Label>Performance</Typography.Label>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Typography.Small>24h</Typography.Small>
                <Typography.H4 className={stakingStats.day > 0 ? 'text-green-500' : 'text-red-500'}>
                  {stakingStats.day > 0 ? '+' : ''}{stakingStats.day}%
                </Typography.H4>
              </div>
              <div>
                <Typography.Small>7d</Typography.Small>
                <Typography.H4 className={stakingStats.week > 0 ? 'text-green-500' : 'text-red-500'}>
                  {stakingStats.week > 0 ? '+' : ''}{stakingStats.week}%
                </Typography.H4>
              </div>
            </div>
          </div>

          {nextTierProgress && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-primary" />
                <Typography.Label>Next Tier Progress</Typography.Label>
              </div>
              <Progress 
                value={nextTierProgress.current}
                max={nextTierProgress.required}
                variant="primary"
                size="md"
                showLabel
              />
              <Typography.Small className="text-gray-500 mt-2">
                Stake {nextTierProgress.remaining} more tokens to reach {nextTierProgress.nextTier}
              </Typography.Small>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default StakingOverview;