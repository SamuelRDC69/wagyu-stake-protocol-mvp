import { Stack, Grid, Container } from '@mantine/core';
import { StakeForm } from './StakeForm';
import { StakeInfo } from './StakeInfo';
import { PoolList } from '../pools/PoolList';
import { useWagyu } from '../../providers/WagyuProvider';

export function StakeDashboard() {
  const { selectedPool } = useWagyu();

  return (
    <Container size="lg" py="xl">
      <Grid gutter="md">
        {/* Pool Selection */}
        <Grid.Col span={{ base: 12, md: selectedPool ? 6 : 12 }}>
          <PoolList />
        </Grid.Col>

        {/* Staking Interface */}
        {selectedPool && (
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Stack spacing="md">
              <StakeInfo />
              <StakeForm />
            </Stack>
          </Grid.Col>
        )}
      </Grid>
    </Container>
  );
}