import { Group, UnstyledButton, Stack, Text, Footer } from '@mantine/core';
import { IconChartBar, IconCoin, IconHistory } from '@tabler/icons-react';
import { useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { label: 'Pools', icon: IconChartBar, path: '/' },
  { label: 'Stake', icon: IconCoin, path: '/stake' },
  { label: 'History', icon: IconHistory, path: '/history' }
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Footer height={60}>
      <Group 
        sx={{ height: '100%' }} 
        position="apart" 
        px="md"
        spacing={0}
        grow
      >
        {navItems.map((item) => (
          <UnstyledButton
            key={item.path}
            onClick={() => navigate(item.path)}
            sx={(theme) => ({
              color: location.pathname === item.path 
                ? theme.colors.orange[4] 
                : theme.colors.gray[6],
              '&:hover': {
                color: theme.colors.orange[4]
              }
            })}
          >
            <Stack align="center" spacing={4}>
              <item.icon size={24} />
              <Text size="xs">{item.label}</Text>
            </Stack>
          </UnstyledButton>
        ))}
      </Group>
    </Footer>
  );
}