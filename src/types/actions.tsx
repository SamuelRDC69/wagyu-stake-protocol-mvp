import { Asset, Name, PermissionLevel } from '@wharfkit/session';
import { ReactNode } from 'react';

// Component Action Props
export interface ActionComponentProps {
  children?: ReactNode;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

// Contract Actions
export interface StakeAction {
  account: Name;
  name: 'transfer';
  authorization: PermissionLevel[];
  data: {
    from: Name;
    to: Name;
    quantity: Asset;
    memo: string;
  };
}

export interface UnstakeAction {
  account: Name;
  name: 'unstake';
  authorization: PermissionLevel[];
  data: {
    claimer: Name;
    pool_id: number;
    quantity: Asset;
  };
}

export interface ClaimAction {
  account: Name;
  name: 'claim';
  authorization: PermissionLevel[];
  data: {
    claimer: Name;
    pool_id: number;
  };
}

// Transaction Context Types
export interface TransactionContextState {
  isProcessing: boolean;
  error?: ContractError;
  resetError: () => void;
}

// Response & Error Types
export interface TableResponse<T> {
  rows: T[];
  more: boolean;
  next_key: string;
}

export interface ContractError extends Error {
  json: {
    error: {
      what: string;
      details: string[];
    };
  };
}