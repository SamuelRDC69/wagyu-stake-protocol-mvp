// src/components/Staking/StakeForm.tsx
import { useState } from 'react';
import { 
  Card, 
  Typography, 
  Button, 
  Progress, 
  Badge,
  AnimatedNumber 
} from '../common';
import { useStaking } from '../../hooks/useStaking';
import { usePoolHealth } from '../../hooks/usePoolHealth';
import { Wallet, Scale, TrendingUp } from 'lucide-react';

interface StakeFormProps {
  onSuccess?: () => void;
}

const StakeForm = ({ onSuccess }: StakeFormProps) => {
  const [amount, setAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { 
    stake, 
    balance, 
    stakedAmount, 
    projectedTier,
    maxStakeAmount
  } = useStaking();
  
  const { poolHealth } = usePoolHealth();

  const projectedMultiplier = projectedTier.weight;
  const isValidAmount = Number(amount) > 0 && Number(amount) <= balance;

  const handleStake = async () => {
    if (!isValidAmount) return;
    
    setIsSubmitting(true);
    try {
      await stake(Number(amount));
      setAmount('');
      onSuccess?.();
    } catch (error) {
      console.error('Staking failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card variant="game">
      <div className="flex items-center gap-3 mb-6">
        <Wallet className="w-6 h-6 text-primary" />
        <Typography.H3>Stake Tokens</Typography.H3>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Typography.Label>Available Balance</Typography.Label>
            <Typography.H4>
              <AnimatedNumber 
                value={balance} 
                precision={4}
                prefix="⟁ "
              />
            </Typography.H4>
          </div>
          <div>
            <Typography.Label>Currently Staked</Typography.Label>
            <Typography.H4>
              <AnimatedNumber 
                value={stakedAmount} 
                precision={4}
                prefix="⟁ "
              />
            </Typography.H4>
          </div>
        </div>

        <div>
          <Typography.Label className="mb-2">Amount to Stake</Typography.Label>
          <div className="flex gap-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter amount..."
              max={maxStakeAmount}
              step="0.0001"
            />
            <Button 
              variant="secondary"
              size="sm"
              onClick={() => setAmount(String(balance))}
            >
              MAX
            </Button>
          </div>
        </div>

        {Number(amount) > 0 && (
          <div className="space-y-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-primary" />
                <Typography.Label>Projected Tier</Typography.Label>
              </div>
              <Badge variant={`tier${projectedTier.level}` as any}>
                {projectedTier.name}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <Typography.Label>Reward Multiplier</Typography.Label>
              </div>
              <Typography.H4 className="text-primary">
                {projectedMultiplier}x
              </Typography.H4>
            </div>

            <div>
              <Typography.Label className="mb-2">Pool Impact</Typography.Label>
              <Progress 
                value={Number(amount)}
                max={poolHealth.totalStaked}
                variant="primary"
                size="sm"
                showLabel
              />
            </div>
          </div>
        )}

        <Button
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          disabled={!isValidAmount || isSubmitting}
          onClick={handleStake}
          fullWidth
        >
          Stake Tokens
        </Button>
      </div>
    </Card>
  );
};

export default StakeForm;