import React from 'react';
import { cn } from '@/lib/utils';
import { getTierConfig, getTierDisplayName } from '@/lib/utils/tierUtils';

interface TierBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  tier: string;
  showIcon?: boolean;
  showLevel?: boolean;
  animate?: boolean;
  compact?: boolean;
}

export const TierBadge: React.FC<TierBadgeProps> = ({
  tier,
  showIcon = true,
  showLevel = true,
  animate = false,
  compact = false,
  className,
  ...props
}) => {
  const style = getTierConfig(tier);
  const Icon = style.icon;
  const displayName = getTierDisplayName(tier);

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg font-medium transition-all duration-200',
        !compact && 'gap-2 px-2.5 py-1 text-xs md:text-sm',
        compact && 'gap-1.5 px-2 py-0.5 text-xs',
        'border border-slate-700/50',
        style.bgColor,
        style.color,
        animate && 'animate-pulse',
        className
      )}
      {...props}
    >
      {showIcon && (
        <Icon 
          className={cn(
            "flex-shrink-0",
            compact ? "w-3 h-3" : "w-3.5 h-3.5 md:w-4 md:h-4"
          )} 
        />
      )}
      <span className="relative top-px truncate">
        {showLevel ? displayName : tier.toUpperCase()}
      </span>
    </div>
  );
};