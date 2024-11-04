// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Context Providers
import { NotificationsProvider } from './contexts/NotificationsContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { PoolProvider } from './contexts/PoolContext';
import { GuildProvider } from './contexts/GuildContext';
import { ChallengesProvider } from './contexts/ChallengesContext';
import { AnalyticsProvider } from './contexts/AnalyticsContext';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <NotificationsProvider>
      <SettingsProvider>
        <PoolProvider>
          <GuildProvider>
            <ChallengesProvider>
              <AnalyticsProvider>
                <App />
              </AnalyticsProvider>
            </ChallengesProvider>
          </GuildProvider>
        </PoolProvider>
      </SettingsProvider>
    </NotificationsProvider>
  </React.StrictMode>
);