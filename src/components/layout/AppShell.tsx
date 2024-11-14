import { AppShell as MantineAppShell, Box } from '@mantine/core';
import { Navigation } from './Navigation';
import { useWharfKit } from '../../hooks/useWharfKit';
import { WagyuProvider } from '../../providers/WagyuProvider';
import { LoadingOverlay } from '@mantine/core';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const { isLoading } = useWharfKit();

  return (
    <WagyuProvider>
      <MantineAppShell
        padding="md"
        header={{ height: 60 }}
        footer={{ height: 60 }}
        bg="dark.9"
      >
        <MantineAppShell.Header>
          <Navigation />
        </MantineAppShell.Header>

        <MantineAppShell.Main>
          {isLoading ? (
            <LoadingOverlay visible={true} overlayBlur={2} />
          ) : (
            <Box className="container mx-auto max-w-3xl">{children}</Box>
          )}
        </MantineAppShell.Main>

        <MantineAppShell.Footer
          className="sm:hidden"
          bg="dark.8"
        >
          <BottomNav />
        </MantineAppShell.Footer>
      </MantineAppShell>
    </WagyuProvider>
  );
}