import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { CooldownTimer } from './CooldownTimer';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../ui/dialog";
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
} from "../ui/alert-dialog";
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { TrendingDown, Timer, TrendingUp } from 'lucide-react';
import { StakedEntity } from '../../lib/types/staked';
import { ConfigEntity } from '../../lib/types/config';
import { formatLastAction } from '../../lib/utils/dateUtils';
import { formatTokenAmount, parseTokenString } from '../../lib/utils/tokenUtils';
import { getTierColor } from '../../lib/utils/tierUtils';

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
            <div className="h-4 bg-slate-700 rounded w-1/4"></div>
            <div className="h-4 bg-slate-700 rounded w-1/2"></div>
            <div className="h-4 bg-slate-700 rounded w-1/3"></div>
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


  const { amount: stakedAmount, symbol } = parseTokenString(stakedData.staked_quantity);

  const handleUnstakeAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setUnstakeAmount('');
      return;
    }
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;
    
    // Cap at maximum staked amount
    if (numValue > stakedAmount) {
      setUnstakeAmount(stakedAmount.toString());
    } else {
      setUnstakeAmount(value);
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

  return (
  <Card className="w-full">
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle>Your Status</CardTitle>
        {stakedData && (
          <Badge 
            variant={stakedData.tier.toLowerCase() as 'bronze' | 'silver' | 'gold'}
            className={`${getTierColor(stakedData.tier)} animate-pulse`}
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
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Staked Amount</span>
              <span className="text-purple-200 font-medium">
                {formatTokenAmount(parseFloat(stakedData.staked_quantity), symbol)}
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
          </>
        ) : (
          <div className="text-center text-slate-400 mb-4">
            No active stake. Start staking to earn rewards!
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 pt-4">
          <Button
            className="w-full bg-purple-600 hover:bg-purple-700"
            onClick={() => setStakeDialogOpen(true)}
            disabled={isProcessing}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Stake
          </Button>

          {stakedData && (
            <>
              <Button
                className="w-full bg-purple-600 hover:bg-purple-700"
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
                    className="w-full"
                    disabled={isProcessing}
                  >
                    <TrendingDown className="w-4 h-4 mr-2" />
                    Unstake
                  </Button>
                </AlertDialogTrigger>
              <AlertDialogContent className="bg-slate-900 text-white">
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Unstaking will remove your tokens from the pool and may affect your tier status.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setConfirmDialogOpen(false)}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction onClick={() => {
                    setConfirmDialogOpen(false);
                    setUnstakeDialogOpen(true);
                  }}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Dialog open={isStakeDialogOpen} onOpenChange={setStakeDialogOpen}>
              <DialogContent className="bg-slate-900 text-white">
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
                      variant="ghost"
                      onClick={() => setStakeDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleStake}
                      disabled={isProcessing || !stakeAmount || parseFloat(stakeAmount) <= 0}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {isProcessing ? 'Processing...' : 'Confirm Stake'}
                    </Button>
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={isUnstakeDialogOpen} onOpenChange={setUnstakeDialogOpen}>
              <DialogContent className="bg-slate-900 text-white">
                <DialogHeader>
                  <DialogTitle>Unstake Tokens</DialogTitle>
                  <DialogDescription>
                    Enter the amount you want to unstake (Max: {formatTokenAmount(stakedAmount, symbol)})
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    type="number"
                    step="0.00000001"
                    min="0.00000001"
                    max={stakedAmount}
                    placeholder={`Amount of ${symbol}`}
                    value={unstakeAmount}
                    onChange={handleUnstakeAmountChange}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                  <DialogFooter>
                    <Button
                      variant="ghost"
                      onClick={() => setUnstakeDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleUnstake}
                      disabled={isProcessing || !unstakeAmount || parseFloat(unstakeAmount) <= 0}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      {isProcessing ? 'Processing...' : 'Confirm Unstake'}
                    </Button>
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};