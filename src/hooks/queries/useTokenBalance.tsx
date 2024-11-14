import { useEffect, useState } from 'react';
import { useWharfKit } from '../useWharfKit';
import { Asset, Name } from '@wharfkit/session';

interface UseTokenBalanceReturn {
  balance: Asset | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useTokenBalance(
  contractAccount: Name,
  symbol: string
): UseTokenBalanceReturn {
  const { session } = useWharfKit();
  const [balance, setBalance] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBalance = async () => {
    if (!session) return;

    try {
      setIsLoading(true);
      const response = await session.client.v1.chain.get_currency_balance(
        contractAccount.toString(),
        session.actor.toString(),
        symbol
      );

      if (response[0]) {
        setBalance(Asset.from(response[0]));
      }
      setError(null);
    } catch (e) {
      setError(e as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchBalance();
      // Poll every 6 seconds for updates
      const interval = setInterval(fetchBalance, 6000);
      return () => clearInterval(interval);
    }
  }, [session, contractAccount, symbol]);

  return { balance, isLoading, error, refetch: fetchBalance };
}