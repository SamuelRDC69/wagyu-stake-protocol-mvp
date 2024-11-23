import { SessionKit } from "@wharfkit/session"
import { WalletPluginAnchor } from "@wharfkit/wallet-plugin-anchor"
import WebRenderer from "@wharfkit/web-renderer"
import { Chains } from "@wharfkit/session"

export const CONTRACT_ACCOUNT = "testnextproj" // Replace with your contract account

export const sessionKit = new SessionKit({
  appName: "Stakeland Admin",
  chains: [Chains.WAXTestnet], // Change to Chains.EOS for mainnet
  walletPlugins: [new WalletPluginAnchor()],
  ui: new WebRenderer()
})

// Helper to format asset strings
export const formatAsset = (assetString: string) => {
  const [amount, symbol] = assetString.split(' ')
  return {
    formatted: `${parseFloat(amount).toLocaleString()} ${symbol}`,
    raw: assetString
  }
}
