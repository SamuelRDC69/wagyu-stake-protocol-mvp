import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CooldownTimer } from './CooldownTimer';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TrendingDown, Timer, TrendingUp } from 'lucide-react';
import { StakedEntity } from '@/lib/types/staked';
import { ConfigEntity } from '@/lib/types/config';
import { formatLastAction } from '@/lib/utils/dateUtils';
import { formatTokenAmount, parseTokenString } from '@/lib/utils/tokenUtils';
import { getTierConfig } from '@/lib/utils/tierUtils';
import { cn } from '@/lib/utils';

interface UserStatusProps {
  stakedData?: StakedEntity;
  config?: ConfigEntity;
  onCooldownComplete?: () => void;
  onClaim: () => Promise<void>;
  onUnstake: (amount: string) => Promise<void>;
  onStake: (amount: string) => Promise<void>;
  poolSymbol: string;
  isLoading?: boolean;
}

export const UserStatus: React.FC<UserStatusProps> = ({
  stakedData,
  config,
  onCooldownComplete,
  onClaim,
  onUnstake,
  onStake,
  poolSymbol,
  isLoading
}) => {
  const [isUnstakeDialogOpen, setUnstakeDialogOpen] = useState(false);
  const [isStakeDialogOpen, setStakeDialogOpen] = useState(false);
  const [isConfirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [stakeAmount, setStakeAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-700 rounded w-1/4" />
            <div className="h-4 bg-slate-700 rounded w-1/2" />
            <div className="h-4 bg-slate-700 rounded w-1/3" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!config) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <p className="text-center text-slate-400">Loading configuration...</p>
        </CardContent>
      </Card>
    );
  }

  const handleUnstakeAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setUnstakeAmount('');
      return;
    }
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    
    if (stakedData) {
      const { amount: maxAmount } = parseTokenString(stakedData.staked_quantity);
      if (numValue > maxAmount) {
        setUnstakeAmount(maxAmount.toString());
      } else {
        setUnstakeAmount(value);
      }
    }
  };

  const handleClaim = async () => {
    setIsProcessing(true);
    try {
      await onClaim();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStake = async () => {
    setIsProcessing(true);
    try {
      await onStake(stakeAmount);
      setStakeDialogOpen(false);
      setStakeAmount('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnstake = async () => {
    setIsProcessing(true);
    try {
      await onUnstake(unstakeAmount);
      setUnstakeDialogOpen(false);
      setUnstakeAmount('');
    } finally {
      setIsProcessing(false);
    }
  };

  const tierConfig = stakedData ? getTierConfig(stakedData.tier) : undefined;

  return (
    <Card className="w-full crystal-bg group">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Your Status</CardTitle>
          {stakedData && tierConfig && (
            <Badge 
              variant={stakedData.tier.toLowerCase().replace(' ', '-') as
                'supplier' | 'merchant' | 'trader' | 'market-maker' | 'exchange'}
              className={cn("animate-pulse", tierConfig.color)}
            >
              {stakedData.tier}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stakedData ? (
            <>
              <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50 transition-all space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Staked Amount</span>
                  <span className={cn("font-medium", tierConfig?.color || "text-purple-200")}>
                    {formatTokenAmount(parseFloat(stakedData.staked_quantity), poolSymbol)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Last Claim</span>
                  <span className={cn("font-medium", tierConfig?.color || "text-purple-200")}>
                    {formatLastAction(stakedData.last_claimed_at)}
                  </span>
                </div>
              </div>
              
              <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50 transition-all">
                <CooldownTimer 
                  cooldownEndAt={stakedData.cooldown_end_at}
                  cooldownSeconds={config.cooldown_seconds_per_claim}
                  onComplete={onCooldownComplete}
                />
              </div>
            </>
          ) : (
            <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/50 transition-all text-center text-slate-400">
              No active stake. Start staking to earn rewards!
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 pt-4">
            <Button
              className={cn(
                "w-full bg-slate-800/30 border border-slate-700/50 hover:bg-slate-700/50",
                tierConfig?.color
              )}
              onClick={() => setStakeDialogOpen(true)}
              disabled={isProcessing}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Stake
            </Button>

            {stakedData && (
              <>
                <Button
                  className={cn(
                    "w-full bg-slate-800/30 border border-slate-700/50 hover:bg-slate-700/50",
                    tierConfig?.color
                  )}
                  onClick={handleClaim}
                  disabled={isProcessing}
                >
                  <Timer className="w-4 h-4 mr-2" />
                  {isProcessing ? 'Processing...' : 'Claim'}
                </Button>

                <AlertDialog open={isConfirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      className="w-full bg-slate-800/30 border border-slate-700/50 hover:bg-red-900/50"
                      disabled={isProcessing}
                    >
                      <TrendingDown className="w-5 h-5 mr-2" />
                      Unstake
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-slate-900 text-white border border-slate-700/50">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Unstaking will remove your tokens from the pool and may affect your tier status.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel 
                        onClick={() => setConfirmDialogOpen(false)}
                        className="border-slate-600 text-slate-200 hover:bg-slate-800 hover:text-white"
                      >
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction onClick={() => {
                        setConfirmDialogOpen(false);
                        setUnstakeDialogOpen(true);
                      }}
                      className="bg-slate-800 hover:bg-slate-700"
                      >
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>

          <Dialog open={isStakeDialogOpen} onOpenChange={setStakeDialogOpen}>
            <DialogContent className="bg-slate-900 text-white border border-slate-700/50">
              <DialogHeader>
                <DialogTitle>Stake Tokens</DialogTitle>
                <DialogDescription>
                  Enter the amount you want to stake
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  type="number"
                  step="0.00000001"
                  min="0.00000001"
                  placeholder={`Amount of ${poolSymbol}`}
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  className="bg-slate-800 border-slate-700 text-white"
                />
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setStakeDialogOpen(false)}
                    className="border-slate-600 text-slate-200 hover:bg-slate-800 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleStake}
                    disabled={isProcessing || !stakeAmount || parseFloat(stakeAmount) <= 0}
                    className={cn(
                      "ml-2 bg-slate-800/30 border border-slate-700/50 hover:bg-slate-700/50",
                      tierConfig?.color
                    )}
                  >
                    {isProcessing ? 'Processing...' : 'Confirm Stake'}
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isUnstakeDialogOpen} onOpenChange={setUnstakeDialogOpen}>
            <DialogContent className="bg-slate-900 text-white border border-slate-700/50">
              <DialogHeader>
                <DialogTitle>Unstake Tokens</DialogTitle>
                <DialogDescription>
                  Enter the amount you want to unstake
                  {stakedData && ` (Max: ${formatTokenAmount(parseFloat(stakedData.staked_quantity), poolSymbol)})`}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  type="number"
                  step="0.00000001"
                  min="0.00000001"
                  max={stakedData ? parseTokenString(stakedData.staked_quantity).amount : 0}
                  placeholder={`Amount of ${poolSymbol}`}
                  value={unstakeAmount}
                  onChange={handleUnstakeAmountChange}
                  className="bg-slate-800 border-slate-700 text-white"
                />
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setUnstakeDialogOpen(false)}
                    className="border-slate-600 hover:bg-slate-800"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleUnstake}
                    disabled={isProcessing || !unstakeAmount || parseFloat(unstakeAmount) <= 0}
                    className={cn(
                      "ml-2 bg-slate-800/30 border border-slate-700/50 hover:bg-slate-700/50",
                      tierConfig?.color
                    )}
                  >
                    {isProcessing ? 'Processing...' : 'Confirm Unstake'}
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};