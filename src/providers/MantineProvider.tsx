import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

const theme = createTheme({
  primaryColor: 'orange',
  colors: {
    orange: [
      '#FFF5E6',
      '#FFE4CC',
      '#FFD1A3',
      '#FFBD7A',
      '#FFA952',
      '#FF942A',
      '#FF6B6B', // Primary
      '#FF5252',
      '#FF3838',
      '#FF1F1F',
    ],
  },
  shadows: {
    md: '0 2px 8px 0 rgba(0, 0, 0, 0.2)',
    xl: '0 8px 28px 0 rgba(0, 0, 0, 0.2)',
  },
  components: {
    Button: {
      defaultProps: {
        size: 'md',
        variant: 'filled',
      },
    },
    Modal: {
      styles: {
        root: { backdropFilter: 'blur(8px)' },
        body: { background: 'transparent' },
      },
    },
  },
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <Notifications position="top-right" zIndex={1000} />
      {children}
    </MantineProvider>
  );
}