import { createContext } from 'react';
import { Session } from '@wharfkit/session';

export const WharfkitContext = createContext<{
  session: Session | undefined;
  setSession: (session: Session | undefined) => void;
}>({
  session: undefined,
  setSession: () => {},
});