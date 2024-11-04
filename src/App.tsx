// src/App.tsx
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Chains, Session, SessionKit } from '@wharfkit/session';
import { WalletPluginAnchor } from '@wharfkit/wallet-plugin-anchor';
import WebRenderer from '@wharfkit/web-renderer';
import React from 'react';
import {
  Dashboard,
  PoolHealth,
  Staking,
  Strategy,
  Guilds,
  Challenges,
  Analytics,
  Settings,
  NotificationCenter
} from './components';
import { Layout } from './components/Layout';
import { Modals } from './components/Modals';
import { Tutorial } from './components/Tutorial';
import { ToastNotifications } from './components/Notifications';

// Initialize SessionKit
const sessionKit = new SessionKit({
  appName: 'Stakeland',
  chains: [Chains.WAX],
  ui: new WebRenderer(),
  walletPlugins: [
    new WalletPluginAnchor(),
  ],
});

// Define available routes
const ROUTES = {
  DASHBOARD: 'dashboard',
  POOL: 'pool',
  STAKING: 'staking',
  STRATEGY: 'strategy',
  GUILDS: 'guilds',
  CHALLENGES: 'challenges',
  ANALYTICS: 'analytics',
  SETTINGS: 'settings',
} as const;

function App() {
  // Session state
  const [session, setSession]: [Session | undefined, Dispatch<SetStateAction<Session | undefined>>] = useState();
  // Current route
  const [currentRoute, setCurrentRoute] = useState<keyof typeof ROUTES>(ROUTES.DASHBOARD);
  // Tutorial state
  const [showTutorial, setShowTutorial] = useState(false);
  // Notifications state
  const [notifications, setNotifications] = useState([]);

  // Restore session on mount
  useEffect(() => {
    sessionKit.restore().then((restored) => setSession(restored));
  }, []);

  // Authentication handlers
  const handleLogin = async () => {
    try {
      const response = await sessionKit.login();
      setSession(response.session);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await sessionKit.logout(session);
      setSession(undefined);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Render content based on route
  const renderContent = () => {
    if (!session) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-4xl font-bold mb-8">Welcome to Stakeland</h1>
          <button
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
            onClick={handleLogin}
          >
            Connect Wallet
          </button>
        </div>
      );
    }

    switch (currentRoute) {
      case ROUTES.DASHBOARD:
        return <Dashboard />;
      case ROUTES.POOL:
        return <PoolHealth />;
      case ROUTES.STAKING:
        return <Staking />;
      case ROUTES.STRATEGY:
        return <Strategy />;
      case ROUTES.GUILDS:
        return <Guilds />;
      case ROUTES.CHALLENGES:
        return <Challenges />;
      case ROUTES.ANALYTICS:
        return <Analytics />;
      case ROUTES.SETTINGS:
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout
      session={session}
      onLogout={handleLogout}
      currentRoute={currentRoute}
      onRouteChange={setCurrentRoute}
      notifications={notifications}
    >
      {renderContent()}
      
      <ToastNotifications />
      <Modals />
      
      {showTutorial && (
        <Tutorial 
          onComplete={() => setShowTutorial(false)}
          currentRoute={currentRoute}
        />
      )}
    </Layout>
  );
}

export default App;