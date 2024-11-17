import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { CooldownTimer } from './CooldownTimer';

interface UserStatusProps {
  stakedAmount: string;
  tier: string;
  lastClaimedAt: string;
  cooldownEndAt: string;
  cooldownSeconds: number;
}

export const UserStatus: React.FC<UserStatusProps> = ({
  stakedAmount,
  tier,
  lastClaimedAt,
  cooldownEndAt,
  cooldownSeconds,
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Your Status</CardTitle>
          <Badge variant={tier.toLowerCase() as 'bronze' | 'silver' | 'gold'}>
            {tier}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Staked Amount</span>
            <span className="text-purple-200 font-medium">{stakedAmount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">Last Claimed</span>
            <span className="text-purple-200 font-medium">
              {new Date(lastClaimedAt).toLocaleString()}
            </span>
          </div>
          <div className="border-t border-slate-800 pt-4">
            <CooldownTimer 
              cooldownEndAt={cooldownEndAt}
              cooldownSeconds={cooldownSeconds}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};