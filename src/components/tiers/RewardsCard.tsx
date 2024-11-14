import { Card, Group, Stack, Text, Button, Timeline, ThemeIcon } from '@mantine/core';
import { IconCoin, IconClock, IconArrowUpRight } from '@tabler/icons-react';
import { useWagyu } from '../../providers/WagyuProvider';
import { useStakingActions } from '../../hooks/actions';
import { formatTokenAmount, formatTimeLeft } from '../../utils/formatters';

export function RewardsCard() {
  const { 
    selectedPool,
    getEstimatedRewards,
    getUserTier
  } = useWagyu();
  
  const { 
    claim, 
    canClaim, 
    timeUntilClaim, 
    isClaiming 
  } = useStakingActions();

  if (!selectedPool) return null;

  const rewards = getEstimatedRewards(selectedPool.pool_id);
  const tier = getUserTier(selectedPool.pool_id);
  const claimTime = timeUntilClaim(selectedPool.pool_id);
  const isClaimable = canClaim(selectedPool.pool_id);

  return (
    <Card withBorder>
      <Stack spacing="xl">
        {/* Current Rewards */}
        <Stack spacing="xs">
          <Text size="sm" color="dimmed">Pending Rewards</Text>
          <Group position="apart" align="flex-end">
            <Text size="xl" weight={700}>
              {formatTokenAmount(rewards || '0')}
            </Text>
            <Badge 
              variant="gradient"
              gradient={{ from: 'orange', to: 'red' }}
            >
              {tier?.tier_name} Tier
            </Badge>
          </Group>
        </Stack>

        {/* Claim Timeline */}
        <Timeline active={isClaimable ? 1 : 0} bulletSize={24} lineWidth={2}>
          <Timeline.Item
            bullet={
              <ThemeIcon size={24} radius="xl" color="orange">
                <IconCoin size={16} />
              </ThemeIcon>
            }
            title="Rewards Accumulated"
          >
            <Text size="sm" mt={4}>
              {formatTokenAmount(rewards || '0')} available
            </Text>
          </Timeline.Item>

          <Timeline.Item
            bullet={
              <ThemeIcon size={24} radius="xl" color={isClaimable ? 'green' : 'gray'}>
                <IconClock size={16} />
              </ThemeIcon>
            }
            title={isClaimable ? 'Ready to Claim' : 'Cooldown Period'}
          >
            <Text size="sm" color="dimmed" mt={4}>
              {isClaimable 
                ? 'You can now claim your rewards'
                : `Claim available in ${formatTimeLeft(claimTime || 0)}`
              }
            </Text>
          </Timeline.Item>
        </Timeline>

        {/* Claim Action */}
        <Button
          variant={isClaimable ? 'gradient' : 'light'}
          gradient={{ from: 'orange', to: 'red' }}
          size="lg"
          loading={isClaiming}
          onClick={() => claim(selectedPool.pool_id)}
          disabled={!isClaimable}
          rightIcon={<IconArrowUpRight size={20} />}
        >
          {isClaiming ? 'Processing...' : 
           isClaimable ? 'Claim Rewards' : 
           `Wait ${formatTimeLeft(claimTime || 0)}`}
        </Button>

        {/* Rewards Info */}
        <Card withBorder radius="md" bg="dark.8">
          <Stack spacing="md">
            <Group position="apart">
              <Text size="sm">Base Rate</Text>
              <Text weight={500}>
                {formatTokenAmount(selectedPool.emission_rate / selectedPool.emission_unit)}/sec
              </Text>
            </Group>
            <Group position="apart">
              <Text size="sm">Tier Bonus</Text>
              <Text weight={500} color="orange">
                {formatPercent((tier?.weight || 1) - 1)} increase
              </Text>
            </Group>
            <Group position="apart">
              <Text size="sm">Next Claim</Text>
              <Text weight={500}>
                {isClaimable ? 'Available Now' : formatTimeLeft(claimTime || 0)}
              </Text>
            </Group>
          </Stack>
        </Card>
      </Stack>
    </Card>
  );
}