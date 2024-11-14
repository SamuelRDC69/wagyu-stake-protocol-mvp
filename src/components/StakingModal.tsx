import { useState } from 'react';
import {
  Modal,
  TextInput,
  Stack,
  Group,
  Button,
  Text,
  RingProgress,
  Paper,
  Title,
  NumberInput,
  Slider,
  Tooltip,
  Divider,
  Box,
  keyframes,
} from '@mantine/core';
import { IconWallet, IconArrowRight, IconInfoCircle } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';

const glowAnimation = keyframes({
  '0%': { boxShadow: '0 0 5px #FF6B6B33' },
  '50%': { boxShadow: '0 0 20px #FF6B6B66' },
  '100%': { boxShadow: '0 0 5px #FF6B6B33' }
});

interface StakingModalProps {
  opened: boolean;
  onClose: () => void;
  walletBalance: number;
  currentStake: number;
  apy: number;
}

export function StakingModal({ 
  opened, 
  onClose, 
  walletBalance = 5000,
  currentStake = 1000,
  apy = 65 
}: StakingModalProps) {
  const [amount, setAmount] = useState<number | ''>(0);
  const [isConfirming, setIsConfirming] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);

  const handleStake = async () => {
    try {
      setIsConfirming(true);
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      notifications.show({
        title: 'Staking Successful!',
        message: `Successfully staked ${amount} WAG`,
        color: 'green',
      });
      
      onClose();
    } catch (error) {
      notifications.show({
        title: 'Staking Failed',
        message: 'There was an error processing your stake',
        color: 'red',
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const handleSliderChange = (value: number) => {
    setSliderValue(value);
    setAmount(Math.floor((walletBalance * value) / 100));
  };

  const estimatedRewards = amount ? (Number(amount) * (apy / 100)) / 365 : 0;

  return (
    <Modal 
      opened={opened} 
      onClose={onClose} 
      title={<Title order={3}>Stake WAGYU</Title>}
      size="lg"
      centered
      padding="xl"
      styles={{
        body: {
          background: 'linear-gradient(135deg, rgba(255,107,107,0.05) 0%, rgba(255,142,83,0.05) 100%)',
        },
      }}
    >
      <Stack spacing="xl">
        {/* Current Statistics */}
        <Group grow>
          <Paper p="md" radius="md" bg="dark.6">
            <Stack spacing="xs">
              <Text size="sm" c="dimmed">Current Stake</Text>
              <Text fw={700} size="lg">{currentStake.toLocaleString()} WAG</Text>
            </Stack>
          </Paper>
          <Paper p="md" radius="md" bg="dark.6">
            <Stack spacing="xs">
              <Text size="sm" c="dimmed">Wallet Balance</Text>
              <Text fw={700} size="lg">{walletBalance.toLocaleString()} WAG</Text>
            </Stack>
          </Paper>
        </Group>

        {/* Staking Amount Input */}
        <Box>
          <Text size="sm" fw={500} mb="xs">Select Amount</Text>
          <NumberInput
            value={amount}
            onChange={(val) => {
              setAmount(val);
              setSliderValue((Number(val) / walletBalance) * 100);
            }}
            max={walletBalance}
            min={0}
            step={100}
            rightSection={<Text size="sm">WAG</Text>}
            styles={{
              input: {
                fontSize: '1.2rem',
                fontWeight: 500,
              },
            }}
          />
          
          <Slider
            value={sliderValue}
            onChange={handleSliderChange}
            marks={[
              { value: 25, label: '25%' },
              { value: 50, label: '50%' },
              { value: 75, label: '75%' },
              { value: 100, label: '100%' },
            ]}
            styles={{
              markLabel: { marginTop: 8 },
              mark: { marginTop: 8 },
            }}
            mt="md"
          />
        </Box>

        <Divider />

        {/* Rewards Preview */}
        <Paper 
          p="md" 
          radius="md" 
          style={{ 
            animation: `${glowAnimation} 3s infinite`,
            background: 'rgba(255,107,107,0.1)',
          }}
        >
          <Group position="apart" align="center">
            <Stack spacing={0}>
              <Group spacing="xs">
                <Text size="sm">Estimated Daily Rewards</Text>
                <Tooltip label="Based on current APY and stake amount">
                  <IconInfoCircle size="1rem" style={{ color: '#FF6B6B' }} />
                </Tooltip>
              </Group>
              <Text size="xl" fw={700} style={{ color: '#FF6B6B' }}>
                {estimatedRewards.toFixed(2)} WAG/day
              </Text>
            </Stack>
            <RingProgress
              size={80}
              roundCaps
              thickness={8}
              sections={[{ value: apy, color: '#FF6B6B' }]}
              label={
                <Text size="xs" ta="center">
                  APY
                  <Text fw={700}>{apy}%</Text>
                </Text>
              }
            />
          </Group>
        </Paper>

        {/* Action Buttons */}
        <Group position="apart">
          <Button variant="subtle" onClick={onClose} size="md">
            Cancel
          </Button>
          <Button
            onClick={handleStake}
            loading={isConfirming}
            disabled={!amount || amount > walletBalance}
            rightIcon={<IconArrowRight size="1.2rem" />}
            size="md"
            style={{
              background: 'linear-gradient(45deg, #FF6B6B 0%, #FF8E53 100%)',
            }}
          >
            {isConfirming ? 'Confirming...' : 'Stake Now'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}