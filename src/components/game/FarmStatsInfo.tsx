import React from 'react';
import { Shield, TrendingUp, Scale } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface FarmStatsInfoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FarmStatsInfo: React.FC<FarmStatsInfoProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-slate-700/50">
        <DialogHeader>
          <DialogTitle className="text-purple-200">
            Understanding Farm Statistics
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 text-slate-200">
          <div>
            <h3 className="font-semibold mb-2 text-purple-300 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Total Staked to Farm
            </h3>
            <ul className="space-y-1 text-sm text-slate-300">
              <li className="flex gap-2">
                <span>•</span>
                <span>Shows the total amount of tokens currently staked in the farm</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Displays the total value from all stakers</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Updates when the data refreshes (30 second intervals)</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2 text-purple-300 flex items-center gap-2">
              <Scale className="w-4 h-4" />
              Farm Total Weight
            </h3>
            <ul className="space-y-1 text-sm text-slate-300">
              <li className="flex gap-2">
                <span>•</span>
                <span>Starts with a preset baseline weight to ensure fair initial distribution</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Grows as users stake and their level multipliers are applied</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Total weight = Preset weight + Combined user weights</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2 text-purple-300 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Farm Rewards Pool
            </h3>
            <ul className="space-y-1 text-sm text-slate-300">
              <li className="flex gap-2">
                <span>•</span>
                <span>Shows current tokens available in the rewards pool</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Updates in real-time every second based on emission rate</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Decreases when users claim rewards</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Emission rate determines how quickly new rewards are added</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2 text-purple-300 flex items-center gap-2">
              <Scale className="w-4 h-4" />
              Your Total Weight (when staked)
            </h3>
            <ul className="space-y-1 text-sm text-slate-300">
              <li className="flex gap-2">
                <span>•</span>
                <span>Shows your staked tokens multiplied by your level's power</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Percentage shows your proportion of the total farm weight</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Example: If your weight is 111 against farm weight of 10,000 = 1.11% of rewards</span>
              </li>
              <li className="flex gap-2">
                <span>•</span>
                <span>Higher weight percentage = larger share of rewards</span>
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};