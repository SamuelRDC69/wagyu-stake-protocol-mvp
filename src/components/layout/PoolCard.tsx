import { Card, Group, Stack, Text, Badge, Progress, ActionIcon } from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import { PoolTable } from '../../types/tables';
import { formatTokenAmount } from '../../utils/formatters';
import { useWagyu } from '../../providers/WagyuProvider';

interface PoolCardProps {
  pool: PoolTable;
  onSelect: (poolId: number) => void;
}

export function PoolCard({ pool, onSelect }: PoolCardProps) {
  const { getUserTier, getPoolAPR } = useWagyu();
  const userTier = getUserTier(pool.pool_id);
  const apr = getPoolAPR(pool.pool_id);

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Card.Section p="md">
        <Group position="apart">
          <Stack spacing={0}>
            <Text size="lg" weight={500}>
              {formatTokenAmount(pool.total_staked_quantity)} Pool
            </Text>
            <Text size="sm" color="dimmed">
              TVL: {formatTokenAmount(pool.total_staked_quantity)}
            </Text>
          </Stack>
          <Badge 
            variant="gradient" 
            gradient={{ from: 'orange', to: 'red' }}
            size="lg"
          >
            {typeof apr === 'number' ? `${apr.toFixed(2)}%` : '0%'}
          </Badge>
        </Group>
      </Card.Section>

      <Stack spacing="xs" mt="md">
        {userTier && (
          <>
            <Group position="apart">
              <Text size="sm" color="dimmed">Current Tier</Text>
              <Text weight={500} color="orange">
                {userTier.tier_name} ({userTier.weight.toFixed(2)}x)
              </Text>
            </Group>
            <Progress 
              value={userTier.staked_up_to_percent} 
              color="orange" 
              size="sm" 
            />
          </>
        )}

        <Group position="apart" mt="xs">
          <Text size="sm" color="dimmed">
            Emission Rate: {(pool.emission_rate / pool.emission_unit).toFixed(4)}/sec
          </Text>
          <ActionIcon 
            variant="gradient" 
            gradient={{ from: 'orange', to: 'red' }}
            onClick={() => onSelect(pool.pool_id)}
          >
            <IconArrowRight size={18} />
          </ActionIcon>
        </Group>
      </Stack>
    </Card>
  );
}