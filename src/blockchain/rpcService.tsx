// WAX Mainnet RPC endpoints (can be changed to testnet for development)
export const RPC_ENDPOINTS = {
    MAINNET: [
        'https://wax.greymass.com',
        'https://api.waxsweden.org',
        'https://wax.cryptolions.io'
    ],
    TESTNET: [
        'https://testnet.waxsweden.org',
        'https://testnet.wax.pink.gg'
    ]
}

class RpcService {
    private static instance: RpcService
    private currentEndpoint: string

    private constructor() {
        // Start with first mainnet endpoint
        this.currentEndpoint = RPC_ENDPOINTS.MAINNET[0]
    }

    public static getInstance(): RpcService {
        if (!RpcService.instance) {
            RpcService.instance = new RpcService()
        }
        return RpcService.instance
    }

    async fetchTableRows<T>({
        code,
        scope,
        table,
        limit = 100,
        lower_bound = null,
        upper_bound = null,
        index_position = 1,
        key_type = 'i64',
        reverse = false,
    }): Promise<{ rows: T[], more: boolean, next_key: string }> {
        try {
            const response = await fetch(`${this.currentEndpoint}/v1/chain/get_table_rows`, {
                method: 'POST',
                body: JSON.stringify({
                    json: true,
                    code,
                    scope,
                    table,
                    limit,
                    lower_bound,
                    upper_bound,
                    index_position,
                    key_type,
                    reverse,
                }),
            })

            if (!response.ok) {
                throw new Error(`RPC error: ${response.statusText}`)
            }

            const data = await response.json()
            return data
        } catch (error) {
            console.error('RPC fetch error:', error)
            // Try another endpoint if available
            this.rotateEndpoint()
            throw error
        }
    }

    private rotateEndpoint(): void {
        const currentIndex = RPC_ENDPOINTS.MAINNET.indexOf(this.currentEndpoint)
        const nextIndex = (currentIndex + 1) % RPC_ENDPOINTS.MAINNET.length
        this.currentEndpoint = RPC_ENDPOINTS.MAINNET[nextIndex]
        console.log(`Switched to RPC endpoint: ${this.currentEndpoint}`)
    }

    // Helper method to get account information
    async getAccount(accountName: string) {
        try {
            const response = await fetch(`${this.currentEndpoint}/v1/chain/get_account`, {
                method: 'POST',
                body: JSON.stringify({ account_name: accountName }),
            })

            if (!response.ok) {
                throw new Error(`RPC error: ${response.statusText}`)
            }

            return await response.json()
        } catch (error) {
            console.error('Error fetching account:', error)
            this.rotateEndpoint()
            throw error
        }
    }

    // Helper method to get token balances
    async getTokenBalance(account: string, code: string, symbol: string) {
        try {
            const response = await this.fetchTableRows<any>({
                code,
                scope: account,
                table: 'accounts',
                limit: 1,
                lower_bound: symbol,
                upper_bound: symbol
            })
            return response.rows[0]?.balance || '0.0000 ' + symbol
        } catch (error) {
            console.error('Error fetching token balance:', error)
            throw error
        }
    }
}

export default RpcService.getInstance()