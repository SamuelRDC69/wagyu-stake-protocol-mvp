import { useState, useEffect } from 'react';
import { Session } from '@wharfkit/session';
import { sessionKit } from '../config/chain';
import { notifications } from '@mantine/notifications';

interface UseWharfKitReturn {
  session: Session | undefined;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  isLoggedIn: boolean;
  accountName: string | undefined;
}

export function useWharfKit(): UseWharfKitReturn {
  const [session, setSession] = useState<Session | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    sessionKit.restore().then((restored) => {
      setSession(restored);
      setIsLoading(false);
    });
  }, []);

  const login = async () => {
    try {
      setIsLoading(true);
      const response = await sessionKit.login();
      setSession(response.session);
      notifications.show({
        title: 'Connected',
        message: `Welcome ${response.session.actor}`,
        color: 'green',
      });
    } catch (e) {
      notifications.show({
        title: 'Connection Failed',
        message: 'Could not connect wallet',
        color: 'red',
      });
      console.error('Login failed:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      if (session) {
        await sessionKit.logout(session);
        setSession(undefined);
        notifications.show({
          title: 'Disconnected',
          message: 'Wallet disconnected successfully',
          color: 'blue',
        });
      }
    } catch (e) {
      console.error('Logout failed:', e);
    }
  };

  return {
    session,
    login,
    logout,
    isLoading,
    isLoggedIn: !!session,
    accountName: session?.actor.toString(),
  };
}