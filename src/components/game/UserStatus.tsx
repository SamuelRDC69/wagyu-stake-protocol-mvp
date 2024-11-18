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
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { TrendingDown, Timer } from 'lucide-react';
import { StakedEntity } from '../../lib/types/staked';
import { ConfigEntity } from '../../lib/types/config';
import { formatLastAction } from '../../lib/utils/dateUtils';
import { formatTokenAmount, parseTokenString } from '../../lib/utils/tokenUtils';
import { getTierColor } from '../../lib/utils/tierUtils';

interface UserStatusProps {
  stakedData: StakedEntity;
  config: Pick<ConfigEntity, 'cooldown_seconds_per_claim'>;
  onCooldownComplete?: () => void;
  onClaim: () => Promise<void>;
  onUnstake: (amount: string) => Promise<void>;
}

export const UserStatus: React.FC<UserStatusProps> = ({
  stakedData,
  config,
  onCooldownComplete,
  onClaim,
  onUnstake
}) => {
  const [isUnstakeDialogOpen, setUnstakeDialogOpen] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

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
      setShowConfirmDialog(false);
      setUnstakeAmount('');
    } finally {
      setIsProcessing(false);
    }
  };

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
              {formatTokenAmount(stakedAmount, symbol)}
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

          <div className="grid grid-cols-2 gap-4 pt-4">
            <Button
              className="w-full bg-purple-600 hover:bg-purple-700"
              onClick={handleClaim}
              disabled={isProcessing}
            >
              <Timer className="w-4 h-4 mr-2" />
              {isProcessing ? 'Processing...' : 'Claim Rewards'}
            </Button>

            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
              <DialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full"
                  disabled={isProcessing}
                >
                  <TrendingDown className="w-4 h-4 mr-2" />
                  Unstake
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-900 text-white">
                <DialogHeader>
                  <DialogTitle>Are you sure?</DialogTitle>
                  <DialogDescription>
                    Unstaking will remove your tokens from the pool and may affect your tier status.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    onClick={() => setShowConfirmDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      setShowConfirmDialog(false);
                      setUnstakeDialogOpen(true);
                    }}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    Continue
                  </Button>
                </DialogFooter>
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