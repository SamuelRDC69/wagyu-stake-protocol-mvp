import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TierProgress, TierEntity } from '@/lib/types/tier';
import { StakedEntity } from '@/lib/types/staked';
import { getTierConfig, calculateSafeUnstakeAmount, getTierDisplayName, getTierWeight } from '@/lib/utils/tierUtils';
import { formatNumber } from '@/lib/utils/formatUtils';
import { parseTokenString } from '@/lib/utils/tokenUtils';
import { cn } from '@/lib/utils';

interface TierDisplayProps {
  tierProgress?: TierProgress;
  isUpgradeAvailable: boolean;
  isLoading?: boolean;
  stakedData?: StakedEntity; // API response data
  totalStaked?: string; // From pool data
  allTiers?: TierEntity[]; // Default tiers from contract
}

// Add this comment to explain the tier data source
// Tier data comes from the API via stakedData, calculations via tierProgress

export const TierDisplay: React.FC<TierDisplayProps> = ({
  tierProgress,
  isUpgradeAvailable,
  isLoading,
  stakedData,
  totalStaked,
  allTiers
}) => {
  // Calculate safe unstake amount
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

  // Use the contract's tier progression
  const tierProgression = ['supplier', 'merchant', 'trader', 'marketmkr', 'exchange'];
  
  // Get tier config using the actual tier from staked data
  const tierConfig = getTierConfig(stakedData.tier);
  const TierIcon = tierConfig.icon;

  // Find current position in progression
  const currentTierIndex = tierProgression.indexOf(stakedData.tier.toLowerCase());
  const nextTierName = currentTierIndex < tierProgression.length - 1 
    ? tierProgression[currentTierIndex + 1] 
    : null;
  const nextTierConfig = nextTierName ? getTierConfig(nextTierName) : null;

  // Extract values from tier progress
  const { 
    currentStakedAmount, 
    totalAmountForNext,
    additionalAmountNeeded,
    symbol,
    progress,
    requiredForCurrent,
  } = tierProgress;

  const variant = stakedData.tier.toLowerCase().replace(/\s+/g, '') as
    'supplier' | 'merchant' | 'trader' | 'marketmkr' | 'exchange';

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
                className="animate-pulse ml-2 shine-effect"
              >
                Tier Up Ready!
              </Badge>
            )}
          </CardTitle>
{/* In TierDisplay.tsx, update the weight display */}
<Badge 
  variant={variant}
  className="ml-2 transition-all shine-effect"
>
  {`${parseFloat(getTierWeight(tierProgress.currentTier.tier)).toFixed(2)}x Power`}
</Badge>

<span className="text-white">{getTierDisplayName(stakedData.tier)}</span>
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

        {nextTierName && typeof additionalAmountNeeded === 'number' && (
          <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-slate-400">Progress to {nextTierName}</p>
              {nextTierConfig && (
                <div className={cn("p-2 rounded-lg", nextTierConfig.bgColor)}>
                  <TierIcon className={cn("w-4 h-4", nextTierConfig.color)} />
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
                additionalAmountNeeded <= 0 ? "text-green-400" : nextTierConfig?.color
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

        {currentTierIndex === tierProgression.length - 1 && (
          <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50 text-center">
            <p className={cn("text-lg font-medium", tierConfig.color)}>
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