import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Crown } from 'lucide-react';

interface TierDisplayProps {
  currentTier: string;
  tierName: string;
  weight: number;
  progress: number;
  nextTierThreshold?: number;
  prevTierThreshold?: number;
}

export const TierDisplay: React.FC<TierDisplayProps> = ({
  currentTier,
  tierName,
  weight,
  progress,
  nextTierThreshold,
  prevTierThreshold,
}) => {
  const getTierVariant = (tier: string) => {
    switch (tier.toLowerCase()) {
      case 'bronze': return 'bronze';
      case 'silver': return 'silver';
      case 'gold': return 'gold';
      default: return 'default';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Crown className={`w-5 h-5 ${currentTier.toLowerCase() === 'gold' ? 'text-yellow-500' : 
              currentTier.toLowerCase() === 'silver' ? 'text-slate-300' : 'text-amber-500'}`} />
            {tierName}
          </CardTitle>
          <Badge variant={getTierVariant(currentTier)} className="ml-2">
            {`${weight}x Weight`}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-xs text-slate-400">
            {prevTierThreshold && (
              <span>{`${prevTierThreshold}% (Previous)`}</span>
            )}
            <span className="font-medium text-purple-300">{`${progress}%`}</span>
            {nextTierThreshold && (
              <span>{`${nextTierThreshold}% (Next)`}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};