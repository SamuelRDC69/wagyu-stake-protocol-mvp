import { Session } from '@wharfkit/session';

export class ContractService {
  private readonly contractAccount = 'token.stake';

  constructor(private session: Session) {}

  // Core transaction handler
  private async transact(action: string, data: any) {
    if (!this.session) {
      throw new Error('No session available');
    }

    const transaction = {
      action: {
        account: this.contractAccount,
        name: action,
        authorization: [this.session.permissionLevel],
        data: data
      }
    };

    return await this.session.transact(transaction);
  }

  // Contract Actions
  async setConfig(cooldown: number, vault: string) {
    return this.transact('setconfig', {
      cooldown_seconds_per_claim: cooldown,
      vault_account: vault
    });
  }

  async setMaintenance(enabled: boolean) {
    return this.transact('maintenance', { maintenance: enabled });
  }

  async setTier(data: TierData) {
    return this.transact('settier', data);
  }

  async removeTier(tier: string) {
    return this.transact('removetier', { tier });
  }

  async setPool(data: PoolData) {
    return this.transact('setpool', data);
  }

  async setPoolActive(poolId: number, isActive: boolean) {
    return this.transact('setpoolact', { 
      pool_id: poolId, 
      is_active: isActive 
    });
  }

  // Table Queries
  async getConfig(): Promise<ConfigData> {
    const response = await this.session.client.v1.chain.get_table_rows({
      code: this.contractAccount,
      scope: this.contractAccount,
      table: 'config',
      limit: 1
    });
    return response.rows[0];
  }

  async getTiers(): Promise<TierData[]> {
    const response = await this.session.client.v1.chain.get_table_rows({
      code: this.contractAccount,
      scope: this.contractAccount,
      table: 'tiers',
      limit: 100
    });
    return response.rows;
  }
}