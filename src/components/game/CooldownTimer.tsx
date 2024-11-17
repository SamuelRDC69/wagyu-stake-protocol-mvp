import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Timer } from 'lucide-react';

interface CooldownTimerProps {
  cooldownEndAt: string;
  cooldownSeconds: number;
}

export const CooldownTimer: React.FC<CooldownTimerProps> = ({
  cooldownEndAt,
  cooldownSeconds,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(cooldownEndAt).getTime();
      const difference = end - now;
      
      if (difference > 0) {
        setTimeLeft(Math.floor(difference / 1000));
      } else {
        setTimeLeft(0);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [cooldownEndAt]);

  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return 'Ready';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const progress = ((cooldownSeconds - timeLeft) / cooldownSeconds) * 100;

  return (
    <div className="flex items-center gap-4">
      <Timer className={`w-5 h-5 ${timeLeft === 0 ? 'text-green-500' : 'text-yellow-500'}`} />
      <div className="flex-1">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-400">Next Action</span>
          <span className={`font-medium ${timeLeft === 0 ? 'text-green-500' : 'text-yellow-500'}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5">
          <div 
            className="bg-gradient-to-r from-purple-600 to-purple-400 h-1.5 rounded-full transition-all duration-1000"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};