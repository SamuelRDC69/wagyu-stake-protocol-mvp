import {
  Card,
  Group,
  Stack,
  Text,
  RingProgress,
  ActionIcon,
  Button,
  Tooltip,
} from '@mantine/core';
import { IconRefresh, IconInfoCircle } from '@tabler/icons-react';
import { useWagyu } from '../../providers/WagyuProvider';
import { useStakingActions } from '../../hooks/actions';
import { formatTokenAmount, formatTimeLeft } from '../../utils/formatters';

export function StakeInfo() {
  const { 
    selectedPool, 
    getUserTier, 
    getEffectiveStake,
    getEstimatedRewards 
  } = useWagyu();
  const { claim, canClaim, timeUntilClaim, isClaiming } = useStakingActions();

  if (!selectedPool) return null;

  const tier = getUserTier(selectedPool.pool_id);
  const effectiveStake = getEffectiveStake(selectedPool.pool_id);
  const estimatedRewards = getEstimatedRewards(selectedPool.pool_id);
  const claimTime = timeUntilClaim(selectedPool.pool_id);
  const isClaimable = canClaim(selectedPool.pool_id);

  return (
    <Card withBorder>
      <Stack spacing="xl">
        {/* Tier Progress */}
        <Group position="apart" align="flex-start">
          <Stack spacing={0}>
            <Text size="lg" weight={500}>
              {tier?.tier_name} Tier
            </Text>
            <Text size="sm" color="dimmed">
              {formatTokenAmount(effectiveStake || '0')} Effective Stake
            </Text>
          </Stack>
          <RingProgress
            size={80}
            thickness={8}
            roundCaps
            sections={[
              {
                value: tier?.staked_up_to_percent || 0,
                color: 'orange',
              },
            ]}
            label={
              <Text size="xs" align="center">
                {tier?.weight}x
              </Text>
            }
          />
        </Group>

        {/* Rewards Info */}
        <Card withBorder radius="md" bg="dark.8">
          <Stack spacing="md">
            <Group position="apart">
              <Text size="sm">Pending Rewards</Text>
              <Group spacing="xs">
                <Text weight={500} color="orange">
                  {formatTokenAmount(estimatedRewards || '0')}
                </Text>
                <Tooltip label="Rewards are calculated based on your effective stake">
                  <ActionIcon variant="subtle" size="sm">
                    <IconInfoCircle size={16} />
                  </ActionIcon>
                </Tooltip>
              </Group>
            </Group>

            <Button
              variant={isClaimable ? 'gradient' : 'light'}
              gradient={{ from: 'orange', to: 'red' }}
              loading={isClaiming}
              onClick={() => claim(selectedPool.pool_id)}
              disabled={!isClaimable}
              rightIcon={isClaimable ? <IconRefresh size={16} /> : undefined}
            >
              {isClaiming ? 'Claiming...' : 
               isClaimable ? 'Claim Rewards' : 
               `Claim in ${formatTimeLeft(claimTime || 0)}`}
            </Button>
          </Stack>
        </Card>
      </Stack>
    </Card>
  );
}