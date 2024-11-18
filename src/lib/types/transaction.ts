import { Transaction } from '@wharfkit/session';

export interface TransactionResult {
  transaction: {
    id: string;
  };
}

export type WaxTransactionResult = {
  resolved: TransactionResult;
} & Transaction;