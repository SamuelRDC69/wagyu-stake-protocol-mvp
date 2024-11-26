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

  const { 
    currentStakedAmount, 
    requiredForNext, 
    symbol,
    nextTier 
  } = tierProgress;

  // Calculate remaining amount needed for next tier
  const remainingForNext = requiredForNext 
    ? Math.max(0, requiredForNext - currentStakedAmount)
    : null;

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
          {nextTier && requiredForNext && (
            <div className="flex justify-between text-xs text-slate-400">
              <span>Current: {formatNumber(currentStakedAmount)} {symbol}</span>
              <span>Next Tier: {formatNumber(requiredForNext)} {symbol}</span>
            </div>
          )}
        </div>

        {nextTier && remainingForNext !== null && (
          <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
            <p className="text-slate-400 mb-2">Progress to {nextTier.tier_name}</p>
            <p className={cn("font-medium", tierConfig.color)}>
              {remainingForNext <= 0 ? (
                'Ready to Advance!'
              ) : (
                `Need ${formatNumber(remainingForNext)} ${symbol} more`
              )}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Currently staking {formatNumber(currentStakedAmount)} {symbol}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};