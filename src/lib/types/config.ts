export interface ConfigEntity {
  maintenance: number;                 // 0 or 1
  cooldown_seconds_per_claim: number;  // 60
  vault_account: string;               // "vaultvaultst"
}

export interface GameConfig {
  isMaintenance: boolean;
  cooldownPeriod: number;
  vaultAccount: string;
}