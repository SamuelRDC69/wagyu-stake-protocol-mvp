import React, { createContext, useState, useEffect } from 'react';
import { Session, SessionKit } from '@wharfkit/session';

interface WharfkitContextType {
  session: Session | undefined;
  setSession: (session: Session | undefined) => void;
  sessionKit: SessionKit;
}

export const WharfkitContext = createContext<WharfkitContextType>({
  session: undefined,
  setSession: () => {},
  sessionKit: {} as SessionKit,
});

export const WharfkitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | undefined>(undefined);
  const [sessionKit] = useState(() => new SessionKit({
    // Your sessionKit config here
  }));

  // Try to restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const restored = await sessionKit.restore();
        if (restored) {
          console.log('Session restored:', restored.actor.toString());
          setSession(restored);
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
      }
    };

    restoreSession();
  }, [sessionKit]);

  const value = {
    session,
    setSession,
    sessionKit
  };

  return (
    <WharfkitContext.Provider value={value}>
      {children}
    </WharfkitContext.Provider>
  );
};