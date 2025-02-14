import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { TierBadge } from '@/components/ui/TierBadge';
import { TierProgress, TierEntity } from '@/lib/types/tier';
import { StakedEntity } from '@/lib/types/staked';
import { 
  calculateSafeUnstakeAmount, 
  getTierConfig, 
  getTierDisplayName, 
  getTierWeight 
} from '@/lib/utils/tierUtils';
import { formatNumber } from '@/lib/utils/formatUtils';
import { cn } from '@/lib/utils';
import { TIER_CONFIG } from '@/lib/config/tierConfig';

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

  const tierConfig = getTierConfig(stakedData.tier);
  const TierIcon = tierConfig.icon;

  const { 
    currentStakedAmount, 
    totalAmountForNext,
    additionalAmountNeeded,
    symbol,
    progress,
    nextTier
  } = tierProgress;

  const currentStyle = getTierConfig(stakedData.tier);
  const nextTierStyle = nextTier ? getTierConfig(nextTier.tier) : null;

  return (
    <Card className="w-full crystal-bg group">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className={cn("p-2 rounded-lg transition-all", currentStyle.bgColor)}>
              <TierIcon className={cn("w-6 h-6", currentStyle.color)} />
            </div>
            <span className="text-white">{getTierDisplayName(stakedData.tier)}</span>
            {isUpgradeAvailable && (
              <TierBadge 
                tier={stakedData.tier}
                className="animate-pulse shine-effect"
              >
                Tier Up Ready!
              </TierBadge>
            )}
          </CardTitle>
          <TierBadge 
            tier={stakedData.tier}
            className="transition-all shine-effect"
          >
            {`${getTierWeight(stakedData.tier)}x Power`}
          </TierBadge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Progress 
            value={progress} 
            className="h-2"
            color={currentStyle.progressColor}
          />
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">
              Safe Unstake: {formatNumber(safeUnstakeAmount)} {symbol}
            </span>
            <span className={cn(
              "font-medium",
              isUpgradeAvailable ? "text-green-400" : "text-slate-400"
            )}>
              {progress.toFixed(1)}%
            </span>
          </div>
        </div>

        {nextTier && typeof additionalAmountNeeded === 'number' && (
          <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-400">Progress to {getTierDisplayName(nextTier.tier)}</p>
              {nextTierStyle && (
                <div className={cn("p-2 rounded-lg", nextTierStyle.bgColor)}>
                  <TierIcon className={cn("w-4 h-4", nextTierStyle.color)} />
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
                "font-medium",
                additionalAmountNeeded <= 0 ? "text-green-400" : nextTierStyle?.color
              )}>
                {additionalAmountNeeded <= 0 
                  ? 'Ready to Advance!'
                  : `Need ${formatNumber(additionalAmountNeeded)} ${symbol} more`
                }
              </p>
              <p className="text-xs text-slate-500">
                Currently staking {formatNumber(currentStakedAmount)} {symbol}
              </p>
            </div>
          </div>
        )}

        {stakedData.tier === 'v' && (
          <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50 text-center">
            <p className={cn("text-lg font-medium", currentStyle.color)}>
              Maximum Tier Reached!
            </p>
            <p className="text-sm text-slate-400 mt-1">
              Enjoying maximum staking rewards
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};