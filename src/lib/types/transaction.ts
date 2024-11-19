import { TransactResult } from '@wharfkit/session';

export type WaxTransactionResult = TransactResult & {
  resolved: {
    transaction_id: string;
  };
};