import React from 'react';
import { getTokenConfig } from '@/lib/config/tokens';

interface TokenImageProps {
  symbol: string;
  className?: string;
  size?: number;
}

export const TokenImage = React.forwardRef<HTMLImageElement, TokenImageProps>(
  ({ symbol, className, size = 24 }, ref) => {
    const config = getTokenConfig(symbol);
    
    if (!config) {
      return <div className={className}>{symbol}</div>;
    }

    return (
      <img 
        ref={ref}
        src={config.image} 
        alt={`${config.name} token`} 
        className={className}
        width={size}
        height={size}
      />
    );
  }
);

TokenImage.displayName = 'TokenImage';