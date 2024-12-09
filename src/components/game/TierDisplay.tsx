import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TierProgress } from '@/lib/types/tier';
import { StakedEntity } from '@/lib/types/staked'; // Add this import
import { getTierConfig } from '@/lib/utils/tierUtils';
import { formatNumber } from '@/lib/utils/formatUtils';
import { cn } from '@/lib/utils';

interface TierDisplayProps {
  tierProgress?: TierProgress;
  isUpgradeAvailable: boolean;
  isLoading?: boolean;
  stakedData?: StakedEntity; // Add this prop
}

export const TierDisplay: React.FC<TierDisplayProps> = ({
  tierProgress,
  isUpgradeAvailable,
  isLoading,
  stakedData // Add this prop
}) => {
  if (isLoading || !tierProgress || !stakedData) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-slate-700 rounded w-1/4" />
              <div className="h-4 bg-slate-700 rounded w-1/2" />
              <div className="h-4 bg-slate-700 rounded w-1/3" />
            </div>
          ) : (
            <p className="text-center text-slate-400">No tier data available</p>
          )}
        </CardContent>
      </Card>
    );
  }

  // Define tier progression
  const tierProgression = ['supplier', 'merchant', 'trader', 'marketmkr', 'exchange'];
  
  // Use the contract's tier
  const tierConfig = getTierConfig(stakedData.tier);
  const TierIcon = tierConfig.icon;

  // Find next tier in progression
  const currentTierIndex = tierProgression.indexOf(stakedData.tier.toLowerCase());
  const nextTierName = currentTierIndex < tierProgression.length - 1 
    ? tierProgression[currentTierIndex + 1] 
    : null;

  const nextTierConfig = nextTierName ? getTierConfig(nextTierName) : null;

  const { 
    currentStakedAmount, 
    totalAmountForNext,
    additionalAmountNeeded,
    symbol,
    nextTier,
    progress,
    requiredForCurrent,
  } = tierProgress;

  const safeUnstakeAmount = Math.max(0, currentStakedAmount - requiredForCurrent);

  const getProgressColor = (tier: string): string => {
    const config = getTierConfig(tier);
    return config?.color || 'bg-purple-500';
  };

  const variant = stakedData.tier.toLowerCase().replace(' ', '-') as
    'supplier' | 'merchant' | 'trader' | 'market-maker' | 'exchange';
  const progressColor = getProgressColor(stakedData.tier);

  return (
    <Card className="w-full crystal-bg group">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className={cn("p-2 rounded-lg transition-all", tierConfig.bgColor)}>
              <TierIcon className={cn("w-6 h-6", tierConfig.color)} />
            </div>
            <span className="text-white">{stakedData.tier}</span>
            {isUpgradeAvailable && (
              <Badge 
                variant={variant}
                className="animate-pulse ml-2"
              >
                Tier Up Ready!
              </Badge>
            )}
          </CardTitle>
          <Badge 
            variant={variant}
            className="ml-2 transition-all shine-effect"
          >
            {`${parseFloat(tierProgress.currentTier.weight)}x Power`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Progress 
            value={progress} 
            className="h-2"
            indicatorClassName={cn(
              "transition-all duration-500",
              tierConfig.color.replace('text-', 'bg-')
            )}
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>Safe Unstake: {formatNumber(safeUnstakeAmount)} {symbol}</span>
          </div>
        </div>

        {nextTier && typeof additionalAmountNeeded === 'number' && (
          <div className="p-3 rounded-lg bg-slate-800/30 border border-slate-700/50">
            {nextTierName ? (
              <>
                <p className="text-slate-400 mb-2">Progress to {nextTierName}</p>
                <div className="space-y-1">
                  {totalAmountForNext && (
                    <p className="text-sm text-slate-300">
                      Total needed: {formatNumber(totalAmountForNext)} {symbol}
                    </p>
                  )}
                  <p className={cn("font-medium", nextTierConfig?.color || tierConfig.color)}>
                    {additionalAmountNeeded <= 0 ? (
                      'Ready to Advance!'
                    ) : (
                      `Need ${formatNumber(additionalAmountNeeded)} ${symbol} more`
                    )}
                  </p>
                  <p className="text-xs text-slate-500">
                    Currently staking {formatNumber(currentStakedAmount)} {symbol}
                  </p>
                </div>
              </>
            ) : (
              <p className={cn("text-center font-medium", tierConfig.color)}>
                Maximum Tier Reached!
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};