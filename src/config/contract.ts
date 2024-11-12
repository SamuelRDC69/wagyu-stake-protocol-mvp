import { SessionKit } from "@wharfkit/session"
import { WalletPluginAnchor } from "@wharfkit/wallet-plugin-anchor"
import WebRenderer from "@wharfkit/web-renderer"
import { APIClient } from "@wharfkit/session"

export const CONTRACT_ACCOUNT = "token.stake" // Replace with your contract account

// WAX Testnet Configuration
const waxTestnet = {
  id: "f16b1833c747c43682f4386fca9cbb327929334a762755ebec17f6f23c9b8a12",
  url: "https://testnet.waxsweden.org",
  // Additional API endpoints for fallback
  apiUrls: [
    "https://testnet.waxsweden.org",
    "https://testnet.wax.pink.gg",
    "https://testnet-wax.eosphere.io",
    "https://wax-testnet.eosauthority.com"
  ]
}

// Create chain configuration
const chain = {
  id: waxTestnet.id,
  url: waxTestnet.url
}

// Optional: Create API client with multiple endpoints for better reliability
const client = new APIClient({
  endpoints: waxTestnet.apiUrls
})

export const sessionKit = new SessionKit({
  appName: "Stakeland Admin",
  chains: [chain],
  walletPlugins: [new WalletPluginAnchor()],
  ui: new WebRenderer(),
  client // Optional: Use the multi-endpoint client
})

// Helper to format asset strings
export const formatAsset = (assetString: string) => {
  const [amount, symbol] = assetString.split(' ')
  return {
    formatted: `${parseFloat(amount).toLocaleString()} ${symbol}`,
    raw: assetString
  }
}