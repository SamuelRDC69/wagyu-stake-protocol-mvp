import { Card, Typography, Badge } from '../common';
import { Crown } from 'lucide-react';

interface TierInfo {
  name: string;
  multiplier: number;
  color: string;
  progress: number;
  nextTier?: {
    name: string;
    requirement: number;
  };
}

const TierBadge = () => {
  const { currentTier, stakedAmount } = useStaking();
  
  const getTierInfo = (tier: string): TierInfo => {
    const tiers: Record<string, TierInfo> = {
      bronze: {
        name: 'Bronze',
        multiplier: 1.0,
        color: 'text-bronze',
        progress: 0,
        nextTier: {
          name: 'Silver',
          requirement: 1000
        }
      },
      silver: {
        name: 'Silver',
        multiplier: 1.5,
        color: 'text-silver',
        progress: 33,
        nextTier: {
          name: 'Gold',
          requirement: 5000
        }
      },
      gold: {
        name: 'Gold',
        multiplier: 2.0,
        color: 'text-gold',
        progress: 66,
        nextTier: {
          name: 'Diamond',
          requirement: 10000
        }
      },
      diamond: {
        name: 'Diamond',
        multiplier: 3.0,
        color: 'text-blue-500',
        progress: 100
      }
    };
    return tiers[tier];
  };

  const tierInfo = getTierInfo(currentTier);

  return (
    <Card variant="tier" className="relative">
      <div className="flex items-center gap-3 mb-4">
        <Crown className={`w-6 h-6 ${tierInfo.color}`} />
        <Typography.H3 className={tierInfo.color}>
          {tierInfo.name} Tier
        </Typography.H3>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Typography.Label>Reward Multiplier</Typography.Label>
          <Typography.H4 className={tierInfo.color}>
            {tierInfo.multiplier}x
          </Typography.H4>
        </div>
        <div>
          <Typography.Label className="mb-2">Tier Progress</Typography.Label>
          <Progress 
            value={tierInfo.progress} 
            max={100}
            variant="default"
            showLabel
          />
        </div>
        {tierInfo.nextTier && (
          <Typography.Small className="text-gray-500">
            Stake {tierInfo.nextTier.requirement - stakedAmount} more tokens to reach {tierInfo.nextTier.name} tier
          </Typography.Small>
        )}
      </div>
    </Card>
  );
};