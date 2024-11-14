import { AppShell, Box, LoadingOverlay } from '@mantine/core';
import { Navigation } from './Navigation';
import { BottomNav } from './BottomNav';
import { useWharfKit } from '../../hooks/useWharfKit';
import { WagyuProvider } from '../../providers/WagyuProvider';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShellLayout({ children }: AppShellProps) {
  const { isLoading } = useWharfKit();

  return (
    <WagyuProvider>
      <AppShell
        padding="md"
        header={<Navigation />}
        footer={<BottomNav />}
        styles={(theme) => ({
          main: {
            backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
          },
        })}
      >
        {isLoading ? (
          <LoadingOverlay visible={true} overlayBlur={2} />
        ) : (
          <Box mx="auto" maw={1200}>
            {children}
          </Box>
        )}
      </AppShell>
    </WagyuProvider>
  );
}