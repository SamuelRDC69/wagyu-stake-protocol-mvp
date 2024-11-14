import { useState, useEffect } from 'react';
import { ThemeProvider } from './providers/MantineProvider';
import { WagyuDashboard } from './components/dashboard/WagyuDashboard';
import { Chains, Session, SessionKit } from '@wharfkit/session';
import { WalletPluginAnchor } from '@wharfkit/wallet-plugin-anchor';
import WebRenderer from '@wharfkit/web-renderer';
import { LoadingOverlay } from '@mantine/core';

const sessionKit = new SessionKit({
  appName: 'WAGYU Staking',
  chains: [Chains.Jungle4],
  ui: new WebRenderer(),
  walletPlugins: [new WalletPluginAnchor()],
});

export default function App() {
  const [session, setSession] = useState<Session | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    sessionKit.restore().then((restored) => {
      setSession(restored);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return <LoadingOverlay visible={true} />;
  }

  return (
    <ThemeProvider>
      <WagyuDashboard 
        session={session}
        sessionKit={sessionKit}
        onUpdateSession={setSession}
      />
    </ThemeProvider>
  );
}