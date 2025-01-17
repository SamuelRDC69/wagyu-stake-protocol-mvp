import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Badge } from '../ui/badge';
import {
  Building2,
  Store,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { calculateTimeLeft, formatTimeLeft } from '../../lib/utils/dateUtils';
import { parseTokenString } from '../../lib/utils/tokenUtils';
import { useContractData } from '../../lib/hooks/useContractData';
import { StakedEntity } from '../../lib/types/staked';
import { cn } from '@/lib/utils';

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
  'marketmkr': {
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

export const Leaderboard: React.FC = () => {
  const { fetchData, loading, error } = useContractData();
  const [leaderboardData, setLeaderboardData] = useState<StakedEntity[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Update the loadLeaderboardData function in Leaderboard.tsx
const loadLeaderboardData = async () => {
  if (isLoading) return;
  
  try {
    setIsLoading(true);
    const data = await fetchData();
    if (data?.stakes) {
      // Sort stakes by staked amount
      const sortedStakes = [...data.stakes].sort((a, b) => {
        const amountA = parseTokenString(a.staked_quantity).amount;
        const amountB = parseTokenString(b.staked_quantity).amount;
        return amountB - amountA;
      });

      // Ensure each stake has an owner property
      const stakesWithOwner = sortedStakes.map(stake => ({
        ...stake,
        owner: stake.owner || 'Unknown'
      }));

      setLeaderboardData(stakesWithOwner);
    }
  } catch (err) {
    console.error('Failed to load leaderboard data:', err);
  } finally {
    setIsLoading(false);
  }
};

  // Initial load
  useEffect(() => {
    loadLeaderboardData();
  }, []);

  // Periodic refresh - no need for constant polling when not visible
  useEffect(() => {
    const interval = setInterval(loadLeaderboardData, 120000); // 2 minutes
    return () => clearInterval(interval);
  }, []);

  const getTierConfig = (tier: string) => {
    const tierKey = tier.toLowerCase() as keyof typeof TIER_CONFIG;
    return TIER_CONFIG[tierKey] || TIER_CONFIG.supplier;
  };

  const renderClaimStatus = (cooldownEnd: string) => {
    const timeLeft = calculateTimeLeft(cooldownEnd);
    if (timeLeft <= 0) {
      return (
        <Badge variant="default" className="bg-green-500/20 text-green-500 animate-pulse">
          Ready to Claim
        </Badge>
      );
    }
    return (
      <span className="text-slate-400">
        {formatTimeLeft(timeLeft)}
      </span>
    );
  };

  if (loading) {
    return (
      <Card className="w-full crystal-bg group">
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-800/30 rounded-lg border border-slate-700/50 animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full crystal-bg group">
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-4 text-red-400 text-center">
            {error.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full crystal-bg group">
      <CardHeader>
        <CardTitle>Top Stakers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 transition-all">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-slate-700/30 border-b border-slate-700/50">
                <TableHead className="text-slate-300">Rank</TableHead>
                <TableHead className="text-slate-300">Account</TableHead>
                <TableHead className="text-slate-300">Tier</TableHead>
                <TableHead className="text-right text-slate-300">Staked Amount</TableHead>
                <TableHead className="text-right text-slate-300">Next Claim</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaderboardData.map((entry, index) => {
                const tierConfig = getTierConfig(entry.tier);
                const TierIcon = tierConfig.icon;
                const { amount, symbol } = parseTokenString(entry.staked_quantity);

                return (
                  <TableRow 
                    key={`${entry.pool_id}-${index}`}
                    className="hover:bg-slate-700/30 transition-all border-b border-slate-700/50 last:border-0"
                  >
                    <TableCell className="font-medium text-slate-200">
                      #{index + 1}
                    </TableCell>
                    <TableCell className="text-slate-200">
                      {entry.owner}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={cn("p-2 rounded-lg transition-all", tierConfig.bgColor)}>
                          <TierIcon className={cn("w-4 h-4", tierConfig.color)} />
                        </div>
                        <span className={tierConfig.color}>{entry.tier}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium text-slate-200">
                      {`${Number(amount).toFixed(8)} ${symbol}`}
                    </TableCell>
                    <TableCell className="text-right">
                      {renderClaimStatus(entry.cooldown_end_at)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default Leaderboard;