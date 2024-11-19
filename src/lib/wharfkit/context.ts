import { createContext } from 'react';
import { Session, SessionKit } from '@wharfkit/session';

interface WharfkitContextType {
  session: Session | undefined;
  setSession: (session: Session | undefined) => void;
  sessionKit: SessionKit;
}

export const WharfkitContext = createContext<WharfkitContextType>({} as WharfkitContextType);