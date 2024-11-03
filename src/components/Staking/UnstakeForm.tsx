// src/components/Staking/UnstakeForm.tsx
import { useState } from 'react';
import { 
  Card, 
  Typography, 
  Button, 
  Progress, 
  Badge,
  AnimatedNumber,
  Tooltip 
} from '../common';
import { useStaking } from '../../hooks/useStaking';
import { AlertTriangle, ArrowDownRight } from 'lucide-react';

interface UnstakeFormProps {
  onSuccess?: () => void;
}

const UnstakeForm = ({ onSuccess }: UnstakeFormProps) => {
  const [amount, setAmount] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { 
    unstake, 
    stakedAmount, 
    currentTier,
    projectedTierAfterUnstake,
    cooldownTimeRemaining
  } = useStaking();

  const isValidAmount = Number(amount) > 0 && Number(amount) <= stakedAmount;
  const willDropTier = projectedTierAfterUnstake.level < currentTier.level;

  const handleUnstake = async () => {
    if (!isValidAmount) return;
    
    setIsSubmitting(true);
    try {
      await unstake(Number(amount));
      setAmount('');
      onSuccess?.();
    } catch (error) {
      console.error('Unstaking failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const cooldownComplete = cooldownTimeRemaining <= 0;

  return (
    <Card variant="game">
      <div className="flex items-center gap-3 mb-6">
        <ArrowDownRight className="w-6 h-6 text-primary" />
        <Typography.H3>Unstake Tokens</Typography.H3>
      </div>

      <div className="space-y-6">
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

        <div>
          <Typography.Label className="mb-2">Amount to Unstake</Typography.Label>
          <div className="flex gap-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter amount..."
              max={stakedAmount}
              step="0.0001"
            />
            <Button 
              variant="secondary"
              size="sm"
              onClick={() => setAmount(String(stakedAmount))}
            >
              MAX
            </Button>
          </div>
        </div>

        {Number(amount) > 0 && willDropTier && (
          <div className="flex items-center gap-2 p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <Typography.Small>
              Unstaking this amount will reduce your tier from{' '}
              <Badge variant={`tier${currentTier.level}` as any}>
                {currentTier.name}
              </Badge>
              {' '}to{' '}
              <Badge variant={`tier${projectedTierAfterUnstake.level}` as any}>
                {projectedTierAfterUnstake.name}
              </Badge>
            </Typography.Small>
          </div>
        )}

        {!cooldownComplete && (
          <div className="space-y-2">
            <Typography.Label>Cooldown Period</Typography.Label>
            <Progress 
              value={cooldownTimeRemaining}
              max={cooldownTimeRemaining}
              variant="warning"
              size="sm"
            />
            <Typography.Small className="text-gray-500">
              Please wait {Math.ceil(cooldownTimeRemaining / 60)} minutes before unstaking
            </Typography.Small>
          </div>
        )}

        <Button
          variant="primary"
          size="lg"
          isLoading={isSubmitting}
          disabled={!isValidAmount || isSubmitting || !cooldownComplete}
          onClick={handleUnstake}
          fullWidth
        >
          {cooldownComplete ? 'Unstake Tokens' : 'Cooling Down...'}
        </Button>
      </div>
    </Card>
  );
};

export default UnstakeForm;