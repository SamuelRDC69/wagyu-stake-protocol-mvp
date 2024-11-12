import { useState, useEffect } from 'react';
import { Session } from '@wharfkit/session';
import { sessionKit } from '../config/contract';

export const useSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    sessionKit.restore()
      .then((restored) => {
        if (restored) {
          setSession(restored);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async () => {
    try {
      setError(null);
      const response = await sessionKit.login();
      setSession(response.session);
      return response.session;
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : 'Login failed';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const logout = async () => {
    if (session) {
      await sessionKit.logout(session);
      setSession(null);
    }
  };

  return {
    session,
    loading,
    error,
    login,
    logout,
    isConnected: !!session
  };
};