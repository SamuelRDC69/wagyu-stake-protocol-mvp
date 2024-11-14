import { Chains, SessionKit } from '@wharfkit/session';
import { WalletPluginAnchor } from '@wharfkit/wallet-plugin-anchor';
import WebRenderer from '@wharfkit/web-renderer';
import { createContext, useContext } from 'react';

// SessionKit initialization
export const sessionKit = new SessionKit({
  appName: 'WAGYU Staking',
  chains: [Chains.Jungle4],
  ui: new WebRenderer(),
  walletPlugins: [new WalletPluginAnchor()],
});

// Chain & Contract Constants
export const CHAIN_CONSTANTS = {
  TOKEN_PRECISION: 4,
  BLOCK_TIME_MS: 500,
} as const;

// Session Context
export interface SessionContextType {
  sessionKit: SessionKit;
}

export const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const useSessionContext = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSessionContext must be used within a SessionProvider');
  }
  return context;
};