import { createContext } from 'react';
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