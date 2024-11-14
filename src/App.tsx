import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { AppShell } from './components/layout/AppShell';
import { StakeDashboard } from './components/staking/StakeDashboard';
import { theme } from './styles/theme';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import { sessionKit } from './config/chain';
import { ModalsProvider } from '@mantine/modals';

function App() {
  return (
    <MantineProvider theme={theme} withNormalizeCSS withGlobalStyles>
      <ModalsProvider>
        <Notifications position="top-right" />
        <BrowserRouter>
          <AppShell>
            <Routes>
              <Route path="/" element={<StakeDashboard />} />
              {/* Add more routes as needed */}
            </Routes>
          </AppShell>
        </BrowserRouter>
      </ModalsProvider>
    </MantineProvider>
  );
}

export default App;