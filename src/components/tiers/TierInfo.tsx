import { Card, Group, Stack, Text, Grid, ThemeIcon } from '@mantine/core';
import { IconStar } from '@tabler/icons-react';
import { useWagyu } from '../../providers/WagyuProvider';
import { formatPercent } from '../../utils/formatters';

export function TierInfo() {
  const { tiers } = useWagyu();

  return (
    <Card withBorder>
      <Stack spacing="xl">
        <Text size="lg" weight={700}>Available Tiers</Text>

        <Grid gutter="md">
          {tiers.map((tier) => (
            <Grid.Col key={tier.tier} span={{ base: 12, sm: 6 }}>
              <Card 
                withBorder 
                radius="md" 
                bg="dark.8"
              >
                <Group position="apart" mb="md">
                  <Group spacing="xs">
                    <ThemeIcon 
                      size="lg" 
                      radius="xl" 
                      variant="gradient"
                      gradient={{ from: 'orange', to: 'red' }}
                    >
                      <IconStar size={20} />
                    </ThemeIcon>
                    <Text weight={500}>{tier.tier_name}</Text>
                  </Group>
                  <Text weight={700} color="orange">
                    {formatPercent(tier.weight)}x
                  </Text>
                </Group>

                <Stack spacing="xs">
                  <Group position="apart">
                    <Text size="sm" color="dimmed">Required Stake</Text>
                    <Text size="sm">
                      Up to {formatPercent(tier.staked_up_to_percent)}
                    </Text>
                  </Group>
                  <Group position="apart">
                    <Text size="sm" color="dimmed">Weight Multiplier</Text>
                    <Text size="sm" color="orange">
                      {formatPercent(tier.weight)}
                    </Text>
                  </Group>
                </Stack>
              </Card>
            </Grid.Col>
          ))}
        </Grid>

        {/* Tier System Info */}
        <Card withBorder radius="md" bg="dark.8">
          <Stack spacing="md">
            <Text weight={500}>How Tiers Work</Text>
            <Text size="sm" color="dimmed">
              Your tier is determined by your stake percentage in the pool.
              Higher tiers provide better reward multipliers and additional benefits.
              Maintain your stake to keep your tier status.
            </Text>

            <Group grow>
              <Stack spacing={0} align="center">
                <Text size="sm" color="dimmed">Min Stake</Text>
                <Text weight={500}>0%</Text>
              </Stack>
              <Stack spacing={0} align="center">
                <Text size="sm" color="dimmed">Max Bonus</Text>
                <Text weight={500} color="orange">
                  {formatPercent(Math.max(...tiers.map(t => t.weight)))}x
                </Text>
              </Stack>
            </Group>
          </Stack>
        </Card>
      </Stack>
    </Card>
  );
}