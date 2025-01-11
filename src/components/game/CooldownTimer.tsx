import React, { useState, useEffect, useCallback } from 'react';
import { Timer } from 'lucide-react';
import { Progress } from '../ui/progress';
import { 
  calculateTimeLeft, 
  formatTimeLeft,
  calculateCooldownProgress,
  isActionReady 
} from '../../lib/utils/dateUtils';

interface CooldownTimerProps {
  cooldownEndAt: string;
  cooldownSeconds: number;
  onComplete?: () => void;
}

export const CooldownTimer: React.FC<CooldownTimerProps> = ({
  cooldownEndAt,
  cooldownSeconds,
  onComplete
}) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(cooldownEndAt));
  const [progress, setProgress] = useState(calculateCooldownProgress(cooldownEndAt, cooldownSeconds));
  
  // Reset timer when cooldownEndAt changes
  useEffect(() => {
    setTimeLeft(calculateTimeLeft(cooldownEndAt));
    setProgress(calculateCooldownProgress(cooldownEndAt, cooldownSeconds));
  }, [cooldownEndAt, cooldownSeconds]);

  const updateTimer = useCallback(() => {
    const newTimeLeft = calculateTimeLeft(cooldownEndAt);
    const newProgress = calculateCooldownProgress(cooldownEndAt, cooldownSeconds);
    
    setTimeLeft(newTimeLeft);
    setProgress(newProgress);

    if (newTimeLeft === 0 && timeLeft !== 0) {
      onComplete?.();
    }
  }, [cooldownEndAt, cooldownSeconds, onComplete, timeLeft]);

  useEffect(() => {
    // Initial update
    updateTimer();
    
    // Start interval
    const interval = setInterval(updateTimer, 1000);
    
    // Cleanup interval on unmount or when cooldownEndAt changes
    return () => clearInterval(interval);
  }, [updateTimer, cooldownEndAt]);

  const ready = isActionReady(cooldownEndAt);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer className={ready ? 'text-green-500' : 'text-yellow-500'} />
          <span className="text-sm text-slate-400">Next Action</span>
        </div>
        <span className={`text-sm font-medium ${
          ready ? 'text-green-500' : 'text-yellow-500'
        }`}>
          {formatTimeLeft(timeLeft)}
        </span>
      </div>

      <Progress 
        value={progress} 
        className="h-1.5"
        color={ready ? 'bg-green-500' : 'bg-yellow-500'}
      />
      
      {ready && (
        <p className="text-xs text-green-500 text-center animate-pulse">
          Ready for next action!
        </p>
      )}
    </div>
  );
};