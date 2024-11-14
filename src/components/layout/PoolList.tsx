import { Stack, Text, Skeleton } from '@mantine/core';
import { PoolCard } from './PoolCard';
import { useWagyu } from '../../providers/WagyuProvider';

export function PoolList() {
  const { pools, isPoolsLoading, selectPool } = useWagyu();

  if (isPoolsLoading) {
    return (
      <Stack spacing="md">
        <Skeleton height={200} radius="md" />
        <Skeleton height={200} radius="md" />
      </Stack>
    );
  }

  if (!pools.length) {
    return (
      <Text align="center" color="dimmed" size="lg">
        No active pools available
      </Text>
    );
  }

  return (
    <Stack spacing="md">
      {pools.map((pool) => (
        <PoolCard
          key={pool.pool_id}
          pool={pool}
          onSelect={selectPool}
        />
      ))}
    </Stack>
  );
}