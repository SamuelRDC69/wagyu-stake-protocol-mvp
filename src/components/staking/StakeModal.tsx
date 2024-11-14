import {
  Modal,
  Stack,
  Text,
  Group,
  Button,
  ThemeIcon,
  List,
} from '@mantine/core';
import { IconCheck, IconClock } from '@tabler/icons-react';
import { formatTokenAmount } from '../../utils/formatters';
import { PoolTable } from '../../types/tables';

interface StakeModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  amount: string;
  pool: PoolTable;
  isLoading: boolean;
}

export function StakeModal({
  opened,
  onClose,
  onConfirm,
  amount,
  pool,
  isLoading,
}: StakeModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Confirm Stake"
      centered
      size="md"
    >
      <Stack spacing="xl">
        <Stack spacing="xs">
          <Text size="lg" weight={500}>
            You are about to stake:
          </Text>
          <Text size="xl" weight={700} color="orange">
            {formatTokenAmount(amount)}
          </Text>
          <Text size="sm" color="dimmed">
            to the {pool.staked_token_contract} Pool
          </Text>
        </Stack>

        <List
          spacing="sm"
          center
          icon={
            <ThemeIcon color="orange" size={24} radius="xl">
              <IconCheck size={16} />
            </ThemeIcon>
          }
        >
          <List.Item>Stake will be locked for rewards generation</List.Item>
          <List.Item>Rewards can be claimed after cooldown period</List.Item>
          <List.Item>Higher tier means better reward multiplier</List.Item>
        </List>

        <Group position="apart" mt="xl">
          <Button variant="subtle" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="gradient"
            gradient={{ from: 'orange', to: 'red' }}
            onClick={onConfirm}
            loading={isLoading}
          >
            {isLoading ? 'Confirming...' : 'Confirm Stake'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}