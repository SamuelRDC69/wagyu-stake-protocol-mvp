import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TierProgress } from '@/lib/types/tier';
import { getTierConfig } from '@/lib/utils/tierUtils';
import { formatNumber } from '@/lib/utils/formatUtils';
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
      <Card className="w-full">
        <CardContent className="p-6">
          <p className="text-center text-slate-400">No tier data available</p>
        </CardContent>
      </Card>
    );
  }

  const tierConfig = getTierConfig(tierProgress.currentTier.tier);
  const TierIcon = tierConfig.icon;

  const remainingForCurrent = Math.max(0, tierProgress.requiredForCurrent - tierProgress.currentStakedAmount);
  const remainingForNext = tierProgress.requiredForNext 
    ? Math.max(0, tierProgress.requiredForNext - tierProgress.currentStakedAmount)
    : 0;

  const normalizedTier = tierProgress.currentTier.tier.toLowerCase().replace(' ', '-') as 
    'supplier' | 'merchant' | 'trader' | 'market-maker' | 'exchange';

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
                variant={normalizedTier}
                className="animate-pulse ml-2"
              >
                Tier Up Ready!
              </Badge>
            )}
          </CardTitle>
          <Badge 
            variant={normalizedTier}
            className="ml-2 transition-all shine-effect"
          >
            {`${parseFloat(tierProgress.currentTier.weight).toFixed(1)}x Power`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Progress 
            value={tierProgress.progress} 
            className="h-2"
            indicatorClassName={cn(
              "transition-all duration-500",
              tierConfig.progressColor
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          {/* Current Tier Requirements */}
          <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
            <p className="text-slate-400 mb-2">Current Tier Threshold</p>
            {remainingForCurrent > 0 ? (
              <>
                <p className={cn("font-medium", tierConfig.color)}>
                  Need {formatNumber(remainingForCurrent)} {tierProgress.symbol}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  to maintain {tierProgress.currentTier.tier_name}
                </p>
              </>
            ) : (
              <p className={cn("font-medium", tierConfig.color)}>
                Threshold Met!
              </p>
            )}
          </div>

          {/* Next Tier Requirements */}
          {tierProgress.nextTier && (
            <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
              <p className="text-slate-400 mb-2">Next Tier Threshold</p>
              {remainingForNext > 0 ? (
                <>
                  <p className={cn("font-medium", tierConfig.color)}>
                    Need {formatNumber(remainingForNext)} {tierProgress.symbol}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    to reach {tierProgress.nextTier.tier_name}
                  </p>
                </>
              ) : (
                <p className={cn("font-medium text-green-500")}>
                  Ready to Advance!
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};