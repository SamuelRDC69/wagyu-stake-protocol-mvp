import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { CooldownTimer } from './CooldownTimer';
import { StakedEntity } from '../../lib/types/staked';
import { ConfigEntity } from '../../lib/types/config';
import { formatLastAction } from '../../lib/utils/dateUtils';
import { formatTokenAmount, parseTokenString } from '../../lib/utils/tokenUtils';
import { getTierColor } from '../../lib/utils/tierUtils';

interface UserStatusProps {
  stakedData: StakedEntity;
  config: Pick<ConfigEntity, 'cooldown_seconds_per_claim'>;
  onCooldownComplete?: () => void;
}

export const UserStatus: React.FC<UserStatusProps> = ({
  stakedData,
  config,
  onCooldownComplete
}) => {
  const { amount, symbol } = parseTokenString(stakedData.staked_quantity);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Your Status</CardTitle>
          <Badge 
            variant={stakedData.tier.toLowerCase() as 'bronze' | 'silver' | 'gold'}
            className={`${getTierColor(stakedData.tier)} animate-pulse`}
          >
            {stakedData.tier}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Staked Amount</span>
            <span className="text-purple-200 font-medium">
              {formatTokenAmount(amount, symbol)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Last Claim</span>
            <span className="text-purple-200 font-medium">
              {formatLastAction(stakedData.last_claimed_at)}
            </span>
          </div>

          <div className="border-t border-slate-800 pt-4">
            <CooldownTimer 
              cooldownEndAt={stakedData.cooldown_end_at}
              cooldownSeconds={config.cooldown_seconds_per_claim}
              onComplete={onCooldownComplete}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};