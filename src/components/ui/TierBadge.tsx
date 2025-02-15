import React from 'react';
import { cn } from '@/lib/utils';
import { getTierConfig, getTierDisplayName } from '@/lib/utils/tierUtils';

interface TierBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  tier: string;
  showIcon?: boolean;
  showLevel?: boolean;
  animate?: boolean;
}

export const TierBadge: React.FC<TierBadgeProps> = ({
  tier,
  showIcon = true,
  showLevel = true,
  animate = false,
  className,
  ...props
}) => {
  const style = getTierConfig(tier);
  const Icon = style.icon;
  const displayName = getTierDisplayName(tier);

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs md:text-sm font-medium',
        'border transition-all duration-200',
        style.bgColor,
        style.color,
        'border-slate-700/50',
        animate && 'animate-pulse',
        className
      )}
      {...props}
    >
      {showIcon && <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />}
      <span className="relative top-px">
        {showLevel ? displayName : tier.toUpperCase()}
      </span>
    </div>
  );
};