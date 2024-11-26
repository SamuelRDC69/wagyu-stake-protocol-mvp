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

  // Calculate requirements correctly
  const { currentStakedAmount, requiredForCurrent, requiredForNext, symbol } = tierProgress;

  // If we're meeting current tier requirements
  const meetsCurrentTier = currentStakedAmount >= requiredForCurrent;
  
  // Calculate remaining for next tier if it exists
  const remainingForNext = requiredForNext 
    ? Math.max(0, requiredForNext - currentStakedAmount)
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
          <div className="flex justify-between text-xs text-slate-400">
            <span>{formatNumber(requiredForCurrent)} {symbol}</span>
            {tierProgress.nextTier && (
              <span>{formatNumber(requiredForNext)} {symbol}</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          {/* Current Tier Status */}
          <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
            <p className="text-slate-400 mb-2">Current Tier Status</p>
            <p className={cn("font-medium", tierConfig.color)}>
              {meetsCurrentTier ? (
                'Requirements Met'
              ) : (
                <>
                  Need {formatNumber(requiredForCurrent - currentStakedAmount)} {symbol} more
                </>
              )}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {meetsCurrentTier ? 
                `Staking ${formatNumber(currentStakedAmount)} ${symbol}` :
                `To maintain ${tierProgress.currentTier.tier_name}`
              }
            </p>
          </div>

          {/* Next Tier Requirements - only show if there's a next tier */}
          {tierProgress.nextTier && (
            <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
              <p className="text-slate-400 mb-2">Next Tier Requirements</p>
              <p className={cn("font-medium", tierConfig.color)}>
                {remainingForNext === 0 ? (
                  'Ready to Advance!'
                ) : (
                  <>
                    Need {formatNumber(remainingForNext)} {symbol} more
                  </>
                )}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                To reach {tierProgress.nextTier.tier_name}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};