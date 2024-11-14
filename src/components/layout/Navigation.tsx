import { Group, Button, Title, Header } from '@mantine/core';
import { useWharfKit } from '../../hooks/useWharfKit';
import { IconWallet } from '@tabler/icons-react';
import { shortenAddress } from '../../utils/formatters';

export function Navigation() {
  const { login, logout, isLoggedIn, accountName } = useWharfKit();

  return (
    <Header height={60}>
      <Group position="apart" sx={{ height: '100%' }} px="md">
        <Title
          order={3}
          sx={(theme) => ({
            background: theme.fn.gradient({ from: 'orange', to: 'red', deg: 45 }),
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          })}
        >
          WAGYU
        </Title>

        <Button
          variant={isLoggedIn ? 'light' : 'gradient'}
          gradient={{ from: 'orange', to: 'red' }}
          leftIcon={<IconWallet size={20} />}
          onClick={isLoggedIn ? logout : login}
        >
          {isLoggedIn ? shortenAddress(accountName!) : 'Connect Wallet'}
        </Button>
      </Group>
    </Header>
  );
}