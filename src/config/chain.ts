import { Chains, SessionKit } from '@wharfkit/session';
import { WalletPluginAnchor } from '@wharfkit/wallet-plugin-anchor';
import WebRenderer from '@wharfkit/web-renderer';

// Initialize SessionKit with WAX testnet
export const sessionKit = new SessionKit({
  appName: 'WAGYU Staking',
  chains: [Chains.Jungle4], // Will change to WAX mainnet/testnet
  ui: new WebRenderer(),
  walletPlugins: [new WalletPluginAnchor()],
});

// Chain & Contract Constants
export const CHAIN_CONSTANTS = {
  TOKEN_PRECISION: 4,
  BLOCK_TIME_MS: 500,
} as const;