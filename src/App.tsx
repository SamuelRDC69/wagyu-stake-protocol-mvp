import { useEffect, useState } from 'react'
import { Session } from '@wharfkit/session'
import GameUI from './components/GameUI'
import { NotificationContainer } from './components/NotificationContainer'
import { WharfkitContext } from './lib/wharfkit/context'
import { sessionService } from './lib/services/session.service'
import { chainService } from './lib/services/chain.service'
import './index.css'
import './App.css'

function App() {
  const [session, setSession] = useState<Session | undefined>();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const restoredSession = await sessionService.restoreSession();
        if (restoredSession) {
          setSession(restoredSession);
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeSession();

    // Cleanup handler for page unload
    const handleUnload = () => {
      chainService.clearCache();
    };
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      chainService.clearCache();
    };
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
      sessionKit: sessionService.getSessionKit() 
    }}>
      <div className="App">
        <GameUI />
        <NotificationContainer />
      </div>
    </WharfkitContext.Provider>
  )
}

export default App