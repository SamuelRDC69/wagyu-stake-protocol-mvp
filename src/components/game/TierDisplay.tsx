import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Crown, TrendingUp, TrendingDown } from 'lucide-react';
import { TierProgress } from '../../lib/types/tier';
import { getTierColor } from '../../lib/utils/tierUtils';

interface TierDisplayProps {
  tierProgress: TierProgress;
  isUpgradeAvailable: boolean;
}

export const TierDisplay: React.FC<TierDisplayProps> = ({
  tierProgress,
  isUpgradeAvailable
}) => {
  // Safe number conversion function
  const safeNumber = (value: string | number): number => {
    if (typeof value === 'string') {
      return parseFloat(value) || 0;
    }
    return value || 0;
  };

  // Safe percentage formatter
  const formatPercent = (value: string | number | undefined): string => {
    if (value === undefined) return '0.00%';
    const num = safeNumber(value);
    return `${num.toFixed(2)}%`;
  };

  const tierColor = useMemo(() => 
    getTierColor(tierProgress.currentTier.tier), 
    [tierProgress.currentTier.tier]
  );

  return (
    <Card className="w-full hover:scale-in">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Crown className={tierColor} />
            {tierProgress.currentTier.tier_name}
            {isUpgradeAvailable && (
              <Badge variant="gold" className="animate-pulse ml-2">
                Upgrade Available!
              </Badge>
            )}
          </CardTitle>
          <Badge 
            variant={tierProgress.currentTier.tier.toLowerCase() as 'bronze' | 'silver' | 'gold'} 
            className="ml-2"
          >
            {`${safeNumber(tierProgress.currentTier.weight).toFixed(1)}x Weight`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Progress 
            value={safeNumber(tierProgress.progress)} 
            className="h-2" 
            color={tierColor}
          />
          <div className="flex justify-between text-xs text-slate-400">
            {tierProgress.prevTier && (
              <div className="flex items-center">
                <TrendingDown className="w-3 h-3 mr-1" />
                <span>
                  {formatPercent(tierProgress.prevTier.staked_up_to_percent)}
                </span>
              </div>
            )}
            <span className="font-medium text-purple-300">
              {formatPercent(tierProgress.progress)}
            </span>
            {tierProgress.nextTier && (
              <div className="flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                <span>
                  {formatPercent(tierProgress.nextTier.staked_up_to_percent)}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-400">Current Requirement</p>
            <p className="font-medium text-purple-200">
              {formatPercent(tierProgress.requiredForCurrent)}
            </p>
          </div>
          {tierProgress.nextTier && (
            <div>
              <p className="text-slate-400">Next Tier at</p>
              <p className="font-medium text-purple-200">
                {formatPercent(tierProgress.requiredForNext)}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};