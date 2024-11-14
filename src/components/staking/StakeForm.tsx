import { useState } from 'react';
import {
  Card,
  Group,
  Stack,
  Text,
  NumberInput,
  Button,
  Progress,
  Tooltip,
  ActionIcon,
} from '@mantine/core';
import { IconInfoCircle, IconArrowRight } from '@tabler/icons-react';
import { useWagyu } from '../../providers/WagyuProvider';
import { useStakingActions } from '../../hooks/actions';
import { formatTokenAmount, formatPercent } from '../../utils/formatters';
import { useTokenBalance } from '../../hooks/queries/useTokenBalance';
import { Asset } from '@wharfkit/session';

export function StakeForm() {
  const { selectedPool, getUserTier, getEffectiveStake } = useWagyu();
  const { stake, isStaking } = useStakingActions();
  const [amount, setAmount] = useState<string>('');

  const { balance } = useTokenBalance(
    selectedPool?.staked_token_contract!,
    selectedPool?.total_staked_quantity.symbol.code().toString()!
  );

  const handleStake = async () => {
    if (!selectedPool || !amount) return;
    try {
      await stake(amount, selectedPool);
      setAmount('');
    } catch (error) {
      console.error('Staking failed:', error);
    }
  };

  const currentTier = selectedPool ? getUserTier(selectedPool.pool_id) : null;
  const effectiveStake = selectedPool ? getEffectiveStake(selectedPool.pool_id) : null;

  const handlePercentageClick = (percentage: number) => {
    if (!balance) return;
    const value = (Number(balance) * percentage).toFixed(4);
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

  return (
    <Card withBorder>
      <Stack spacing="xl">
        {/* Token Input */}
        <Stack spacing="xs">
          <Group position="apart">
            <Text size="sm" weight={500}>
              Amount to Stake
            </Text>
            <Text size="sm" color="dimmed">
              Balance: {formatTokenAmount(balance || '0')}
            </Text>
          </Group>

          <NumberInput
            value={amount}
            onChange={(val) => setAmount(val.toString())}
            placeholder="0.0000"
            precision={4}
            min={0}
            max={balance ? Number(balance) : 0}
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

        {/* Tier Info */}
        {currentTier && (
          <Card withBorder radius="md" bg="dark.8">
            <Stack spacing="xs">
              <Group position="apart">
                <Text size="sm">Current Tier</Text>
                <Group spacing="xs">
                  <Text weight={500} color="orange">
                    {currentTier.tier_name}
                  </Text>
                  <Tooltip label="Tier multiplier affects your reward rate">
                    <ActionIcon variant="subtle" size="sm">
                      <IconInfoCircle size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>
              </Group>

              <Stack spacing={5}>
                <Group position="apart" spacing="xs">
                  <Text size="sm" color="dimmed">
                    Weight Multiplier
                  </Text>
                  <Text weight={500}>
                    {formatPercent(currentTier.weight)}
                  </Text>
                </Group>
                <Progress 
                  value={currentTier.staked_up_to_percent} 
                  color="orange"
                  size="sm"
                />
              </Stack>
            </Stack>
          </Card>
        )}

        {/* Effective Stake */}
        {effectiveStake && (
          <Group position="apart">
            <Text size="sm" color="dimmed">
              Effective Stake
            </Text>
            <Text weight={500} color="orange">
              {formatTokenAmount(effectiveStake)}
            </Text>
          </Group>
        )}

        {/* Stake Button */}
        <Button
          size="lg"
          variant="gradient"
          gradient={{ from: 'orange', to: 'red' }}
          rightIcon={<IconArrowRight size={20} />}
          loading={isStaking}
          onClick={handleStake}
          disabled={!amount || Number(amount) <= 0 || !balance || Number(amount) > Number(balance)}
        >
          {isStaking ? 'Confirming...' : 'Stake Now'}
        </Button>
      </Stack>
    </Card>
  );
}