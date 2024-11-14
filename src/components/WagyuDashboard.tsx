import { useState, useEffect } from 'react';
import {
  AppShell,
  Burger,
  Group,
  Text,
  Title,
  Card,
  Stack,
  RingProgress,
  Button,
  Container,
  Grid,
  NavLink,
  rem,
  keyframes,
  Box,
  Paper,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconFlame, IconWallet, IconHistory, IconHome, IconUser } from '@tabler/icons-react';
import { Session } from '@wharfkit/session';

// Define pulse animation
const pulse = keyframes({
  '0%': { transform: 'scale(1)' },
  '50%': { transform: 'scale(1.05)' },
  '100%': { transform: 'scale(1)' },
});

const WagyuDashboard = () => {
  const [opened, { toggle }] = useDisclosure();
  const [active, setActive] = useState('home');
  const [stakeAmount, setStakeAmount] = useState(1000);
  const [rewardRate, setRewardRate] = useState(25.5);
  const [progress, setProgress] = useState(65);

  // Simulate loading new reward data
  useEffect(() => {
    const interval = setInterval(() => {
      setRewardRate((prev) => +(prev + 0.01).toFixed(2));
      setProgress((prev) => (prev >= 100 ? 65 : prev + 1));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <IconFlame size={30} style={{ color: '#FF6B6B' }} />
            <Title order={3} 
              style={{ 
                background: 'linear-gradient(45deg, #FF6B6B 0%, #FF8E53 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              WAGYU
            </Title>
          </Group>
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        </Group>
      </AppShell.Header>

      <AppShell.Main>
        <Container size="lg">
          <Stack spacing="lg">
            {/* Main Staking Card */}
            <Card 
              shadow="sm" 
              padding="xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255,107,107,0.1) 0%, rgba(255,142,83,0.1) 100%)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <Group position="apart" mb="md">
                <Stack spacing={0}>
                  <Text size="sm" color="dimmed">Total Staked</Text>
                  <Title order={2}>{stakeAmount.toLocaleString()} WAG</Title>
                </Stack>
                <RingProgress
                  size={90}
                  roundCaps
                  thickness={8}
                  sections={[{ value: progress, color: '#FF6B6B' }]}
                  label={
                    <Text size="xs" ta="center">
                      APY
                      <Text fw={700}>{progress}%</Text>
                    </Text>
                  }
                />
              </Group>
              
              <Box
                style={{
                  animation: `${pulse} 2s infinite ease-in-out`,
                }}
              >
                <Text size="sm" color="dimmed">Current Reward Rate</Text>
                <Text fw={700} size="xl" style={{ color: '#FF6B6B' }}>
                  {rewardRate} WAG/day
                </Text>
              </Box>
            </Card>

            {/* Quick Actions */}
            <Grid>
              <Grid.Col span={{ base: 6, xs: 3 }}>
                <Paper
                  shadow="md"
                  p="md"
                  style={{
                    background: 'rgba(255,107,107,0.1)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                    },
                  }}
                >
                  <Stack align="center" spacing="xs">
                    <IconWallet size={30} style={{ color: '#FF6B6B' }} />
                    <Text size="sm">Stake</Text>
                  </Stack>
                </Paper>
              </Grid.Col>
              <Grid.Col span={{ base: 6, xs: 3 }}>
                <Paper
                  shadow="md"
                  p="md"
                  style={{
                    background: 'rgba(255,142,83,0.1)',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                    },
                  }}
                >
                  <Stack align="center" spacing="xs">
                    <IconHistory size={30} style={{ color: '#FF8E53' }} />
                    <Text size="sm">History</Text>
                  </Stack>
                </Paper>
              </Grid.Col>
            </Grid>
          </Stack>
        </Container>
      </AppShell.Main>

      {/* Mobile Navigation */}
      <Paper
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          borderTop: '1px solid #2C2E33',
          background: 'rgba(26,27,30,0.9)',
          backdropFilter: 'blur(10px)',
          zIndex: 1000,
        }}
        hiddenFrom="sm"
      >
        <Group grow p="md">
          {[
            { icon: IconHome, label: 'Home' },
            { icon: IconWallet, label: 'Stake' },
            { icon: IconFlame, label: 'Rewards' },
            { icon: IconUser, label: 'Profile' },
          ].map((item) => (
            <NavLink
              key={item.label.toLowerCase()}
              active={active === item.label.toLowerCase()}
              label={<Text size="xs">{item.label}</Text>}
              icon={<item.icon size="1.2rem" stroke={1.5} />}
              onClick={() => setActive(item.label.toLowerCase())}
              style={{ textAlign: 'center' }}
            />
          ))}
        </Group>
      </Paper>
    </AppShell>
  );
};

export default WagyuDashboard;