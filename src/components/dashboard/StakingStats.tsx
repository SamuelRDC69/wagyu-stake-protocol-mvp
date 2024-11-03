import { Card, Typography, AnimatedNumber } from '../common';
import { useStaking } from '../../hooks/useStaking';
import { Wallet, TrendingUp, Clock } from 'lucide-react';

const StakingStats = () => {
  const { 
    stakedAmount,
    totalRewards,
    averageRewardRate,
    stakingDuration 
  } = useStaking();

  const stats = [
    {
      label: 'Total Staked',
      value: stakedAmount,
      icon: Wallet,
      prefix: '⟁ '
    },
    {
      label: 'Total Rewards',
      value: totalRewards,
      icon: TrendingUp,
      prefix: '⟁ '
    },
    {
      label: 'Staking Duration',
      value: stakingDuration,
      icon: Clock,
      suffix: ' days'
    }
  ];

  return (
    <Card variant="game">
      <Typography.H3 className="mb-6">Staking Statistics</Typography.H3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <stat.icon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <Typography.Label className="text-gray-500">
                {stat.label}
              </Typography.Label>
              <Typography.H4>
                <AnimatedNumber
                  value={stat.value}
                  precision={2}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                />
              </Typography.H4>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export {
  ClaimProjectionGauge,
  CooldownTimer,
  RiskMeter,
  TierBadge,
  StakingStats
};