import { Asset } from '@wharfkit/session';
import { CHAIN_CONSTANTS } from '../config/chain';

export const formatTokenAmount = (amount: Asset | string | number, includeSymbol = true): string => {
  try {
    const assetInstance = typeof amount === 'string' || typeof amount === 'number' 
      ? Asset.from(`${Number(amount).toFixed(CHAIN_CONSTANTS.TOKEN_PRECISION)} WAX`)
      : amount;

    const formatted = assetInstance.toString();
    return includeSymbol ? formatted : formatted.split(' ')[0];
  } catch (e) {
    console.error('Format error:', e);
    return '0.0000';
  }
};

export const formatTimeLeft = (milliseconds: number): string => {
  if (milliseconds <= 0) return 'Ready';
  
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
};

export const formatPercent = (value: number): string => {
  return `${(value * 100).toFixed(2)}%`;
};

export const shortenAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};