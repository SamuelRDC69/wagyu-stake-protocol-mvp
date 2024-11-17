import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Crown, TrendingUp, TrendingDown } from 'lucide-react';
import { TierEntity, TierProgress } from '../../lib/types/tier';
import { getTierColor } from '../../lib/utils/tierUtils';
import { formatPercent } from '../../lib/utils/formatUtils';

interface TierDisplayProps {
  tierProgress: TierProgress;
  isUpgradeAvailable: boolean;
}

export const TierDisplay: React.FC<TierDisplayProps> = ({
  tierProgress,
  isUpgradeAvailable
}) => {
  const {
    currentTier,
    nextTier,
    prevTier,
    progress,
    requiredForNext,
    requiredForCurrent
  } = tierProgress;

  return (
    <Card className="w-full hover:scale-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Crown className={getTierColor(currentTier.tier)} />
            {currentTier.tier_name}
            {isUpgradeAvailable && (
              <Badge variant="gold" className="animate-pulse ml-2">
                Upgrade Available!
              </Badge>
            )}
          </CardTitle>
          <Badge 
            variant={currentTier.tier.toLowerCase() as 'bronze' | 'silver' | 'gold'} 
            className="ml-2"
          >
            {`${currentTier.weight}x Weight`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Progress 
              value={progress} 
              className="h-2" 
              color={getTierColor(currentTier.tier)}
            />
            <div className="flex justify-between text-xs text-slate-400">
              {prevTier && (
                <div className="flex items-center">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  <span>{formatPercent(prevTier.staked_up_to_percent)}</span>
                </div>
              )}
              <span className="font-medium text-purple-300">
                {formatPercent(progress)}
              </span>
              {nextTier && (
                <div className="flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  <span>{formatPercent(nextTier.staked_up_to_percent)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-400">Current Requirement</p>
              <p className="font-medium text-purple-200">
                {formatPercent(requiredForCurrent)}
              </p>
            </div>
            {nextTier && (
              <div>
                <p className="text-slate-400">Next Tier at</p>
                <p className="font-medium text-purple-200">
                  {formatPercent(requiredForNext || 0)}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};