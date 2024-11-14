import { Group, Button, Title, useMantineTheme } from '@mantine/core';
import { useWharfKit } from '../../hooks/useWharfKit';
import { IconWallet } from '@tabler/icons-react';
import { shortenAddress } from '../../utils/formatters';

export function Navigation() {
  const { login, logout, isLoggedIn, accountName } = useWharfKit();
  const theme = useMantineTheme();

  return (
    <Group 
      justify="space-between" 
      h="100%" 
      px="md"
      bg="dark.8"
    >
      <Title
        order={3}
        variant="gradient"
        gradient={{ from: 'orange', to: 'red', deg: 45 }}
      >
        WAGYU
      </Title>

      <Button
        variant={isLoggedIn ? 'light' : 'gradient'}
        gradient={{ from: 'orange', to: 'red' }}
        leftSection={<IconWallet size={20} />}
        onClick={isLoggedIn ? logout : login}
      >
        {isLoggedIn ? shortenAddress(accountName!) : 'Connect Wallet'}
      </Button>
    </Group>
  );
}