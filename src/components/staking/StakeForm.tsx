import { useState } from 'react';
import { Card, Group, Stack, Text, NumberInput, Button } from '@mantine/core';
import { useWagyu } from '../../providers/WagyuProvider';
import { useStakingActions } from '../../hooks/actions';
import { useTokenBalance } from '../../hooks/queries/useTokenBalance';
import { Asset } from '@wharfkit/session';

export function StakeForm() {
  const { selectedPool, getUserTier } = useWagyu();
  const { stake, isStaking } = useStakingActions();
  const [amount, setAmount] = useState<number>(0);

  const { balance } = useTokenBalance(
    selectedPool?.staked_token_contract,
    selectedPool?.total_staked_quantity.symbol.code().toString()
  );

  const handleStake = async () => {
    if (!selectedPool || !amount) return;
    try {
      const assetString = Asset.from(
        amount,
        selectedPool.total_staked_quantity.symbol
      ).toString();
      await stake(assetString, selectedPool);
      setAmount(0);
    } catch (error) {
      console.error('Staking failed:', error);
    }
  };

  const handlePercentageClick = (percentage: number) => {
    if (!balance) return;
    const value = (Number(balance) * percentage);
    setAmount(value);
  };

  if (!selectedPool) {
    return (
      <Card withBorder>
        <Text align="center" color="dimmed">
          Select a pool to stake
        </Text>
      </Card>
    );
  }

  const balanceNumber = balance ? Number(balance) : 0;

  return (
    <Card withBorder>
      <Stack spacing="xl">
        <Stack spacing="xs">
          <Group position="apart">
            <Text size="sm" weight={500}>Amount to Stake</Text>
            <Text size="sm" color="dimmed">
              Balance: {balance ? balance.toString() : '0'}
            </Text>
          </Group>

          <NumberInput
            value={amount}
            onChange={(val) => setAmount(val || 0)}
            precision={4}
            min={0}
            max={balanceNumber}
            size="xl"
            rightSection={
              <Text size="sm" color="dimmed" mr="md">
                {selectedPool.total_staked_quantity.symbol.code().toString()}
              </Text>
            }
          />

          <Group grow spacing="xs" mt="xs">
            {[0.25, 0.5, 0.75, 1].map((percentage) => (
              <Button
                key={percentage}
                variant="light"
                size="xs"
                onClick={() => handlePercentageClick(percentage)}
                disabled={!balance}
              >
                {percentage * 100}%
              </Button>
            ))}
          </Group>
        </Stack>

        <Button
          size="lg"
          variant="gradient"
          gradient={{ from: 'orange', to: 'red' }}
          loading={isStaking}
          onClick={handleStake}
          disabled={!amount || amount <= 0 || !balance || amount > balanceNumber}
        >
          {isStaking ? 'Confirming...' : 'Stake Now'}
        </Button>
      </Stack>
    </Card>
  );
}