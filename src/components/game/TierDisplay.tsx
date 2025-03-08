import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TierBadge } from '@/components/ui/TierBadge';
import { TierProgress, TierEntity } from '@/lib/types/tier';
import { StakedEntity } from '@/lib/types/staked';
import { getTierConfig, calculateSafeUnstakeAmount, getTierDisplayName } from '@/lib/utils/tierUtils';
import { formatNumber } from '@/lib/utils/formatUtils';
import { parseTokenString } from '@/lib/utils/tokenUtils';
import { cn } from '@/lib/utils';

interface TierDisplayProps {
  tierProgress?: TierProgress;
  isUpgradeAvailable: boolean;
  isLoading?: boolean;
  stakedData?: StakedEntity;
  totalStaked?: string;
  allTiers?: TierEntity[];
}

export const TierDisplay: React.FC<TierDisplayProps> = ({
  tierProgress,
  isUpgradeAvailable,
  isLoading,
  stakedData,
  totalStaked,
  allTiers
}) => {
  const safeUnstakeAmount = useMemo(() => {
    if (!stakedData?.staked_quantity || !totalStaked || !allTiers || !tierProgress?.currentTier) {
      return 0;
    }
    return calculateSafeUnstakeAmount(
      stakedData.staked_quantity,
      totalStaked,
      allTiers,
      tierProgress.currentTier
    );
  }, [stakedData, totalStaked, allTiers, tierProgress]);

  if (isLoading || !tierProgress || !stakedData) {
    return (
      <Card className="w-full crystal-bg">
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

  const tierStyle = getTierConfig(stakedData.tier);
  const TierIcon = tierStyle.icon;

  // Use the nextTier from tierProgress for "Progress to" display
  const { 
    currentTier,
    nextTier,
    currentStakedAmount, 
    totalAmountForNext,
    additionalAmountNeeded,
    symbol,
    progress,
  } = tierProgress;

  // Log for debugging
  console.log('TierDisplay render:', {
    currentTier: currentTier.tier_name,
    nextTier: nextTier?.tier_name || 'None (max tier)',
    progress,
    additionalAmountNeeded
  });

  return (
    <Card className="w-full crystal-bg group">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("p-2 rounded-lg transition-all", tierStyle.bgColor)}>
              <TierIcon className={cn("w-5 h-5 md:w-6 md:h-6", tierStyle.color)} />
            </div>
            <span className="text-slate-100">{getTierDisplayName(stakedData.tier)}</span>
            {isUpgradeAvailable && (
              <TierBadge 
                tier={stakedData.tier}
                animate
                className="ml-2 shine-effect"
              >
                Tier Up Ready!
              </TierBadge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Progress 
            value={progress} 
            className="h-2 bg-slate-800/50"
            color={tierStyle.color.replace('text-', 'bg-')}
          />
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300">
              Safe Unstake: {formatNumber(safeUnstakeAmount)} {symbol}
            </span>
            <span className={cn(
              "font-medium",
              isUpgradeAvailable ? "text-green-400" : "text-slate-300"
            )}>
              {progress.toFixed(1)}%
            </span>
          </div>
        </div>

        {nextTier ? (
          <div className="bg-slate-800/30 rounded-lg p-3 md:p-4 border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-300 text-sm">
                {/* Always show progress to NEXT tier, not current */}
                Progress to {getTierDisplayName(nextTier.tier)}
              </p>
              {nextTier && (
                <div className={cn("p-2 rounded-lg", tierStyle.bgColor)}>
                  <TierIcon className={cn("w-4 h-4", tierStyle.color)} />
                </div>
              )}
            </div>
            <div className="space-y-2">
              {totalAmountForNext && (
                <p className="text-sm text-slate-300">
                  Total needed: {formatNumber(totalAmountForNext)} {symbol}
                </p>
              )}
              <p className={cn(
                "font-medium text-sm",
                additionalAmountNeeded && additionalAmountNeeded <= 0.001 
                  ? "text-green-400" 
                  : "text-slate-300"
              )}>
                {additionalAmountNeeded && additionalAmountNeeded <= 0.001 
                  ? 'Ready to Advance!'
                  : `Need ${formatNumber(additionalAmountNeeded || 0)} ${symbol} more`
                }
              </p>
              <p className="text-xs text-slate-400">
                Currently staking {formatNumber(currentStakedAmount)} {symbol}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-slate-800/30 rounded-lg p-3 md:p-4 border border-slate-700/50 text-center">
            <p className={cn("text-base md:text-lg font-medium", tierStyle.color)}>
              Maximum Tier Reached!
            </p>
            <p className="text-sm text-slate-300 mt-1">
              Enjoying maximum staking rewards
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};