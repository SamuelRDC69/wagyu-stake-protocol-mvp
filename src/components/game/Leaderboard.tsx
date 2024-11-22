import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import {
  Building2,
  Store,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { parseTokenString } from '../../lib/utils/tokenUtils';
import { StakedEntity } from '../../lib/types/staked';
import { CooldownTimer } from './CooldownTimer';

const TIER_CONFIG = {
  supplier: {
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    icon: Store,
  },
  merchant: {
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    icon: Building2,
  },
  trader: {
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    icon: TrendingUp,
  },
  'market maker': {
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    icon: BarChart3,
  },
  exchange: {
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    icon: Building2,
  },
} as const;

interface LeaderboardProps {
  data: StakedEntity[];
  isLoading?: boolean;
  error?: Error | null;
  cooldownPeriod: number;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({
  data,
  isLoading,
  error,
  cooldownPeriod
}) => {
  const getTierConfig = (tier: string) => {
    const tierKey = tier.toLowerCase() as keyof typeof TIER_CONFIG;
    return TIER_CONFIG[tierKey] || TIER_CONFIG.supplier;
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-800/30 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-400 text-center">{error.message}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Top Stakers</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Account</TableHead>
              <TableHead>Tier</TableHead>
              <TableHead className="text-right">Staked Amount</TableHead>
              <TableHead className="text-right">Next Claim</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((entry, index) => {
              const tierConfig = getTierConfig(entry.tier);
              const TierIcon = tierConfig.icon;
              const { amount, symbol } = parseTokenString(entry.staked_quantity);

              return (
                <TableRow key={`${entry.owner}-${entry.pool_id}`}>
                  <TableCell className="font-medium">#{index + 1}</TableCell>
                  <TableCell>{entry.owner}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${tierConfig.bgColor}`}>
                        <TierIcon className={`w-4 h-4 ${tierConfig.color}`} />
                      </div>
                      <span className={tierConfig.color}>{entry.tier}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {`${Number(amount).toFixed(8)} ${symbol}`}
                  </TableCell>
                  <TableCell className="text-right">
                    <CooldownTimer 
                      cooldownEndAt={entry.cooldown_end_at}
                      cooldownSeconds={cooldownPeriod}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
