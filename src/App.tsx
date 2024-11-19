import { useState, useEffect } from 'react'
import { Session, SessionKit, Chains } from '@wharfkit/session'
import { WalletPluginAnchor } from '@wharfkit/wallet-plugin-anchor'
import WebRenderer from '@wharfkit/web-renderer'
import GameUI from './components/GameUI'
import { NotificationContainer } from './components/NotificationContainer'
import { WharfkitContext } from './lib/wharfkit/context'
import './index.css'
import './App.css'

const sessionKit = new SessionKit({
  appName: 'Stakeland',
  chains: [Chains.WAXTestnet],
  ui: new WebRenderer(),
  walletPlugins: [new WalletPluginAnchor()],
  storage: localStorage
});

function App() {
  const [session, setSession] = useState<Session | undefined>();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const restored = await sessionKit.restore();
        if (restored) setSession(restored);
      } catch (error) {
        console.error('Failed to restore session:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    restoreSession();
  }, []);

  if (isInitializing) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <WharfkitContext.Provider value={{ 
      session, 
      setSession, 
      sessionKit 
    }}>
      <div className="App">
        <GameUI />
        <NotificationContainer />
      </div>
    </WharfkitContext.Provider>
  );
}

export default App;