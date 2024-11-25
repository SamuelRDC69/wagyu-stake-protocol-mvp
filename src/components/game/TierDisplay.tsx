import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TierProgress } from '@/lib/types/tier';
import { getTierConfig, getProgressColor, calculateRequiredTokens } from '@/lib/utils/tierUtils';
import { cn } from '@/lib/utils';

interface TierDisplayProps {
  tierProgress?: TierProgress;
  isUpgradeAvailable: boolean;
  isLoading?: boolean;
}

export const TierDisplay: React.FC<TierDisplayProps> = ({
  tierProgress,
  isUpgradeAvailable,
  isLoading
}) => {
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-700 rounded w-1/4" />
            <div className="h-4 bg-slate-700 rounded w-1/2" />
            <div className="h-4 bg-slate-700 rounded w-1/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!tierProgress) {
    return (
      <Card className="w-full crystal-bg">
        <CardContent className="p-6">
          <p className="text-center text-slate-400">No tier data available</p>
        </CardContent>
      </Card>
    );
  }

  const tierConfig = getTierConfig(tierProgress.currentTier.tier);
  const TierIcon = tierConfig.icon;

  return (
    <Card className="w-full crystal-bg group">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className={cn("p-2 rounded-lg transition-all", tierConfig.bgColor)}>
              <TierIcon className={cn("w-6 h-6", tierConfig.color)} />
            </div>
            <span className="text-white">{tierProgress.currentTier.tier_name}</span>
            {isUpgradeAvailable && (
              <Badge 
                variant="outline" 
                className={cn(
                  "animate-pulse ml-2",
                  tierConfig.color,
                  tierConfig.borderColor
                )}
              >
                Tier Up Ready!
              </Badge>
            )}
          </CardTitle>
          <Badge 
            variant="outline" 
            className={cn(
              "ml-2 transition-all shine-effect",
              tierConfig.color,
              tierConfig.borderColor
            )}
          >
            {`${parseFloat(tierProgress.currentTier.weight).toFixed(1)}x Power Multiplier`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="relative h-2 w-full bg-slate-800/50 rounded overflow-hidden">
            <Progress 
              value={tierProgress.progress} 
              className="h-full transition-all duration-500"
              indicatorClassName={cn(
                "transition-all duration-500",
                getProgressColor(tierProgress.progress)
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
            <p className="text-slate-400 mb-2">Current Tier Requirements</p>
            <p className={cn("font-medium", tierConfig.color)}>
              {calculateRequiredTokens(
                tierProgress.requiredForCurrent,
                tierProgress.currentStakedAmount,
                tierProgress.symbol
              )}
            </p>
          </div>

          {tierProgress.nextTier && (
            <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
              <p className="text-slate-400 mb-2">Next Tier Requirements</p>
              <p className={cn("font-medium", tierConfig.color)}>
                {calculateRequiredTokens(
                  tierProgress.requiredForNext!,
                  tierProgress.currentStakedAmount,
                  tierProgress.symbol
                )}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};