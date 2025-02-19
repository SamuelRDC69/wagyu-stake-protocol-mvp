import React from 'react';
import { Clock, Wallet, Timer, TrendingDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UserStatusInfoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const UserStatusInfo: React.FC<UserStatusInfoProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700/50">
        <DialogHeader>
          <DialogTitle className="text-purple-200">
            Understanding Your Status
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 text-slate-200">
          <div>
            <h3 className="font-semibold mb-2 text-purple-300 flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Staking Mechanics
            </h3>
            <ul className="space-y-1 text-sm text-slate-300">
              <li className="flex gap-2">
                <span>•</span>
                <span>First-time staking cannot auto-claim rewards</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Subsequent stakes will automatically claim rewards before staking</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Each stake has a 0.3% platform fee deducted</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Minimum stake amount determined by fee calculation (334 tokens)</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2 text-purple-300 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Cooldown System
            </h3>
            <ul className="space-y-1 text-sm text-slate-300">
              <li className="flex gap-2">
                <span>•</span>
                <span>8-hour cooldown period between actions</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Cooldown starts after staking, claiming, or unstaking</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Must wait for cooldown to complete before next action</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Timer shows exact time remaining until next action</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2 text-purple-300 flex items-center gap-2">
              <Timer className="w-4 h-4" />
              Claiming Rewards
            </h3>
            <ul className="space-y-1 text-sm text-slate-300">
              <li className="flex gap-2">
                <span>•</span>
                <span>Claim button active when cooldown is complete</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Rewards calculated based on your weight versus total farm weight</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Auto-claims occur before new stakes (except first stake)</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Rewards sent directly to your wallet</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2 text-purple-300 flex items-center gap-2">
              <TrendingDown className="w-4 h-4" />
              Unstaking
            </h3>
            <ul className="space-y-1 text-sm text-slate-300">
              <li className="flex gap-2">
                <span>•</span>
                <span>Removes tokens from the farm</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Will affect your level and reward share</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Cooldown period applies after unstaking</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Cannot stake or claim during cooldown</span>
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};