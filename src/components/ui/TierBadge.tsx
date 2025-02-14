import React from 'react';
import { cn } from '@/lib/utils';
import { getTierStyle, getTierIcon, getTierDisplayName } from '@/lib/config/tierConfig';

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
  const style = getTierStyle(tier);
  const Icon = getTierIcon(tier);
  const displayName = getTierDisplayName(tier);

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-semibold',
        style.borderColor,
        style.bgColor,
        style.color,
        animate && 'animate-pulse',
        className
      )}
      {...props}
    >
      {showIcon && <Icon className="w-3 h-3" />}
      {showLevel ? displayName : tier.toUpperCase()}
    </div>
  );
};