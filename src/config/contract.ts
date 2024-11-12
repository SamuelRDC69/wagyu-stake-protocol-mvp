// src/config/contract.ts
import { SessionKit } from "@wharfkit/session"
import { WalletPluginAnchor } from "@wharfkit/wallet-plugin-anchor"
import WebRenderer from "@wharfkit/web-renderer"
import { Chains } from "@wharfkit/session"

export const CONTRACT_ACCOUNT = "token.stake" // Replace with your contract account

export const sessionKit = new SessionKit({
  appName: "Stakeland Admin",
  chains: [Chains.Jungle4], // Change to Chains.EOS for mainnet
  walletPlugins: [new WalletPluginAnchor()],
  ui: new WebRenderer()
})

// Contract table interfaces
export interface ConfigState {
  maintenance: boolean
  cooldown_seconds_per_claim: number
  vault_account: string
}

export interface TierEntity {
  tier: string
  tier_name: string
  weight: number
  staked_up_to_percent: number
}

export interface PoolEntity {
  pool_id: number
  staked_token_contract: string
  total_staked_quantity: string
  total_staked_weight: string
  reward_pool: {
    quantity: string
    contract: string
  }
  emission_unit: number
  emission_rate: number
  last_emission_updated_at: string
  is_active: boolean
}

// Helper to format asset strings
export const formatAsset = (assetString: string) => {
  const [amount, symbol] = assetString.split(' ')
  return {
    formatted: `${parseFloat(amount).toLocaleString()} ${symbol}`,
    raw: assetString
  }
}