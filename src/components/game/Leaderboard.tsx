import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { TierBadge } from '../ui/TierBadge';
import { calculateTimeLeft, formatTimeLeft } from '../../lib/utils/dateUtils';
import { parseTokenString } from '../../lib/utils/tokenUtils';
import { useContractData } from '../../lib/hooks/useContractData';
import { StakedEntity } from '../../lib/types/staked';
import { PoolEntity } from '../../lib/types/pool';
import { getTierWeight, getTierConfig, getTierDisplayName } from '../../lib/utils/tierUtils';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface ExtendedStakeEntity extends StakedEntity {
  calculatedWeight: number;
  weightPercentage: string;
}

export const Leaderboard: React.FC = () => {
  const { fetchData, fetchLeaderboardByPool, loading, error } = useContractData();
  const [leaderboardData, setLeaderboardData] = useState<ExtendedStakeEntity[]>([]);
  const [totalWeight, setTotalWeight] = useState<string>('0.00000000 WAX');
  const [isLoading, setIsLoading] = useState(false);
  const [pools, setPools] = useState<PoolEntity[]>([]);
  const [selectedPoolId, setSelectedPoolId] = useState<number | undefined>(undefined);

  const calculateWeight = (amount: string, tier: string): number => {
    const { amount: stakedAmount } = parseTokenString(amount);
    const tierWeight = parseFloat(getTierWeight(tier));
    return parseFloat((stakedAmount * tierWeight).toFixed(8));
  };

  const calculateWeightPercentage = (weight: number): string => {
    const { amount: totalWeightAmount } = parseTokenString(totalWeight);
    if (totalWeightAmount === 0) return "0.00";
    return ((weight / totalWeightAmount) * 100).toFixed(2);
  };

  const loadPoolData = useCallback(async () => {
    try {
      const data = await fetchData();
      if (data?.pools) {
        setPools(data.pools);
        
        // Set default pool if none selected
        if (!selectedPoolId && data.pools.length > 0) {
          setSelectedPoolId(data.pools[0].pool_id);
        }
      }
    } catch (err) {
      console.error('Failed to load pool data:', err);
    }
  }, [fetchData, selectedPoolId]);

  const loadLeaderboardData = useCallback(async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      
      // Fetch data based on selected pool or all pools
      const data = await fetchData(selectedPoolId);
      
      if (data?.stakes && data?.pools) {
        const relevantPool = selectedPoolId 
          ? data.pools.find(p => p.pool_id === selectedPoolId)
          : data.pools[0];
          
        const poolTotalWeight = relevantPool?.total_staked_weight || '0.00000000 WAX';
        setTotalWeight(poolTotalWeight);

        // Calculate weights for each stake
        const stakesWithWeights = data.stakes
          .filter(stake => !selectedPoolId || stake.pool_id === selectedPoolId)
          .map(stake => {
            const calculatedWeight = calculateWeight(stake.staked_quantity, stake.tier);
            return {
              ...stake,
              calculatedWeight,
              weightPercentage: calculateWeightPercentage(calculatedWeight)
            };
          });

        // Sort by calculated weight
        const sortedStakes = stakesWithWeights.sort((a, b) => (
          b.calculatedWeight - a.calculatedWeight
        ));

        setLeaderboardData(sortedStakes);
      }
    } catch (err) {
      console.error('Failed to load leaderboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchData, selectedPoolId, isLoading]);

  // Initial load of pools
  useEffect(() => {
    loadPoolData();
  }, [loadPoolData]);

  // Load leaderboard data when selected pool changes
  useEffect(() => {
    if (selectedPoolId !== undefined) {
      loadLeaderboardData();
    }
  }, [selectedPoolId, loadLeaderboardData]);

  const handlePoolSelect = (poolId: string) => {
    setSelectedPoolId(Number(poolId));
  };

  const renderClaimStatus = (cooldownEnd: string) => {
    const timeLeft = calculateTimeLeft(cooldownEnd);
    if (timeLeft <= 0) {
      return (
        <div className="bg-green-500/20 text-green-500 px-2 py-1 rounded-lg text-xs font-medium animate-pulse">
          Ready to Claim
        </div>
      );
    }
    return (
      <span className="text-slate-400">
        {formatTimeLeft(timeLeft)}
      </span>
    );
  };

  if (loading && pools.length === 0) {
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

  // Get token symbol for display
  const poolSymbol = selectedPoolId && pools.length
    ? parseTokenString(pools.find(p => p.pool_id === selectedPoolId)?.total_staked_quantity || '').symbol
    : '';

  return (
    <Card className="w-full crystal-bg group">
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <CardTitle>
          {poolSymbol ? `${poolSymbol} Leaderboard` : 'Top Stakers'}
        </CardTitle>
        
        {/* Pool filter dropdown */}
        <div className="w-full sm:w-64">
          <Select 
            value={selectedPoolId?.toString()}
            onValueChange={handlePoolSelect}
          >
            <SelectTrigger className="w-full bg-slate-800/30 border border-purple-500/20 text-purple-200">
              <SelectValue placeholder="Select Token" />
            </SelectTrigger>
            <SelectContent className="bg-white/5 backdrop-blur-xl border-purple-500/20">
              <div className="py-2">
                {pools.map((pool) => {
                  const { symbol } = parseTokenString(pool.total_staked_quantity);
                  return (
                    <SelectItem 
                      key={pool.pool_id} 
                      value={pool.pool_id.toString()}
                      className="text-purple-100 hover:bg-purple-500/20 focus:bg-purple-500/20 cursor-pointer"
                    >
                      {`${symbol} Pool #${pool.pool_id}`}
                    </SelectItem>
                  );
                })}
              </div>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-800/30 rounded-lg border border-slate-700/50 animate-pulse" />
            ))}
          </div>
        ) : leaderboardData.length > 0 ? (
          <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 transition-all overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-slate-700/30 border-b border-slate-700/50">
                  <TableHead className="text-slate-300">Rank</TableHead>
                  <TableHead className="text-slate-300">Account</TableHead>
                  <TableHead className="text-slate-300">Tier</TableHead>
                  <TableHead className="text-right text-slate-300">Staked Amount</TableHead>
                  <TableHead className="text-right text-slate-300">Weight</TableHead>
                  <TableHead className="text-right text-slate-300">Share</TableHead>
                  <TableHead className="text-right text-slate-300">Next Claim</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboardData.map((entry, index) => {
                  const tierConfig = getTierConfig(entry.tier);
                  const TierIcon = tierConfig.icon;
                  const { amount, symbol, decimals } = parseTokenString(entry.staked_quantity);
                  const style = tierConfig;

                  return (
                    <TableRow 
                      key={`${entry.pool_id}-${index}-${entry.owner}`}
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
                          <div className={cn("p-2 rounded-lg transition-all", style.bgColor)}>
                            <TierIcon className={cn("w-4 h-4", style.color)} />
                          </div>
                          <span className={style.color}>
                            {getTierDisplayName(entry.tier)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium text-slate-200">
                        {`${amount.toFixed(decimals)} ${symbol}`}
                      </TableCell>
                      <TableCell className="text-right font-medium text-slate-200">
                        {`${entry.calculatedWeight.toFixed(decimals)} ${symbol}`}
                      </TableCell>
                      <TableCell className="text-right font-medium text-slate-200">
                        {`${entry.weightPercentage}%`}
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
        ) : (
          <div className="bg-slate-800/30 rounded-lg border border-slate-700/50 p-8 text-center text-slate-400">
            No stakers found for this pool
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Leaderboard;