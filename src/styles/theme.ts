import { createTheme, MantineThemeOverride } from '@mantine/core';

export const theme: MantineThemeOverride = {
  colorScheme: 'dark',
  primaryColor: 'orange',
  defaultRadius: 'md',
  
  colors: {
    dark: [
      '#C1C2C5',
      '#A6A7AB',
      '#909296',
      '#5C5F66',
      '#373A40',
      '#2C2E33',
      '#25262B',
      '#1A1B1E',
      '#141517',
      '#101113',
    ],
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

  components: {
    Card: {
      defaultProps: {
        padding: 'lg',
        radius: 'md',
      },
    },
    Button: {
      defaultProps: {
        radius: 'md',
      },
    },
  },

  globalStyles: (theme) => ({
    '*, *::before, *::after': {
      boxSizing: 'border-box',
    },
    body: {
      ...theme.fn.fontStyles(),
      backgroundColor: theme.colors.dark[9],
      color: theme.colors.dark[0],
      lineHeight: theme.lineHeight,
    },
  }),
};