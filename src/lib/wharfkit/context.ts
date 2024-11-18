// In lib/wharfkit/context.tsx

import React, { createContext, useState, useEffect } from 'react';
import { Session, SessionKit } from '@wharfkit/session';

export const WharfkitContext = createContext<{
  session: Session | undefined;
  setSession: (session: Session | undefined) => void;
  sessionKit: SessionKit;
}>({
  session: undefined,
  setSession: () => {},
  sessionKit: {} as SessionKit,
});

export const WharfkitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | undefined>(undefined);
  const [sessionKit] = useState(() => new SessionKit(/* your config */));

  // Try to restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const restored = await sessionKit.restore();
        if (restored) {
          setSession(restored);
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
      }
    };

    restoreSession();
  }, [sessionKit]);

  return (
    <WharfkitContext.Provider value={{ session, setSession, sessionKit }}>
      {children}
    </WharfkitContext.Provider>
  );
};