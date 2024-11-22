import React, { useEffect, useState, useContext } from 'react';
import { WharfkitContext } from '../../lib/wharfkit/context';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '../ui/badge';
import {
  Building2,
  Store,
  TrendingUp,
  BarChart3,
} from 'lucide-react';
import { calculateTimeLeft, formatTimeLeft } from '../../lib/utils/dateUtils';
import { parseTokenString } from '../../lib/utils/tokenUtils';
import { Name } from '@wharfkit/session';

// Types
interface LeaderboardEntry {
  account: Name;
  pool_id: number;
  staked_quantity: string;
  tier: string;
  cooldown_end_at: string;
  last_claimed_at: string;
}

// Tier configurations
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

export const Leaderboard: React.FC = () => {
  const { session } = useContext(WharfkitContext);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboardData = async () => {
    if (!session) return;
    
    try {
      setLoading(true);
      const response = await session.client.v1.chain.get_table_by_scope({
        code: 'stakingcontract',  // Replace with your actual contract name
        table: 'stakeds',
        limit: 100
      });

      const accounts = response.rows.map(row => Name.from(row.scope));
      
      const stakesPromises = accounts.map(account =>
        session.client.v1.chain.get_table_rows({
          code: 'stakingcontract',  // Replace with your actual contract name
          scope: account.toString(),
          table: 'stakeds',
          limit: 1
        })
      );

      const stakesResponses = await Promise.all(stakesPromises);
      
      const entries: LeaderboardEntry[] = stakesResponses
        .map((response, index) => {
          if (response.rows.length === 0) return null;
          const stake = response.rows[0];
          return {
            account: accounts[index],
            pool_id: Number(stake.pool_id),
            staked_quantity: stake.staked_quantity,
            tier: stake.tier,
            cooldown_end_at: stake.cooldown_end_at,
            last_claimed_at: stake.last_claimed_at
          };
        })
        .filter((entry): entry is LeaderboardEntry => entry !== null)
        .sort((a, b) => {
          const amountA = parseTokenString(a.staked_quantity).amount;
          const amountB = parseTokenString(b.staked_quantity).amount;
          return amountB - amountA;
        });

      setLeaderboardData(entries);
    } catch (err) {
      console.error('Error fetching leaderboard data:', err);
      setError('Failed to load leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboardData();
    const interval = setInterval(fetchLeaderboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [session]);

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
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-16 bg-slate-800/30 rounded animate-pulse"
              />
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
          <div className="text-red-400 text-center">{error}</div>
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
            {leaderboardData.map((entry, index) => {
              const tierConfig = getTierConfig(entry.tier);
              const TierIcon = tierConfig.icon;
              const { amount, symbol } = parseTokenString(entry.staked_quantity);

              return (
                <TableRow key={entry.account.toString()}>
                  <TableCell className="font-medium">#{index + 1}</TableCell>
                  <TableCell>{entry.account.toString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-lg ${tierConfig.bgColor}`}>
                        <TierIcon className={`w-4 h-4 ${tierConfig.color}`} />
                      </div>
                      <span className={tierConfig.color}>
                        {entry.tier}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
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
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
