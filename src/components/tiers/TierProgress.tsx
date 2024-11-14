import { Card, Group, Stack, Text, Progress, RingProgress, Tooltip, Badge } from '@mantine/core';
import { useWagyu } from '../../providers/WagyuProvider';
import { formatTokenAmount, formatPercent } from '../../utils/formatters';
import { calculateTimeUntilNextTier } from '../../utils/calculations';

export function TierProgress() {
  const { 
    selectedPool, 
    tiers,
    getUserTier,
    getEffectiveStake
  } = useWagyu();

  if (!selectedPool) return null;

  const currentTier = getUserTier(selectedPool.pool_id);
  const effectiveStake = getEffectiveStake(selectedPool.pool_id);
  
  // Find next tier
  const tierIndex = tiers.findIndex(t => t.tier === currentTier?.tier);
  const nextTier = tierIndex < tiers.length - 1 ? tiers[tierIndex + 1] : null;

  return (
    <Card withBorder>
      <Stack spacing="xl">
        {/* Current Tier Display */}
        <Group position="apart" align="flex-start">
          <Stack spacing={4}>
            <Text size="xl" weight={700}>
              {currentTier?.tier_name}
            </Text>
            <Badge 
              variant="gradient" 
              gradient={{ from: 'orange', to: 'red' }}
              size="lg"
            >
              {formatPercent(currentTier?.weight || 1)}x Multiplier
            </Badge>
          </Stack>
          
          <RingProgress
            size={90}
            thickness={8}
            roundCaps
            sections={[
              { 
                value: currentTier?.staked_up_to_percent || 0,
                color: 'orange'
              }
            ]}
            label={
              <Stack spacing={0} align="center">
                <Text size="xs" color="dimmed">Progress</Text>
                <Text size="sm" weight={700}>
                  {formatPercent(currentTier?.staked_up_to_percent || 0)}
                </Text>
              </Stack>
            }
          />
        </Group>

        {/* Tier Progress */}
        {nextTier && (
          <Card withBorder radius="md" bg="dark.8">
            <Stack spacing="md">
              <Group position="apart">
                <Text size="sm">Next Tier: {nextTier.tier_name}</Text>
                <Text size="sm" weight={500} color="orange">
                  {formatPercent(nextTier.weight)}x Multiplier
                </Text>
              </Group>

              <Stack spacing={5}>
                <Group position="apart" spacing="xs">
                  <Text size="xs" color="dimmed">Progress to Next Tier</Text>
                  <Text size="xs" color="dimmed">
                    {effectiveStake ? formatTokenAmount(effectiveStake) : '0'} / 
                    {formatTokenAmount(calculateTimeUntilNextTier(
                      effectiveStake!,
                      selectedPool.total_staked_quantity,
                      nextTier
                    ))}
                  </Text>
                </Group>
                <Progress
                  value={(currentTier?.staked_up_to_percent || 0) / nextTier.staked_up_to_percent * 100}
                  color="orange"
                  size="lg"
                  radius="xl"
                />
              </Stack>
            </Stack>
          </Card>
        )}

        {/* Benefits List */}
        <Stack spacing="xs">
          <Text weight={500}>Tier Benefits</Text>
          <Card withBorder radius="md" bg="dark.8">
            <Stack spacing="xs">
              <Group position="apart">
                <Text size="sm">Reward Multiplier</Text>
                <Text weight={500} color="orange">
                  {formatPercent(currentTier?.weight || 1)}x
                </Text>
              </Group>
              <Group position="apart">
                <Text size="sm">Voting Power</Text>
                <Text weight={500} color="orange">
                  {formatPercent((currentTier?.weight || 1) * 100)} per stake
                </Text>
              </Group>
            </Stack>
          </Card>
        </Stack>
      </Stack>
    </Card>
  );
}